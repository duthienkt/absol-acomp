import ACore, {_, $, $$} from '../ACore';
import '../css/chrometimepicker.css';
import DomSignal from "absol/src/HTML5/DomSignal";
import {beginOfDay, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE} from "absol/src/Time/datetime";
import {isRealNumber} from "./utils";

/***
 * @extends AElement
 * @constructor
 */
function ChromeTimePicker() {
    this._hour = null;
    this._minute = null;
    this.$lists = $$('.as-chrome-time-picker-list', this);
    this.$hourList = this.$lists[0];
    this.$hourList.on('scroll', this.eventHandler.hourScroll)
        .on('click', this.eventHandler.clickHourList);

    this.$hour24List = this.$lists[1];
    this.$hour24List.on('scroll', this.eventHandler.hour24Scroll)
        .on('click', this.eventHandler.clickHour24List);


    this.$minList = this.$lists[2];
    this.$minList.on('scroll', this.eventHandler.minScroll)
        .on('click', this.eventHandler.clickMinList);
    this.$attachhook = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$attachhook)
        .on('request_scroll_into_selected', this._scrollIntoSelected.bind(this));
    this.$amBtn = $('.as-chrome-time-picker-btn[data-value="AM"]', this)
        .on('click', this.eventHandler.clickAM);
    this.$pmBtn = $('.as-chrome-time-picker-btn[data-value="PM"]', this)
        .on('click', this.eventHandler.clickPM);
    this.scrollIntoSelected();
    this.hour = null;
    this.minute = null;
    this.s24 = false;
    $$('.as-chrome-time-picker-scroller', this).forEach(this._makeScroller.bind(this));
}

ChromeTimePicker.tag = 'ChromeTimePicker'.toLowerCase();

ChromeTimePicker.render = function () {
    return _({
        class: 'as-chrome-time-picker',
        extendEvent: ['change'],
        child: [
            {
                class: ['as-chrome-time-picker-scroller', 'as-chrome-time-picker-scroller-h12'],
                child: [
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up'},
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down'},
                    {
                        class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-h12'],
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(36).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',

                                    child: {
                                        tag: 'span',
                                        child: {text: (i % 12) + 1 + ''}
                                    },
                                    props: {
                                        __hour__: (i % 12) + 1
                                    }
                                }
                            })
                        }
                    }]
            },
            {
                class: ['as-chrome-time-picker-scroller', 'as-chrome-time-picker-scroller-h24'],
                child: [
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up'},
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down'},
                    {
                        class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-h24'],
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(24 * 3).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',

                                    child: {
                                        tag: 'span',
                                        child: {text: (i % 24) + ''}
                                    },
                                    props: {
                                        __hour__: (i % 24)
                                    }
                                }
                            })
                        }
                    }]
            }, {
                class: 'as-chrome-time-picker-scroller',
                child: [
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up'},
                    {tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down'},
                    {
                        class: 'as-chrome-time-picker-viewport',
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(180).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',

                                    child: {
                                        tag: 'span',

                                        child: {text: (i % 60) + ''}
                                    },
                                    props: {
                                        __min__: (i % 60)
                                    }
                                }
                            })
                        }
                    }]
            },
            {
                class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-period'],
                child: ['AM', 'PM'].map(function (u,) {
                    return {
                        tag: 'button',
                        class: 'as-chrome-time-picker-btn',
                        attr: {
                            'data-value': u
                        },
                        child: {
                            tag: 'span',
                            child: {text: u}
                        },
                        props: {
                            __APM__: u
                        }
                    }
                })
            }
        ]
    });
};

ChromeTimePicker.prototype._makeScroller = function (rootElt) {
    var upBtn = $('.as-chrome-time-picker-scroller-up', rootElt);
    var downBtn = $('.as-chrome-time-picker-scroller-down', rootElt);
    var listElt = $('.as-chrome-time-picker-list', rootElt);
    var delta = 0;

    function tick() {
        if (delta === 0) return;
        listElt.scrollTop -= delta;
        requestAnimationFrame(tick);
    }

    function cancel() {
        delta = 0;
        document.body.removeEventListener('mouseup', cancel);
        document.body.removeEventListener('mouseleave', cancel);
    }

    upBtn.on('mousedown', function () {
        delta = 5;
        document.body.addEventListener('mouseup', cancel);
        document.body.addEventListener('mouseleave', cancel);
        tick();

    });

    downBtn.on('mousedown', function () {
        delta = -5;
        document.body.addEventListener('mouseup', cancel);
        document.body.addEventListener('mouseleave', cancel);
        tick();
    });


};


ChromeTimePicker.prototype.scrollIntoSelected = function () {
    this.domSignal.emit('request_scroll_into_selected');
};

ChromeTimePicker.prototype._scrollIntoSelected = function () {
    var hour = this._hour;
    this.$hour24List.scrollTop = (hour + 24) * 28;
    hour = this._hour % 12;
    if (hour === 0) hour = 12;
    this.$hourList.scrollTop = (hour + 11) * 28;
    this.$minList.scrollTop = (this._minute + 60) * 28;
};


ChromeTimePicker.prototype.notifyChange = function (event) {
    this.emit('change', {
        type: 'change',
        originEvent: event,
        dayOffset: this.dayOffset,
        hour: this.hour,
        minute: this.minute,
        target: this
    }, this);
}

ChromeTimePicker.property = {};


ChromeTimePicker.property.hour = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.min(23, Math.max(0, Math.floor(value) % 24));
        } else {
            value = null;
        }
        var prevVal = this._hour;
        if (prevVal !== null) {
            this.$hour24List.childNodes[prevVal].removeClass('as-selected');
            this.$hour24List.childNodes[prevVal + 24].removeClass('as-selected');
            this.$hour24List.childNodes[prevVal + 48].removeClass('as-selected');
            prevVal = this._hour % 12;
            if (prevVal === 0) prevVal = 12;
            this.$hourList.childNodes[prevVal - 1].removeClass('as-selected');
            this.$hourList.childNodes[prevVal - 1 + 12].removeClass('as-selected');
            this.$hourList.childNodes[prevVal - 1 + 24].removeClass('as-selected');
        }
        this._hour = value;
        prevVal = this._hour;
        if (prevVal !== null) {
            this.$hour24List.childNodes[prevVal].addClass('as-selected');
            this.$hour24List.childNodes[prevVal + 24].addClass('as-selected');
            this.$hour24List.childNodes[prevVal + 48].addClass('as-selected');
            prevVal = this._hour % 12;
            if (prevVal === 0) prevVal = 12;
            this.$hourList.childNodes[prevVal - 1].addClass('as-selected');
            this.$hourList.childNodes[prevVal - 1 + 12].addClass('as-selected');
            this.$hourList.childNodes[prevVal - 1 + 24].addClass('as-selected');
            if (this._hour >= 12) {
                this.$pmBtn.addClass('as-selected');
                this.$amBtn.removeClass('as-selected');
            } else {
                this.$amBtn.addClass('as-selected');
                this.$pmBtn.removeClass('as-selected');
            }
        } else {
            this.$pmBtn.removeClass('as-selected');
            this.$amBtn.removeClass('as-selected');
        }
    },
    get: function () {
        return this._hour;
    }
};


ChromeTimePicker.property.minute = {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.min(59, Math.max(0, Math.floor(value) % 60));
        } else {
            value = null;
        }
        var prevVal = this._minute;
        if (prevVal !== null) {
            this.$minList.childNodes[prevVal].removeClass('as-selected');
            this.$minList.childNodes[prevVal + 60].removeClass('as-selected');
            this.$minList.childNodes[prevVal + 120].removeClass('as-selected');
        }
        this._minute = value;
        prevVal = this._minute;
        if (prevVal !== null) {
            this.$minList.childNodes[prevVal].addClass('as-selected');
            this.$minList.childNodes[prevVal + 60].addClass('as-selected');
            this.$minList.childNodes[prevVal + 120].addClass('as-selected');
        }
    },
    get: function () {
        return this._minute;
    }
};


ChromeTimePicker.property.dayOffset = {
    set: function (value) {
        if (!isRealNumber(value) && !(value instanceof Date)) {
            value = null;
        }
        if (value && value.getTime) {
            value = value.getTime() - beginOfDay(value).getTime();
            if (!isRealNumber(value)) value = null;
        } else if (isRealNumber(value)) {
            value = Math.min(MILLIS_PER_DAY - 1, Math.max(0, value % MILLIS_PER_DAY));
        }

        if (isRealNumber(value)) {
            this.hour = Math.floor(value / MILLIS_PER_HOUR);
            this.minute = Math.floor((value % MILLIS_PER_HOUR) / MILLIS_PER_MINUTE);
        } else {
            this.hour = null;
            this.minute = null;
        }
        this.domSignal.emit('request_scroll_into_selected');
    },
    get: function () {
        var res = this._hour * MILLIS_PER_HOUR + this._minute * MILLIS_PER_MINUTE;
        return isRealNumber(res) ? res : null;
    }
};

ChromeTimePicker.property.s24 = {
    set: function (value) {
        if (value) {
            this.addClass('as-24h-clock');
        } else {
            this.removeClass('as-24h-clock');
        }
    },
    get: function () {
        return this.containsClass('as-24h-clock');
    }
}

ChromeTimePicker.eventHandler = {};

ChromeTimePicker.eventHandler.hourScroll = function () {
    var y = this.$hourList.scrollTop;
    var dy = 0;
    if (y < 28 * 12) dy = 28 * 12;
    else if (y > 28 * 24) {
        dy = -28 * 12;
    }
    if (dy !== 0) {
        this.$hourList.scrollTop += dy;
    }
};

ChromeTimePicker.eventHandler.hour24Scroll = function () {
    var y = this.$hour24List.scrollTop;
    var dy = 0;
    if (y < 28 * 24) dy = 28 * 24;
    else if (y > 28 * 48) {
        dy = -28 * 24;
    }
    if (dy !== 0) {
        this.$hour24List.scrollTop += dy;
    }
};

ChromeTimePicker.eventHandler.minScroll = function () {
    var y = this.$minList.scrollTop;
    var dy = 0;
    if (y < 28 * 60) dy = 28 * 60;
    else if (y > 28 * 120) {
        dy = -28 * 60;
    }
    if (dy !== 0) {
        this.$minList.scrollTop += dy;
    }
};

ChromeTimePicker.eventHandler.clickHourList = function (event) {
    var hour;
    if ('__hour__' in event.target) hour = event.target.__hour__;
    if ('__hour__' in event.target.parentElement) hour = event.target.parentElement.__hour__;
    if (hour !== undefined) {
        if (this.hour >= 12) {
            this.hour = hour === 12 ? hour : hour + 12;
        } else {
            this.hour = hour === 12 ? 0 : hour;
        }

        if ((hour - 1 + 12) * 28 < this.$hourList.scrollTop) {
            this.$hourList.scrollTop = (hour - 1 + 12) * 28;
        } else if (((hour - 1 + 13) * 28) > this.$hourList.scrollTop + this.$hourList.clientHeight) {
            this.$hourList.scrollTop = (hour - 1 + 13) * 28 - this.$hourList.clientHeight;
        }
        this.notifyChange(event);
    }
};


ChromeTimePicker.eventHandler.clickHour24List = function (event) {
    var hour;
    if ('__hour__' in event.target) hour = event.target.__hour__;
    if ('__hour__' in event.target.parentElement) hour = event.target.parentElement.__hour__;
    if (hour !== undefined) {
        this.hour = hour;
        if ((hour + 24) * 28 < this.$hourList.scrollTop) {
            this.$hourList.scrollTop = (hour + 24) * 28;
        } else if (((hour + 24) * 28) > this.$hourList.scrollTop + this.$hourList.clientHeight) {
            this.$hourList.scrollTop = (hour + 24) * 28 - this.$hourList.clientHeight;
        }
        this.notifyChange(event);
    }
};

ChromeTimePicker.eventHandler.clickMinList = function (event) {
    var min;
    if ('__min__' in event.target) min = event.target.__min__;
    if ('__min__' in event.target.parentElement) min = event.target.parentElement.__min__;
    if (min !== undefined) {
        this.minute = min;
        if ((min + 60) * 28 < this.$minList.scrollTop) {
            this.$minList.scrollTop = (min + 60) * 28;
        } else if (((min + 61) * 28) > this.$minList.scrollTop + this.$minList.clientHeight) {
            this.$minList.scrollTop = (min + 61) * 28 - this.$minList.clientHeight;
        }
        this.notifyChange(event);
    }
};

ChromeTimePicker.eventHandler.clickPM = function (event) {
    if (isRealNumber(this.hour)) {
        if (this.hour < 12)
            this.hour += 12;
    } else {
        this.hour = 12;
    }
    this.notifyChange(event);

};

ChromeTimePicker.eventHandler.clickAM = function (event) {
    if (isRealNumber(this.hour)) {
        if (this.hour >= 12)
            this.hour -= 12;
    } else {
        this.hour = 0;
    }
    this.notifyChange(event);
};


ACore.install(ChromeTimePicker);

export default ChromeTimePicker;