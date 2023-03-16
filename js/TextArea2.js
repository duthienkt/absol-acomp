import '../css/textarea2.css';
import ACore from "../ACore";
import SelectMenu from "./SelectMenu";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;


/***
 *
 *  @augments HTMLTextAreaElement
 *  @augments AElement
 *
 * @constructor
 */
function TextArea2() {
    this.on('keydown', this.eventHandler.keydown);
    this.on('paste', this.eventHandler.paste);
    this.on('cut', this.eventHandler.paste);
}

TextArea2.tag = 'TextArea2'.toLowerCase();

TextArea2.render = function () {
    return _('textarea.absol-textarea2');
};


TextArea2.getRenderPre = function () {
    if (!TextArea2.$preSpace) {
        TextArea2.$preSpace = _('textarea').addStyle({
            'overflow': 'hidden',
            'height': '12px',
            'resize': 'none'
        }).addTo(SelectMenu.getRenderSpace());
    }
    return TextArea2.$preSpace;
};

TextArea2.prototype.updateSize = function () {
    var heightStyle = this._measureHeight(this.value);
    this.addStyle('height', heightStyle);
};

TextArea2.eventHandler = {};

TextArea2.eventHandler.keydown = function (event) {
    if (event.altKey || event.ctrlKey) return;
    var key = event.key;
    var selectPost = this.getInputSelection();
    var leftText = this.value.substring(0, selectPost.start);
    var rightText = this.value.substring(selectPost.end);


    var middText = '';
    if (key == 'Enter') {
        middText = '\n';
    }
    else if (key == 'Backspace') {
        if (leftText.length > 0) {
            leftText = leftText.substring(0, leftText.length - 1);
        }
    }
    else if (key == 'Delete') {
        if (selectPost.start < selectPost.end) {
            middText = '';
        }
        else if (rightText.length > 0) {
            rightText = rightText.substring(1);
        }
    }
    else if (key.length == 1) {//char
        middText = key;
    }
    else {
        return;
    }
    var newText = leftText + middText + rightText;

    var heightStyle = this._measureHeight(newText);
    this.addStyle('height', heightStyle);
};


TextArea2.eventHandler.paste = function (event) {
    // var text  = 
    var cl = event.clipboardData || window.clipboardData;
    var middText = cl.getData('Text') || '';
    var selectPost = this.getInputSelection();
    var leftText = this.value.substring(0, selectPost.start);
    var rightText = this.value.substring(selectPost.end);
    var newText = leftText + middText + rightText;

    var heightSyle = this._measureHeight(newText);
    this.addStyle('height', heightSyle);

};


TextArea2.eventHandler.cut = function (event) {
    // var text  = 
    var cl = event.clipboardData || window.clipboardData;
    var selectPost = this.getInputSelection();
    var leftText = this.value.substring(0, selectPost.start);
    var rightText = this.value.substring(selectPost.end);
    var newText = leftText + rightText;

    var heightSyle = this._measureHeight(newText);
    this.addStyle('height', heightSyle);

};

TextArea2.prototype._measureHeight = function (text) {
    var pre = TextArea2.getRenderPre();
    pre.addStyle('padding-left', this.getComputedStyleValue('padding-left'))
    pre.addStyle('padding-right', this.getComputedStyleValue('padding-right'))
    pre.addStyle('padding-top', this.getComputedStyleValue('padding-top'))
    pre.addStyle('padding-bottom', this.getComputedStyleValue('padding-bottom'));
    pre.addStyle('width', this.getComputedStyleValue('width'));
    pre.addStyle('height', this.getFontSize() + 'px');
    pre.addStyle('boder', this.getComputedStyleValue('boder'));
    pre.addStyle('font-size', this.getComputedStyleValue('font-size'));
    pre.addStyle('font-family', this.getComputedStyleValue('font-family'));
    pre.value = text;
    var result = pre.scrollHeight + 'px';
    return result;
};

/**
 * Return an object with the selection range or cursor position (if both have the same value)
 * @param {DOMElement} el A dom element of a textarea or input text.
 * @return {Object} reference Object with 2 properties (start and end) with the identifier of the location of the cursor and selected text.
 **/
TextArea2.prototype.getInputSelection = function () {
    var start = 0, end = 0, normalizedValue, range, textInputRange, len, endRange;

    if (typeof this.selectionStart == "number" && typeof this.selectionEnd == "number") {
        start = this.selectionStart;
        end = this.selectionEnd;
    }
    else {
        range = document.selection.createRange();

        if (range && range.parentElement() == this) {
            len = this.value.length;
            normalizedValue = this.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = this.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = this.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            }
            else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                }
                else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

ACore.install(TextArea2);
export default TextArea2;