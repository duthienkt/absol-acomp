import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { measureText } from "absol/src/HTML5/Text";
import { isNaturalNumber, isRealNumber } from "../utils";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import noop from "absol/src/Code/noop";
import Snackbar from "../Snackbar";

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
    var width = measureText(text, font).width;
    width = Math.ceil(width);
    this.elt.addStyle('--text-width', width + 'px');
    var newBound = this.elt.getBoundingClientRect();
    if (newBound.width !== bound.width) ResizeSystem.requestUpdateUpSignal(this.elt, true);
};


NITextController.prototype.flushTextToValue = function () {
    var thousandsSeparator = this.elt.thousandsSeparator || '';
    var decimalSeparator = this.elt.decimalSeparator;
    var text = this.$input.value;

    text = text.replace(/[^0-9\-+.,]/g, '');
    var parts = text.split(decimalSeparator);
    var thousands = parts[0].split(thousandsSeparator).join('').trim();
    var decimal = (parts[1] || '').split(thousandsSeparator).join('').trim();
    var value;
    if (decimal) {
        value = parseFloat(thousands + '.' + decimal);
    }
    else {
        value = parseInt(thousands, 10);
    }
    this.elt.valueCtrl.value = parseFloat(value);
};


NITextController.prototype.flushValueToText = function () {
    var text = this.elt.valueCtrl.originValueText;
    this.$input.value = text;
    text = this.elt.valueCtrl.formatedValueText;
    this.elt.$text.firstChild.firstChild.data = text;
    this.estimateWidthBy(text);
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
    clearTimeout(this.blurClazzTO );
    this.blurClazzTO =  setTimeout(()=>{
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
    clearTimeout(this.blurClazzTO );
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