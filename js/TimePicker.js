import Acore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";
import { beginOfDay, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE } from "absol/src/Time/datetime";

//todo: add this to absol
var isTouchDevice = 'ontouchstart' in window ||
    window.DocumentTouch && document instanceof window.DocumentTouch ||
    navigator.maxTouchPoints > 0 ||
    window.navigator.msMaxTouchPoints > 0;
//todo: re select text after click
var _ = Acore._;
var $ = Acore.$;

var $g = Svg.ShareInstance.$;
var _g = Svg.ShareInstance._;

function TimePicker() {
    this._hour = 0;
    this._minute = 0;
    this._state = 'none';
    var thisPicker = this;
    if (isTouchDevice)
        this.addClass('ac-time-picker-touch');
    this.$attachook = _('attachhook').addTo(this).on('error', function () {
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
    });
    this.$attachook.requestUpdateSize = this.updateSize.bind(this);
    this.$hour = $('.ac-time-picker-hour', this)
        .on({
            click: this.eventHandler.clickHour,
            keydown: this.eventHandler.keydownHour
        });
    this.$minute = $('.ac-time-picker-minute', this)
        .on({
            click: this.eventHandler.clickMinute,
            keydown: this.eventHandler.keydownMinute
        });

    //only support if is none touch device
    if (!isTouchDevice) {
        this.$hour.attr('contenteditable', 'true');
        this.$minute.attr('contenteditable', 'true');
    }

    this.$clock = $g('.ac-time-picker-clock', this)
        .on({
            mousedown: this.eventHandler.mousedownClock
        });

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
        else
            if (h == 12) h = '00';
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
}


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
}


TimePicker.render = function () {
    return _({
        class: 'ac-time-picker',
        child: [
            {
                class: 'ac-time-picker-header',
                child: [
                    {
                        tag: 'span',
                        class: 'ac-time-picker-hour',
                        child: { text: '00' }
                    },
                    {
                        tag: 'span',
                        text: ':'
                    },
                    {
                        tag: 'span',
                        class: 'ac-time-picker-minute',
                        child: { text: '00' }
                    },
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
            ),
            {
                class: 'ac-time-picker-footer',
                child: [
                    {
                        tag: 'button',
                        class: 'ac-time-picker-keyboard-btn',
                        child: 'span.mdi.mdi-keyboard-outline'
                    },
                    {
                        class: 'ac-time-picker-footer-right',
                        child: [
                            {
                                tag: 'button',
                                child: { text: 'CANCEL' }
                            },
                            {
                                tag: 'button',
                                child: { text: 'OK' }
                            }

                        ]
                    }]
            }
        ]
    });
};

TimePicker.prototype.editHour = function () {
    this._state = "EDIT_HOUR";
    this._preHour = this._hour;
    this.removeClass('ac-time-picker-edit-minute')
        .addClass('ac-time-picker-edit-hour');
    this.updateSize();
};


TimePicker.prototype.editMinute = function () {
    this._state = "EDIT_MINUTE";
    this._preMinute = this._minute;
    this.addClass('ac-time-picker-edit-minute')
        .removeClass('ac-time-picker-edit-hour');
    this.updateSize();

};

TimePicker.eventHandler = {};

TimePicker.eventHandler.clickHour = function () {
    if (this._state != 'EDIT_HOUR') this.editHour();
};

TimePicker.eventHandler.clickMinute = function () {
    if (this._state != 'EDIT_MINUTE') this.editMinute();

};


TimePicker.property = {};


TimePicker.property.hour = {
    set: function (value) {
        value = (value % 24) || 0;
        this._hour = value;
        this.$hour.clearChild().addChild(_({ text: (value < 10 ? '0' : '') + value + '' }));
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
        this.$minute.clearChild().addChild(_({ text: (value < 10 ? '0' : '') + value + '' }));
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
}

TimePicker.prototype._showSelectByHourText = function () {
    var hour = parseFloat(this.$hour.innerHTML) || 0;
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


TimePicker.prototype._showSelectByMinuteText = function () {
    var minute = parseFloat(this.$minute.innerHTML) || 0;
    var angle = Math.PI * (minute - 15) / 30;
    if (minute >= 0 && minute < 60) {
        this._drawSelect(this._clockRadius, angle);
    }
};

TimePicker.eventHandler.keydownHour = function (event) {
    if (event.key.length == 1) {
        if (event.key.match(/[0-9]/)) {
            setTimeout(this._showSelectByHourText.bind(this), 1);
        }
        else {
            event.preventDefault();
        }
    } if (event.key == 'Enter') {
        event.preventDefault();
        var hour = parseFloat(this.$hour.innerHTML) || 0;
        if (hour < 0 || hour >= 24)
            hour = this._preHour;
        this.$hour.clearChild().addChild(_({ text: (hour < 10 ? '0' : '') + hour + '' }));
        this.$hour.blur();
        this.editMinute();
    }
    else {
        setTimeout(this._showSelectByHourText.bind(this), 1);
    }
}

TimePicker.eventHandler.keydownMinute = function (event) {
    if (event.key.length == 1) {
        if (event.key.match(/[0-9]/)) {
            setTimeout(this._showSelectByMinuteText.bind(this), 1);
        }
        else {
            event.preventDefault();
        }
    }
    if (event.key == 'Enter') {
        event.preventDefault();
        var minute = parseFloat(this.$minute.innerHTML) || 0;
        if (minute < 0 || minute >= 60)
            minute = this._preMinute
        this.$minute.clearChild().addChild(_({ text: (minute < 10 ? '0' : '') + minute + '' }));
        this.$minute.blur();
    }
    else {
        setTimeout(this._showSelectByMinuteText.bind(this), 1);
    }
};

TimePicker.eventHandler.dragOnClock = function (event) {
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

        this.hour = hour;
    }
    else if (this._state == "EDIT_MINUTE") {
        radius = this._clockRadius;
        angle += Math.PI * 2;
        index = Math.round(angle / (Math.PI / 30));
        angle = index * (Math.PI / 30);
        var minute = (index + (60 + 15)) % 60;
        this.minute = minute;
    }
    else {
        return;
    }
};


TimePicker.eventHandler.mousedownClock = function (event) {
    this.eventHandler.dragOnClock(event);
    document.body.addEventListener('mousemove', this.eventHandler.mousemoveClock);
    document.body.addEventListener('mouseup', this.eventHandler.mousefinishClock);
    document.body.addEventListener('mouseleave', this.eventHandler.mousefinishClock);

};



TimePicker.eventHandler.mousemoveClock = function (event) {
    this.eventHandler.dragOnClock(event);
};


TimePicker.eventHandler.mousefinishClock = function () {
    document.body.removeEventListener('mousemove', this.eventHandler.mousemoveClock);
    document.body.removeEventListener('mouseup', this.eventHandler.mousefinishClock);
    document.body.removeEventListener('mouseleave', this.eventHandler.mousefinishClock);
    if (this._state == 'EDIT_HOUR') this.editMinute();
};


Acore.install('timepicker', TimePicker);