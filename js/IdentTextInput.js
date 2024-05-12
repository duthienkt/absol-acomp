import ACore, { _ } from "../ACore";
import { setCaretPosition } from "absol/src/HTML5/Text";



/***
 * @augments HTMLInputElement
 * @augments AElement
 * @constructor
 */
function IdentTextInput() {
    this.history = new ITIHistory(this);
    this.textCtrl = new ITITextController(this);
    // this.on('keydown', this.eventHandler.identTextKeyDown)
    //     .on('paste', this.applyData ? this.eventHandler.identTextPaste : this.eventHandler.identTextPaste1);
}


IdentTextInput.tag = 'IdentTextInput'.toLowerCase();

IdentTextInput.render = function () {
    return _('input.as-text-input[type="text"]');
};



IdentTextInput.prototype._filterHistory = function () {
    if (!this.history) return;
    var temp = this.history.filter(function (t) {
        return !t.text.match(/(^[^a-zA-Z_$])|([^a-zA-Z$_0-9]+)/);
    });
    this.history.splice(0, this.history.length);
    this.history.push.apply(this.history, temp);
};

IdentTextInput.prototype._setNewText = function (text, caretPos) {
    this._filterHistory();
    if (typeof caretPos !== "number") caretPos = text.length;
    caretPos = Math.max(0, Math.min(text.length, caretPos >> 0));
    if (this.applyData) {
        this.applyData(text, { start: caretPos, end: caretPos, direction: 'forward' });
    }
    else {
        this.value = text;
        setCaretPosition(this, caretPos);
    }
};

//
// IdentTextInput.eventHandler.identTextKeyDown = function (event) {
//
// };
//
//
// IdentTextInput.eventHandler.identTextPaste = function (event) {
//     var prevValue = this.value;
//     var startPos = this.getSelectionStart();
//     var endPos = this.getSelectionEnd();
//     setTimeout(function () {
//         var newValue = this.value;
//         var newEndPos = endPos + newValue.length - prevValue.length;
//         var pastedText = newValue.substr(startPos, newEndPos - startPos).replace(/(^[^a-zA-Z_$])|([^a-zA-Z$_0-9]+)/g, '');
//         var newValue1 = newValue.substr(0, startPos) + pastedText + newValue.substr(newEndPos);
//         if (!newValue1 !== newValue) {
//             this._setNewText(newValue1, startPos + pastedText.length);
//         }
//     }.bind(this), 0);
// };
//
// IdentTextInput.eventHandler.identTextPaste1 = function (event) {
//     var clipboardData = event.clipboardData || window.clipboardData;
//     var pastedText = clipboardData.getData('text/plain');
//     var pastedText1 = pastedText.replace(/(^[^a-zA-Z_$])|([^a-zA-Z$_0-9]+)/g, '');
//     if (pastedText !== pastedText1) {
//         document.execCommand("insertText", false, pastedText1);
//         event.preventDefault();
//     }
// };

ACore.install(IdentTextInput);

export default IdentTextInput;

/**
 *
 * @param {IdentTextInput} elt
 * @constructor
 */
function ITIHistory(elt) {
    this.elt = elt;
}


/**
 *
 * @param {IdentTextInput} elt
 * @constructor
 */
function ITITextController(elt) {
    this.elt = elt;
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    });
    this.elt.on('keydown', this.ev_keydown);
}

ITITextController.prototype.getSelectionStart = function () {
    var start = 0;
    if (this.elt.selectionStart || this.elt.selectionStart === 0)
        start = this.elt.selectionStart;
    return start;
};


ITITextController.prototype.getSelectionEnd = function () {
    var end = 0;
    if (this.elt.selectionEnd || this.elt.selectionEnd === 0)
        end = this.elt.selectionEnd;
    return end;
};

ITITextController.prototype.ev_keydown = function (event) {
    var selectedPositionStart;
    var key = event.key;
    if (key === ' ') {
        event.preventDefault();
    }
    else if (key === 'Enter') {
        event.preventDefault();
        this.elt.blur();
    }
    else if (key === "Escape") {
        // this.value = this._prevValue || '';
        this.elt.blur();
    }
    else if (!event.ctrlKey && !event.altKey && key.length === 1) {
        if (key.match(/[a-zA-Z$_0-9]/)) {
            selectedPositionStart = this.getSelectionStart();
            if (selectedPositionStart === 0 && key.match(/[0-9]/)) {
                event.preventDefault();
            }
        }
        else {
            event.preventDefault();
        }
    }
};
