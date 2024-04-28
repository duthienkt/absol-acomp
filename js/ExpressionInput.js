import '../css/expressioninput.css';
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
 */
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

