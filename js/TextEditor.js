import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import { getTextNodesIn, getTextIn, measureText } from "absol/src/HTML5/Text";

var _ = Acore._;
var $ = Acore.$;


function TextEditor() {
    var res = _({
        class: ['absol-text-editor'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-text-editor-text-layer',
                attr: {
                    contenteditable: 'true'
                },
                child: {
                    class: 'absol-text-editor-line',
                    child: 'br'
                }
            },
            {
                class: 'absol-text-editor-position',
                child: { text: 'Ln 1, Col 1' }
            }
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, TextEditor.eventHandler);
    res._textFont = '14px Helvetica, Arial, sans-serif';
    res.$textLayter = $('.absol-text-editor-text-layer', res)
        .on('keydown', res.eventHandler.keydown);

    res.$cursorPos = $('.absol-text-editor-position', res);
    res.on('mousedown', res.eventHandler.mousedown)
        .on('mouseup', res.eventHandler.mouseup)
        .on('paste', res.eventHandler.paste);
    // res.$attachook = _('attachhook').addTo(res)
    //     .on('error', function () {
    //         res.reloadFontInfo();
    //     });
    // res.on('focus', res.eventHandler.focus, true);

    // res.$editable = $('.absol-text-editor-edittable', res)
    //     .on('keydown', res.eventHandler.keydown, true);

    // res.$textLayer = $('.absol-text-editor-text-layer', res);
    // res._cursorCol = 0;
    // res._cursorRow = 0;
    // res.$cursor = $('.absol-text-editor-cursor', res);
    return res;
}


TextEditor.eventHandler = {};

// TextEditor.eventHandler.focus = function (event) {
//     this.focus();
// };

// TextEditor.eventHandler.editableBlur = function (event) {
//     this.removeClass('absol-focus');
// };


TextEditor.eventHandler.keydown = function (event) {
    this.isEmptyText();
    if (event.key == 'Backspace') {
        if (this.isEmptyText()) event.preventDefault();
    }
    setTimeout(this._updateCursorPosition.bind(this), 1);
};

TextEditor.eventHandler.mousedown = function () {
    setTimeout(this._updateCursorPosition.bind(this), 1);
};

TextEditor.eventHandler.mouseup = function () {
    setTimeout(this._updateCursorPosition.bind(this), 1);
};


TextEditor.eventHandler.paste = function (event) {
    setTimeout(this._normalizeLineElt.bind(this, this._lineOf(event.target)), 1);
};

TextEditor.prototype._normalizeLineEltFrom = function (elt){

}

TextEditor.prototype._normalizeLineElt = function (elt) {
    if (elt.classList.contains('absol-text-editor-line') && elt.childNodes.length == 1) return false;
    var texts = getTextIn(elt).split('\n');
    var text, childStruct;
    var newOffset;
    text = texts.shift();
    newOffset = text.length;
    var cLine = $(elt).clearChild().addChild(_({ text: text }));
    var lLine;
    while (texts.length > 1) {
        text = texts.shift();
        newOffset = text.length;
        lLine = cLine;
        cLine = _({ class: 'absol-text-editor-line', child: { text: text } });
        this.$textLayter.addChildAfter(cLine, lLine);
    }
    if (texts.length == 1) {
        text = texts.shift();
        newOffset = text.length;

        lLine = cLine;
        var lLineIndex = this._lineIndexOf(lLine);
        if (lLineIndex == this.$textLayter.childNodes.length - 1) {
            if (text == '')
                childStruct = 'br';
            else childStruct = { text: text };
            cLine = _({ class: 'absol-text-editor-line', child: childStruct });
            this.$textLayter.addChild(cLine);
        }
        else {
            cLine = $(this.$textLayter.childNodes[lLineIndex + 1]);
            text = text + getTextIn(cLine);
            cLine.clearChild()
                .addChild(_({ text: text }));
        }
    }

    var range = document.createRange();
    
    range.setStart(cLine.childNodes[0], newOffset);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);



};

TextEditor.prototype._updateCursorPosition = function () {
    var selection = document.getSelection();
    this._selection = {};
    this._selection.anchorNode = selection.anchorNode;
    this._selection.anchorOffset = selection.anchorOffset;
    this._selection.focusNode = selection.focusNode;
    this._selection.focusOffset = selection.focusOffset;
    this._selection.type = selection.type;
    var r = this._lineIndexOf(this._selection.focusNode);
    var c = this._selection.focusOffset;
    this.$cursorPos.innerHTML = "Ln " + (r + 1) + ', ' + 'Col ' + (c + 1);
};

TextEditor.prototype._lineIndexOf = function (node) {
    while (node) {
        if (node.tagName == 'DIV' && node.classList.contains('absol-text-editor-line')) {
            return Array.prototype.indexOf.call(this.$textLayter.childNodes, node);
        }
        node = node.parentElement;
    }
    return -1;
};


TextEditor.prototype._lineOf = function (node) {
    while (node) {
        if (node.tagName == 'DIV' && node.classList.contains('absol-text-editor-line')) {
            return node;
        }
        node = node.parentElement;
    }
    return undefined;
};




TextEditor.prototype.getSelection = function () {

};


TextEditor.prototype.getCursorPosition = function () {

};


TextEditor.prototype.isEmptyText = function () {
    if (this.$textLayter.childNodes.length == 1 && this.$textLayter.childNodes[0].innerHTML == "" || this.$textLayter.childNodes[0].innerHTML == '<br>' || this.$textLayter.childNodes[0].innerHTML == '</br>')
        return true;
    return false;
};

// TextEditor.prototype.flushEditable = function () {
//     var text = getTextIn(this.$editable);
//     var images = [];
//     $('img', this.$editable, function (elt) {
//         images.push(elt);
//     });
//     this.$editable.clearChild();
//     if (text)
//         this.insertText(text);

// };

// TextEditor.prototype.focus = function () {
//     this.addClass('absol-focus');
//     this.$editable.focus();
// };

// TextEditor.prototype.blur = function () {
//     this.removeClass('absol-focus');
//     this.$editable.blur();
// };


// TextEditor.prototype.insertText = function (text) {
//     var lineElt = this.$textLayer.childNodes[this._cursorRow];
//     var textNode = lineElt.childNodes[0];
//     var oldText = textNode.data;
//     var newText = oldText.slice(0, this._cursorCol) + text;
//     this._cursorCol += text.length;
//     var textWidth = measureText(newText, this._textFont).width;

//     this.$cursor.addStyle('left', textWidth + 'px');
//     newText += oldText.slice(this._cursorCol);
//     textNode.data = newText;
// };

// TextEditor.prototype.insertLine = function (rowPos, text) {
//     rowPos = Math.min(this.$textLayer.childNodes.length, rowPos);
//     text = text || '';
//     var newLineElt = _({
//         class: 'absol-text-editor-line',
//         child: { text: text }
//     });

//     var lineElt = this.$textLayer.childNodes[rowPos];
//     if (lineElt) {
//         this.$textLayer.addChildBefore(newLineElt, lineElt);
//     }
//     else {
//         this.$textLayer.addChild(newLineElt);
//     }

//     if (this._cursorRow >= rowPos) {
//         ++this._cursorRow;
//         this.$cursor.addStyle('top', 1.5 * this._cursorRow + 'em');
//     }
// };


// TextEditor.prototype.reloadFontInfo = function () {
//     this._textFont = this.getComputedStyleValue('font');
// };

// TextEditor.prototype.setCursorPosition = function (row, col) {

// };

// TextEditor.prototype.setText = function () {

// };

// TextEditor.prototype.getText = function () {

// };

Acore.install('texteditor', TextEditor);