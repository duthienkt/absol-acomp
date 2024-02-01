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
        .on('paste', this.onKeyDown)
        .on('blur', this.onBlur);

}


NITextController.prototype.estimateWidthBy = function (text) {
    if (this.elt.hasClass('as-pressing')) return;
    var bound = this.elt.getBoundingClientRect();
    var width = measureText(text, this.$input.getComputedStyleValue('font')).width;
    this.elt.addStyle('--text-width', width + 'px');
    var newBound = this.elt.getBoundingClientRect();
    if (newBound.width !== bound.width) ResizeSystem.requestUpdateUpSignal(this.elt, true);
};


NITextController.prototype.flushTextToValue = function () {
    var thousandsSeparator = this.elt.thousandsSeparator || '';
    var decimalSeparator = this.elt.decimalSeparator;
    var text = this.$input.value;
    var floatText = text.split(thousandsSeparator).join('').split(decimalSeparator).join('.');
    this.elt._value = parseFloat(floatText);
    if (!isRealNumber(this.elt._value)) this.elt._value = null;
};


NITextController.prototype.flushValueToText = function () {
    var formatter;
    var opt = Object.assign({}, this.elt._format);
    var value = this.elt.value;
    var text, parts;
    if (value === null) {
        text = '';
    }
    else if (opt.locales === 'none') {
        if (opt.maximumFractionDigits === 20) {
            text = value + '';
        }
        else if (opt.maximumFractionDigits === opt.minimumIntegerDigits) {
            text = value.toFixed(opt.maximumFractionDigits);
        }
        else {
            text = value + '';
            parts = text.split('.');
            parts[1] = parts[1] || '';
            if (parts[1].length < opt.minimumIntegerDigits) {
                text = value.toFixed(opt.minimumIntegerDigits);
            }
        }
    }
    else {
        formatter = new Intl.NumberFormat(this.elt._format.locales, opt);
        text = formatter.format(value);
    }

    this.$input.value = text;
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
    this.flushValueToText();
    this.elt.notifyChanged({ by: 'blur' });

}

/***
 * @param {KeyboardEvent|ClipboardEvent|{}} event
 * @param {boolean=} event
 */
NITextController.prototype.onKeyDown = function (event, dontInsert) {
    var key = event.type === 'keydown' ? keyboardEventToKeyBindingIdent(event) : '';
    if ((key.length === 1 && !key.match(/[0-9.,\-]/)) || key.match(/^shift-.$/)) {
        event.preventDefault();
        return;
    }
    Snackbar.show(key);
    var thousandsSeparator = this.elt.thousandsSeparator;
    var decimalSeparator = this.elt.decimalSeparator;

    var value = this.$input.value;
    var sStart = this.$input.selectionStart;
    var sEnd = this.$input.selectionEnd;
    var sDir = this.$input.selectionDirection;
    var onKeys = {};


    onKeys.unidentified = () => {
        var oldText = this.$input.value;
        setTimeout(() => {
            var newText = this.$input.value;
            if (oldText === newText) return;
            var key = newText[sStart];
            var fakeEvent = {
                type: 'keydown',
                preventDefault: noop,
                key: key
            }
            if (key.match(/^[0-9.]$/)) {
                this.onKeyDown(fakeEvent, true);
            }
            else {
                this.$input.value = oldText;
                this.$input.setSelectionRange(sStart, sStart);
                this.onKeyDown(fakeEvent);
            }
        }, 10);
    };


    onKeys.process = () => {
        setTimeout(() => {
            this.flushTextToValue();
        }, 10);

    }

    onKeys.paste = () => {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData('Text');
        var hasSeparator = value.indexOf(decimalSeparator) >= 0;
        pastedData = pastedData.split('').filter(c => {
            if (c.match(/[0-9]/)) return true;
            if (!hasSeparator && c === hasSeparator) {
                hasSeparator = true;
                return true;
            }
        }).join('');
        if (this.elt.readOnly) return;
        if (!dontInsert) {
            this.$input.value = value.substring(0, sStart) + pastedData + value.substring(sEnd);
            this.$input.setSelectionRange(sStart + pastedData.length, sStart + pastedData.length);
        }
        this.reformat();
        this.flushTextToValue();
    };

    onKeys.arrowleft = () => {
        if (sStart === sEnd) {
            if (value[sStart - 2] === thousandsSeparator) {
                this.$input.setSelectionRange(sStart - 2, sStart - 2);
            }
            else if (sStart > 0) {
                this.$input.setSelectionRange(sStart - 1, sStart - 1);
            }
        }
        else {
            this.$input.setSelectionRange(sStart, sStart);
        }
    };

    onKeys['shift-arrowleft'] = () => {
        var newSStart;
        var newSEnd;
        if (sDir === 'backward') {
            newSStart = sEnd;
            newSEnd = sStart - 1;

        }
        else {
            newSStart = sStart;
            newSEnd = sEnd - 1;
        }
        if (value[newSEnd - 1] === thousandsSeparator) newSEnd--;
        newSEnd = Math.max(0, newSEnd);
        if (newSStart <= newSEnd) {
            this.$input.setSelectionRange(newSStart, newSEnd, "forward");
        }
        else {
            this.$input.setSelectionRange(newSEnd, newSStart, "backward");
        }
    };


    onKeys.arrowright = () => {
        if (sStart === sEnd) {
            if (value[sStart] === thousandsSeparator) {
                this.$input.setSelectionRange(sStart + 2, sStart + 2);
            }
            else if (sStart < value.length) {
                this.$input.setSelectionRange(sStart + 1, sStart + 1);
            }
        }
        else {
            this.$input.setSelectionRange(sStart, sStart);
        }
    };


    onKeys['shift-arrowright'] = () => {
        var newSStart;
        var newSEnd;
        if (sDir === 'backward') {
            newSStart = sEnd;
            newSEnd = sStart + 1;
        }
        else {
            newSStart = sStart;
            newSEnd = sEnd + 1;
        }
        if (value[newSEnd - 1] === thousandsSeparator) newSEnd++;
        newSEnd = Math.min(value.length, newSEnd);

        if (newSStart <= newSEnd) {
            this.$input.setSelectionRange(newSStart, newSEnd, "forward");
        }
        else {
            this.$input.setSelectionRange(newSEnd, newSStart, "backward");
        }
    };


    onKeys.number = () => {
        if (this.elt.readOnly) return;
        if (!dontInsert) {
            this.$input.value = value.substring(0, sStart) + key + value.substring(sEnd);
            this.$input.setSelectionRange(sStart + 1, sStart + 1);
        }
        this.reformat();
        this.flushTextToValue();
    };
    onKeys['-'] = () => {
        if (this.elt.readOnly) return;
        if (value.indexOf('-') >= 0 || sStart > 0) return;
        this.$input.value = '-' + value.substring(sEnd);
        this.$input.setSelectionRange(1, 1);
        this.reformat();
        this.flushTextToValue();
    };

    onKeys.backspace = () => {
        if (this.elt.readOnly) return;
        var delStart, delEnd;
        if (sStart === sEnd) {
            if (sStart > 0) {
                delStart = sStart - 1;
                delEnd = sStart;
            }
        }
        else {
            delStart = sStart;
            delEnd = sEnd;

        }
        if (delStart === undefined || delEnd === undefined) return;
        this.$input.value = value.substring(0, delStart) + value.substring(delEnd);
        this.$input.setSelectionRange(delStart, delStart);
        this.reformat();
        this.flushTextToValue();
    };

    onKeys.enter = () => {
        if (this.elt.readOnly) return;
        this.flushValueToText();
        this.$input.setSelectionRange(this.$input.value.length, this.$input.value.length);
        this.elt.notifyChanged({ by: 'enter' });
    };


    onKeys.delete = () => {
        if (this.elt.readOnly) return;
        var delStart, delEnd;

        if (sStart === sEnd) {
            if (sStart < value.length) {
                delStart = sStart;
                delEnd = sStart + 1;
                if (value[delStart] === thousandsSeparator)
                    delEnd++;
            }
        }
        else {
            delStart = sStart;
            delEnd = sEnd;
        }

        if (isNaturalNumber(delStart) && isNaturalNumber(delEnd)) {
            this.$input.value = value.substring(0, delStart) + value.substring(delEnd);
            this.$input.setSelectionRange(delStart, delStart);
            this.reformat();
            this.flushTextToValue();
        }
    };

    onKeys.decimalSeparator = () => {
        if (this.elt.readOnly) return;
        var idx = value.indexOf(decimalSeparator);
        if (idx >= 0) {
            if (idx < sStart) {
                this.$input.value = value.substring(0, sStart).replace(decimalSeparator, '')
                    + decimalSeparator + value.substring(sEnd);
                this.$input.setSelectionRange(sStart, sStart);
            }
            else if (idx < sEnd) {
                this.$input.value = value.substring(0, sStart)
                    + decimalSeparator + value.substring(sEnd);
                this.$input.setSelectionRange(sStart + 1, sStart + 1);
            }
            else {
                this.$input.value = value.substring(0, sStart)
                    + decimalSeparator + value.substring(sEnd).replace(decimalSeparator, '');
                this.$input.setSelectionRange(sStart + 1, sStart + 1);
            }
        }
        else {
            this.$input.value = value.substring(0, sStart) + decimalSeparator + value.substring(sEnd);
            this.$input.setSelectionRange(sStart + 1, sStart + 1);
        }
        this.reformat();
        this.flushTextToValue();
    };

    if (key === 'arrowup') {
        if (sStart === 0 && sEnd === 0) {
            this.elt.nextStep();
            event.preventDefault();
            this.$input.setSelectionRange(0, 0);
        }
    }
    else if (key === 'arrowdown') {
        if (sStart === value.length && sEnd === value.length) {
            this.elt.prevStep();
            event.preventDefault();
            this.$input.setSelectionRange(this.$input.value.length, this.$input.value.length);
        }
    }
    else if (key === 'ctrl-x') {
        onKeys.delete();
    }
    else if (onKeys[event.type]) {
        event.preventDefault();
        onKeys[event.type]();
    }
    else if (onKeys[key]) {
        event.preventDefault();
        onKeys[key]();
    }
    else if (key.match(/^[0-9.]$/)) {
        event.preventDefault();
        onKeys.number();
    }
    else if (key === decimalSeparator) {
        event.preventDefault();
        onKeys.decimalSeparator();
    }
};


export default NITextController;