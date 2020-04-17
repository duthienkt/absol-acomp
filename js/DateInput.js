import ACore from "../ACore";
import { daysInMonth, beginOfDay, compareDate, formartDateString } from "absol/src/Time/datetime";

var _ = ACore._;
var $ = ACore.$;



function DateInput() {
    this._lastValue = null;
    this._value = null;
    this.$input = $('input', this)
        .on('mouseup', this.eventHandler.mouseup)
        .on('keydown', this.eventHandler.keydown)
        .on('paste', this.eventHandler.paste)
        .on('blur', this.eventHandler.blur)
        .on('cut', this.eventHandler.cut);

}

DateInput.render = function () {
    //only support dd/mm/yyyy
    return _({
        class: 'as-date-input',
        extendEvent: ['change'],
        child: [{
            tag: 'input',
            props: {
                value: '__/__/____'
            }
        },
        {
            class: 'as-date-input-icon-ctn',
            child: 'span.mdi.mdi-calendar'
        }
        ]
    });
};

DateInput.prototype._autoSelect = function () {
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var texts = this.$input.value.split('/');
    var lTexts = texts.reduce(function (ac, cr) {
        ac.push(ac[ac.length - 1] + cr.length + 1);
        return ac;
    }, [0]);
    function indexOf(offset) {
        var l;
        for (var i = 0; i < lTexts.length; ++i) {
            l = lTexts[i];
            if (l > offset) return i;
        }
        return texts.length;
    }

    var i0 = indexOf(slStart);
    var i1 = indexOf(slEnd);

    if (i0 == i1) {
        this.$input.selectionStart = lTexts[i0 - 1];
        this.$input.selectionEnd = lTexts[i0] - 1;
    }
    else {
        this.$input.selectionStart = 0;
        this.$input.selectionEnd = lTexts[lTexts.length - 1];
    }
};

DateInput.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this, value: this._value }, this);
}


/**
 * @type {DateInput}
 */
DateInput.eventHandler = {};

DateInput.eventHandler.paste = function (event) {
    var paste = (event.clipboardData || window.clipboardData).getData('text');
    event.preventDefault();
    paste = paste.replace(/[^0-9\/]/g, '');
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var value = this.$input.value;
    var slashPasteCount = paste.replace(/[^\/]/g, '').length;
    var slashSelectedCount = value.substr(sStart, sEnd - sStart).replace(/[^\/]/g, '').length;

    if (slashPasteCount < 2) {
        if (slashPasteCount > slashSelectedCount) {
            paste = paste.split(/[\/]/).slice(0, slashSelectedCount + 1).join('/');
        }
        else if (slashPasteCount < slashSelectedCount) {
            paste += '/'.repeat(slashSelectedCount - slashPasteCount);
        }
        slStart = (value.substr(0, sStart) + paste).length;
        slEnd = slStart;
        value = value.substr(0, sStart) + paste + value.substr(sEnd);
    }
    else {
        value = paste.split(/[\/]/).slice(0, 3).join('/');
        slStart = value.length;
        slEnd = value.length;
    }
    this.$input.value = value;
    this.$input.selectionStart = slStart;
    this.$input.selectionEnd = slEnd;
};

DateInput.eventHandler.cut = function (event) {
    event.preventDefault();
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var value = this.$input.value;
    this.$input.value = value.substr(0, sStart) + value.substr(sStart, sEnd - sStart).replace(/[^\/]/g, '') + value.substr(sEnd);
    this.$input.selectionStart = slStart;
    this.$input.selectionEnd = slStart;
};

DateInput.eventHandler.mouseup = function () {
    setTimeout(this._autoSelect.bind(this), 1);
};

DateInput.eventHandler.blur = function () {
    var value = this.$input.value;
    var slashValueCount = value.replace(/[^\/]/g, '').length;
    for (var i = slashValueCount; i < 2; ++i) value += '/';
    var texts = value.split('/').slice(0, 3);
    var day = parseInt(texts[0]);
    var month = parseInt(texts[1]);
    var year = parseInt(texts[2]);
    if (!isNaN(year)) year = Math.min(2100, Math.max(year, 1890));
    if (!isNaN(month)) month = Math.max(1, Math.min(12, month));
    if (!isNaN(day)) {
        day = Math.max(1, Math.min(31, day));
        if (!isNaN(month)) {
            day = Math.min(daysInMonth(2000, month), day);
            if (!isNaN(year)) day = Math.min(daysInMonth(year, month), day);
        }
    }
    console.log(day, month, year);
    

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        
        var dateValue = new Date(year, month - 1, day, 0, 0, 0, 0);
        if (this._lastValue == null || compareDate(dateValue, this._lastValue) != 0) {
            this.value = dateValue;
            this.notifyChange();
        }
    }
    else {
        this.$input.value = [day, month, year].map(function (e, i) {
            if (isNaN(e)) return '__' + (i == 2 ? '__' : '');
            return (e < 10 ? '0' : '') + e;
        }).join('/');
        if (this._lastValue != null) {
            this._value = null;
            this.notifyChange();
        }
    }
};


DateInput.eventHandler.keydown = function (event) {
    var slEnd = this.$input.selectionEnd;
    var slStart = this.$input.selectionStart;
    var value = this.$input.value;
    var sStart = Math.min(slStart, slEnd);
    var sEnd = Math.max(slEnd, slStart);
    var selectedValue = value.substr(sStart, sEnd - sStart);
    var slashValueCount = value.replace(/[^\/]/g, '').length;
    var slashSelectedCount = value.substr(sStart, sEnd - sStart).replace(/[^\/]/g, '').length;

    var texts = value.split('/');
    var lTexts = texts.reduce(function (ac, cr) {
        ac.push(ac[ac.length - 1] + cr.length + 1);
        return ac;
    }, [0]);
    function indexOf(offset) {
        var l;
        for (var i = 0; i < lTexts.length; ++i) {
            l = lTexts[i];
            if (l > offset) return i;
        }
        return texts.length;
    }
    var i0 = indexOf(slStart);
    var i1 = indexOf(slEnd);
    if (event.key == 'Enter') {
        event.preventDefault();
        this.$input.blur();
    }
    else if (event.key == 'Meta') {
        event.preventDefault();
    }
    else if (event.key == 'Backspace') {
        if (slStart == slEnd) {
            if (slStart > 0) {
                if (value.charAt(slStart - 1) == '/') {
                    event.preventDefault();
                    this.$input.value = value;
                    this.$input.selectionStart = slStart - 1;
                    this.$input.selectionEnd = slStart - 1;
                }
            }
        }
        else if (i0 != i1) {
            event.preventDefault();

            this.$input.value = value.substr(0, sStart) + selectedValue.replace(/[^\/]/g, '') + value.substr(sEnd);
            this.$input.selectionStart = slStart;
            this.$input.selectionEnd = slStart;
        }
    }
    else if (event.key == 'Delete') {
        if (slStart == slEnd) {
            if (slStart < value.length) {
                if (value.charAt(slStart) == '/') {
                    event.preventDefault();
                    this.$input.value = value;
                    this.$input.selectionStart = slStart + 1;
                    this.$input.selectionEnd = slStart + 1;
                }
            }
        }
        else if (i0 != i1) {
            event.preventDefault();
            var sStart = Math.min(slStart, slEnd);
            var sEnd = Math.max(slEnd, slStart);
            this.$input.value = value.substr(0, sStart) + value.substr(sStart, sEnd - sStart).replace(/[^\/]/g, '') + value.substr(sEnd);
            this.$input.selectionStart = slStart;
            this.$input.selectionEnd = slStart;
        }
    }
    else if (!event.ctrlKey && !event.altKey && event.key && event.key.length == 1) {
        if (event.key.match(/[0-9\/]/)) {
            if (event.key == '/') {
                if (slashSelectedCount == 0 && slashValueCount >= 2) {
                    event.preventDefault();
                }
                else if (value.charAt(slStart) == '/') {
                    event.preventDefault();
                    this.$input.selectionStart = slStart + 1;
                    this.$input.selectionEnd = slStart + 1;
                }
            }
        }
        else {
            event.preventDefault();
        }
    }
    else if (!event.ctrlKey && !event.altKey && event.key == "Tab") {
        if (event.shiftKey) {
            if (i0 > 1) {
                event.preventDefault();
                this.$input.selectionStart = lTexts[i1 - 2];
                this.$input.selectionEnd = lTexts[i1 - 1] - 1;
            }
        }
        else {
            if (i1 < texts.length) {
                event.preventDefault();
                this.$input.selectionStart = lTexts[i1];
                this.$input.selectionEnd = lTexts[i1 + 1] - 1;
            }
        }
    }
};

DateInput.property = {};

DateInput.property.value = {
    set: function (value) {
        if (value === false || value === null || value === undefined) {
            this.$input = '__/__/____';
            this._value = null;
        }
        else if ((typeof value == 'string') || (typeof value == 'number')) {
            this._value = beginOfDay(new Date(value));
            this.$input.value = formartDateString(this._value, 'dd/mm/yyyy');
        }
        else if (value.getTime) {
            this._value = beginOfDay(value);
            this.$input.value = formartDateString(this._value, 'dd/mm/yyyy');
        }
        this._lastValue = this._value;
        
    },
    get: function () {
        return this._value;
    }
};
//textContent

ACore.install('dateinput', DateInput);

export default DateInput;