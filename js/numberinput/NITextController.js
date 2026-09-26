import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { measureText } from "absol/src/HTML5/Text";
import { isNaturalNumber, isRealNumber } from "../utils";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import noop from "absol/src/Code/noop";
import Snackbar from "../Snackbar";
import { parsedNodeToAST } from "absol/src/Pharse/DPParseInstance";
import SCGrammar from "absol/src/SCLang/SCGrammar";
import DPTokenizer from "absol/src/Pharse/DPTokenizer";
import { mixClass } from "absol/src/HTML5/OOP";
import DPParser from "absol/src/Pharse/DPParser";

/***
 *
 * @param {NumberInput} elt
 * @constructor
 */
function NITextController(elt) {
    this.prevBlurTime = 0;
    this.elt = elt;
    /***
     *
     * @type {HTMLInputElement|AElement}
     */
    this.$input = this.elt.$input;
    Object.keys(NITextController.prototype).forEach(key => {
        if (key.startsWith('on'))
            this[key] = this[key].bind(this);
    });
    this.elt.$input.on('keydown', this.onKeyDown)
        .on('input', this.onKeyDown)
        .on('paste', this.onKeyDown)
        .on('blur', this.onBlur)
        .on('focus', this.onFocus);


}


NITextController.prototype.estimateWidthBy = function (text) {
    if (this.elt.hasClass('as-pressing')) return;
    var bound = this.elt.getBoundingClientRect();
    var font = this.$input.getComputedStyleValue('font');
    var width = measureText(text, font || '14px Roboto').width;
    width = Math.ceil(width);
    this.elt.addStyle('--text-width', width + 'px');
    var newBound = this.elt.getBoundingClientRect();
    if (newBound.width !== bound.width) ResizeSystem.requestUpdateUpSignal(this.elt, true);
};


NITextController.prototype.flushTextToValue = function () {
    this.changed = false;
    // var thousandsSeparator = this.elt.thousandsSeparator || '';
    // var decimalSeparator = this.elt.decimalSeparator;
    var text = this.$input.value;

    text = text.replace(/[^0-9\-+.,()%*\/]/g, '');
    var errorCtx = {};
    var value = execute(text, this.elt.valueCtrl.isVI, errorCtx);
    if (isRealNumber(value)) {
        this.elt.valueCtrl.value = value;
    }
};


NITextController.prototype.flushValueToText = function () {
    var text = this.elt.valueCtrl.originValueText;
    this.$input.value = text;
    text = this.elt.valueCtrl.formatedValueText;
    this.elt.$text.firstChild.firstChild.data = text;
    this.estimateWidthBy(text);
};

NITextController.prototype.showError = function (errorMessage) {

};


NITextController.prototype.reformat = function () {
    var thousandsSeparator = this.elt.thousandsSeparator || '';
    var decimalSeparator = this.elt.decimalSeparator;
    var caretPos = this.$input.selectionEnd;
    var value = this.$input.value;
    var parts = value.split(decimalSeparator);
    var caretWTSPos = value.substring(0, caretPos).split(thousandsSeparator).join('').length;
    parts[0] = parts[0].split('').filter(x => x.match(/[0-9\-]/)).reduce((ac, c, i, arr) => {
        ac += c;
        if ((i + 1 < arr.length) && ((arr.length - i) % 3 === 1) && arr[i] !== '-') {
            ac += thousandsSeparator;
        }
        return ac;
    }, '');
    if (parts[1]) parts[1] = parts[1].split('').filter(x => x.match(/[0-9]/)).join('');

    var newValue = parts.join(decimalSeparator);
    var newCaretPos = 0;
    var counter = 0;
    for (newCaretPos = 0; newCaretPos < newValue.length && counter < caretWTSPos; ++newCaretPos) {
        if (newValue[newCaretPos].match(/[0-9\-]/) || newValue[newCaretPos] === decimalSeparator) {
            counter++;
        }
    }
    this.$input.value = newValue;
    this.$input.setSelectionRange(newCaretPos, newCaretPos);

    this.estimateWidthBy(newValue);
};


NITextController.prototype.onBlur = function () {
    clearTimeout(this.blurClazzTO);
    this.blurClazzTO = setTimeout(() => {
        this.elt.removeClass('as-focus');
    }, 100);
    this.prevBlurTime = Date.now();
    this.flushValueToText();
    this.elt.notifyChanged({ by: 'blur' });

}


/***
 * @param {KeyboardEvent|ClipboardEvent|{}} event
 * @param {boolean=} event
 */
NITextController.prototype.onKeyDown = function (event) {
    var key = event.type === 'keydown' ? keyboardEventToKeyBindingIdent(event) : '';
    var onKeys = {};
    onKeys.enter = () => {
        if (this.elt.readOnly) return;
        this.flushValueToText();
        this.$input.setSelectionRange(this.$input.value.length, this.$input.value.length);
        this.elt.notifyChanged({ by: 'enter' });
    };

    if (onKeys[key]) {
        event.preventDefault();
        onKeys[key]();
    }
    else {
        this.changed = true;
        setTimeout(() => {
            this.flushTextToValue();
        }, 10);
    }
};


/***
 * @param {FocusEvent|{}} event
 */
NITextController.prototype.onFocus = function (event) {
    var focusTime = Date.now();
    this.elt.addClass('as-focus');
    clearTimeout(this.blurClazzTO);
    setTimeout(() => {
        var fOVT = this.elt.valueCtrl.originValueText;
        var txt = this.$input.value;
        var selectionStart = this.$input.selectionStart;
        var selectionEnd = this.$input.selectionEnd;
        var selectionDir = this.$input.selectionDirection;

        if (fOVT !== txt && !this.elt.readOnly) {
            this.$input.value = fOVT;
            if (focusTime - this.prevBlurTime > 500) {
                //fist focus
                this.$input.select();
            }
            else {
                this.$input.setSelectionRange(selectionStart, selectionEnd, selectionDir);
            }
        }
        else if (focusTime - this.prevBlurTime > 500) {
            //fist focus
            this.$input.select();
        }
    }, 30);
};

export default NITextController;


/*********************************
 * EXPRESSION
 */

var rules = [];

var elementRegexes = [
    ['string', /("(?:[^"\\\n]|\\.)*?")|('(?:[^'\\\n]|\\.)*?')/],
    ['number', /(\d+([.]\d*)?([eE][+-]?\d+)?|[.]\d+([eE][+-]?\d+)?)/],
    ['word', /[_a-zA-Z][_a-zA-Z0-9]*/],
    ['skip', /([\s\r\n])|(\/\/[^\n]*)|(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)/],
    ['dsymbol', /\+\+|--|==|!=|<=|>=|<>|\|\||&&|->/],
    ['tsymbol', /\.\.\./],
    ['symbol', /[^\s_a-zA-Z0-9]/],
];

var elementRegexesVI = elementRegexes.slice();
elementRegexesVI[1] = ['number', /(\d+([,]\d*)?([eE][+-]?\d+)?|[,]\d+([eE][+-]?\d+)?)/];


var operatorOrder = {
    '*': 5,
    '/': 5,
    'MOD': 5,
    '%': 5,
    '+': 6,
    '-': 6
}


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
    target: 'exp',
    elements: ['number'],
    toAST: function (parsedNode) {
        return parsedNodeToAST(parsedNode.children[0]);
    }
});


['+', '-', '*', '/', '%'].forEach(function (op) {
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


rules.push({
    target: 'exp',
    elements: ['exp', 'bin_op', 'exp'],
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


['+', '-', '!'].forEach(function (op) {
    ['number', 'bracket_group', 'unary_exp'].forEach(function (arg) {
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

var NIGrammar = {
    elementRegexes: elementRegexes,
    operatorOrder: operatorOrder,
    rules: rules
};

function NITokenizerVI() {
    DPTokenizer.apply(this, arguments);
}

mixClass(NITokenizerVI, DPTokenizer);

NITokenizerVI.prototype.tokenize = function () {
    var res = DPTokenizer.prototype.tokenize.apply(this, arguments);
    //convert to use same rules
    res.forEach(token => {
        if (token.type === 'number') {
            token.originalContent = token.content;
            token.content = token.originalContent.replace(/,/g, '.');
        }
    });
    return res;
};

var NIGrammarVI = {
    elementRegexes: elementRegexesVI,
    operatorOrder: operatorOrder,
    rules: rules,
    tokenizerClass: NITokenizerVI
};


/**
 * @extends DPParser
 * @param opt
 * @constructor
 */
function NIParserClass(opt) {
    opt = opt || {};
    if (opt.rules) {
        this.rules = opt.rules;
    }
    this.targets = {};
    var NITokenizerClass = opt.tokenizerClass || DPTokenizer;
    this.tokenizer = new NITokenizerClass(opt);
    this.computeTarget();
}

mixClass(NIParserClass, DPParser);


var NIParser = new NIParserClass(NIGrammar);
var NIParserVI = new NIParserClass(NIGrammarVI);


var visitor = {};

visitor.BinaryExpression = function (nd) {
    switch (nd.operator.content) {
        case '+':
            return accept(nd.left) + accept(nd.right);
        case '-':
            return accept(nd.left) - accept(nd.right);
        case '*':
            return accept(nd.left) * accept(nd.right);
        case '/':
            return accept(nd.left) / accept(nd.right);
        case '%':
            return accept(nd.left) % accept(nd.right);
    }
    return 0;
}

visitor.NumericLiteral = function (nd) {
    return nd.value;
};

visitor.UnaryExpression = function (nd) {
    switch (nd.operator.content) {
        case '+':
            return +accept(nd.argument);
        case '-':
            return -accept(nd.argument);
    }
    return 0;
};

function accept(nd) {
    if (!nd) return NaN;
    var type = nd.type;
    if (type in visitor) {
        return visitor[type](nd);
    }
    else {
        console.log("Can not handle ", nd);
        return NaN;
    }
}

var execute = function (text, isVI, ctx) {
    var parser = isVI ? NIParserVI : NIParser;
    var t = parser.parse(text, 'exp');
    if (t.ast) {
        return accept(t.ast);
    }
    else {
        if (ctx) {
            ctx.error = t.error;
            ctx.tokens = t.tokens;
        }
        return NaN;
    }
};


export function parseLocalFloat(text) {
    var isVI = false;
    if ((typeof systemconfig === 'object') && systemconfig && systemconfig.commaSign) {
        isVI = systemconfig.commaSign === ',';
    }
    else {
        isVI = navigator.language==='vi';
    }
    return execute(text, isVI);
}

var makeErrorMessage = function (ctx) {
    //todo
};
