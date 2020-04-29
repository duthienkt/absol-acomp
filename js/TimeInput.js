import ACore from "../ACore";
import { isTouchDevice } from "./TimePicker";
import { MILLIS_PER_HOUR, MILLIS_PER_MINUTE, MILLIS_PER_DAY, beginOfDay } from "absol/src/Time/datetime";
import EventEmitter from 'absol/src/HTML5/EventEmitter';

var _ = ACore._;
var $ = ACore.$;


function TimeInput() {
    this._isOpenPicker = false;
    this._hour = 0;
    this._minute = 0;
    this.$hour = $('.ac-time-input-hour', this);
    this.$minute = $('.ac-time-input-minute', this);
    this.$timePicker = TimeInput.getTimePicker();
    this.$timePickerCtn = TimeInput.getTimePickerContainer();
    this.on('click', this.togglePicker.bind(this));
}


TimeInput.getTimePicker = function () {
    if (!TimeInput.$timePickerCtn) {
        TimeInput.$timePickerCtn = _((isTouchDevice ? '' : 'follower') + '.ac-time-input-picker-ctn.ac-time-input-picker-ctn-hidden')
            .addTo(document.body);
        TimeInput.$timePicker = _('timepicker').addTo(TimeInput.$timePickerCtn);
        TimeInput.$timePicker.on('sizechange', function () {
            if (isTouchDevice) {
                var bound = TimeInput.$timePickerCtn.getBoundingClientRect();
                TimeInput.$timePickerCtn.addStyle({
                    left: 'calc(50vw - ' + (bound.width / 2) + 'px)',
                    top: 'calc(50vh - ' + (bound.height / 2) + 'px)'
                });
            }
            else {
                TimeInput.$timePickerCtn.updatePosition();
            }
        });
    }
    return TimeInput.$timePicker;
};

TimeInput.getTimePickerContainer = function () {
    TimeInput.getTimePicker();
    return TimeInput.$timePickerCtn;
}

TimeInput.render = function () {
    return _({
        class: 'ac-time-input',
        extendEvent: ['change'],
        child: [
            {
                tag: 'span',
                class: 'ac-time-input-hour',
                child: { text: '00' }
            },
            {
                tag: 'span',
                child: { text: " : " }
            },
            {
                tag: 'span',
                class: 'ac-time-input-minute',
                child: {
                    text: '00'
                }
            }
        ]
    })
};


TimeInput.prototype.togglePicker = function () {
    if (this._isOpenPicker) this.closePicker();
    else this.openPicker();
};


TimeInput.prototype.openPicker = function () {
    if (this._isOpenPicker) return;
    this._isOpenPicker = true;
    if (!isTouchDevice)
        this.$timePickerCtn.followTarget = this;
    this._lastDayOfset = this.dayOffset;
    this.$timePickerCtn.removeClass('ac-time-input-picker-ctn-hidden');
    this.$timePicker.dayOffset = this._lastDayOfset;
    this.$timePicker.clockMode();
    this.$timePicker.editHour();
    this.$timePicker
        .on('finish', this.eventHandler.pickerFinish)
        .on('cancel', this.eventHandler.pickerCancel);
    $(document.body).on('click', this.eventHandler.clickBody);
};

TimeInput.prototype.closePicker = function () {
    if (!this._isOpenPicker) return;
    var thisTI = this;
    this._isOpenPicker = false;
    this.$timePickerCtn.addClass('ac-time-input-picker-ctn-hidden');
    if (!isTouchDevice)
        this.$timePickerCtn.followTarget = null;
    this.$timePicker
        .off('finish', this.eventHandler.pickerFinish)
        .off('cancel', this.eventHandler.pickerCancel);
    setTimeout(function(){
        $(document.body).off('click', thisTI.eventHandler.clickBody);
    }, 100);
};

TimeInput.property = {};

TimeInput.property.hour = {
    set: function (value) {
        value = (value % 24) || 0;
        this._hour = value;
        var text = (value < 10 ? '0' : '') + value + '';
        this.$hour.clearChild().addChild(_({ text: text }));
    },
    get: function () {
        return this._hour;
    }
};


TimeInput.property.minute = {
    set: function (value) {
        value = (value % 60) || 0;
        this._minute = value;
        var text = (value < 10 ? '0' : '') + value + '';
        this.$minute.clearChild().addChild(_({ text: text }));
    },
    get: function () {
        return this._minute;
    }
};


TimeInput.property.dayOffset = {
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


TimeInput.eventHandler = {};


TimeInput.eventHandler.pickerFinish = function (event) {
    this.closePicker();
    if (this._lastDayOfset != event.dayOffset) {
        this.dayOffset = event.dayOffset;
        this.emit('change', { name: 'change', target: this }, this);
    }
};


TimeInput.eventHandler.pickerCancel = function (event) {
    this.closePicker();
};

TimeInput.eventHandler.clickBody = function(event){
    if (EventEmitter.hitElement(this.$timePicker, event) || EventEmitter.hitElement(this, event)) return;
    this.closePicker();
};

ACore.install('timeinput', TimeInput);