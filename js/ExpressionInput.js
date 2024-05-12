

import ACore, { _, $ } from "../ACore";

import '../css/expressioninput.css'
// import '../../../css/ExpressionInput.css';
import DomSignal from "absol/src/HTML5/DomSignal";
import SCParser from "absol/src/SCLang/SCParser";
import PreInput from "./PreInput";
/***
 * @extends AElement
 * @constructor
 */
function ExpressionInput() {
    this._stopChangeTO = -1;
    this.on('stopchange', this.highlightError.bind(this));

    this.$content = $('.as-expression-input-content', this)
        .on('keydown', this.eventHandler.keydown)
        .on('cut', this.eventHandler.cut)
        .on('blur', this.eventHandler.blur)
        .on('focus', this.eventHandler.focus)
        .on('paste', this.eventHandler.paste);
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.domSignal.on('redrawTokens', this.redrawTokens.bind(this));
    this.lastSelectedPosition = null;
    /****
     * @name value
     * @type {string}
     * @memberOf ExpressionInput#
     */
}


ExpressionInput.tag = 'ExpressionInput'.toLowerCase();

ExpressionInput.render = function () {
    return _({
        extendEvent: ['stopchange'],
        class: ['as-expression-input'],
        child: [
            {
                class: 'as-expression-input-icon-ctn',
                child: ['span.mdi.mdi-equal', 'span.mdi.mdi-alert-circle']
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


ExpressionInput.prototype.tokenize = function (source) {
    return [];
};

ExpressionInput.prototype.getSelectPosition = PreInput.prototype.getSelectPosition;
ExpressionInput.prototype.getPosition = PreInput.prototype.getPosition;
ExpressionInput.prototype.stringOf = PreInput.prototype.stringOf;
ExpressionInput.prototype.tokenOf = function (elt) {

};

ExpressionInput.prototype.delayNotifyStopChange = function () {
    if (this._stopChangeTO > 0) {
        clearTimeout(this._stopChangeTO);
    }
    this._stopChangeTO = setTimeout(function () {
        this._stopChangeTO = -1;
        this.emit('stopchange', {}, this);
    }.bind(this), 200);
};


ExpressionInput.prototype.makeTokenElt = function (token) {
    return _({
        tag: 'span',
        class: ['as-token'],
        attr: {
            'data-type': token.type
        },
        child: { text: token.content }
    });
};

ExpressionInput.prototype.tokenOf = function (elt) {
    if (!elt.classList.contains('as-token')) return null;
    var res = {};
    res.type = elt.getAttribute('data-type');
    res.content = elt.firstChild && elt.firstChild.data;
    if (res.type && res.content)
        return res;
    return null;
};


ExpressionInput.prototype.highlightError = function () {
    var value = this.value.trim();
    var it = SCParser.parse(value, 'exp');
    var i, notSkipCount = 0;
    var tokenErrorIdx = -1;
    if (value && it.error) {
        this.addClass('as-error');
        this.attr('title', it.error.message);
        tokenErrorIdx = it.error.tokenIdx;
    }
    else {
        this.removeClass('as-error');
    }

    for (i = 0; i < this.$content.childNodes.length; ++i) {
        if (this.$content.childNodes[i].classList.contains('as-token') && this.$content.childNodes[i].getAttribute('data-type') !== 'skip') {
            if (notSkipCount === tokenErrorIdx) {
                this.$content.childNodes[i].classList.add('as-unexpected-token');
            }
            else {
                this.$content.childNodes[i].classList.remove('as-unexpected-token');
            }
            notSkipCount++;
        }
    }
};

ExpressionInput.prototype.clearErrorHighlight = function () {
    for (var i = 0; i < this.$content.childNodes.length; ++i) {
        if (this.$content.childNodes[i].classList.contains('as-token') && this.$content.childNodes[i].getAttribute('data-type') !== 'skip') {
            this.$content.childNodes[i].classList.remove('as-unexpected-token');
        }
    }
};

ExpressionInput.prototype.setSelectedPosition = function (pos) {
    //when tokenized
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

    var curOffset = 0;
    var elt;
    var childNodes = this.$content.childNodes;
    var content;
    var i;
    var sel = window.getSelection();
    var range = document.createRange();
    var d1 = true, d2 = true;
    for (i = 0; i < childNodes.length && d1 && d2; ++i) {
        elt = childNodes[i];
        content = (elt.firstChild && elt.firstChild.data) || '';
        if (d1 && curOffset <= start && (curOffset + content.length > start || i + 1 === childNodes.length)) {
            range.setStart(elt.firstChild || elt, start - curOffset);
            d1 = false;
        }
        if (d2 && curOffset <= end && (curOffset + content.length > end || i + 1 === childNodes.length)) {
            range.setEnd(elt.firstChild || elt, end - curOffset);
            d2 = false;
        }
        curOffset += content.length;
    }
    sel.removeAllRanges();
    sel.addRange(range);
    this.lastSelectedPosition = { start: start, end: end, direction: 'forward' };
};

ExpressionInput.prototype.insertText = function (text) {
    var lastPos = this.lastSelectedPosition;
    var value;
    if (this.lastSelectedPosition) {
        value = this.value;
        this.value = value.substring(0, lastPos.start) + text + value.substring(lastPos.end);
        this.lastSelectedPosition = Object.assign({
            direction: 'forward',
            start: lastPos.start + text.length,
            end: lastPos.start + text.length
        });
        if (document.activeElement === this.$content) {
            this.setSelectedPosition(this.lastSelectedPosition);
        }
    }
    else this.appendText(text);
    this.delayNotifyStopChange();
};

ExpressionInput.prototype.appendText = function (text) {
    var newValue = this.value + text;
    this.value = newValue;
    if (document.activeElement === this.$content) {
        this.setSelectedPosition(newValue.length);
    }
    this.delayNotifyStopChange();
}


ExpressionInput.prototype.redrawTokens = function () {
    var selectedPos = this.getSelectPosition();
    var value = this.value;
    var tokens = SCParser.tokenizer.tokenize(value);
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


ExpressionInput.property = {};
ExpressionInput.property.value = {
    get: function () {
        return this.stringOf(this.$content);
    },
    set: function (value) {
        var tokens = SCParser.tokenizer.tokenize(value || '');
        this.$content.clearChild()
            .addChild(tokens.map(function (token) {
                return this.makeTokenElt(token);
            }.bind(this)));
        this.lastSelectedPosition = null;
    }
};

/***
 * @memberOf ExpressionInput#
 * @type {{}}
 */
ExpressionInput.eventHandler = {};

/***
 *
 * @param {KeyboardEvent} event
 */
ExpressionInput.eventHandler.keydown = function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
    else if ((event.ctrlKey && event.key === 'X') || (!event.ctrlKey && event.key.length === 1)
        || event.key === 'Delete'
        || event.key === 'Backspace') {
        this.domSignal.emit('redrawTokens');
    }
    this.delayNotifyStopChange();
};

/***
 *
 * @param {MouseEvent} event
 */
ExpressionInput.eventHandler.mousedown = function (event) {

};

ExpressionInput.eventHandler.paste = function (event) {
    let paste = (event.clipboardData || window.clipboardData).getData('text');
    paste = paste.replace(/[\r\n]+/g, ' ');
    event.preventDefault();
    var pos = this.getSelectPosition();
    if (!pos || !paste) return;
    var value = this.value;
    var newValue = value.substring(0, pos.start) + paste + value.substring(pos.end);
    this.value = newValue;
    this.setSelectedPosition(pos.start + paste.length);
    this.highlightError();
};

ExpressionInput.eventHandler.cut = function (event) {
    this.domSignal.emit('redrawTokens');
    this.delayNotifyStopChange();
};

/***
 * @this ExpressionInput
 */
ExpressionInput.eventHandler.blur = function () {
    this.highlightError();
};


/***
 * @this ExpressionInput
 */
ExpressionInput.eventHandler.focus = function () {
    this.clearErrorHighlight();
    setTimeout(function () {
        this.lastSelectedPosition = this.getSelectPosition();
    }.bind(this), 100);
};

ACore.install(ExpressionInput)


export default ExpressionInput;


/*import '../css/expressioninput.css';
import EditableElement, { _, $ } from "./EditableElement";
import SCGrammar from "absol/src/SCLang/SCGrammar";
import DPParser from "absol/src/Pharse/DPParser";
import { parsedNodeToAST, parsedNodeToASTChain } from "absol/src/Pharse/DPParseInstance";


function EIIdentifier() {

}

EIIdentifier.tag = 'EIIdentifier'.toLowerCase();
EIIdentifier.render = function () {
    return _({
        class: ['asei-identifier', 'asei-elt'],
        child: { text: 'Math' }
    });
};


function EINumber() {

}


EINumber.tag = 'EINumber'.toLowerCase();
EINumber.render = function () {
    return _({
        class: ['asei-number', 'asei-elt'],
        child: { text: '1234' }
    });
};


function EIArgumentList() {

}

EIArgumentList.tag = 'EIArgumentList'.toLowerCase();
EIArgumentList.render = function () {
    return _({
        class: ['asei-argument-list', 'asei-elt'],
        child: []
    });
};


function EIBinaryChain() {

}


EIBinaryChain.tag = 'EIBinaryChain'.toLowerCase();
EIBinaryChain.render = function () {
    return _({
        class: ['asei-binary-chain', 'asei-elt'],
        child: []
    });
};


function EICallExpression() {

}


EICallExpression.tag = 'EICallExpression'.toLowerCase();
EICallExpression.render = function () {
    return _({
        class: ['asei-call-expression', 'asei-elt'],
        child: []
    });
};


function EIGroup() {

}


EIGroup.tag = 'EICallExpression'.toLowerCase();
EIGroup.render = function () {
    return _({
        class: ['asei-group', 'asei-elt'],
        child: []
    });
};


/**
 *
 * @constructor
 *
function ExpressionInput() {
    this._value = '';
    this.$content = $('.as-expression-input-content', this);

}

ExpressionInput.tag = 'ExpressionInput'.toLowerCase();

ExpressionInput.render = function () {
    return _({
        class: 'as-expression-input',
        child: [
            {
                attr: { contenteditable: true },
                class: 'as-expression-input-content',
                child: [
                    { tag: EIIdentifier }
                ]
            }
        ]
    });
};


ExpressionInput.property = {};

ExpressionInput.property.value = {
    set: function (value) {
        if (typeof value !== "string") value = '';
        this._value = value;
        var res = EIParser.parse(value, 'exp');
        console.log(res);
    },
    get: function () {

    }
};


ExpressionInput.property.ast = {
    get: function () {

    }
};

export default ExpressionInput;

/**
 *
 * @param {ExpressionInput} elt
 * @constructor
 *
function EITokenizer(elt) {
    this.elt = elt;
}

EITokenizer.prototype.getText = function () {

};




var rules = [];

rules.push({
    target: 'e_exp',
    elements: ['__'],
    toAST: function (parsedNode) {
        return {
            type: 'EmptyExpression',
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
    target: 'exp',
    elements: ['ident'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


rules.push({
    target: 'exp',
    elements: ['function_call'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


var EIGrammar = {
    elementRegexes: SCGrammar.elementRegexes,
    operatorOrder: SCGrammar.operatorOrder,
    rules: rules
};

var EIParser = new DPParser(EIGrammar);

*/