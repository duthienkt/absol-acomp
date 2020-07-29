import '../css/timepicker.css';
import ACore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";
import {beginOfDay, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE} from "absol/src/Time/datetime";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import NumberSpanInput from "./NumberSpanInput";

//todo: add this to absol
export var isTouchDevice = BrowserDetector.hasTouch && !BrowserDetector.os.type.match(/windows|X11|Ubuntu|Linux/);
//todo: re select text after click
var _ = ACore._;
var $ = ACore.$;

var $g = Svg.ShareInstance.$;
var _g = Svg.ShareInstance._;

function TimePicker() {
    this._hour = 0;
    this._minute = 0;
    this._lastDayOffset = 0;
    this._state = 'none';
    this._mode = 'CLOCK';
    this._latBound = { width: 0, height: 0 };
    var thisPicker = this;
    if (isTouchDevice)
        this.addClass('ac-time-picker-touch');
    this.$attachook = _('attachhook').addTo(this).on('error', function () {
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
        thisPicker.addStyle('font-size', thisPicker.getComputedStyleValue('font-size'));
    });
    this.$attachook.requestUpdateSize = this.updateSize.bind(this);
    /***
     *
     * @type {NumberSpanInput}
     */
    this.$hour = $('.ac-time-picker-hour', this)
        .on({
            focus: this.eventHandler.focusHour,
            keydown: this.eventHandler.keydownHour,
            blur: this.eventHandler.blurHour
        });
    /***
     *
     * @type {NumberSpanInput}
     */
    this.$minute = $('.ac-time-picker-minute', this)
        .on({
            keydown: this.eventHandler.keydownMinute,
            focus: this.eventHandler.focusMinute,
            blur: this.eventHandler.blurMinute,
        });

    this.$hourInput = $('.ac-time-picker-hour-input', this)
        .on({
            click: this.eventHandler.clickHourInput,
            keydown: this.eventHandler.keydownHourInput,
            blur: this.eventHandler.blurHourInput
        });

    this.$minuteInput = $('.ac-time-picker-minute-input', this)
        .on({
            click: this.eventHandler.clickMinuteInput,
            keydown: this.eventHandler.keydownMinuteInput,
            blur: this.eventHandler.blurMinuteInput
        });

    //only support if is none touch device
    if (isTouchDevice) {
        this.$hour.readOnly = true;
        this.$hour.on('click', this._editHourState.bind(this));
        this.$minute.readOnly = true;
        this.$minute.on('click', this._editMinuteState.bind(this));
    }

    this.$clock = $g('.ac-time-picker-clock', this)
        .on(isTouchDevice ? 'touchstart' : 'mousedown', this.eventHandler.mousedownClock
        );

    this._clockWidth = 400;
    this._clockHeight = 400;
    this._clockRadius = 150;
    this._clockRadiusInner = 100;
    this.$clockContent = $g('.ac-time-picker-clock-content', this);
    this.$clockHourCtn = $g('.ac-time-picker-clock-hour-ctn', this);
    this.$clockMinuteCtn = $g('.ac-time-picker-clock-minute-ctn', this);

    this.$hourNumbers = Array(24).fill(0).map(function (u, i) {
        var h = i;
        if (h == 0)
            h = 12;
        else if (h == 12) h = '00';
        return _g({
            tag: 'text',
            attr: {
                'text-anchor': 'middle'
            },
            class: 'ac-time-picker-clock-hour-' + (i < 12 ? 'am' : 'pm'),
            child: { text: h + '' }
        }).addTo(thisPicker.$clockHourCtn);
    });
    this.$minuteNumbers = Array(12).fill(0).map(function (u, i) {
        return _g({
            tag: 'text',
            attr: {
                'text-anchor': 'middle'
            },
            class: 'ac-time-picker-clock-minute',
            child: { text: i * 5 + '' }
        }).addTo(thisPicker.$clockMinuteCtn);
    });

    this.$selectCtn = $g('.ac-time-picker-clock-select-ctn', this);
    this.$clockCenter = _g({
        tag: 'circle',
        class: 'ac-time-picker-clock-center',
        attr: {
            cx: "0",
            cy: '0'
        }
    }).addTo(this.$selectCtn);
    this.$clockSelectLine = _g({
        tag: 'path',
        class: 'ac-time-picker-clock-select-line'
    }).addTo(this.$selectCtn);
    this.$clockSelectCicle = _g({
        tag: 'circle',
        class: 'ac-time-picker-clock-select-circle',
        attr: {
            cx: 0,
            cy: 0
        }
    }).addTo(this.$selectCtn);

    this.$clockSelectCenter = _g({
        tag: 'circle',
        class: 'ac-time-picker-clock-select-center'
    }).addTo(this.$selectCtn);
    this.$finishBtn = $('.ac-time-picker-finish-btn', this)
        .on('click', this.finishSelect.bind(this));
    this.$cancelBtn = $('.ac-time-picker-cancel-btn', this)
        .on('click', this.cancelSelect.bind(this));
    this.$keyboardBtn = $('.ac-time-picker-keyboard-btn', this)
        .on('click', this.timeMode.bind(this));
    this.$clockBtn = $('.ac-time-picker-clock-btn', this)
        .on('click', this.clockMode.bind(this));
};


TimePicker.prototype.updateSize = function () {
    // var 
    this._fontSize = this.getFontSize();
    var cBound = this.$clock.getBoundingClientRect();
    this._clockWidth = cBound.width;
    this._clockHeight = cBound.height;
    this.$clock.attr({
        width: this._clockWidth,
        height: this._clockHeight,
        viewBox: '0 0 ' + this._clockWidth + ' ' + this._clockHeight
    });

    this.$clockContent.attr('transform', 'translate(' + (this._clockWidth / 2) + ',' + (this._clockHeight / 2) + ')');
    var clockRadius = this._clockWidth / 2 - this._fontSize;
    var clockRadiusInner = clockRadius - this._fontSize * 1.5;
    this._clockRadius = clockRadius;
    this._clockRadiusInner = clockRadiusInner;
    this.$clockCenter.attr('r', this._fontSize / 5);
    this.$clockSelectCicle.attr({ r: this._fontSize * 0.7, cx: clockRadius });
    this.$clockSelectCenter.attr({ r: this._fontSize / 10, cx: clockRadius });
    this.$hourNumbers.forEach(function (elt, i) {
        var angle = Math.PI * (i - 3) / 6;
        var r = i < 12 ? clockRadius : clockRadiusInner;
        var box = elt.getBBox();
        var x = r * Math.cos(angle);
        var y = r * Math.sin(angle) + box.height / 2;
        elt.attr({
            x: x,
            y: y
        });
    });
    this.$minuteNumbers.forEach(function (elt, i) {
        var angle = Math.PI * (i - 3) / 6;
        var box = elt.getBBox();
        var x = clockRadius * Math.cos(angle);
        var y = clockRadius * Math.sin(angle) + box.height / 3;
        elt.attr({
            x: x,
            y: y
        });
    });
    this.updateSelectPosition();
    this.notifySizeChange();
};


TimePicker.prototype.updateSelectPosition = function () {
    var angle, radius;
    if (this._state == "EDIT_MINUTE") {
        angle = Math.PI * (this._minute - 15) / 30;
        radius = this._clockRadius
    }
    else if (this._state == "EDIT_HOUR") {
        angle = Math.PI * (this._hour - 3) / 6;
        if (this._hour > 0 && this._hour <= 12) {
            radius = this._clockRadius;
        }
        else {
            radius = this._clockRadiusInner;
        }
    }
    else {
        return;
    }
    this._drawSelect(radius, angle);
};

TimePicker.prototype.editHour = function () {
    this.clockMode();
    if (this.$hour.readOnly) {
        this._editHourState();
    }
    else {
        this.$hour.focus();
    }
}


TimePicker.prototype._drawSelect = function (radius, angle) {
    var x = radius * Math.cos(angle);
    var y = radius * Math.sin(angle);
    this.$clockSelectCicle.attr({
        cx: x, cy: y
    });
    this.$clockSelectCenter.attr({
        cx: x, cy: y
    });
    this.$clockSelectLine.attr('d', 'M0,0L' + x + ',' + y);
};


TimePicker.prototype.notifyChange = function (force) {
    if (this._lastDayOffset != this.dayOffset || force) {
        this.emit('change', {
            target: this,
            hour: this.hour,
            minute: this.minute,
            dayOffset: this.dayOffset,
            name: 'change'
        }, this);
        this._lastDayOffset = this.dayOffset;
    }
};


TimePicker.prototype.notifySizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._latBound.width != bound.width || this._latBound.height != bound.height) {
        this._latBound.width = bound.width;
        this._latBound.height = bound.height;
        this.emit('sizechange', { name: 'sizechange', bound: bound, target: this }, this);
    }
};

TimePicker.tag = 'TimePicker';

TimePicker.render = function () {
    return _({
        extendEvent: ['change', 'finish', 'cancel', 'sizechange'],
        class: ['ac-time-picker', 'ac-time-picker-clock-mode'],//clock mode is default
        child: [
            {
                class: 'ac-time-picker-set-clock',
                child: [{
                    class: 'ac-time-picker-set-clock-header',
                    child: [
                        {
                            tag: 'numberspaninput',
                            class: 'ac-time-picker-hour',
                            props: {
                                value: 0,
                                zeroInt: 2
                            }
                        },
                        {
                            tag: 'span',
                            text: ':'
                        },
                        {
                            tag: 'numberspaninput',
                            class: 'ac-time-picker-minute',
                            props: {
                                value: 0,
                                zeroInt: 2
                            }
                        }
                    ]
                },
                    _g(
                        {
                            tag: 'svg',
                            class: 'ac-time-picker-clock',
                            child: [
                                {
                                    class: 'ac-time-picker-clock-content',
                                    child: ['.ac-time-picker-clock-select-ctn', '.ac-time-picker-clock-hour-ctn', '.ac-time-picker-clock-minute-ctn']
                                }
                            ]
                        }
                    )]
            },
            {
                class: 'ac-time-picker-set-time',
                child: [
                    {
                        class: 'ac-time-picker-set-time-header',
                        child: { text: 'Set time' }
                    },
                    {
                        class: 'ac-time-picker-set-time-label',
                        child: { text: 'Type in time' }
                    },
                    {
                        class: 'ac-time-picker-set-time-input-group',
                        child: [
                            {
                                class: 'ac-time-picker-set-time-input-hm',
                                child: [
                                    {
                                        tag: 'input',
                                        class: 'ac-time-picker-hour-input',
                                        attr: {
                                            type: 'number',
                                            placeHolder: '00',
                                            tabindex: '2',
                                        }
                                    },
                                    {
                                        tag: 'span',
                                        child: { text: ':' }
                                    },
                                    {
                                        tag: 'input',
                                        class: 'ac-time-picker-minute-input',
                                        attr: {
                                            type: 'number',
                                            placeHolder: '00',
                                            tabindex: '3'
                                        }
                                    }
                                ]
                            },
                            {
                                class: 'ac-time-picker-set-time-input-label-hm',
                                child: [
                                    { tag: 'span', child: { text: 'hour' } },
                                    { tag: 'span', style: { visibility: 'hidden' }, child: { text: ':' } },
                                    { tag: 'span', child: { text: 'minute' } }

                                ]
                            }
                        ]
                    }
                ]
            },
            {
                class: 'ac-time-picker-footer',
                child: [
                    {
                        tag: 'button',
                        class: 'ac-time-picker-keyboard-btn',
                        child: 'span.mdi.mdi-keyboard-outline'
                    },
                    {
                        tag: 'button',
                        class: 'ac-time-picker-clock-btn',
                        child: 'span.mdi.mdi-clock-outline'
                    },
                    {
                        class: 'ac-time-picker-footer-right',
                        child: [
                            {
                                tag: 'button',
                                class: 'ac-time-picker-cancel-btn',
                                attr: { tabindex: '4' },
                                child: { text: 'CANCEL' }
                            },
                            {
                                tag: 'button',
                                attr: { tabindex: '4' },
                                class: 'ac-time-picker-finish-btn',
                                child: { text: 'OK' }
                            }

                        ]
                    }]
            }
        ]
    });
};


TimePicker.prototype.clockMode = function () {
    if (this._mode == "CLOCK") return;
    this._mode = 'CLOCK';
    this.removeClass('ac-time-picker-time-mode')
        .addClass('ac-time-picker-clock-mode');
    this.$hour.value = this._hour < 10 ? '0' + this._hour : this._hour;
    this.$minute.value = this._minute < 10 ? '0' + this._minute : this._minute;
    this._editHourState();
    this.updateSize();
    this._showSelectHour(this._hour);
};


TimePicker.prototype.timeMode = function () {
    if (this._mode == "TIME") return;
    this._mode = 'TIME';
    this.addClass('ac-time-picker-time-mode')
        .removeClass('ac-time-picker-clock-mode');
    this.$hourInput.value = this._hour < 10 ? '0' + this._hour : this._hour;
    this.$minuteInput.value = this._minute < 10 ? '0' + this._minute : this._minute;
    this.editHourInput();
    this.updateSize();
};


TimePicker.prototype._editHourState = function () {
    this._state = "EDIT_HOUR";
    this._preHour = this._hour;
    this.removeClass('ac-time-picker-edit-minute')
        .addClass('ac-time-picker-edit-hour')
        .removeClass('ac-time-picker-edit-hour-input')
        .removeClass('ac-time-picker-edit-minute-input');
    this.updateSize();
};


TimePicker.prototype._editMinuteState = function () {
    this._state = "EDIT_MINUTE";
    this._preMinute = this._minute;
    this.addClass('ac-time-picker-edit-minute')
        .removeClass('ac-time-picker-edit-hour')
        .removeClass('ac-time-picker-edit-hour-input')
        .removeClass('ac-time-picker-edit-minute-input');
    this.updateSize();
};


TimePicker.prototype.editHourInput = function () {
    var thisPicker = this;
    this._state = "EDIT_HOUR_INPUT";
    this._preHour = this._hour;
    this.removeClass('ac-time-picker-edit-minute')
        .removeClass('ac-time-picker-edit-hour')
        .addClass('ac-time-picker-edit-hour-input')
        .removeClass('ac-time-picker-edit-minute-input');
    this.updateSize();
    setTimeout(function () {
        thisPicker.$hourInput.focus();
        thisPicker.$hourInput.select();
    }, 10);
};


TimePicker.prototype.editMinuteInput = function () {
    var thisPicker = this;
    this._state = "EDIT_MINUTE_INPUT";
    this._preMinute = this._minute;
    this.removeClass('ac-time-picker-edit-minute')
        .removeClass('ac-time-picker-edit-hour')
        .removeClass('ac-time-picker-edit-hour-input')
        .addClass('ac-time-picker-edit-minute-input');
    this.updateSize();
    setTimeout(function () {
        thisPicker.$minuteInput.focus();
        thisPicker.$minuteInput.select();
    }, 1)
};


TimePicker.prototype.finishSelect = function () {
    this.emit('finish', {
        target: this,
        hour: this.hour,
        minute: this.minute,
        dayOffset: this.dayOffset,
        name: 'finish'
    }, this);
};


TimePicker.prototype.cancelSelect = function () {
    this.emit('cancel', { target: this, name: 'cancel' }, this);
};


TimePicker.eventHandler = {};

TimePicker.eventHandler.focusHour = function () {
    this._editHourState();
    this.$hour.selectAll();
};


TimePicker.eventHandler.blurHour = function () {
    var newText = this.$hour.value;
    var hour = parseFloat(newText) || 0;
    if (hour < 0 || hour >= 24)
        hour = this._preHour;
    this.$hour.value = hour < 10 ? '0' + hour : hour;
    this._hour = hour;
    this._showSelectHour(hour);
    this.notifyChange();
};


TimePicker.eventHandler.focusMinute = function () {
    this._editMinuteState();
    this.$minute.selectAll();
};


TimePicker.eventHandler.blurMinute = function () {
    var newText = this.$minute.innerHTML;
    var minute = parseFloat(newText) || 0;
    if (minute < 0 || minute >= 60)
        minute = this._preMinute;
    this.$minute.value = minute < 10 ? '0' + minute : minute;
    this._minute = minute;
    this._showSelectByMinuteText();
    this.notifyChange();
};


TimePicker.eventHandler.clickHourInput = function () {
    if (this._state != 'EDIT_HOUR') this.editHourInput();
    else {
        this.$hourInput.focus();
        this.$hourInput.select();
    }
};


TimePicker.eventHandler.clickMinuteInput = function () {
    if (this._state != 'EDIT_MINUTE_INPUT') this.editMinuteInput();
    else {
        this.$minuteInput.focus();
        this.$minuteInput.select();

    }
};

TimePicker.eventHandler.blurHourInput = function () {
    var hour = parseFloat(this.$hourInput.value) || 0;
    if (hour < 0 || hour >= 24)
        hour = this._preHour;
    this.hour = hour;
};

TimePicker.eventHandler.blurMinuteInput = function () {
    var minute = parseFloat(this.$minuteInput.value) || 0;
    if (minute < 0 || minute >= 60)
        minute = this._preMinute;
    this.minute = minute;
};


TimePicker.property = {};


TimePicker.property.hour = {
    set: function (value) {
        value = (value % 24) || 0;
        this._hour = value;
        var text = (value < 10 ? '0' : '') + value + '';
        this.$hour.clearChild().addChild(_({ text: text }));
        this.$hourInput.value = text;
        this.updateSelectPosition();
    },
    get: function () {
        return this._hour;
    }
};


TimePicker.property.minute = {
    set: function (value) {
        value = (value % 60) || 0;
        this._minute = value;
        var text = (value < 10 ? '0' : '') + value + '';
        this.$minute.value = text;
        this.$minuteInput.value = text;
        this.updateSelectPosition();
    },
    get: function () {
        return this._minute;
    }
};


TimePicker.property.dayOffset = {
    set: function (value) {
        value = value || 0;
        if (value.getTime)
            value = value.getTime() - beginOfDay(value).getTime();
        else {
            value = value % MILLIS_PER_DAY;
        }

        this.hour = Math.floor(value / MILLIS_PER_HOUR);
        this.minute = Math.floor((value % MILLIS_PER_HOUR) / MILLIS_PER_MINUTE);
    },
    get: function () {
        return this._hour * MILLIS_PER_HOUR + this._minute * MILLIS_PER_MINUTE;
    }
};

TimePicker.prototype._showSelectHour = function (hour) {
    var radius;
    var angle = Math.PI * (hour - 3) / 6;
    if ((hour < 24 && hour > 12) || hour == 0) {
        radius = this._clockRadiusInner;
    }
    else if (hour <= 12) {
        radius = this._clockRadius;
    }
    else {
        return;
    }
    this._drawSelect(radius, angle);
};

TimePicker.prototype._showSelectByHourText = function () {
    var hour = parseFloat(this.$hour.innerHTML) || 0;
    if (hour < 0 || hour >= 24) return;
    this._showSelectHour(hour);
};


TimePicker.prototype._showSelectMinute = function (minute) {
    var angle = Math.PI * (minute - 15) / 30;
    this._drawSelect(this._clockRadius, angle);
}

TimePicker.prototype._showSelectByMinuteText = function () {
    var minute = parseFloat(this.$minute.innerHTML) || 0;
    if (minute < 0 || minute >= 60) return;
    this._showSelectMinute(minute);
};

/***
 *
 * @param {KeyboardEvent} event
 */
TimePicker.eventHandler.keydownHour = function (event) {
    var thisPicker = this;
    if (event.key == 'Enter' || event.key == 'Tab') {
        event.preventDefault();
        this.$hour.blur();
        this._editMinuteState();
        setTimeout(function () {
            thisPicker.$minute.focus();
            thisPicker.$minute.selectAll();
        }, 30);
    }
    else {
        setTimeout(function () {
            var newText = thisPicker.$hour.value;
            var hour = parseFloat(newText) || 0;
            if (hour < 0 || hour >= 24)
                hour = thisPicker._preHour;
            else {
                thisPicker._hour = hour;
                thisPicker._showSelectHour(hour);
            }
        }, 30);
    }
};


TimePicker.eventHandler.keydownMinute = function (event) {
    var thisPicker = this;
    if (event.key == 'Enter') {
        this.$minute.blur();
        event.preventDefault();
        setTimeout(this.finishSelect.bind(this), 30);
    }
    else if (event.key == 'Tab') {
        this.$minute.selectNone();
        this.$finishBtn.focus();
        event.preventDefault();
    }
    else {
        setTimeout(function () {
            var newText = thisPicker.$minute.value;
            var minute = parseFloat(newText) || 0;
            if (minute < 0 || minute >= 60)
                minute = thisPicker._preMinute;
            else {
                thisPicker._minute = minute;
                thisPicker._showSelectMinute(minute);
            }
        }, 30);
    }
};


TimePicker.eventHandler.keydownHourInput = function (event) {
    var thisPicker = this;
    if ((isTouchDevice && event.key == "Unidentified") || (event.key && event.key.length == 1 && !event.ctrlKey && !event.altKey)) {
        if (event.key.match(/[0-9]/)) {
            setTimeout(this.notifyChange.bind(this), 2);
        }
        else {
            event.preventDefault();
        }
    }
    else if (event.key == 'Enter') {
        event.preventDefault();
        this.$hourInput.blur();
        this.editMinuteInput();
    }
    else if (!event.key && !event.key.toLowerCase().match(/arrow|back/)) {
        var cText = this.$hourInput.value;
        setTimeout(function () {
            var newText = thisPicker.$hourInput.value;
            if (cText != newText) {
                var hour = parseFloat(newText) || 0;
                if (hour < 0 || hour >= 24)
                    hour = thisPicker._preHour;
                thisPicker.hour = hour;
                thisPicker.$hourInput.blur();
                thisPicker.editMinuteInput();
                thisPicker.notifyChange();
            }
        }, 1);
    }
};


TimePicker.eventHandler.keydownMinuteInput = function (event) {
    var thisPicker = this;
    if ((isTouchDevice && event.key == "Unidentified") || event.key.length == 1 && !event.ctrlKey && !event.altKey) {
        if ((isTouchDevice && event.key == "Unidentified") || event.key.match(/[0-9]/)) {
            setTimeout(this.notifyChange.bind(this), 2);

        }
        else {
            event.preventDefault();
        }
    }
    else if (event.key == 'Enter') {
        this.$minute.blur();
        this.eventHandler.blurMinuteInput();
        event.preventDefault();

        setTimeout(this.finishSelect.bind(this), 100);
    }
    else if (event.key == "Backspace") {

    }
    else if (event.key != 'Enter') {
        var cText = this.$minuteInput.value;
        setTimeout(function () {
            var newText = thisPicker.$minuteInput.value;
            if (cText != newText) {
                var minute = parseFloat(newText) || 0;
                if (minute < 0 || minute >= 60)
                    minute = thisPicker._preMinute;
                thisPicker.minute = minute;
                thisPicker.$minuteInput.focus();
                thisPicker.$minuteInput.select();
                thisPicker.notifyChange();
            }
        }, 1);
    }
};


TimePicker.eventHandler.dragOnClock = function (event) {
    event = (event.changedTouches && event.changedTouches[0]) || event;
    var cBound = this.$clock.getBoundingClientRect();
    var cx = (cBound.left + cBound.right) / 2;
    var cy = (cBound.top + cBound.bottom) / 2;
    var x = event.clientX - cx;
    var y = event.clientY - cy;
    var angle = Math.atan2(y, x);
    var radius = Math.sqrt(x * x + y * y);

    var index;
    if (this._state == "EDIT_HOUR") {
        angle += Math.PI * 2;
        index = Math.round(angle / (Math.PI / 6));
        var hour = (index + (12 + 3)) % 12;
        if (radius < (this._clockRadiusInner + this._clockRadius) / 2) {
            if (hour != 0) hour += 12;
        }
        else {
            if (hour == 0) hour = 12;
        }
        this._hour = hour;
        this._showSelectHour(hour);
        this.$hour.value = hour < 10 ? '0' + hour : hour;
        this.$hour.selectEnd();
    }
    else if (this._state == "EDIT_MINUTE") {
        radius = this._clockRadius;
        angle += Math.PI * 2;
        index = Math.round(angle / (Math.PI / 30));
        angle = index * (Math.PI / 30);
        var minute = (index + (60 + 15)) % 60;
        this._minute = minute;
        this.$minute.value = minute < 10 ? '0' + minute : minute;
        this._showSelectMinute(minute);
        this.$minute.selectEnd();
        this.notifyChange();
    }
    else {
        return;
    }
};


TimePicker.eventHandler.mousedownClock = function (event) {
    event.preventDefault();
    this.eventHandler.dragOnClock(event);
    document.body.addEventListener(isTouchDevice ? 'touchmove' : 'mousemove', this.eventHandler.mousemoveClock);
    document.body.addEventListener(isTouchDevice ? 'touchend' : 'mouseup', this.eventHandler.mousefinishClock);
    if (!isTouchDevice)
        document.body.addEventListener('mouseleave', this.eventHandler.mousefinishClock);
};


TimePicker.eventHandler.mousemoveClock = function (event) {
    event.preventDefault();
    this.eventHandler.dragOnClock(event);
};


TimePicker.eventHandler.mousefinishClock = function () {
    document.body.removeEventListener('mousemove', this.eventHandler.mousemoveClock);
    document.body.removeEventListener('mouseup', this.eventHandler.mousefinishClock);
    document.body.removeEventListener('mouseleave', this.eventHandler.mousefinishClock);
    if (this._state == 'EDIT_HOUR') {
        if (this.$minute.readOnly) {
            this._editMinuteState();
        }
        else {
            this.$minute.focus();
        }
    }
    else if (this._state == 'EDIT_MINUTE') {
        this.$minute.selectAll();// refocus
    }
};


ACore.install('timepicker', TimePicker);
export  default TimePicker;