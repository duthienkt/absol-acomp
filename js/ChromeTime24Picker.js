import ACore, { $$, $, _ } from "../ACore";
import '../css/chrometimepicker.css';
import '../css/chrometime24picker.css';
import { beginOfDay, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE } from "absol/src/Time/datetime";
import { isNaturalNumber, isRealNumber, measureText, vScrollIntoView } from "./utils";
import { map } from "absol/src/Math/int";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { findChangedTouchByIdent } from "absol/src/HTML5/EventEmitter";
import LangSys from "absol/src/HTML5/LanguageSystem";

/**
 *
 * @param {number} leftOffset
 */
function calcMinHMTime(leftOffset) {
    var h = Math.floor(leftOffset / MILLIS_PER_HOUR);
    var m = Math.floor(leftOffset / MILLIS_PER_MINUTE) % 60;
    if (leftOffset % MILLIS_PER_MINUTE > 0) {
        if (m === 59) {
            h++;
            m = 0;
        }
        else {
            m++;
        }
    }
    var offset = h * MILLIS_PER_HOUR + m * MILLIS_PER_MINUTE;
    return { m: m, h: h, offset: offset };
}

/***
 * @extends AElement
 * @constructor
 */
function ChromeTime24Picker() {
    var tText = `24 ${LangSys.getText('txt_next_day') || 'Next day'})`;
    this.addStyle('--next-day-h24-width', Math.ceil(measureText(tText, '16px arial').width  + 15) + 'px');

    this.$lists = $$('.as-chrome-time-picker-list', this);
    this.$scrollers = $$('.as-chrome-time-picker-scroller', this);
    this.minuteController = new CTPMinuteListController(this);
    this.hourController = new CTPHourListController(this);


    this._dayOffset = 0;
    this._value = 0;

    /**
     * @name dayOffset
     * @type {number}
     * @memberOf ChromeTime24Picker#
     */

    /**
     * @name value
     * @type {number | null}
     * @memberOf ChromeTime24Picker#
     */

}


ChromeTime24Picker.tag = 'ChromeTime24Picker'.toLowerCase();


ChromeTime24Picker.render = function () {
    return _({
        extendEvent: 'change',
        class: ['as-chrome-time-24-picker', 'as-chrome-time-picker'],
        child: [
            {
                class: ['as-chrome-time-picker-scroller', 'as-chrome-time-24-picker-hour'],
                child: [
                    { tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up' },
                    { tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down' },
                    {
                        class: ['as-chrome-time-picker-viewport', 'as-chrome-time-picker-h24'],
                        child: {
                            class: 'as-chrome-time-picker-list',
                            child: Array(25).fill(0).map(function (u, i) {
                                return {
                                    tag: 'button',
                                    class: 'as-chrome-time-picker-btn',
                                    child: [
                                        {
                                            tag: 'span',
                                            child: { text: i + '' }
                                        },
                                        {
                                            tag: 'span',
                                            class: 'as-chrome-time-24-picker-tomorrow-text',
                                            child: { text: ` (${LangSys.getText('txt_next_day') || 'Next day'})` }
                                        }
                                    ],
                                    props: {
                                        __hour__: i
                                    }
                                }
                            })
                        }
                    }
                ]

            },
            {
                class: ['as-chrome-time-picker-scroller', 'as-chrome-time-picker-infinity-scroller'],
                child: [
                    { tag: 'button', class: 'as-chrome-time-picker-scroller-up', child: 'span.mdi.mdi-chevron-up' },
                    { tag: 'button', class: 'as-chrome-time-picker-scroller-down', child: 'span.mdi.mdi-chevron-down' },
                    {
                        class: ['as-chrome-time-picker-infinity-viewport', 'as-chrome-time-picker-m60', 'as-chrome-time-picker-list'],
                        child: Array(60).fill(0).map(function (u, i) {
                            return {
                                tag: 'button',
                                class: 'as-chrome-time-picker-btn',
                                child: {
                                    tag: 'span',
                                    child: { text: i + '' }
                                },
                                props: {
                                    __min__: i
                                }
                            }
                        })
                    }
                ]
            }
        ]

    });
};


ChromeTime24Picker.prototype.updateViewByValue = function () {
    var offset = this.dayOffset;
    var offsetMH = calcMinHMTime(offset);
    var value = this.value;
    this.hourController.hourOffset = offsetMH.h;

    var valueMH;
    if (isRealNumber(value)) {
        valueMH = calcMinHMTime(offset + value);
        this.hourController.hour = valueMH.h;
        if (valueMH.h === offsetMH.h) {
            this.minuteController.activeItem(offsetMH.m, Infinity);
        }
        else if (valueMH.h === offsetMH.h + 24) {
            this.minuteController.activeItem(Infinity, offsetMH.m + 1);
        }
        this.minuteController.minute = valueMH.m;
    }
    else {
        this.hourController.hour = null;
        this.minuteController.minute = null;
    }
};

ChromeTime24Picker.prototype.scrollIntoSelected = function () {
    this.hourController.scrollIntoSelected(true);
    this.minuteController.scrollIntoSelected(true);
};

ChromeTime24Picker.prototype.flushViewToValue = function () {
    var hour = this.hourController.hour;
    var minute = this.minuteController.minute;
    var endMil, newValue;
    if (isRealNumber(hour) && isRealNumber(minute)) {
        endMil = hour * MILLIS_PER_HOUR + minute * MILLIS_PER_MINUTE;
        newValue = endMil - this.dayOffset;
        if (newValue !== this._value) {
            this._value = newValue;
            this.notifyChange();
        }
    }
};

ChromeTime24Picker.prototype.notifyChange = function () {
    this.emit('change', { type: 'change' }, this);
};


ChromeTime24Picker.property = {};

ChromeTime24Picker.property.dayOffset = {
    /***
     * @this ChromeTime24Picker
     * @param {number|Date} value
     */
    set: function (value) {
        if (value instanceof Date) {
            value = value.getTime() - beginOfDay(value).getTime();
        }
        if (isRealNumber(value)) {
            value = Math.round(value);
            value = value % MILLIS_PER_DAY;
            if (value < 0) value += MILLIS_PER_DAY;
        }
        else {
            value = 0;
        }
        this._dayOffset = calcMinHMTime(value).offset;//round to minute
        this.updateViewByValue();
    },
    /**
     * @this ChromeTime24Picker
     * @returns {number|*}
     */
    get: function () {
        return this._dayOffset;
    }
};


ChromeTime24Picker.property.value = {
    /***
     * @this ChromeTime24Picker
     * @param value
     */
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.min(MILLIS_PER_DAY, Math.max(0, Math.round(value)));
            value = calcMinHMTime(value).offset;
        }
        else {
            value = null;
        }
        this._value = value;
        this.updateViewByValue();
    },
    /**
     * @this ChromeTime24Picker
     * @returns {number|*}
     */
    get: function () {
        return this._value;
    }
};

ChromeTime24Picker.property.hour = {
    get: function () {
        return Math.floor((this.dayOffset + this.value) / MILLIS_PER_HOUR);
    }
};


ChromeTime24Picker.property.minute = {
    get: function () {
        return Math.floor((this.dayOffset + this.value) / MILLIS_PER_MINUTE) % 60;
    }
};


ACore.install(ChromeTime24Picker);

export default ChromeTime24Picker;


function CTPHourListController(elt) {
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt = elt;
    this.$list = $('.as-chrome-time-picker-h24 >.as-chrome-time-picker-list', elt);
    this.$items = Array.prototype.slice.call(this.$list.childNodes);
    this.$list.on('click', this.ev_clickList);
    this._offset = 0;
    this.selectedValue = null;
    this.$selectedItem = null;
    /**
     * @type {number}
     * @name hour - from 0 to 23, 24... is next day
     * @memberOf CTPHourListController
     */
}

Object.defineProperty(CTPHourListController.prototype, 'hourOffset', {
    set: function (value) {
        if (!isRealNumber(value)) value = 0;
        value = Math.round(value);
        value = value % 24;
        if (value < 0) value += 24;
        this._offset = value;

        for (var i = 0; i < this.$items.length; ++i) {
            this.$items[i].firstChild.firstChild.data = (i + value)% 24;
            this.$items[i].__hour__ = i + value;
            if ((value + i) >= 24) {
                this.$items[i].addClass('as-in-tomorrow');
            }
            else {
                this.$items[i].removeClass('as-in-tomorrow');
            }
        }

        this.updateSelected();
    },
    get: function () {
        return this._offset;
    }
});


CTPHourListController.prototype.updateSelected = function () {
    if (this.$selectedItem) {
        this.$selectedItem.removeClass('as-selected');
    }
    if (isRealNumber(this.selectedValue)) {
        this.$selectedItem = this.$items[this.selectedValue - this._offset];
    }
    else {
        this.$selectedItem = null;
    }

    if (this.$selectedItem) {
        this.$selectedItem.addClass('as-selected');
    }

};

CTPHourListController.prototype.ev_clickList = function (event) {
    this.hour = this.itemValueOf(event.target);
    this.scrollIntoSelected(false);
    var offsetMH = calcMinHMTime(this.elt.dayOffset);
    if (this.hour === offsetMH.h) {
        this.elt.minuteController.activeItem(offsetMH.m, Infinity);

        if (!isRealNumber(this.elt.minuteController.minute) || this.elt.minuteController.minute < offsetMH.m) {
            this.elt.minuteController.minute = offsetMH.m;
            this.elt.minuteController.scrollIntoSelected(true);
        }
    }
    else if (this.hour === offsetMH.h + 24) {
        this.elt.minuteController.activeItem(Infinity, offsetMH.m + 1);
        if (!isRealNumber(this.elt.minuteController.minute)  || this.elt.minuteController.minute > offsetMH.m ) {
            this.elt.minuteController.minute = offsetMH.m;
            this.elt.minuteController.scrollIntoSelected(true);
        }
    }
    else {
        if (!isRealNumber(this.elt.minuteController.minute)) {
            this.elt.minuteController.minute = 0;
            this.elt.minuteController.scrollIntoSelected(true);
        }
        this.elt.minuteController.activeItem(Infinity, Infinity);
    }
    this.elt.flushViewToValue();
};

CTPHourListController.prototype.scrollIntoSelected = function (onTop) {
    if (this.$selectedItem)
        vScrollIntoView(this.$selectedItem);
};

CTPHourListController.prototype.itemValueOf = function (itemElt) {
    while (itemElt) {
        if (itemElt.hasClass && itemElt.hasClass('as-chrome-time-picker-btn')) break;
        itemElt = itemElt.parentElement;
    }
    if (!itemElt) return undefined;
    return itemElt.__hour__;
};


Object.defineProperty(CTPHourListController.prototype, 'hour', {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.round(value);
        }
        else {
            value = null;
        }
        this.selectedValue = value;
        this.updateSelected();
    },
    get: function () {
        return this.selectedValue;
    }
});

function CTPInfinityVerticalScroller(elt) {
    this.elt = elt;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.$upBtn = $('.as-chrome-time-picker-scroller-up', this.elt)
        .on('pointerdown', this.ev_pressUpBtn);
    this.$downBtn = $('.as-chrome-time-picker-scroller-down', this.elt)
        .on('pointerdown', this.ev_pressDownBtn);
    this.$upBtn.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    }, BrowserDetector.supportPassiveEvent ? { passive: false } : true);
    this.$downBtn.addEventListener('contextmenu', function (event) {
        event.preventDefault();
    }, BrowserDetector.supportPassiveEvent ? { passive: false } : true);

    this.$viewport = $('.as-chrome-time-picker-infinity-viewport', this.elt);
    this.offset = 0;
    this.buttonHeight = 28;//2em
    this.elt.addEventListener('wheel', this.ev_wheel);
    this.$items = $$('.as-chrome-time-picker-btn', this.$viewport);
    this.updateItemPosition();
    this.$viewport.addEventListener('touchstart', this.ev_touchStart, BrowserDetector.supportPassiveEvent ? { passive: false } : true);

    /**
     *
     * @type {null|{startTime: number, endTime: number, startValue: number, endValue: number, type: string}}
     */
    this.animation = null;

    this.touchInfo = {};
}

CTPInfinityVerticalScroller.prototype.ev_touchStart = function (event) {
    var evFlag = BrowserDetector.supportPassiveEvent ? { passive: false } : true;
    document.addEventListener('touchmove', this.ev_touchMove, evFlag);
    document.addEventListener('touchend', this.ev_touchEnd, evFlag);
    var touch = event.changedTouches[0];
    var now = Date.now();
    this.touchInfo.prevY = touch.clientY;
    this.touchInfo.prevTime = now;
    this.touchInfo.target = touch.target;
    this.touchInfo.identifier = touch.identifier;
    this.touchInfo.state = 0;//init
    this.touchInfo.checkPoints = [{ time: now, y: touch.clientY }];
    event.preventDefault();
};

CTPInfinityVerticalScroller.prototype.ev_touchMove = function (event) {
    var touch = findChangedTouchByIdent(event, this.touchInfo.identifier);
    if (!touch) return;
    var dy = touch.clientY - this.touchInfo.prevY;
    var now = Date.now();
    if (this.touchInfo.state === 0) {
        if (Math.abs(dy) > 2) {
            this.touchInfo.state = 1;
        }
    }
    if (this.touchInfo.state === 1) {
        this.makeAnimation(this.offset - dy / this.buttonHeight, 0);
        this.touchInfo.prevY = touch.clientY;
        this.touchInfo.prevTime = now;
        this.touchInfo.checkPoints.push({ time: now, y: touch.clientY });
    }
    event.preventDefault();
};

/**
 *
 * @returns {number} - offset/s
 */
CTPInfinityVerticalScroller.prototype.getTouchSped = function () {
    var checkPoints = this.touchInfo.checkPoints;
    if (checkPoints.length < 2) return 0;
    var minTime = 100;
    var lastTime = checkPoints[checkPoints.length - 1].time;
    var dy;
    var dt;

    for (var i = checkPoints.length - 2; i >= 0; --i) {
        dy = checkPoints[i].y - checkPoints[checkPoints.length - 1].y;
        dt = checkPoints[i].time - checkPoints[checkPoints.length - 1].time;
        if (lastTime - checkPoints[i].time > minTime) break
    }
    if (dy === 0) return 0;
    return dy / this.buttonHeight / (dt / 1000);
};

CTPInfinityVerticalScroller.prototype.ev_touchEnd = function (event) {
    var touch = findChangedTouchByIdent(event, this.touchInfo.identifier);
    if (!touch) return;
    var evFlag = BrowserDetector.supportPassiveEvent ? { passive: false } : true;
    document.removeEventListener('touchmove', this.ev_touchMove, evFlag);
    document.removeEventListener('touchend', this.ev_touchEnd, evFlag);
    var speed = 0, acc = 10;
    var target;
    if (this.touchInfo.state === 1) {
        speed = this.getTouchSped();
        this.makeAnimation(this.offset - speed * Math.abs(speed) / acc / 2, Math.abs(speed) / acc * 1000, 'pow2');
    }
    else {
        target = this.touchInfo.target;
        var now = Date.now();
        while (target && target !== this.elt) {
            if (target.isSupportedEvent && target.isSupportedEvent('press')) {
                if (!target.lastPressTime || now - target.lastPressTime > 300) {
                    target.emit('press', { target: this.touchInfo.target });
                    target.lastPressTime = now;
                }
            }
            target = target.parentElement;
        }
    }

};

CTPInfinityVerticalScroller.prototype.ev_pressUpBtn = function (event) {
    this.makeAnimation(this.offset - 250, 25e3, 'linear');
    document.addEventListener('pointerup', this.ev_ReleaseUpDownBtn);
    event.preventDefault();
};

CTPInfinityVerticalScroller.prototype.ev_pressDownBtn = function (event) {
    this.makeAnimation(this.offset + 250, 25 * 1000, 'linear');
    document.addEventListener('pointerup', this.ev_ReleaseUpDownBtn);
    event.preventDefault();
};

CTPInfinityVerticalScroller.prototype.ev_ReleaseUpDownBtn = function (event) {
    this.makeAnimation(this.offset, 0);
    event.preventDefault();
};


CTPInfinityVerticalScroller.prototype.updateItemPosition = function () {
    while (this.offset < 0) this.offset += this.$items.length;
    while (this.offset >= this.$items.length) this.offset -= this.$items.length;
    var offset = this.offset;
    this.$items.forEach((itemElt, i) => {
        var k = i - offset;
        if (k < -this.$items.length / 2) k += this.$items.length;
        itemElt.addStyle('top', k * 2 + 'em');
    });
};


CTPInfinityVerticalScroller.prototype.ev_wheel = function (event) {
    event.preventDefault();
    var delta = event.deltaY;
    this.makeAnimation(this.offset + delta / this.buttonHeight, 200);
};

CTPInfinityVerticalScroller.prototype.makeAnimation = function (value, inTime, type) {
    if (inTime <= 0) {
        this.offset = value;
        this.updateItemPosition();
        this.animation = null;
        return;
    }
    var isNewAnimation = !this.animation;
    this.animation = {
        startTime: Date.now(),
        endTime: Date.now() + inTime,
        startValue: this.offset,
        endValue: value,
        type: type || 'linear'
    };


    if (isNewAnimation) {
        requestAnimationFrame(this.ev_animationFrame);
    }
};

CTPInfinityVerticalScroller.prototype.ev_animationFrame = function () {
    if (!this.animation) return;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    var now = Date.now();
    var t = map(Math.min(this.animation.endTime, now), this.animation.startTime, this.animation.endTime, 0, 1);
    if (this.animation.type === 'easeIn') {
        t = easeInOutCubic(t / 2);
    }
    else if (this.animation.type === 'easeOut') {
        t = easeInOutCubic(0.5 + t / 2);
    }
    else if (this.animation.type === 'pow2') {
        t = Math.sqrt(t);
    }

    this.offset = map(t, 0, 1, this.animation.startValue, this.animation.endValue);

    this.updateItemPosition();
    if (now >= this.animation.endTime) {
        this.animation = null;
    }
    else {
        requestAnimationFrame(this.ev_animationFrame);
    }
};


/**
 * @param {ChromeTime24Picker} elt
 * @param elt
 * @constructor
 */
function CTPMinuteListController(elt) {
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    this.elt = elt;
    this.minuteScroller = new CTPInfinityVerticalScroller(this.elt.$scrollers[1]);
    this.$list = $('.as-chrome-time-picker-m60', this.elt);

    this.$list.defineEvent('press');
    this.$list.addEventListener('click', function (event) {
        var now = Date.now();
        if (!this.lastPressTime || now - this.lastPressTime > 50) {
            this.emit('press', { target: event.target });
            this.lastPressTime = now;
        }
    }, true);
    this.$list.on('press', this.ev_clickList);
    this.$items = Array.prototype.slice.call(this.$list.childNodes);
    this.selectedValue = null;
    this.itemLength = this.$items.length;
}

/**
 *
 * @param start
 * @param end - end not include
 */
CTPMinuteListController.prototype.activeItem = function (start, end) {
    if (!isNaturalNumber(start)) start = 0;
    if (!isNaturalNumber(end)) end = this.$list.children.length;
    for (var i = 0; i < this.$list.children.length; ++i) {
        this.$list.children[i].disabled = i < start || i >= end;
    }
};

CTPMinuteListController.prototype.ev_clickList = function (event) {
    var value = this.itemValueOf(event.target);
    if (isNaturalNumber(value)) {
        this.minute = value;
        this.scrollIntoSelected(false);
        this.elt.flushViewToValue();
    }
};

CTPMinuteListController.prototype.itemValueOf = function (itemElt) {
    while (itemElt) {
        if (itemElt.hasClass && itemElt.hasClass('as-chrome-time-picker-btn')) break;
        itemElt = itemElt.parentElement;
    }
    if (!itemElt) return undefined;
    return itemElt.__min__;
};

CTPMinuteListController.prototype.scrollIntoSelected = function (onTop) {
    if (this.selectedValue == null) return;
    var curOffset = this.minuteScroller.offset;
    var targetOffset = this.selectedValue;
    var k, minCost = Infinity;
    var cost;
    var t;
    for (k = -2; k <= 2; ++k) {
        t = this.selectedValue + k * this.itemLength;
        if (t >= curOffset && t <= curOffset + 3 && !onTop) {
            minCost = 0;
            targetOffset = curOffset;
        }
        else {
            cost = Math.abs(t - curOffset);
            if (cost < minCost) {
                minCost = cost;
                targetOffset = t;
            }
            cost = Math.abs(t - curOffset - 3);
            if (cost < minCost && !onTop) {
                minCost = cost;
                targetOffset = t - 3;
            }
        }
    }

    this.minuteScroller.makeAnimation(targetOffset, 200);
};


Object.defineProperty(CTPMinuteListController.prototype, 'minute', {
    set: function (value) {
        if (isRealNumber(value)) {
            value = Math.max(0, Math.min(59, Math.round(value)));
        }
        else {
            value = null;
        }
        if (value !== this.selectedValue) {
            if (this.$items[this.selectedValue]) {
                this.$items[this.selectedValue].removeClass('as-selected');
            }
        }
        this.selectedValue = value;
        if (this.$items[value]) {
            this.$items[value].addClass('as-selected');
        }
    },
    get: function () {
        return this.selectedValue;
    }
});