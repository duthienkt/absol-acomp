import { EmojiAnimByIdent } from "../EmojiAnims";
import { _ } from "../../ACore";
import Dom from "absol/src/HTML5/Dom";
import EmojiPicker from "../EmojiPicker";
import { buildCss } from "../utils";
import { isNewLine, isText, isToken, isTokenText, text2ContentElements, tokenizeMessageText } from "./tiutils";

export var EMPTY_2_SPACES = String.fromCharCode(0x2003);

Dom.documentReady.then(() => {
    var styleSheet = {};
    for (var name in EmojiAnimByIdent) {
        styleSheet['.as-emoji-token[data-text="' + name + '"]'] = {
            'background-image': 'url(' + EmojiPicker.assetRoot + '/static/x20/' + EmojiAnimByIdent[name][1] + ')'
        }
    }

    buildCss(styleSheet)
});

/***
 *
 * @param {TokenizeHyperInput} elt
 * @constructor
 */
function TITextController(elt) {
    this.elt = elt;
}

TITextController.prototype.setText = function (text) {
    this.elt.clearChild();
    this.elt.addChild(text2ContentElements(text, { tagMap: this.elt.tagMap }));
    this.elt.addChild(this.elt.$br);
};

TITextController.prototype.getText = function () {
    var nodes = Array.prototype.slice.call(this.elt.childNodes);
    if (isNewLine(nodes[nodes.length - 1])) {
        nodes.pop();
    }
    return nodes.map(node => {
        if (isText(node)) {
            return node.data;
        }
        else if (isToken(node)) {
            return node.getAttribute('data-text') || '';
        }
        else if (isNewLine(node)) return '\n';
    }).join('');
};


/***
 *
 * @param {Range=} range default: previous selected range
 */
TITextController.prototype.getTextByRange = function (range) {
    range = range || this.elt.selectionCtrl.prevRange;
    if (!range) return this.getText();
    var nodes = Array.prototype.slice.call(this.elt.childNodes);
    if (isNewLine(nodes[nodes.length - 1])) nodes.pop();
    var startCtn = range.startContainer;
    var startOffset = range.startOffset;
    var endCtn = range.endContainer;
    var endOffset = range.endOffset;
    if (startCtn === this.elt) {
        startCtn = this.elt.childNodes[startOffset - 1];
        startOffset = 0;
    }
    else if (isTokenText(startCtn)) {
        startCtn = startCtn.parentElement;
    }

    if (endCtn === this.elt) {
        endCtn = this.elt.childNodes[endOffset];
        endOffset = 0;
    }
    else if (isTokenText(endCtn)) {
        endCtn = endCtn.parentElement;
    }

    if (startCtn === endCtn) {
        if (isToken(startCtn)) {
            return startCtn.getAttribute('data-text');
        }
        else if (isText(startCtn)) {
            return startCtn.data.substring(startOffset, endOffset);
        }
        return '';
    }

    var res = '';
    var node;


    var started = false;


    for (var i = 0; i < nodes.length; ++i) {
        node = nodes[i];
        if (started) {
            if (endCtn === node) {
                if (isToken(endCtn)) {
                    res += node.getAttribute('data-text');
                }
                else if (isText(node)) {
                    res += node.data.substring(0, endOffset);
                }
                break;
            }
            else {
                if (isToken(node)) {
                    res += node.getAttribute('data-text');
                }
                else if (isText(node)) {
                    res += node.data;
                }
                else if (isNewLine(node)) {
                    res += '\n';
                }
            }
        }
        else {
            if (startCtn === node) {
                started = true;
                if (isText(node)) {
                    res += node.data.substring(startOffset);
                }
                else if (isToken(node)) {
                    if (startOffset === 0) {
                        res += node.getAttribute('data-text');
                    }
                }
            }
        }
    }

    return res;
}


TITextController.prototype.applyData = function (text, offset) {
    this.setText(text);
    this.elt.selectionCtrl.setRangeByOffset(offset);
};

TITextController.prototype.insertText = function (text) {
    var range = document.getSelection().getRangeAt(0);
    range.deleteContents();
    this.elt.selectionCtrl.onSelect();
    range = document.getSelection().getRangeAt(0);
    var eltChain = text2ContentElements(text, { tagMap: this.elt.tagMap });
    var startCtn = range.startContainer;
    var at;
    if (isTokenText(startCtn)) {
        at = startCtn.parentElement;
    }
    else if (startCtn === this.elt) {
        at = this.elt.childNodes[range.startOffset - 1];
    }

    var newNode;
    while (eltChain.length > 0) {
        newNode = eltChain.shift();
        if (!at) {
            this.elt.addChildBefore(newNode, this.elt.firstChild);
            at = newNode;
        }
        else if (isText(at) && isText(newNode)) {
            at.data += newNode.data;
        }
        else {
            this.elt.addChildAfter(newNode, at);
            at = newNode;
        }
    }
};


export default TITextController;