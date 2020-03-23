import Acore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

var $g = Svg.ShareInstance.$;
var _g = Svg.ShareInstance._;

function TimePicker() {
    this._state = 'none';
    var thisPicker = this;
    this.$attachook = _('attachhook').addTo(this).on('error', function () {
        Dom.addToResizeSystem(this);
        this.requestUpdateSize();
    });
    this.$attachook.requestUpdateSize = this.updateSize.bind(this);
    this.$hour = $('.ac-time-picker-hour', this).on('click', this.eventHandler.clickHour);
    this.$minute = $('.ac-time-picker-minute', this).on('click', this.eventHandler.clickMinute);

    this.$clock = $g('.ac-time-picker-clock', this);
    this._clockWidth;
    this._clockHeight;
    this.$clockContent = $g('.ac-time-picker-clock-content', this);
    this.$clockHourCtn = $g('.ac-time-picker-clock-hour-ctn', this);
    this.$clockMinuteCtn = $g('.ac-time-picker-clock-minute-ctn', this);

    this.$hourNumbers = Array(24).fill(0).map(function (u, i) {
        return _g({
            tag: 'text',
            attr: {
                'text-anchor': 'middle'
            },
            class: 'ac-time-picker-clock-hour-' + (i < 12 ? 'am' : 'pm'),
            child: { text: i + 1 + '' }
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
        var y = clockRadius * Math.sin(angle) + box.height / 2;
        elt.attr({
            x: x,
            y: y
        });
    });
};

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
            )
        ]
    });
};

TimePicker.prototype.editHour = function () {
    this._state = "EDIT_HOUR";
    this.removeClass('ac-time-picker-edit-minute')
        .addClass('ac-time-picker-edit-hour');
    this.$hour.attr('contenteditable', 'true');
    this.$minute.attr('contenteditable', 'true');
};


TimePicker.prototype.editMinute = function () {
    this._state = "EDIT_MINUTE";
    this.addClass('ac-time-picker-edit-minute')
        .removeClass('ac-time-picker-edit-hour');
    this.$minute.attr('contenteditable', 'true');
    this.$hour.attr('contenteditable', 'true');
};

TimePicker.eventHandler = {};

TimePicker.eventHandler.clickHour = function () {
    if (this._state != 'EDIT_HOUR') this.editHour();
};

TimePicker.eventHandler.clickMinute = function () {
    if (this._state != 'EDIT_MINUTE') this.editMinute();

};

Acore.install('timepicker', TimePicker);