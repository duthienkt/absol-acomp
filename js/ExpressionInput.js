import ACore, { _, $ } from "../ACore";

import '../css/expressioninput.css'
import DelaySignal from "absol/src/HTML5/DelaySignal";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { phraseMatch } from "absol/src/String/stringMatching";
import PositionTracker from "./PositionTracker";
import { findMaxZIndex, revokeResource } from "./utils";
import { getScreenSize, isDomNode } from "absol/src/HTML5/Dom";
import SCGrammar from "absol/src/SCLang/SCGrammar";
import DPParser from "absol/src/Pharse/DPParser";
import { parsedNodeToAST, parsedNodeToASTChain } from "absol/src/Pharse/DPParseInstance";
import Follower from "./Follower";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import AElement from "absol/src/HTML5/AElement";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

/***
 * @extends PositionTracker
 * @constructor
 */
function ExpressionInput() {
    this.domSignal = new DelaySignal();
    this.$content = $('.as-expression-input-content', this);
    this.$iconCtn = $('.as-expression-input-icon-ctn', this);

    /**
     *
     * @type {null|AElement}
     */
    this.$icon = null;
    this.$alertIcon = $('.mdi.mdi-alert-circle', this.$iconCtn);
    this.engine = new EIEngine(this);
    this.userActionCtrl = new EIUserActionController(this);

    this.autoCompleteCtrl = new EIAutoCompleteController(this);
    this.undoMgn = new EIUndoManager(this);
    this.cmdTool = new EICommandTool(this);

    this._icon = null;


    /****
     * @name value
     * @type {string}
     * @memberOf ExpressionInput#
     */

    /**
     * @type {{variables: string[], functions: string[]}}
     * @memberOf ExpressionInput#
     * @name autocomplete
     */
    /**
     * @type {*}
     * @memberOf ExpressionInput#
     * @name icon
     */
}


ExpressionInput.tag = 'ExpressionInput'.toLowerCase();

ExpressionInput.render = function () {
    return _({
        extendEvent: ['stopchange', 'blur', 'focus'],
        class: ['as-expression-input'],
        child: [
            {
                class: 'as-expression-input-icon-ctn',
                child: ['span.mdi.mdi-alert-circle']
            },
            {
                class: 'as-expression-input-content',
                attr: {
                    contenteditable: "true",
                    spellcheck: 'false'
                }
            }
        ]
    });
};

ExpressionInput.prototype.requestUpdateSize = function () {
    if (this.cmdTool && this.cmdTool.$ctn && this.cmdTool.$ctn.parentElement) {
        this.cmdTool.$ctn.updatePosition();
    }
};

ExpressionInput.prototype.notifySizeCanBeChanged = function () {
    var bound = this.getBoundingClientRect();
    if (!this._prevSize || this._prevSize.width !== bound.width || this._prevSize.height !== bound.height) {
        ResizeSystem.updateUp(this, true);
    }
    this._prevSize = { width: bound.width, height: bound.height };
};

ExpressionInput.prototype.revokeResource = function () {
    revokeResource(this.engine);
    revokeResource(this.autoCompleteCtrl);
    revokeResource(this.undoMgn);
    revokeResource(this.cmdTool);
};


ExpressionInput.prototype.focus = function () {
    this.$content.focus();
    this.engine.setSelectedPosition(this.engine.value.length);
};

ExpressionInput.property = {};
ExpressionInput.property.value = {
    get: function () {
        return this.engine.value;
    },
    set: function (value) {
        this.engine.value = value;
    }
};

ExpressionInput.property.icon = {
    /**
     * @this ExpressionInput
     * @param value
     */
    set: function (value) {
        if (this.$icon) this.$icon.remove();
        this.$iconCtn.clearChild();
        var elt;
        if (isDomNode(value)) {
            if (value.parentElt)
                value = value.cloneNode(true);
            elt = value;
        }
        else if (value && (typeof value === 'string' || typeof value === 'object')) {
            if (value === 'default') value = 'span.mdi.mdi-equal';
            elt = _(value);
        }

        if (elt) {
            this.$iconCtn.addChild(elt);
            this.$icon = elt;
            this.addClass('as-has-icon');
        }
        else {
            this.$icon = null;
            value = null;
            this.removeClass('as-has-icon');
        }
        this._icon = value;
    },
    get: function () {
        return this._icon;
    }
};

/***
 * @memberOf ExpressionInput#
 * @type {{}}
 */
ExpressionInput.eventHandler = {};


ACore.install(ExpressionInput)


export default ExpressionInput;

/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 */
function EIUserActionController(elt) {
    this.elt = elt;
    this.$content = elt.$content;
    this._stopChangeTO = -1;
    /**
     *
     * @type {EIEngine}
     */
    this.engine = elt.engine;

    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }

    this.elt.on('stopchange', () => {
        this.elt.engine.highlightError();
    });

    this.$content.on({
        cut: this.ev_cut,
        blur: this.ev_blur,
        focus: this.ev_focus,
        paste: this.ev_paste,
        keydown: this.ev_keydown
    });

}


EIUserActionController.prototype.delayNotifyStopChange = function () {
    if (this._stopChangeTO > 0) {
        clearTimeout(this._stopChangeTO);
    }
    this._stopChangeTO = setTimeout(function () {
        this._stopChangeTO = -1;
        this.elt.emit('stopchange', {}, this.elt);
    }.bind(this), 200);
}

EIUserActionController.prototype.ev_keydown = function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        this.engine.breakLine();
    }
    else if ((event.ctrlKey && event.key === 'X') || (!event.ctrlKey && event.key.length === 1)
        || event.key === 'Delete'
        || event.key === 'Backspace') {
        this.elt.domSignal.emit('redrawTokens');
    }
    this.delayNotifyStopChange();
    this.elt.notifySizeCanBeChanged();
};

EIUserActionController.prototype.ev_paste = function (event) {
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/[\r\n]+/g, ' ');
    event.preventDefault();
    var pos = this.elt.engine.getSelectPosition();
    if (!pos || !paste) return;
    var value = this.elt.value;
    this.elt.value = value.substring(0, pos.start) + paste + value.substring(pos.end);
    this.elt.engine.setSelectedPosition(pos.start + paste.length);
    this.elt.engine.highlightError();
    this.elt.notifySizeCanBeChanged();
};

EIUserActionController.prototype.ev_cut = function (event) {
    this.elt.domSignal.emit('redrawTokens');
    this.delayNotifyStopChange();
    this.elt.notifySizeCanBeChanged();
};


EIUserActionController.prototype.ev_focus = function (event) {
    this.elt.engine.clearErrorHighlight();
    setTimeout(function () {
        //todo
        this.elt.engine.getSelectPosition();
    }.bind(this), 100);
};

EIUserActionController.prototype.ev_blur = function (event) {
    this.elt.engine.highlightError();
};


/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 */
function EIEngine(elt) {
    this.elt = elt;
    this.lastSelectedPosition = { start: 0, end: 0, direction: 'forward' };
    this.$content = elt.$content;
    /**
     *
     * @type {null|Range}
     */
    this.range = null;
    this.elt.domSignal.on('redrawTokens', this.redrawTokens.bind(this));
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this._isListenSelectionChange = false;
    this.$content.on('focus', this.ev_focus);
}


EIEngine.prototype.ev_focus = function () {
    if (!this._isListenSelectionChange) {
        document.addEventListener('selectionchange', this.ev_range);
        this._isListenSelectionChange = true;
    }
};


EIEngine.prototype.ev_range = function () {
    if (!this.elt.isDescendantOf(document.body)) {
        document.removeEventListener('selectionchange', this.ev_range);
        this._isListenSelectionChange = false;
    }
    this.updateRange();
};


EIEngine.prototype.revokeResource = function () {
    if (this._isListenSelectionChange) {
        document.removeEventListener('selectionchange', this.ev_range);
        this._isListenSelectionChange = false;
    }
};

EIEngine.prototype.highlightError = function () {
    var elt = this.elt;
    var contentElt = this.$content;
    var value = elt.value.trim();
    var it = EIParser.parse(value, 'exp');
    var i, notSkipCount = 0;
    var tokenErrorIdx = -1;
    if (value && it.error) {
        elt.addClass('as-error');
        elt.attr('title', it.error.message);
        tokenErrorIdx = it.error.tokenIdx;
    }
    else {
        elt.removeClass('as-error');
    }

    for (i = 0; i < contentElt.childNodes.length; ++i) {
        if (contentElt.childNodes[i].classList.contains('as-token') && contentElt.childNodes[i].getAttribute('data-type') !== 'skip') {
            if (notSkipCount === tokenErrorIdx) {
                contentElt.childNodes[i].classList.add('as-unexpected-token');
            }
            else {
                contentElt.childNodes[i].classList.remove('as-unexpected-token');
            }
            notSkipCount++;
        }
    }
};


EIEngine.prototype.clearErrorHighlight = function () {
    var contentElt = this.$content;
    for (var i = 0; i < contentElt.length; ++i) {
        if (contentElt.childNodes[i].classList.contains('as-token') && contentElt.childNodes[i].getAttribute('data-type') !== 'skip') {
            contentElt.childNodes[i].classList.remove('as-unexpected-token');
        }
    }
};


EIEngine.prototype.drawTokensContent = function () {
    var selectedPos = this.getSelectPosition();
    var value = this.value;
    var tokens = EIParser.tokenizer.tokenize(value);
    var tokenEltChain = Array.prototype.slice.call(this.$content.childNodes);
    while (tokenEltChain[tokenEltChain.length - 1] && tokenEltChain[tokenEltChain.length - 1].tagName === 'BR') {
        tokenEltChain.pop();
    }
    var leftPassed = 0;
    while (leftPassed < tokenEltChain.length && leftPassed < tokens.length) {
        if (!tokenEltChain[leftPassed].firstChild || !tokenEltChain[leftPassed].classList.contains('as-token') || tokens[leftPassed].content !== tokenEltChain[leftPassed].firstChild.data) break;
        if (!tokenEltChain[leftPassed].token || tokenEltChain[leftPassed].getAttribute('data-type') !== tokens[leftPassed].type) {
            tokenEltChain[leftPassed].setAttribute('data-type', tokens[leftPassed].type);
        }
        leftPassed++;
    }
    var rightPassed = 0;
    while (rightPassed < tokenEltChain.length && rightPassed < tokens.length) {
        if (!tokenEltChain[tokenEltChain.length - 1 - rightPassed].firstChild || !tokenEltChain[tokenEltChain.length - 1 - rightPassed].classList.contains('as-token') || tokens[tokens.length - 1 - rightPassed].content !== tokenEltChain[tokenEltChain.length - 1 - rightPassed].firstChild.data) break;
        if (tokenEltChain[tokenEltChain.length - 1 - rightPassed].getAttribute('data-type') !== tokens[tokens.length - 1 - rightPassed].type) {
            tokenEltChain[tokenEltChain.length - 1 - rightPassed].setAttribute('data-type', tokens[tokens.length - 1 - rightPassed].type);
        }
        rightPassed++;
    }

    var beforeToken;
    if (leftPassed + rightPassed < Math.max(tokenEltChain.length, tokens.length)) {
        beforeToken = tokenEltChain[tokenEltChain.length - rightPassed];
        tokenEltChain.splice(leftPassed, tokenEltChain.length - leftPassed - rightPassed).forEach(function (elt) {
            elt.remove();
        });
        tokens.slice(leftPassed, tokens.length - rightPassed).forEach(function (token) {
            var tokenElt = this.makeTokenElt(token);
            if (beforeToken) {
                this.$content.addChildBefore(tokenElt, beforeToken);
            }
            else {
                this.$content.addChild(tokenElt);
            }
        }.bind(this));
    }

    if (selectedPos)
        this.setSelectedPosition(selectedPos);
};

EIEngine.prototype.updateTokenExType = function () {
    /**
     * @type {HTMLElement[]}
     */

    var tokenEltChain = Array.prototype.slice.call(this.$content.childNodes);
    var token, nextToken;
    var i, j;
    for (i = 0; i < tokenEltChain.length; ++i) {
        token = tokenEltChain[i];
        if (token.innerText === "true" || token.innerText === "false") {
            token.setAttribute('data-ex-type', 'boolean');
        }
        else if (token.getAttribute('data-type') === 'word') {
            j = i + 1;
            nextToken = tokenEltChain[i + 1];
            while (nextToken) {
                if (nextToken.getAttribute('data-type') === 'symbol' && nextToken.innerText === '(') {
                    token.setAttribute('data-ex-type', 'function');
                    break;
                }
                else if (nextToken.getAttribute('data-type') === 'skip') {
                    nextToken = tokenEltChain[++j];
                }
                else {
                    break;
                }
            }
        }
        else {
            token.removeAttribute('data-ex-type');
        }
    }
};

EIEngine.prototype.redrawTokens = function () {
    this.drawTokensContent();
    this.updateTokenExType();
};

EIEngine.prototype.makeTokenElt = function (token) {
    if (token.content === '\n') return _('br');
    return _({
        tag: 'span',
        class: ['as-token'],
        attr: {
            'data-type': token.type
        },
        child: { text: token.content }
    });
};

EIEngine.prototype.insertText = function (text) {
    var lastPos = this.getSelectPosition();
    var value;
    if (this.lastSelectedPosition) {
        value = this.elt.value;
        this.value = value.substring(0, lastPos.start) + text + value.substring(lastPos.end);
        this.lastSelectedPosition = Object.assign({
            direction: 'forward',
            start: lastPos.start + text.length,
            end: lastPos.start + text.length
        });
        if (document.activeElement === this.elt.$content) {
            this.setSelectedPosition(this.lastSelectedPosition);
        }
    }
    else this.appendText(text);
    this.elt.userActionCtrl.delayNotifyStopChange();
};

EIEngine.prototype.appendText = function (text) {
    var newValue = this.value + text;
    this.elt.value = newValue;
    if (document.activeElement === this.$content) {
        this.setSelectedPosition(newValue.length);
    }
    this.elt.userActionCtrl.delayNotifyStopChange();
};

EIEngine.prototype.isValidRange = function (range) {
    return AElement.prototype.isDescendantOf.call(range.startContainer, this.$content) && AElement.prototype.isDescendantOf.call(range.endContainer, this.$content);
};

EIEngine.prototype.updateRange = function () {
    var sel = window.getSelection();
    var range;
    for (var i = 0; i < sel.rangeCount; ++i) {
        range = sel.getRangeAt(i);
        if (this.isValidRange(range))
            this.range = range;
    }
};

EIEngine.prototype.isTextNode = function (node) {
    return node.nodeType === Node.TEXT_NODE;
};

EIEngine.prototype.isWordToken = function (node) {
    if (this.isTextNode(node)) return false;
    return node.getAttribute('data-type') === 'word';
};

EIEngine.prototype.isSymbolToken = function (node) {
    if (this.isTextNode(node)) return false;
    return node.getAttribute('data-type') === 'symbol';
};

EIEngine.prototype.getRange = function () {
    this.updateRange();
    return this.range;
};

/**
 *
 * @param {Range} range
 */
EIEngine.prototype.setRange = function (range) {
    this.range = range;
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
};

EIEngine.prototype.childIndexOf = function (node) {
    if (!node.parentElement) return 0;
    return Array.prototype.indexOf.call(node.parentElement.childNodes, node);
};

EIEngine.prototype.lcaOf = function (nd1, nd2) {
    var track1 = [];
    var track2 = [];
    var rootNode = this.elt;
    while (nd1 && (nd1 !== rootNode)) {
        track1.unshift(nd1);
        nd1 = nd1.parentElement;
    }

    while (nd2 && (nd2 !== rootNode)) {
        track2.unshift(nd2);
        nd2 = nd2.parentElement;
    }
    var res = null;
    for (var i = 0; i < track1.length && i < track2.length; ++i) {
        if (track1[i] === track2[i]) res = track1[i];
        else break;
    }
    return res;
};

EIEngine.prototype.trimLeft = function (nd, ofs) {
    if (this.isTextNode(nd)) {
        nd.data = nd.data.substring(ofs);
    }
    else {
        for (var i = 0; i < ofs; ++i) {
            nd.removeChild(nd.firstChild);
        }
    }
};

EIEngine.prototype.trimRight = function (nd, ofs) {
    if (this.isTextNode(nd)) {
        nd.data = nd.data.substring(0, ofs);
    }
    else {
        while (nd.childNodes.length > ofs) {
            nd.removeChild(nd.lastChild);
        }
    }
};


EIEngine.prototype.breakTextNode = function (textNode, offset) {
    var parent = $(textNode.parentElement);
    var text = textNode.data;
    var newTextNode = _({ text: text.substring(offset) });
    textNode.data = text.substring(0, offset);
    parent.addChildAfter(newTextNode, textNode);
    return newTextNode;
};


EIEngine.prototype.breakElement = function (elt, offset) {
    var parent = $(elt.parentElement);
    var newElt = elt.cloneNode(false);
    var rightChildren = Array.prototype.slice.call(elt.childNodes, offset);
    for (var i = 0; i < rightChildren.length; ++i) {
        newElt.appendChild(rightChildren[i]);
    }
    parent.addChildAfter(newElt, elt);
    return newElt;
};

EIEngine.prototype.breakNode = function (node, offset) {
    if (this.isTextNode(node)) {
        return this.breakTextNode(node, offset);
    }
    else {
        return this.breakElement(node, offset);
    }
}




EIEngine.prototype.breakLine = function () {
    var range = this.getRange();
    if (!range) return;//todo
    var startCtn = range.startContainer;
    var endCtn = range.endContainer;
    var startOfs = range.startOffset;
    var endOfs = range.endOffset;
    console.log('==============');
    console.log(startCtn.cloneNode(true), startOfs, endCtn.cloneNode(true), endOfs);

    var text, lText, rText;
    var newNd;
    var lcaNd = this.lcaOf(startCtn, endCtn);
    while (startCtn !== lcaNd) {
        this.trimRight(startCtn, startOfs);
        startOfs = this.childIndexOf(startCtn) + 1;
        startCtn = startCtn.parentElement;
    }

    while (endCtn !== lcaNd) {
        this.trimLeft(endCtn, endOfs);
        endOfs = this.childIndexOf(endCtn);
        endCtn = endCtn.parentElement;
    }

    if (this.isTextNode(startCtn)) {
        newNd = startCtn.parentElement.cloneNode(false);
        newNd.appendChild(_({ text: startCtn.data.substring(0, startOfs) }));
        startCtn.parentElement.parentElement.insertBefore(newNd, startCtn.parentElement);
        startCtn.data = startCtn.data.substring(endOfs);
        newNd = _('br');
        startCtn.parentElement.parentElement.insertBefore(newNd, startCtn.parentElement);
        startCtn = newNd.parentElement;
        startOfs = this.childIndexOf(newNd) + 1;
        endCtn = startCtn;
        endOfs = startOfs;

    }
    else if (startCtn === this.$content) {
        Array.prototype.slice.call(startCtn.childNodes, startOfs, endOfs - 1).forEach(nd => nd.remove());
        newNd = _('br');
        startCtn.insertBefore(newNd, startCtn.childNodes[startOfs]);
        endOfs = startOfs + 1;
        startOfs = endOfs;
    }
    else {
        endCtn = this.breakElement(startCtn, startOfs);
        endOfs -= startCtn;
        if (endOfs >= 0) {
            newNd = this.breakElement(endCtn, endOfs);
            endCtn.remove();
            endCtn = newNd;
            endOfs = 0;
        }
        newNd = _('br');
        endCtn.parentElement.insertBefore(newNd, endCtn);
        startCtn = newNd.parentElement;
        startOfs = this.childIndexOf(newNd) + 1;
        endCtn = startCtn;
        endOfs = startOfs;
    }

    var childNodes = Array.prototype.slice.call(this.$content.childNodes);
    var nd;
    for (var i = 0; i < childNodes.length; ++i) {
        nd = childNodes[i];
        if (nd.tagName === 'BR') continue;
        if (this.stringOf(nd).length === 0) {
            if (AElement.prototype.isDescendantOf.call(startCtn, nd)) {
                startCtn = this.$content;
                startOfs = this.childIndexOf(nd);
            }
            if (AElement.prototype.isDescendantOf.call(endCtn, nd)) {
                endCtn = this.$content;
                endOfs = this.childIndexOf(nd);
            }
            nd.remove();
        }
    }

    console.log(startCtn, startOfs, endCtn, endOfs);

    range = document.createRange();
    range.setStart(startCtn, startOfs);
    range.setEnd(endCtn, endOfs);
    this.setRange(range);

};


EIEngine.prototype.getSelectPosition = function () {
    var range = this.getRange();
    var sel = window.getSelection();
    var direction = 'forward';
    var cmpPosition = sel.anchorNode.compareDocumentPosition(sel.focusNode);
    if (cmpPosition === 4) {
        direction = 'forward';
    }
    else if (cmpPosition === 2) {
        direction = 'backward'
    }
    else if (!cmpPosition && sel.anchorOffset > sel.focusOffset ||
        cmpPosition === Node.DOCUMENT_POSITION_PRECEDING) {
        direction = 'backward';
    }
    var startOffset = this.getPosition(range.startContainer, range.startOffset);
    var endOffset = this.getPosition(range.endContainer, range.endOffset);
    if (isNaN(startOffset)) return this.lastSelectedPosition;
    this.lastSelectedPosition = {
        start: startOffset, end: endOffset, direction: direction,
        startCtn: range.startContainer, startOffset: range.startOffset,
        endCtn: range.endContainer, endOffset: range.endOffset
    };
    return this.lastSelectedPosition;
};

/**
 *
 * @param  {null|number|{start: number, end: number}=}pos
 */
EIEngine.prototype.setSelectedPosition = function (pos) {
    var start;
    var end;
    if (typeof pos === "number") {
        start = pos;
        end = pos;
    }
    else {
        start = pos.start;
        end = pos.end;
    }


    var startCtn, startOfs, endCtn, endOfs;
    var text;
    text = '';
    var visit = (nd) => {
        var prevText = text;
        var parent = nd.parentElement;
        if (this.isTextNode(nd)) {
            text += nd.data;
            if (text.length > start && prevText.length <= start) {
                startCtn = nd;
                startOfs = start - prevText.length;
            }
            if (text.length > end && prevText.length <= end) {
                endCtn = nd;
                endOfs = end - prevText.length;
            }
        }
        else if (nd.tagName === 'BR' && parent && parent.lastChild !== nd) {
            text += '\n';
            if (text.length > start && prevText.length <= start) {
                startCtn = parent;
                startOfs = this.childIndexOf(nd);
            }
            if (text.length > end && prevText.length <= end) {
                endCtn = parent;
                endOfs = this.childIndexOf(nd);
            }
        }
        else {
            for (var i = 0; i < nd.childNodes.length; ++i) {
                visit(nd.childNodes[i]);
            }
        }
    }

    visit(this.$content);


    if (!startCtn) {
        startCtn = this.$content;
        startOfs = this.$content.childNodes.length;
    }

    if (!endCtn) {
        endCtn = startCtn;
        endOfs = startOfs;
    }


    var range = document.createRange();
    range.setStart(startCtn, startOfs);
    range.setEnd(endCtn, endOfs);
    this.setRange(range);


//     if (pos === null) pos = this.lastSelectedPosition;
//     if (pos === undefined) pos = this.lastSelectedPosition;
// //when tokenized
//     var start;
//     var end;
//     if (typeof pos === "number") {
//         start = pos;
//         end = pos;
//     }
//     else {
//         start = pos.start;
//         end = pos.end;
//     }
//
//     var curOffset = 0;
//     var elt;
//     var childNodes = this.elt.$content.childNodes;
//     var content;
//     var i;
//     var sel = window.getSelection();
//     var range = document.createRange();
//     var d1 = true, d2 = true;
//     for (i = 0; i < childNodes.length && d1 && d2; ++i) {
//         elt = childNodes[i];
//         content = (elt.firstChild && elt.firstChild.data) || '';
//         if (d1 && curOffset <= start && (curOffset + content.length > start || i + 1 === childNodes.length)) {
//             range.setStart(elt.firstChild || elt, start - curOffset);
//             d1 = false;
//         }
//         if (d2 && curOffset <= end && (curOffset + content.length > end || i + 1 === childNodes.length)) {
//             range.setEnd(elt.firstChild || elt, end - curOffset);
//             d2 = false;
//         }
//         curOffset += content.length;
//     }
//     if (d1 && d2) {
//         range.setStart(this.$content, 0);
//         range.setEnd(this.$content, 0);
//     }
//     sel.removeAllRanges();
//     sel.addRange(range);
//     this.lastSelectedPosition = { start: start, end: end, direction: 'forward' };
};

EIEngine.prototype.getPosition = function (node, offset) {
    var text = '';
    var found = false;
    var visit = (nd) => {
        var i;
        if (found) return;
        if (nd === node) {
            if (this.isTextNode(nd)) {
                text += nd.data.substring(0, offset);
            }
            else {
                for (i = 0; i < nd.childNodes.length && i < offset; ++i) {
                    visit(nd.childNodes[i]);
                }
            }
            found = true;
            return;
        }
        var parent = nd.parentElement;
        if (nd.tagName === 'BR' && parent && parent.lastChild !== nd) {
            text += '\n';
        }
        if (this.isTextNode(nd)) {
            text += nd.data;
        }
        else {
            for (i = 0; i < nd.childNodes.length && !found; ++i) {
                visit(nd.childNodes[i]);
            }
        }

    }

    visit(this.$content);


    return text.length;
};


EIEngine.prototype.stringOf = function (node) {
    if (!node) return '';
    if (node.nodeType === 3) {
        return node.data;
    }
    var res = '';
    var parent = node.parentElement;
    if ((node.tagName === 'BR' || node.tagName === 'br')
        && parent && parent.lastChild !== node) {
        return '\n';
    }
    else if ((node.tagName === 'DIV' || node.tagName === 'div')
        && parent && parent.firstChild !== node) {
        res += '\n';
    }


    return res + Array.prototype.map.call(node.childNodes, (cNode, index, arr) => {
        return this.stringOf(cNode, node);
    }).join('');
};


EIEngine.prototype.tokenAt = function (offset) {
    var l = 0;
    var res = null;
    var nd, i;
    for (i = 0; i < this.$content.childNodes.length; ++i) {
        nd = this.$content.childNodes[i];
        l += this.stringOf(nd).length;
        if (l > offset || (i + 1 === this.$content.childNodes.length && l === offset)) {
            res = nd;
            break;
        }
    }
    return res;
};


Object.defineProperty(EIEngine.prototype, 'value', {
    get: function () {
        return Array.prototype.map.call(this.$content.childNodes, nd => this.stringOf(nd)).join('');
    },
    set: function (value) {
        var tokens = EIParser.tokenizer.tokenize(value || '');
        this.$content.clearChild()
            .addChild(tokens.map(function (token) {
                return this.makeTokenElt(token);
            }.bind(this)));
        this.updateTokenExType();
        this.lastSelectedPosition = {
            start: value.length,
            end: value.length,
            direction: 'forward'
        };
    }
});


/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 */
function EIUndoManager(elt) {
    this.elt = elt;
    this.reset();
}


EIUndoManager.prototype.commit = function () {
    var text = this.elt.value;
    var range = this.elt.engine.getSelectPosition() || { start: text.length, end: text.length };

    var newItem = {
        value: text,
        range: { start: range.start, end: range.end, direction: range.direction || 'forward' }
    };
    while (this.stack.length > this.idx + 1) {
        this.stack.pop();
    }
    this.idx = this.stack.length;
    this.stack.push(newItem);
    return this;
};

EIUndoManager.prototype.modified = function () {
    var text = this.elt.value;
    var range = this.elt.engine.getSelectPosition() || { start: text.length, end: text.length };

    var newItem = {
        value: text,
        range: { start: range.start, end: range.end, direction: range.direction || 'forward' }
    };
    while (this.stack.length > this.idx) {
        this.stack.pop();
    }
    this.idx = this.stack.length;
    this.stack.push(newItem);
    return this;
};

EIUndoManager.prototype.reset = function () {
    this.stack = [{ value: this.elt.value, range: { start: 0, end: 0, direction: "forward" } }];
    this.idx = 0;
};


EIUndoManager.prototype.undo = function () {
    if (this.idx <= 0) return;
    this.idx--;
    var item = this.stack[this.idx];
    this.elt.value = item.value;
    this.elt.engine.setSelectedPosition(item.range);
};

EIUndoManager.prototype.redo = function () {
    if (this.idx + 1 >= this.stack.length) return;
    this.idx++;
    var item = this.stack[this.idx];
    this.elt.value = item.value;
    this.elt.engine.setSelectedPosition(item.range);
};


/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 */
function EIAutoCompleteController(elt) {
    this.elt = elt;
    this.$content = elt.$content;
    this.$tokenTarget = null;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    _({
        tag: PositionTracker, elt: this.elt,
        on: {
            positionchange: this.ev_positionChange
        }
    });
    this.$content.on('keydown', this.ev_keydown);


    this.isOpen = false;
    this.dropIsDown = true;
    this.selectedIdx = 0;
}

EIAutoCompleteController.prototype.revokeResource = function () {

};

EIAutoCompleteController.prototype.openDropdown = function () {
    if (this.isOpen) return;
    if (this.getSuggestionList().length === 0) return;
    this.isOpen = true;
    this.dropIsDown = true;
    if (!this.$dropDown) {
        this.$dropDown = _({
            class: ['as-expression-input-autocomplete', 'as-dropdown-box-common-style', 'absol-selectlist', 'as-bscroller'],
            props: {}
        });
    }
    var zIndex = findMaxZIndex(this.elt) + 1;
    this.$dropDown.addStyle('z-index', zIndex);
    this.$dropDown.sponsorElement = this.elt;
    this.elt.startTrackPosition();
    this.$dropDown.addTo(this.elt);

    this.$tokenTarget = null;
    this.selectedIdx = 0;
    this.updateDropDownContent();
    this.updateDropDownPosition();
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    }, 200);
};

EIAutoCompleteController.prototype.closeDropdown = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.elt.stopTrackPosition();
    this.$dropDown.remove();
    this.$tokenTarget = null;
    document.removeEventListener('click', this.ev_clickOut);
}


EIAutoCompleteController.prototype.getCurrentText = function () {
    var pos = this.elt.engine.getSelectPosition();
    if (!pos) return '';
    var res = {
        value: '',
        tokenElt: null
    };
    var tokenElt = this.elt.engine.tokenAt(pos.start);
    if (!tokenElt || tokenElt.getAttribute('data-type') !== 'word') {
        res.tokenElt = tokenElt;
        res.value = '';
        tokenElt = null;
    }
    if (!tokenElt && pos && pos.start > 0) {
        tokenElt = this.elt.engine.tokenAt(pos.start - 1);
    }

    if (tokenElt && tokenElt.getAttribute('data-type') === 'word') {
        res.value = tokenElt.innerText;
        res.tokenElt = tokenElt;
    }

    return res;
};

EIAutoCompleteController.prototype.updateDropDownContent = function () {
    if (!this.isOpen) return;
    var text = this.getCurrentText();
    var value = text.value;
    var suggestionList = this.getSuggestionList(value);
    var itemElements = suggestionList.map((suggestion, idx) => {
        return _({
            class: ['as-ei-suggestion-item', 'absol-selectlist-item'],
            child: [
                suggestion.type === 'variable' ? 'span.mdi.mdi-variable' : 'span.mdi.mdi-function',
                { text: suggestion.text }
            ],
            attr: { "data-suggestion": suggestion.text },
            on: {
                click: () => {
                    this.applySuggestion(suggestion.text);
                    this.closeDropdown();
                }
            }
        });
    });
    if (!itemElements[this.selectedIdx]) {
        this.selectedIdx = 0;
    }
    itemElements[this.selectedIdx].addClass('as-selected');
    this.$item = itemElements;
    this.$dropDown.clearChild();
    this.$dropDown.addChild(itemElements);
    this.$tokenTarget = text.tokenElt;
    this.updateDropDownPosition();
};

EIAutoCompleteController.prototype.updateDropDownPosition = function () {
    if (!this.isOpen) return;
    var selected = this.elt.engine.getSelectPosition();
    var startToken = this.elt.engine.tokenAt(selected.start) || selected.startCtn;
    if (startToken && startToken.nodeType === Node.TEXT_NODE) startToken = startToken.parentElement;
    var bound = null;
    var dx = 0;
    if (this.$tokenTarget) {
        bound = this.$tokenTarget.getBoundingClientRect();
        dx = -30;
    }
    else if (startToken) {
        bound = startToken.getBoundingClientRect();
    }
    else {
        bound = this.elt.$content.getBoundingClientRect();
    }
    var x = bound.left;
    this.$dropDown.addStyle({
        left: (x + dx) + 'px',
    });
    var screenHeight = getScreenSize().height;
    var availableHeight;
    var aTop = bound.top;
    var aBottom = screenHeight - bound.bottom;
    var contentHeight = this.$dropDown.scrollHeight;
    if (this.dropIsDown) {
        if (aBottom > contentHeight || aBottom > aTop) {
            this.$dropDown.addStyle('max-height', aBottom + 'px')
                .removeStyle('bottom')
                .addStyle('top', bound.bottom + 'px');
        }
        else {
            this.dropIsDown = false;
            this.$dropDown.addStyle('max-height', aTop + 'px')
                .addStyle('bottom', bound.top + 'px')
                .removeStyle('top');
        }
    }
    else {
        if (aTop > contentHeight || aTop > aBottom) {
            this.$dropDown.addStyle('max-height', aTop + 'px')
                .removeStyle('top')
                .addStyle('bottom', bound.top + 'px');
        }
        else {
            this.dropIsDown = true;
            this.$dropDown.addStyle('max-height', aBottom + 'px')
                .addStyle('top', bound.bottom + 'px')
                .removeStyle('bottom');
        }
    }
};


/**
 *
 * @param text
 */
EIAutoCompleteController.prototype.getSuggestionList = function (text) {
    text = text || '';
    text = text.toLowerCase();
    var res = [];
    var variables = [];
    var functions = [];
    var temp;
    if (this.elt.autocomplete) {
        temp = this.elt.autocomplete.variables;
        if (typeof temp === "function") temp = temp();
        if (Array.isArray(temp)) {
            temp = temp.filter(x => typeof x === 'string');
            variables = variables.concat(temp);
        }

        temp = this.elt.autocomplete.functions;
        if (typeof temp === "function") temp = temp();
        if (Array.isArray(temp)) {
            temp = temp.filter(x => typeof x === 'string');
            functions = functions.concat(temp);
        }
    }

    var i;
    var itemText, score;
    for (i = 0; i < variables.length; ++i) {
        itemText = variables[i];
        score = phraseMatch(itemText.toLowerCase(), text);
        res.push({ text: itemText, score: score, type: 'variable' });
    }
    for (i = 0; i < functions.length; ++i) {
        itemText = functions[i];
        score = phraseMatch(itemText.toLowerCase(), text);
        res.push({ text: itemText, score: score, type: 'function' });
    }
    res.sort(function (a, b) {
        if (a.score === b.score) {
            return a.text > b.text ? 1 : -1;
        }
        return b.score - a.score;
    });
    return res;
};


EIAutoCompleteController.prototype.applySuggestion = function (suggestion) {
    var selected = this.elt.engine.getSelectPosition();
    var startToken = this.elt.engine.tokenAt(selected.start);
    var endToken = this.elt.engine.tokenAt(selected.end);
    var rangeStartCtn, rangeStartOffset, rangeEndCtn, rangeEndOffset;
    var oldValue, newValue;
    if (((selected.start === selected.end) || (startToken === endToken)) && this.$tokenTarget && this.$tokenTarget.getAttribute('data-type') === 'word') {
        this.$tokenTarget.innerHTML = suggestion;
        rangeStartCtn = this.$tokenTarget.firstChild;
        rangeStartOffset = suggestion.length;
        rangeEndCtn = rangeStartCtn;
        rangeEndOffset = rangeStartOffset;
        var newRange = document.createRange();
        newRange.setStart(rangeStartCtn, rangeStartOffset);
        newRange.setEnd(rangeEndCtn, rangeEndOffset);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.elt.engine.getSelectPosition();
    }
    else {
        oldValue = this.elt.value;
        newValue = oldValue.substring(0, selected.start) + suggestion + oldValue.substring(selected.end);
        this.elt.engine.value = newValue;
        this.elt.engine.setSelectedPosition(selected.start + suggestion.length);
    }
};


EIAutoCompleteController.prototype.ev_keydown = function (event) {
    var key = keyboardEventToKeyBindingIdent(event);
    if (key === 'enter') {
        if (this.isOpen && this.$item && this.$item.length) {
            this.applySuggestion(this.$item[this.selectedIdx].getAttribute('data-suggestion'));
            this.closeDropdown();
        }
    }
    else if (key === 'ctrl-space') {
        this.elt.engine.drawTokensContent();
        this.openDropdown();
    }
    else if (key === 'arrowleft' || key === 'arrowright') {
        setTimeout(() => {
            var text = this.getCurrentText();
            this.$tokenTarget = text && text.tokenElt;
            if (this.isOpen) {
                if (!this.$tokenTarget || this.$tokenTarget.getAttribute('data-type') !== 'word') {
                    this.closeDropdown();
                }
            }
        });
    }
    else if (key === 'arrowdown' || key === 'arrowup') {
        event.preventDefault();
        if (this.isOpen && this.$item && this.$item.length) {
            this.$item[this.selectedIdx].removeClass('as-selected');
            this.selectedIdx = (this.selectedIdx + (key === 'arrowdown' ? 1 : (this.$item.length - 1))) % this.$item.length;
            this.$item[this.selectedIdx].addClass('as-selected');
        }

    }
    else if (key.match(/^[a-zA-Z]$/)) {
        setTimeout(() => this.openDropdown(), 10);
    }
    else if (this.isOpen) {
        setTimeout(() => {
            if (this.isOpen) {
                var text = this.getCurrentText();
                this.$tokenTarget = text && text.tokenElt;
                if (!this.$tokenTarget || this.$tokenTarget.getAttribute('data-type') !== 'word') {
                    this.closeDropdown();
                }
                else {
                    this.updateDropDownContent();
                }
            }

        }, 5);
    }
};


EIAutoCompleteController.prototype.ev_positionChange = function (event) {
    if (!this.elt.isDescendantOf(document.body)) {
        this.elt.stopTrackPosition();
        return;
    }
};


EIAutoCompleteController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.$dropDown, event)) return;
    this.closeDropdown();
}


/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 */
function EICommandTool(elt) {
    this.elt = elt;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.isOpen = false;
    this.$ctn = _({
        tag: Follower,
        class: 'as-ei-command-tool',
        props: {
            anchor: [6, 1]
        },
        child: [
            {
                tag: 'button',
                class: 'as-transparent-button',
                child: 'span.mdi.mdi-magnify',

            },
            {
                tag: 'button',
                class: 'as-transparent-button',
                child: 'span.mdi.mdi-lightbulb-on-outline',
                attr: {
                    title: 'Hint [Ctrl + Space]'
                },

                on: {
                    click: () => {
                        this.elt.autoCompleteCtrl.openDropdown();
                        this.elt.engine.setSelectedPosition();
                    }
                }
            }]
    });
    this.elt.$content.on('focus', this.ev_focus);
}

EICommandTool.prototype.open = function () {
    if (this.isOpen) return;
    this.elt.emit('focus', { type: 'focus', originalEvent: event, target: this.elt }, this.elt);
    if (this.elt.autoCompleteCtrl.getSuggestionList().length === 0) return;
    this.isOpen = true;
    this.$ctn.addTo(this.elt);
    this.$ctn.followTarget = this.elt;
    var zIndex = findMaxZIndex(this.elt) + 1;
    this.$ctn.addStyle('z-index', zIndex);
    document.addEventListener('click', this.ev_clickOut);


};

EICommandTool.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.elt.emit('blur', { type: 'blur', originalEvent: event, target: this.elt }, this.elt);
    document.removeEventListener('click', this.ev_clickOut);
    this.$ctn.selfRemove();
};


EICommandTool.prototype.ev_focus = function (event) {
    this.open();
};

EICommandTool.prototype.ev_clickOut = function (ev) {
    if (hitElement(this.elt, ev)) return;
    this.close();

};


EICommandTool.prototype.revokeResource = function () {
    this.elt.$content.on('focus', this.ev_focus);
    this.close();
};


/*********************************
 * EXPRESSION
 */


var rules = [];


var operatorOrder = {
    'NOT': 4,
    '!': 4,
    '*': 5,
    '/': 5,
    'MOD': 5,
    '%': 5,
    '+': 6,
    '-': 6,
    '<': 9,
    '>': 9,
    '<=': 9,
    '>=': 9,
    '==': 9,
    '=': 9,
    '===': 9,
    '!=': 9,
    'AND': 14,
    '&&': 14,
    'OR': 15,
    '||': 15,
    'XOR': 15,
}


rules.push({
    target: 'null',
    elements: ['_null'],
    toAST: function (parsedNode) {
        return {
            type: 'NullLiteral',
        }
    }
});

rules.push({
    target: 'ident',
    elements: ['.word'],
    toAST: function (parsedNode) {
        return {
            type: 'Identifier',
            name: parsedNode.children[0].content
        }
    }
});


rules.push({
    target: 'args_list',
    elements: ['exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    },
    toASTChain: function (parsedNode) {
        return [parsedNodeToAST(parsedNode)];
    }
});


rules.push({
    target: 'args_list',
    elements: ['args_list', '_,', 'exp'],
    longestOnly: true,
    ident: 'args_list_rec',
    toASTChain: function (parsedNode) {
        return parsedNodeToASTChain(parsedNode.children[0]).concat(parsedNodeToAST(parsedNode.children[2]));
    }
});


rules.push({
    target: 'function_callee',
    elements: ['ident'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'function_callee',
    elements: ['mem_exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
})

rules.push({
    target: 'function_call',
    elements: ['function_callee', '_(', 'args_list', '_)'],
    toAST: function (parsedNode) {
        return {
            type: 'CallExpression',
            arguments: parsedNode.children[2].rule.toASTChain(parsedNode.children[2]),
            callee: parsedNodeToAST(parsedNode.children[0])
        }
    }
});


rules.push({
    target: 'function_call',
    elements: ['function_callee', '_(', '_)'],
    toAST: function (parsedNode) {
        return {
            type: 'CallExpression',
            arguments: [],
            callee: parsedNodeToAST(parsedNode.children[0])
        };
    }
});


rules.push({
    target: 'new_expression',
    elements: ['_new', 'function_call'],
    toAST: function (parsedNode) {
        var callAst = parsedNodeToAST(parsedNode.children[1])
        return {
            type: 'NewExpression',
            arguments: callAst.arguments,
            callee: callAst.callee
        }
    }
});


rules.push({
    target: 'exp',
    elements: ['new_expression'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'exp',
    elements: ['null'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'exp',
    elements: ['ident'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


rules.push({
    target: 'number',
    elements: ['.number'],
    toAST: function (parsedNode) {
        return {
            type: 'NumericLiteral',
            value: parseFloat(parsedNode.children[0].content)
        }
    }
});


rules.push({
    target: 'string',
    elements: ['.string'],
    toAST: function (parsedNode) {
        var content = parsedNode.children[0].content;
        if (content[0] === "'") content = '"' + content.substring(1, content.length - 1).replace(/["]/g, '\\"') + '"';
        return {
            type: 'StringLiteral',
            value: JSON.parse(content)
        }
    }
});


rules.push({
    target: 'boolean',
    elements: ['_true'],
    toAST: function (parsedNode) {
        return {
            type: 'BooleanLiteral',
            value: true
        };
    }
});


rules.push({
    target: 'boolean',
    elements: ['_false'],
    toAST: function (parsedNode) {
        return {
            type: 'BooleanLiteral',
            value: false
        };
    }
});

rules.push({
    target: 'exp',
    elements: ['number'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'exp',
    elements: ['string'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


rules.push({
    target: 'exp',
    elements: ['boolean'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

['+', '-', '*', '/', '%', '&&', '||', 'XOR', "=", '==', '===', '!=', '<', '>', '>=', '<='].forEach(function (op) {
    rules.push({
        target: 'bin_op',
        elements: ['_' + op],
        toAST: function (parsedNode) {
            return {
                type: "BinaryOperator",
                content: op
            }
        }
    });
});

var x = Math.m

rules.push({
    target: 'exp',
    elements: ['exp', 'bin_op', 'exp'],
    // longestOnly: true,//* error when parse return (...)...
    ident: 'bin_op_rec',
    toASTChain: function (parseNode) {
        var res = [];
        if (parseNode.children[0].rule === this) {
            res = res.concat(this.toASTChain(parseNode.children[0]));
        }
        else {
            res.push(parsedNodeToAST(parseNode.children[0]));
        }

        res.push(parseNode.children[1].children[0]);

        if (parseNode.children[2].rule === this) {
            res = res.concat(this.toASTChain(parseNode.children[2]));
        }
        else {
            res.push(parsedNodeToAST(parseNode.children[2]));
        }
        return res;
    },
    toAST: function (parsedNode) {
        var chain = this.toASTChain(parsedNode);
        var stack = [];
        var item;
        var newNode;
        while (chain.length > 0) {
            item = chain.shift();
            if (item.content in operatorOrder) {
                while (stack.length >= 3 && operatorOrder[stack[stack.length - 2].content] <= operatorOrder[item.content]) {
                    newNode = { type: 'BinaryExpression' };
                    newNode.right = stack.pop();
                    newNode.operator = stack.pop();
                    newNode.left = stack.pop();
                    stack.push(newNode);
                }
            }
            stack.push(item);
        }

        while (stack.length >= 3) {
            newNode = { type: 'BinaryExpression' };
            newNode.right = stack.pop();
            newNode.operator = stack.pop();
            newNode.left = stack.pop();
            stack.push(newNode);
        }

        return stack.pop();
    }
});

rules.push({
    target: 'exp',
    elements: ['function_call'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'bracket_group',
    elements: ['_(', 'exp', '_)'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[1]);
    }
});

rules.push({
    target: 'exp',
    elements: ['bracket_group'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


// rules.push({
//     target: 'exp',
//     elements: ['_(', 'exp', '_)'],
//     toAST: function (parsedNode) {
//         return parsedNodeToAST(parsedNode.children[1]);
//     }
// });

['+', '-', '!'].forEach(function (op) {
    ['number', 'bracket_group', 'ident', 'function_call', 'mem_exp', 'unary_exp'].forEach(function (arg) {
        rules.push({
            target: 'unary_exp',
            elements: ['_' + op, arg],
            toAST: function (parsedNode) {
                return {
                    type: 'UnaryExpression',
                    argument: parsedNodeToAST(parsedNode.children[1]),
                    operator: {
                        type: 'UnaryOperator',
                        content: op
                    }
                }
            }
        });
    });
});

rules.push({
    target: 'exp',
    elements: ['unary_exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


rules.push({
    target: 'mem_exp',
    elements: ['ident', '_.', 'ident'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: false,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});

rules.push({
    target: 'mem_exp',
    elements: ['ident', '_[', 'exp', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: true,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});


rules.push({
    target: 'mem_exp',
    elements: ['new_expression', '_.', 'ident'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: false,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});

rules.push({
    target: 'mem_exp',
    elements: ['new_expression', '_[', 'exp', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: true,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});


rules.push({
    target: 'mem_exp',
    elements: ['mem_exp', '_.', 'ident'],
    longestOnly: true,
    ident: 'mem_exp_ident_rev',
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: false,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});

rules.push({
    target: 'mem_exp',
    elements: ['mem_exp', '_[', 'exp', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: true,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});


rules.push({
    target: 'mem_exp',
    elements: ['bracket_group', '_.', 'ident'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: false,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});

rules.push({
    target: 'mem_exp',
    elements: ['bracket_group', '_[', 'exp', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "MemberExpression",
            computed: true,
            object: parsedNodeToAST(parsedNode.children[0]),
            property: parsedNodeToAST(parsedNode.children[2])
        }
    }
});


rules.push({
    target: 'exp',
    elements: ['mem_exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


/**********************************************************************************************************************/


rules.push({
    target: 'object_exp',
    elements: ['_{', '_}'],
    toAST: function (parsedNode) {
        return {
            type: 'ObjectExpression',
            properties: []
        }
    }
});

rules.push({
    target: 'object_exp',
    elements: ['_{', 'object_property_list', '_}'],
    toAST: function (parsedNode) {
        return {
            type: 'ObjectExpression',
            properties: parsedNodeToASTChain(parsedNode.children[1])
        }
    }
});


rules.push({
    target: 'exp',
    elements: ['object_exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'object_property',
    elements: ['ident', '_:', 'exp'],
    toAST: function (parsedNode) {
        return {
            type: 'ObjectProperty',
            key: parsedNodeToAST(parsedNode.children[0]),
            value: parsedNodeToAST(parsedNode.children[2])
        };
    }
});

rules.push({
    target: 'object_property',
    elements: ['string', '_:', 'exp'],
    toAST: function (parsedNode) {
        return {
            type: 'ObjectProperty',
            key: parsedNodeToAST(parsedNode.children[0]),
            value: parsedNodeToAST(parsedNode.children[2])
        };
    }
});


rules.push({
    target: 'object_property_list',
    elements: ['object_property'],
    toASTChain: function (parsedNode) {
        return [parsedNodeToAST(parsedNode.children[0])];
    }
});

rules.push({
    target: 'object_property_list',
    elements: ['object_property_list', '_,', 'object_property'],
    longestOnly: true,
    ident: 'object_property_list_rec',
    toASTChain: function (parsedNode) {
        return parsedNodeToASTChain(parsedNode.children[0]).concat([parsedNodeToAST(parsedNode.children[2])]);
    }
});


/**********************************************************************************************************************/


rules.push({
    target: 'exp',
    elements: ['array_exp'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});

rules.push({
    target: 'array_exp',
    elements: ['_[', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "ArrayExpression",
            elements: []
        };
    }
});

rules.push({
    target: 'array_exp',
    elements: ['_[', 'array_item_list', '_]'],
    toAST: function (parsedNode) {
        return {
            type: "ArrayExpression",
            elements: parsedNodeToASTChain(parsedNode.children[1])
        };
    }
});

rules.push({
    target: 'array_item_list',
    elements: ['exp'],
    toASTChain: function (parsedNode) {
        return [parsedNodeToAST(parsedNode.children[0])];
    }
});

rules.push({
    target: 'array_item_list',
    elements: ['array_item_list', '_,', 'exp'],
    longestOnly: true,
    ident: 'array_item_list_rec',
    toASTChain: function (parsedNode) {
        return parsedNodeToASTChain(parsedNode.children[0]).concat([parsedNodeToAST(parsedNode.children[2])]);
    }
});


/**********************************************************************************************************************/


var elementRegexes = [
    ['string', /("(?:[^"\\\n]|\\.)*?")|('(?:[^'\\\n]|\\.)*?')/],
    ['number', /(\d+([.]\d*)?([eE][+-]?\d+)?|[.]\d+([eE][+-]?\d+)?)/],
    ['word', /[_a-zA-Z][_a-zA-Z0-9]*/],
    ['skip', /([\s\r\n])|(\/\/[^\n]*)|(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)/],
    ['dsymbol', /\+\+|--|==|!=|<=|>=|\|\||&&/],
    ['tsymbol', /\.\.\./],
    ['symbol', /[^\s_a-zA-Z0-9]/],
];


var EIGrammar = {
    elementRegexes: elementRegexes,
    operatorOrder: SCGrammar.operatorOrder,
    rules: rules
};

var EIParser = new DPParser(EIGrammar);
