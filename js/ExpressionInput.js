import ACore, { _, $ } from "../ACore";

import '../css/expressioninput.css'
import DelaySignal from "absol/src/HTML5/DelaySignal";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { phraseMatch, wordLike } from "absol/src/String/stringMatching";
import PositionTracker from "./PositionTracker";
import { findMaxZIndex, revokeResource, vScrollIntoView } from "./utils";
import { getScreenSize, isDomNode } from "absol/src/HTML5/Dom";
import SCGrammar from "absol/src/SCLang/SCGrammar";
import DPParser from "absol/src/Pharse/DPParser";
import { parsedNodeToAST, parsedNodeToASTChain } from "absol/src/Pharse/DPParseInstance";
import Follower from "./Follower";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import AElement from "absol/src/HTML5/AElement";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { arrayUnique } from "absol/src/DataStructure/Array";


/***
 * @extends PositionTracker
 * @constructor
 */
function ExpressionInput() {
    this.domSignal = new DelaySignal();
    this.$rangeCtn = $('.as-expression-input-range-ctn', this);
    this.$content = $('.as-expression-input-content', this);
    this.$iconCtn = $('.as-expression-input-icon-ctn', this);
    // this.$forground = $('.as-expression-input-foreground', this);

    /**
     *
     * @type {null|AElement}
     */
    this.$icon = null;
    this.$alertIcon = $('.mdi.mdi-alert-circle', this.$iconCtn);
    this.engine = new EIEngine(this);
    this.userActionCtrl = new EIUserActionController(this);
    // this.selection = new EISelection(this);

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
     * @type {{variables: string[], functions: string[], sampleJS?:{getFunctions: function(): string[], getVariables: function(): string[]}}}
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
        tag: PositionTracker,
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
                    contenteditable: 'true',
                    spellcheck: 'false'
                }
            }//,
            // { class: 'as-expression-input-range-ctn' },

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
    revokeResource(this.domSignal);
};


ExpressionInput.prototype.focus = function () {
    this.$content.focus();
    this.engine.setSelectedPosition(this.engine.value.length);
};

ExpressionInput.property = {};

ExpressionInput.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
            this.$content.removeAttribute('contenteditable');
        }
        else {
            this.removeClass('as-read-only');
            if (!this.hasClass('as-disabled')) {
                this.$content.setAttribute('contenteditable', 'true');
            }
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

ExpressionInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
            this.$content.removeAttribute('contenteditable');
        }
        else {
            this.removeClass('as-disabled');
            if (!this.hasClass('as-read-only')) {
                this.$content.setAttribute('contenteditable', 'true');
            }
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
}

ExpressionInput.property.value = {
    get: function () {
        return this.engine.value;
    },
    set: function (value) {
        this.engine.value = value;
        this.undoMgn.reset();
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


ACore.install(ExpressionInput);


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
        this.elt.undoMgn.commit();
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
};


EIUserActionController.prototype.ev_keydown = function (event) {
    var key = keyboardEventToKeyBindingIdent(event);
    if (key.match(/^[a-zA-Z0-9]$/)) {
        this.elt.engine.requestRedrawTokens();
        setTimeout(() => {
            this.elt.autoCompleteCtrl.openDropdownIfNeed();
            if (this.elt.autoCompleteCtrl.isOpen) {
                this.elt.autoCompleteCtrl.updateDropDownContent();
            }
        }, 200);
    }
    else if (key === 'enter') {
        event.preventDefault();
        if (this.elt.autoCompleteCtrl.isSelecting()) {
            this.elt.autoCompleteCtrl.applySelectingSuggestion();
        }
        else {
            this.engine.breakLine();
        }
    }
    else if (key === 'arrowleft' || key === 'arrowright' || key.match(/^[^a-zA-Z0-9]$/)) {
        this.elt.autoCompleteCtrl.closeDropdownIfNeed();
    }
    else if (key === 'arrowup' || key === 'arrowdown') {
        if (this.elt.autoCompleteCtrl.isSelecting()) {
            event.preventDefault();
            this.elt.autoCompleteCtrl.moveSelectingSuggestion(key === 'arrowup' ? 'up' : 'down');
        }
    }
    else if (key === 'ctrl-space') {
        this.engine.redrawTokens();
        this.elt.autoCompleteCtrl.openDropdown();
    }
    else if (key === 'escape') {
        if (this.elt.autoCompleteCtrl.isOpen) {
            this.elt.autoCompleteCtrl.closeDropdown();
            event.preventDefault();
        }
    }
    else if (key === 'ctrl-z') {
        event.preventDefault();
        this.elt.undoMgn.undo();
    }
    else if (key === 'ctrl-y') {
        event.preventDefault();
        this.elt.undoMgn.redo();
    }
    else if ((event.ctrlKey && event.key === 'X') || (!event.ctrlKey && event.key.length === 1)
        || event.key === 'Delete'
        || event.key === 'Backspace') {
        this.elt.engine.requestRedrawTokens();
        setTimeout(() => {
            this.elt.autoCompleteCtrl.openDropdownIfNeed();
            if (this.elt.autoCompleteCtrl.isOpen) {
                this.elt.autoCompleteCtrl.updateDropDownContent();
            }
        }, 200);
    }
    this.delayNotifyStopChange();
    setTimeout(() => {
        this.elt.notifySizeCanBeChanged();
    }, 1);
};

EIUserActionController.prototype.ev_paste = function (event) {
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/[\r\n]+/g, ' ');
    event.preventDefault();
    var pos = this.elt.engine.getSelectPosition();
    if (!pos || !paste) return;
    var value = this.elt.value;
    this.elt.engine.value = value.substring(0, pos.start) + paste + value.substring(pos.end);
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

EIUserActionController.prototype.ev_dragInit = function (event) {
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

EIEngine.prototype.requestRedrawTokens = function () {
    this.elt.domSignal.emit('redrawTokens');
}

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

    for (i = 0; i < contentElt.childNodes.length; ++i) {//todo: fix conflict (run before redraw)
        if (contentElt.childNodes[i].getAttribute &&contentElt.childNodes[i].classList.contains('as-token') && contentElt.childNodes[i].getAttribute('data-type') !== 'skip') {
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
        if (this.isTextNode(token)) continue;
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
    this.elt.notifySizeCanBeChanged();

};

/**
 *
 * @param {{type: string, content: string}} token
 * @returns {*}
 */
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
    this.value = newValue;
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

EIEngine.prototype.isMemberSymbolToken = function (node) {
    return this.isSymbolToken(node) && node.innerText === '->';
};


EIEngine.prototype.isSkipToken = function (node) {
    if (this.isTextNode(node)) return false;
    return node.getAttribute('data-type') === 'skip';
}

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
};


EIEngine.prototype.breakLine = function () {
    var range = this.getRange();
    if (!range) return;
    var startCtn = range.startContainer;
    var endCtn = range.endContainer;
    var startOfs = range.startOffset;
    var endOfs = range.endOffset;
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


    range = document.createRange();
    range.setStart(startCtn, startOfs);
    range.setEnd(endCtn, endOfs);
    this.setRange(range);

};

EIEngine.prototype.domRange2SelectPosition = function (range) {
    var sel = window.getSelection();
    if (!range) return null;
    var direction = 'forward';
    if (!range) return null;
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
    if (isNaN(startOffset)) return null;
    return {
        start: startOffset, end: endOffset, direction: direction,
        startCtn: range.startContainer, startOffset: range.startOffset,
        endCtn: range.endContainer, endOffset: range.endOffset
    };
};

EIEngine.prototype.getSelectPosition = function () {
    var range = this.getRange();
    this.lastSelectedPosition = this.domRange2SelectPosition(range) || this.lastSelectedPosition;
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
    else if (pos === null) {
        return;
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

/**
 *
 * @param offset
 * @returns {AElement}
 */
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

/**
 *
 * @param {AElement}token
 * @returns {AElement}
 */
EIEngine.prototype.findPrefixWordTokenOf = function (token) {
    if (!token) return null;
    if (!this.isWordToken(token) && this.stringOf(token) !== '->') return null;
    var temp = token;
    var prefixStartElt = null;
    var state = this.isWordToken(temp) ? 0 : 1;//0: after is word, 1: symbol
    temp = temp.previousSibling;
    while (temp) {
        if (this.isSkipToken(temp)) {
            temp = temp.previousSibling;
            continue;
        }
        if (state === 0) {
            if (this.stringOf(temp) === '->') {
                state = 1;
            }
            else break;
        }
        else {
            if (this.isWordToken(temp)) {
                prefixStartElt = temp;
                state = 0;
            }
            else break;
        }
        temp = temp.previousSibling;
    }
    return prefixStartElt || null;
};

//
// EIEngine.prototype.selectCurrentMemberExpression = function () {
//     var rage = this.getRange();
//     if (!rage) return;
//     var startCtn = rage.startContainer;
//     var endCtn = rage.endContainer;
//     var startOfs = rage.startOffset;
//     var endOfs = rage.endOffset;
//
// };

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

/**
 *
 * @returns {boolean} is changed value and commit success
 */
EIUndoManager.prototype.commit = function () {
    var text = this.elt.value;
    var range = this.elt.engine.getSelectPosition() || { start: text.length, end: text.length };

    var curValue = this.stack[this.idx].value;
    if (curValue === text) return false;

    var newItem = {
        value: text,
        range: { start: range.start, end: range.end, direction: range.direction || 'forward' }
    };
    while (this.stack.length > this.idx + 1) {
        this.stack.pop();
    }
    this.idx = this.stack.length;
    this.stack.push(newItem);
    return true;
};


EIUndoManager.prototype.reset = function () {
    var value = this.elt.value;
    this.stack = [{ value: value, range: { start: value.length, end: value.length, direction: "forward" } }];
    this.idx = 0;
};


EIUndoManager.prototype.undo = function () {
    if (this.idx <= 0) return;
    this.idx--;
    var item = this.stack[this.idx];
    this.elt.engine.value = item.value;
    this.elt.engine.setSelectedPosition(item.range);
};

EIUndoManager.prototype.redo = function () {
    if (this.idx + 1 >= this.stack.length) return;
    this.idx++;
    var item = this.stack[this.idx];
    this.elt.engine.value = item.value;
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

    this.rawSuggestionCache = {
        value: null,
        time: 0
    }

    /**
     *
     * @type {EISuggestionList |null}
     */
    this.$suggestionList = null;
    this.query = null;

    this.isOpen = false;
    this.dropIsDown = true;
}

EIAutoCompleteController.prototype.revokeResource = function () {


};

EIAutoCompleteController.prototype.openDropdownIfNeed = function () {
    if (this.isOpen) return;
    var query = this.getCurrentSearch();
    if (query && query.value && query.value.trim()) {
        this.openDropdown();
    }
}


/**
 *
 */
EIAutoCompleteController.prototype.openDropdown = function () {
    if (this.isOpen) {
        this.updateDropDownContent();
        return;
    }
    if (!this.hasSuggestions()) return;
    this.isOpen = true;
    this.dropIsDown = true;
    if (!this.$suggestionList) {
        this.$suggestionList = _({
            tag: EISuggestionList,
            style: {
                top: '10px',
                left: '10px',
                position: 'fixed'
            },
            on: {
                select: (event) => {
                    this.applySuggestion(event.data);
                    this.closeDropdown();
                }
            }
        });
    }

    this.$suggestionList.addTo(this.elt);


    var zIndex = findMaxZIndex(this.elt) + 1;
    this.$suggestionList.addStyle('z-index', zIndex + '');
    this.$suggestionList.reset();


    this.elt.startTrackPosition();


    // this.$dropDown.addTo(this.elt);

    this.$tokenTarget = null;


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
    this.$suggestionList.remove();
    document.removeEventListener('click', this.ev_clickOut);
}

/**
 *
 * @returns {null|{prefix: string, value, tokenElt: HTMLElement, prefixStartElt: HTMLElement}}
 */
EIAutoCompleteController.prototype.getCurrentSearch = function () {
    var engine = this.elt.engine;
    var pos = this.elt.engine.getSelectPosition();
    if (!pos) return null;//all
    var tokenElt = this.elt.engine.tokenAt(pos.start);
    if (!tokenElt) return null;
    if (!engine.isWordToken(tokenElt)) {
        tokenElt = tokenElt.previousSibling;
    }
    if (!tokenElt) return null;
    var temp = tokenElt;
    while (temp) {
        if (engine.isSymbolToken(temp)) {
            if ((engine.stringOf(temp) === '->')) {
                tokenElt = temp;
            }
            else {
                break;
            }
        }
        else if (engine.isSkipToken(temp)) {

        }
        else if (engine.isWordToken(temp)) {
            tokenElt = temp;
        }
        temp = temp.nextSibling;
    }

    if (!engine.isWordToken(tokenElt) && !engine.isMemberSymbolToken(tokenElt)) return null;

    var res = {
        prefix: '',
        value: '',
        tokenElt: null,
        prefixStartElt: null
    };

    temp = tokenElt;
    var prefixStartElt = engine.findPrefixWordTokenOf(tokenElt);

    res.value = engine.stringOf(tokenElt);
    res.tokenElt = tokenElt;

    if (prefixStartElt) {
        res.prefixStartElt = prefixStartElt;
        temp = prefixStartElt;
        while (temp !== tokenElt) {
            if (engine.isSkipToken(temp)) {
                temp = temp.nextSibling;
                continue;
            }

            res.prefix += engine.stringOf(temp);
            temp = temp.nextSibling;
        }
    }

    return res;
};

EIAutoCompleteController.prototype.getCurrentText = function () {
    var pos = this.elt.engine.getSelectPosition();
    if (!pos) return '';

    var res = {
        value: '',
        tokenElt: null
    };
    var tokenElt = this.elt.engine.tokenAt(pos.start);
    if (!tokenElt || !tokenElt.getAttribute || tokenElt.getAttribute('data-type') !== 'word') {
        res.tokenElt = tokenElt;
        res.value = '';
        tokenElt = null;
    }
    if (!tokenElt && pos && pos.start > 0) {
        tokenElt = this.elt.engine.tokenAt(pos.start - 1);
    }

    if (tokenElt && tokenElt.getAttribute && tokenElt.getAttribute('data-type') === 'word') {
        res.value = tokenElt.innerText;
        res.tokenElt = tokenElt;
    }

    console.log(res);

    return res;
};

EIAutoCompleteController.prototype.updateDropDownContent = function () {
    if (!this.isOpen) return;
    this.query = this.getCurrentSearch();
    this.$suggestionList.data = this.getSuggestionTree(this.query);
    this.$suggestionList.selectMaxScoreItem();
    this.updateDropDownPosition();
};

EIAutoCompleteController.prototype.updateDropDownPosition = function () {
    if (!this.isOpen) return;
    var bound;
    var targetELt = this.query && this.query.tokenElt;
    var range = this.elt.engine.getRange();
    var selected = this.elt.engine.getSelectPosition();
    var dropBound = this.$suggestionList.getBoundingClientRect();
    if (targetELt) {
        bound = targetELt.getBoundingClientRect();
    }
    if (!bound) {
        bound = range.getBoundingClientRect();
        if (!bound.width || !bound.height) bound = null;
    }

    if (!bound && selected) {
        targetELt = this.elt.engine.tokenAt(selected.start);
        if (targetELt) {
            bound = targetELt.getBoundingClientRect();
        }
    }

    if (!bound) {
        bound = this.elt.$content.getBoundingClientRect();
    }

    var screenHeight = getScreenSize().height;
    var aTop = bound.top - 10;
    var aBottom = screenHeight - bound.bottom - 10;
    var contentHeight = this.$suggestionList.scrollHeight;
    if (this.dropIsDown) {
        if (aBottom < contentHeight && aBottom <= aTop) {
            this.dropIsDown = false;
        }
    }
    else {
        if (aTop < contentHeight && aTop <= aBottom) {
            this.dropIsDown = true;
        }
    }

    var screenSize = getScreenSize();
    this.$suggestionList.addStyle('left', Math.max(0, Math.min(bound.left, screenSize.width - dropBound.width)) + 'px');
    this.$suggestionList.addStyle('max-height', this.dropIsDown ? aBottom + 'px' : aTop + 'px');
    var listBound;
    if (this.dropIsDown) {
        this.$suggestionList.addStyle('top', bound.bottom + 'px');
    }
    else {
        listBound = this.$suggestionList.getBoundingClientRect();
        this.$suggestionList.addStyle('top', (bound.top - listBound.height) + 'px');
    }
};

EIAutoCompleteController.prototype.getRawSuggestion = function () {
    var now = Date.now();
    if (now - this.rawSuggestionCache.time < 3000) {
        return this.rawSuggestionCache.value;
    }
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

        if (this.elt.sampleJS && (typeof this.elt.sampleJS.getFunctions === "function")) {
            temp = this.elt.sampleJS.getFunctions();
            if (Array.isArray(temp)) {
                temp = temp.filter(x => typeof x === 'string');
                functions = functions.concat(temp);
            }
        }
    }

    variables = arrayUnique(variables);
    functions = arrayUnique(functions);
    this.rawSuggestionCache.value = {
        variables: variables,
        functions: functions
    }
    this.rawSuggestionCache.time = now;
    return this.rawSuggestionCache.value;
};

EIAutoCompleteController.prototype.hasSuggestions = function () {
    var rawSuggestions = this.getRawSuggestion();
    return rawSuggestions.variables.length > 0 || rawSuggestions.functions.length > 0;
};

/**
 *
 * @param {string} text
 * @param {string} prefix
 */
EIAutoCompleteController.prototype.getSuggestionList = function (text, prefix) {
    var res = [];
    prefix = prefix || '';
    text = text || '';
    text = text.toLowerCase();
    var rawSuggestion = this.getRawSuggestion();
    var variables = rawSuggestion.variables;
    var functions = rawSuggestion.functions;

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
    if (text)
        res = res.filter(x => x.score > 0);
    return res;
};

EIAutoCompleteController.prototype.computeScore = function (queryWords, itemWords) {
    if (queryWords.length === 0) return 1;
    queryWords = queryWords.map(x => x.toLowerCase());
    itemWords = itemWords.map(x => x.toLowerCase());
    var score = 0;
    var wordScore = 1 / queryWords.length;
    var i, j;
    for (i = 0; i < queryWords.length && i < itemWords.length; ++i) {
        if (queryWords[i] === itemWords[i]) {
            score += wordScore;
        }
        else {
            score += wordScore * wordLike(queryWords[i], itemWords[i]);
        }
    }

    var qDict = queryWords.reduce((ac, cr) => {
        ac[cr] = true;
        return ac;
    }, {});
    var iDict = itemWords.reduce((ac, cr) => {
        ac[cr] = true;
        return ac;
    }, {});

    var bestMatch, bestWord, curWordScore;
    queryWords = Object.keys(qDict);
    itemWords = Object.keys(iDict);
    for (i = 0; i < queryWords.length; ++i) {
        bestMatch = 0;
        bestWord = '';
        for (j = 0; j < itemWords.length; ++j) {
            if (queryWords[i] === itemWords[j]) {
                bestMatch = wordScore;
                bestWord = itemWords[j];
                break;
            }
            else {
                curWordScore = wordScore * wordLike(queryWords[i], itemWords[j]);
                if (curWordScore > bestMatch) {
                    bestMatch = curWordScore;
                    bestWord = itemWords[j];
                }
            }
        }

        if (bestWord) {
            iDict[bestWord] = false;
            score += bestMatch;
        }
    }

    return score;
};

EIAutoCompleteController.prototype.getSuggestionTree = function (query) {
    var splitWords = (text) => text.split(/[^a-zA-Z0-9_$]+/).filter(x => x.length > 0);
    var queryWords = query ? splitWords(query.prefix + ' ' + query.value) : [];
    var rawSuggestion = this.getRawSuggestion();
    var variables = rawSuggestion.variables;
    var functions = rawSuggestion.functions;

    var items = [];
    var item;
    var i;
    for (i = 0; i < variables.length; ++i) {
        items.push({ text: variables[i], type: 'variable', words: splitWords(variables[i]) });
    }

    for (i = 0; i < functions.length; ++i) {
        items.push({ text: functions[i], type: 'function', words: splitWords(functions[i]) });
    }
    var min = Infinity, max = -Infinity;
    for (i = 0; i < items.length; ++i) {
        item = items[i];
        item.score = this.computeScore(queryWords, item.words);
        if (item.score < min) min = item.score;
        if (item.score > max) max = item.score;
    }

    var idx;
    if (query) {
        for (i = 0; i < items.length; ++i) {
            item = items[i];
            idx = item.text.toLowerCase().indexOf(query.value.toLowerCase());
            if (idx >= 0) item.score = max - (idx / 1000);
        }
    }
    items.sort((a, b) => b.score - a.score);

    var mid = (max + min) / 2;
    items = items.filter(x => x.score >= mid);

    var trees = [];
    var nodeDict = {
        "*": { text: "", children: trees }
    };
    items.forEach(item => {
        var words = item.words;
        var k;
        var key = '';
        var nd;
        var parent = nodeDict['*'];
        for (k = 0; k < words.length; ++k) {
            if (k > 0) key += '->';
            key += words[k];
            nd = nodeDict[key];
            if (!nd) {
                nd = { text: words[k], children: [], key: key, score: 0 };
                nodeDict[key] = nd;
                parent.children.push(nd);
            }

            parent = nd;
        }
        parent.item = item;
        parent.score = item.score;
    });
    return trees;
};


EIAutoCompleteController.prototype.applySuggestion = function (suggestion) {
    var engine = this.elt.engine;
    var query = this.query;
    var key = suggestion.key;
    var words = key.split('->');
    var startToken = query && query.prefixStartElt;
    var endToken = query && query.tokenElt;
    startToken = startToken || endToken;
    var range;

    var rangeStartCtn, rangeStartOffset, rangeEndCtn, rangeEndOffset;
    var i, tokenElt;

    var oldValue, newValue;
    var selected;


    if (startToken && endToken && engine.isWordToken(startToken)
        && (engine.isWordToken(endToken) || engine.stringOf(endToken) === '->')) {
        for (i = 0; i < words.length; ++i) {
            if (i > 0) {
                tokenElt = engine.makeTokenElt({ type: 'symbol', content: '->' });
                this.elt.$content.insertBefore(tokenElt, startToken);
            }
            tokenElt = engine.makeTokenElt({ type: 'word', content: words[i] });
            this.elt.$content.insertBefore(tokenElt, startToken);
            if (i + 1 === words.length) {
                rangeStartCtn = this.elt.$content;
                rangeStartOffset = engine.childIndexOf(tokenElt) + 1;
                rangeEndCtn = rangeStartCtn;
                rangeEndOffset = rangeStartOffset;
            }
        }
        while (startToken !== endToken) {
            tokenElt = startToken.nextSibling;
            startToken.remove();
            startToken = tokenElt;
        }
        endToken.remove();
        range = document.createRange();
        range.setStart(rangeStartCtn, rangeStartOffset);
        range.setEnd(rangeEndCtn, rangeEndOffset);
        engine.setRange(range);
    }
    else {
        oldValue = this.elt.value;
        selected = engine.getSelectPosition();
        newValue = oldValue.substring(0, selected.start) + key + oldValue.substring(selected.end);
        this.elt.engine.value = newValue;
        this.elt.engine.setSelectedPosition(selected.start + key.length);
    }
    engine.updateTokenExType();
};

EIAutoCompleteController.prototype.isSelecting = function () {
    return this.isOpen && this.$suggestionList && this.$suggestionList.$selectedNode && true;
};

EIAutoCompleteController.prototype.applySelectingSuggestion = function () {
    if (this.isSelecting()) {
        this.applySuggestion(this.$suggestionList.$selectedNode.data);
        //todo
        // this.applySuggestion(this.$item[this.selectedIdx].getAttribute('data-suggestion'));
        this.closeDropdown();
    }
};

EIAutoCompleteController.prototype.closeDropdownIfNeed = function () {
    setTimeout(() => {
        var text = this.getCurrentText();
        this.$tokenTarget = text && text.tokenElt;
        if (this.isOpen) {
            if (!this.$tokenTarget || this.$tokenTarget.getAttribute('data-type') !== 'word') {
                this.closeDropdown();
            }
        }
    }, 5);
};

/**
 *
 * @param {"down"|"up"} direction
 * @returns {boolean}
 */
EIAutoCompleteController.prototype.moveSelectingSuggestion = function (direction) {
    if (direction !== 'down' && direction !== 'up') return false;
    if (!this.hasSuggestions()) return false;
    if (this.isSelecting()) {
        if (direction === 'down') {
            return this.$suggestionList.moveToNextSuggestion();
        }
        else {
            return this.$suggestionList.moveToPrevSuggestion();
        }
    }
};


EIAutoCompleteController.prototype.ev_positionChange = function (event) {
    if (!this.elt.isDescendantOf(document.body)) {
        this.elt.stopTrackPosition();
        return;
    }
    //todo
};


EIAutoCompleteController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.$suggestionList, event)) return;
    this.closeDropdown();
};


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
            // {
            //     tag: 'button',
            //     class: 'as-transparent-button',
            //     child: 'span.mdi.mdi-function-variant',
            //     attr: {
            //         title: 'Insert [Ctrl + I]'
            //     },
            // },
            {
                tag: 'button',
                class: 'as-transparent-button',
                child: 'span.mdi.mdi-magnify',
                attr: {
                    title: 'Hint [Ctrl + Space]'
                },
                on: {
                    click: () => {
                        this.elt.autoCompleteCtrl.openDropdown();
                        this.elt.engine.setSelectedPosition(this.elt.engine.lastSelectedPosition);
                    }
                }
            }
        ]
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

/**
 * @extends {AElement}
 * @constructor
 */
function EISuggestionList() {
    /**
     *
     * @type {EISuggestionNode}
     */
    this.$selectedNode = null;
    this._data = [];
    this.$children = [];
}

EISuggestionList.prototype.reset = function () {
    //todo: select first suggestion
}

EISuggestionList.prototype.moveToNextSuggestion = function () {
    if (this.$selectedNode) {
        return this.selectElt(this.$selectedNode.nextSibling || this.childNodes[0]);
    }
    else {
        return this.selectElt(this.$children[0]);
    }
};


EISuggestionList.prototype.moveToPrevSuggestion = function () {
    if (this.$selectedNode) {
        return this.selectElt(this.$selectedNode.previousSibling || this.lastChild);
    }
    else {
        return this.selectElt(this.lastChild);
    }
};


EISuggestionList.render = function () {
    return _({
        extendEvent: ['select'],
        class: ['am-select-tree-leaf-box-list', 'as-bscroller', 'as-dropdown-box-common-style', 'as-ei-suggestion-list'],
    });
};

EISuggestionList.prototype.selectElt = function (elt) {
    elt = elt || null;
    if (elt === this.$selectedNode) return false;
    if (this.$selectedNode) {
        this.$selectedNode.removeClass('as-selected');
    }
    this.$selectedNode = elt;
    if (elt) {
        elt.addClass('as-selected');
    }
    if (this.isDescendantOf(document.body)) {
        vScrollIntoView(elt);
    }
    return true;
}

EISuggestionList.prototype.selectMaxScoreItem = function () {
    var maxPath = [];
    var maxScore = 0;
    var visit = (nd, path) => {
        if (nd.data.score > maxScore) {
            maxScore = nd.data.score;
            maxPath = path.concat([nd]);
        }
        path.push(nd);
        nd.$children.forEach(child => {
            visit(child, path);
        });

        path.pop();
    }

    this.$children.forEach((node) => {
        visit(node, []);
    });
    maxPath.forEach((node) => {
        node.open()
    });
    if (maxPath.length > 0) {
        this.selectElt(maxPath[maxPath.length - 1]);
    }
};

EISuggestionList.property = {};

EISuggestionList.property.data = {
    set: function (data) {
        data = data || [];
        this._data = data;
        this.clearChild();
        this.$children = data.map((it) => {
            return _({
                tag: EISuggestionNode,
                props: {
                    data: it
                }
            })
        });

        var viewElements = [];
        this.$children.forEach(function (child) {
            child.getViewElements(viewElements);
        });

        this.addChild(viewElements);
    },
    get: function () {
        return this._data;
    }
};

EISuggestionList.property.selectedSuggestions = {
    get: function () {
        return this.$selectedNode ? this.$selectedNode.data : null;
    }
};


/**
 * @typedef {Object} EISuggestionNodeData
 * @property {string} text
 * @property {string} value
 * @property {string} [desc]
 * @property {string} type
 * @property {boolean} [noSelect]
 * @property {EISuggestionNodeData[]} [children]
 */

/**
 * @extends {AElement}
 * @constructor
 */
function EISuggestionNode() {
    this.$text = $('.as-eisli-text', this);
    this.$desc = $('.as-eisli-desc', this);
    this.$iconCtn = $('.as-eisli-icon-ctn', this);
    this._level = 0;

    this._data = { text: '', desc: '' };
    this.on('click', (event) => {
        this.parentElement.emit('select', {
            type: 'select',
            originalEvent: event,
            target: this,
            data: this.data
        }, this);
    });

    /**
     *
     * @type {EISuggestionNode[]}
     */
    this.$children = [];
    /**
     * @type {"none"|"open"|"close"}
     * @name status
     * @memberOf EISuggestionNode#
     */

    /**
     * @type {EISuggestionNodeData}
     * @name data
     * @memberOf EISuggestionNode#
     */
    /**
     * @type {number}
     * @name level
     * @memberOf EISuggestionNode#
     */
}

EISuggestionNode.render = function () {
    return _({
        class: ['as-ei-suggestion-list-item'],
        child: [
            {
                class: 'as-eisli-toggler',
                child: 'toggler-ico'
            },
            {
                class: 'as-eisli-icon-ctn'
            },
            {
                class: 'as-eisli-text',
                child: { text: '' }
            },
            {
                class: 'as-eisli-desc',
                child: { text: '' }
            }
        ]
    });
}

EISuggestionNode.prototype.getViewElements = function (ac) {
    ac = ac || [];
    ac.push(this);
    if (this.status === 'open') {
        this.$children.forEach(function (child) {
            child.getViewElements(ac);
        });
    }

    return ac;
};


EISuggestionNode.prototype.close = function () {
    if (!this.hasClass(' as-status-open')) return;
    var viewElements = this.getViewElements();
    this.addClass('as-status-close').removeClass('as-status-open');
    viewElements.shift();
    for (var i = 0; i < viewElements.length; ++i) {
        viewElements[i].remove();
    }
};

EISuggestionNode.prototype.open = function () {
    if (!this.hasClass(' as-status-close')) return;
    this.addClass('as-status-open').removeClass('as-status-close');
    var nextSibling = this.nextSibling;
    var viewElements = this.getViewElements();
    for (var i = 0; i < viewElements.length; ++i) {
        this.insertBefore(viewElements[i], nextSibling);
    }
};


EISuggestionNode.property = {};

EISuggestionNode.property.data = {
    /**
     * @this {EISuggestionNode}
     * @param {EISuggestionNodeData} data
     */
    set: function (data) {
        this._data = data || {};
        this.$text.firstChild.data = data.text || '';
        this.$desc.firstChild.data = data.desc || '';
        if (data.noSelect) {
            this.addClass('as-no-select');
        }

        this.$children = (data.children || []).map((childData) => {
            return _({
                tag: EISuggestionNode,
                props: {
                    data: childData,
                    level: this.level + 1
                }
            });
        });
        this.$iconCtn.clearChild();

        if (data.item) {
            switch (data.item.type) {
                case 'variable':
                    this.$iconCtn.addChild(_('span.mdi.mdi-variable'));
                    if (data.children && data.children.length > 0) {
                        this.status = 'open';
                    }
                    break;
                case 'function':
                    this.$iconCtn.addChild(_('span.mdi.mdi-function'));
                    break;
            }
        }
        else {
            this.status = 'open';
            this.$iconCtn.addChild(_('span.mdi.mdi-code-json'));
        }
    },
    get: function () {
        return this._data;
    }
};


EISuggestionNode.property.level = {
    set: function (value) {
        this.addStyle('--level', value + '');
        this._level = value;
        this.$children.forEach((child) => {
            child.level = value + 1;
        });
    },
    get: function () {
        return this._level;
    }
}

EISuggestionNode.property.status = {
    set: function (value) {
        if (value === 'open') {
            this.addClass('as-status-open').removeClass('as-status-close');
        }
        else if (value === 'close') {
            this.addClass('as-status-close').removeClass('as-status-open');
        }
    },
    get: function () {
        if (this.hasClass('as-status-open')) return 'open';
        if (this.hasClass('as-status-close')) return 'close';
        return 'none';
    }
}


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
    elements: ['ident', '_->', 'ident'],
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
    elements: ['new_expression', '_->', 'ident'],
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
    elements: ['mem_exp', '_->', 'ident'],
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
    elements: ['bracket_group', '_->', 'ident'],
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
    ['dsymbol', /\+\+|--|==|!=|<=|>=|\|\||&&|->/],
    ['tsymbol', /\.\.\./],
    ['symbol', /[^\s_a-zA-Z0-9]/],
];


var EIGrammar = {
    elementRegexes: elementRegexes,
    operatorOrder: SCGrammar.operatorOrder,
    rules: rules
};

var EIParser = new DPParser(EIGrammar);
