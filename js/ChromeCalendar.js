import '../css/chromecalendar.css';
import ACore, { $$ } from "../ACore";

import * as datetime from 'absol/src/Time/datetime';
import EventEmitter, { hitElement } from 'absol/src/HTML5/EventEmitter';
import { VScroller } from "./Scroller";
import {
    beginOfDay,
    beginOfMonth, beginOfQuarter, beginOfWeek, beginOfYear,
    compareDate,
    compareMonth, ddmmyyyy,
    formatDateString, getDefaultFirstDayOfWeek, implicitDate,
    nextDate, nextMonth,
    prevDate, prevMonth, weekIndexOf
} from "absol/src/Time/datetime";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import { keyStringOf, zeroPadding } from "./utils";
import DelaySignal from "absol/src/HTML5/DelaySignal";
import Follower from "./Follower";

var _ = ACore._;
var $ = ACore.$;


var calendarLangMap = {
    'en': {
        monthNames: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dayOfWeekNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        shortDayOfWeekNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        quarterNames: ['Q1', 'Q2', 'Q3', 'Q4']
    },
    'vi': {
        monthNames: [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ],
        shortMonthNames: ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'],
        dayOfWeekNames: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
        shortDayOfWeekNames: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        quarterNames: ['Q1', 'Q2', 'Q3', 'Q4']
    }
};

var getCalendarSupportedLanguage = () => {
    var res = null;
    if (window['LanguageModule']) res = window['LanguageModule'].defaultcode;
    if (!res) res = navigator.language || navigator.userLanguage;
    res = res || 'en';
    res = res.toLowerCase();
    if (res === 'vn') res = 'vi';
    if (!calendarLangMap[res]) res = 'en';
    return res;
}

/**
 * get multi language text
 * @param {string} key
 * @returns {*}
 */
var getCMLText = key => {
    return calendarLangMap[getCalendarSupportedLanguage()][key];
};

var EV_CONTENT_CHANGE = 'ev_content_change';

/**
 * @extends AElement
 * @constructor
 */
function ChromeCalendar() {
    var thisCal = this;
    this.dayInWeekTexts = getCMLText('shortDayOfWeekNames');

    this._startDayOfWeek = getDefaultFirstDayOfWeek();
    this._level = "day";
    this.$years = $('.absol-chrome-calendar-years', this);
    this.$title = $('.absol-chrome-calendar-title', this)
    this.$titleTime = $('.title-time', this.$title);

    this.$instance = $('.absol-chrome-calendar-instance', this);
    this.$era = $('.absol-chrome-calendar-era', this)
    this.$month = $('.absol-chrome-calendar-month', this);
    this.$dayOfWeek = $('.absol-chrome-calendar-dayofweek', this);
    this._min = new Date(1890, 0, 1);
    this._max = new Date(2090, 0, 1);

    this._selectedDates = [datetime.beginOfDay(new Date())];
    this._viewDate = new Date();

    this.$prevBtn = $('.absol-chrome-calendar-header-buttons > button.prev-btn', this)
    this.$todayBtn = $('.absol-chrome-calendar-header-buttons > button.today-btn', this)
    this.$nextBtn = $('.absol-chrome-calendar-header-buttons > button.next-btn', this)

    /***
     *
     * @type {VScroller}
     */
    this.$yearScroller = $('vscroller.absol-chrome-calendar-years', this);
    this.$yearItems = [];

    $('.absol-chrome-calendar-year', this.$yearScroller, function (e) {
        thisCal.$yearItems.push(e);
    });

    this.$attachHook = _('attachhook').addTo(this);

    this.domSignal = new DelaySignal()
        .on(EV_CONTENT_CHANGE, () => {
            switch (this.level) {
                case 'day':
                case 'week':
                    this.startViewer('month');
                    this.viewer.updateContent();
                    break;
                case 'month':
                case 'quarter':
                    this.startViewer('year');
                    this.viewer.updateContent();
                    break;
                case 'year':
                    this.startViewer('era');
                    break;
                default:
                    break;
            }
            this.viewer.updateContent();
            this.headerCtrl.updateTitle();
            this.headerCtrl.updateButtons();
        })


    this.sync = new Promise(function (rs) {
        thisCal.$attachHook.on('attached', rs);
    });

    OOP.drillProperty(this, this, 'minLimitDate', 'min');
    OOP.drillProperty(this, this, 'minDateLimit', 'min');
    OOP.drillProperty(this, this, 'maxLimitDate', 'max');
    OOP.drillProperty(this, this, 'maxDateLimit', 'max');


    this.headerCtrl = new CCHeaderController(this);
    this.viewers = {
        month: new CCMonthViewer(this),
        year: new CCYearViewer(this),
        era: new CCEraViewer(this)
    };
    /**
     *
     * @type {CCViewerAbstract}
     */
    this.viewer = this.viewers['month'];
    this.viewer.start();

    /**
     * @type {number}
     * @name startDayOfWeek
     * @memberOf ChromeCalendar#
     */

    /**
     * @type {Date[]}
     * @name selectedDates
     * @memberOf ChromeCalendar#
     */

    /**
     * @type {'day'|'week'|'month'|'quarter'|'year'}
     * @name level
     * @memberOf ChromeCalendar#
     */

    /**
     * @type {Date}
     * @name viewDate
     * @memberOf ChromeCalendar#
     */
}


ChromeCalendar.tag = 'ChromeCalendar'.toLowerCase();
ChromeCalendar.render = function () {
    return _({
        class: ['absol-chrome-calendar'],
        attr: {
            'data-level': 'day',
            tabindex: '1'
        },
        extendEvent: 'pick',
        child: [
            {
                class: 'absol-chrome-calendar-header',
                child: [
                    {
                        class: 'absol-chrome-calendar-title',
                        child: [
                            {
                                tag: 'span',
                                class: 'title-time',
                                child: { text: 'Septemper, 2019' }
                            },

                        ]
                    },
                    {
                        class: 'absol-chrome-calendar-header-buttons',
                        child: [
                            {
                                tag: 'button',
                                class: 'prev-btn',
                                child: 'span.mdi.mdi-menu-left',
                                attr: {
                                    title: 'Previous Month'
                                }
                            },
                            {
                                tag: 'button',
                                class: 'today-btn',
                                child: 'span.mdi.mdi-circle-medium',
                                attr: {
                                    title: 'Today'
                                }
                            },
                            {
                                tag: 'button',
                                class: 'next-btn',
                                child: 'span.mdi.mdi-menu-right',
                                attr: {
                                    title: 'Next Month'
                                }
                            }
                        ]

                    }
                ]
            },
            {
                class: 'absol-chrome-calendar-instance',
                child: [
                    {
                        class: 'absol-chrome-calendar-dayofweek',
                        child: getCMLText('shortDayOfWeekNames').map(function (text) {
                            return {
                                child: { text: text }
                            }
                        })
                    },
                    {
                        class: 'absol-chrome-calendar-month',
                    },
                    {
                        tag: 'vscroller',
                        class: 'absol-chrome-calendar-years',
                    },
                    {
                        class: "absol-chrome-calendar-era"
                    }
                ]
            }
        ]
    });
};


/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype.isSelectedDate = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (compareDate(date, this._selectedDates[i]) === 0) return true;
    }
    return false;
};

ChromeCalendar.prototype.isSelectedWeek = function (date) {
    return this._selectedDates.some(it => {
        if (date.getFullYear() !== it.getFullYear()) return false;
        var weekIdx = weekIndexOf(date, false, this.startDayOfWeek);
        var itWeekIdx = weekIndexOf(it, false, this.startDayOfWeek);
        return weekIdx === itWeekIdx;
    });
};


/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype.isSelectedMonth = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (compareMonth(date, this._selectedDates[i]) === 0) return true;
    }
    return false;
};


/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype.isSelectedQuarter = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (compareMonth(beginOfQuarter(date), beginOfQuarter(this._selectedDates[i])) === 0) return true;
    }
    return false;
};


/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype.isSelectedYear = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (date.getFullYear() === this._selectedDates[i].getFullYear()) return true;
    }
    return false;
};


ChromeCalendar.prototype.dayCmpLimit = function (date) {
    if (compareDate(date, this._min) < 0) return -1;
    if (compareDate(date, this._max) > 0) return 1;
    return 0;
};


ChromeCalendar.prototype.monthCmpLimit = function (date) {
    var startOfMonth = beginOfMonth(date);
    var endOfMonth = nextMonth(date);
    var minMil = Math.max(startOfMonth.getTime(), this._min.getTime());
    var maxMil = Math.min(endOfMonth.getTime(), nextDate(this._max).getTime());
    if (minMil < maxMil) return 0;
    return this.dayCmpLimit(date);
};

ChromeCalendar.prototype.yearCmpLimit = function (date) {
    var startOfYear = beginOfYear(date);
    var endOfYear = new Date(date.getFullYear() + 1, 0, 1);
    var minMil = Math.max(startOfYear.getTime(), this._min.getTime());
    var maxMil = Math.min(endOfYear.getTime(), nextDate(this._max).getTime());
    if (minMil < maxMil) return 0;
    return this.dayCmpLimit(date);
};

ChromeCalendar.prototype.quarterCmpLimit = function (date) {
    var startOfQuarter = beginOfQuarter(date);
    var endOfQuarter = new Date(date.getFullYear(), date.getMonth() + 3, 1);
    var minMil = Math.max(startOfQuarter.getTime(), this._min.getTime());
    var maxMil = Math.min(endOfQuarter.getTime(), nextDate(this._max).getTime());
    if (minMil < maxMil) return 0;
    return this.dayCmpLimit(date);
}


/**
 *
 * @param {"month"|"year"|"era"} key
 */
ChromeCalendar.prototype.startViewer = function (key) {
    if (!this.viewers[key]) return;
    if (this.viewers[key] === this.viewer) {
        this.viewer.start();
        this.headerCtrl.updateTitle();
    }
    else {
        this.viewer.stop();
        this.viewer = this.viewers[key];
        this.viewer.start();
        this.headerCtrl.updateTitle();
    }
};


ChromeCalendar.property = {};

ChromeCalendar.property.selectedDates = {
    set: function (value) {
        value = value || [];
        if (!(value instanceof Array)) value = [value];
        value = value.map(d => implicitDate(d)).filter(d => !!d);
        this._selectedDates = value;
        this._viewDate = this._selectedDates[0] || new Date();
        this.domSignal.emit(EV_CONTENT_CHANGE);
    },
    get: function () {
        var level = this._level;
        var res = this._selectedDates.map(d => {
            var res = d;
            switch (level) {
                case 'day':
                    res = beginOfDay(d);
                    break;
                case 'week':
                    res = beginOfWeek(d, this.startDayOfWeek);
                    if (res.getFullYear() < d.getFullYear()) res = beginOfYear(d);
                    break;
                case 'month':
                    res = beginOfMonth(d);
                    break;
                case 'quarter':
                    res = beginOfQuarter(d);
                    break;
                case 'year':
                    res = beginOfYear(d);
                    break;
            }
            return res;
        });

        res = res.reduce((ac, d) => {
            var key = keyStringOf(d);
            if (ac.has[key]) return ac;
            ac.has[key] = d;
            ac.arr.push(d);
            return ac;
        }, { has: {}, arr: [] }).arr;

        res.sort((a, b) => {
            return a.getTime() - b.getTime();
        });

        return res;
    }
};


ChromeCalendar.property.min = {
    set: function (value) {
        if (!value) value = new Date(1890, 0, 1);
        if (typeof value == 'number') value = new Date(value);
        value = beginOfDay(value);
        value = new Date(Math.max(new Date(1890, 0, 1).getTime(), value.getTime()));
        this._min = value;
        this.domSignal.emit(EV_CONTENT_CHANGE);

    },
    get: function () {
        return this._min;
    }
};

//include maxLimitDate
ChromeCalendar.property.max = {
    set: function (value) {
        if (!value) value = new Date(2090, 0, 1);
        if (typeof value == 'number') value = new Date(value);
        if (value.getTime() > beginOfDay(value).getTime()) value = nextDate(beginOfDay(value));
        value = new Date(Math.min(new Date(2090, 0, 1).getTime(), value.getTime()));
        this._max = value;
        this.domSignal.emit(EV_CONTENT_CHANGE);

    },
    get: function () {
        return this._max;
    }
};


ChromeCalendar.property.multiSelect = {
    set: function (value) {
        value = false;
        // throw new Error('Not support yet!')
        var lastValue = this.multiSelect;
        value = !!value;
        if (lastValue !== value) {
            if (value) {
                this.addClass('as-multi-select')
            }
            else {
                this.removeClass('as-multi-select');
            }
        }
        this.domSignal.emit(EV_CONTENT_CHANGE);
    },
    get: function () {
        return this.hasClass('as-multi-select');
    }
};


ChromeCalendar.property.level = {
    set: function (value) {
        value = (value || '') + '';
        value = value.toLowerCase();
        if (['day', 'week', 'quarter', 'month', 'year'].indexOf(value) < 0) value = 'day';
        if (this._level === value) return;
        this.attr('data-level', value);
        this._level = value;
        this.domSignal.emit(EV_CONTENT_CHANGE);
    },
    get: function () {
        return this._level;
    }
};

ChromeCalendar.prototype.dayInWeekTexts = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

ChromeCalendar.property.startDayOfWeek = {
    set: function (value) {
        value = Math.max(0, Math.min(Math.floor(value || 0), 6));
        if (this._startDayOfWeek !== value) {
            this._startDayOfWeek = value;
            Array.prototype.forEach.call(this.$dayOfWeek.childNodes, function (e, i) {
                e.firstChild.data = this.dayInWeekTexts[(i + value) % 7];
            }.bind(this));
        }
        this.viewers.month.updateContent();
    },
    get: function () {
        return this._startDayOfWeek;
    }
};


ChromeCalendar.property.viewDate = {
    set: function (date) {
        this._viewDate = date;
        this.domSignal.emit(EV_CONTENT_CHANGE);
    },
    get: function () {
        return this._viewDate;
    }
};


ACore.install(ChromeCalendar);

/**
 *
 * @param {ChromeCalendar} elt
 * @constructor
 */
function CCViewerAbstract(elt) {
    this.elt = elt;
    this.$instance = elt.$instance;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
}

CCViewerAbstract.prototype.getTitle = function () {
    return '';
};

CCViewerAbstract.prototype.updateContent = function () {

};

CCViewerAbstract.prototype.prev = function () {

};

CCViewerAbstract.prototype.next = function () {

};

CCViewerAbstract.prototype.canPrev = function () {
};
CCViewerAbstract.prototype.canNext = function () {
};


CCViewerAbstract.prototype.viewToday = function () {
};

CCViewerAbstract.prototype.canViewToday = function () {
};


CCViewerAbstract.prototype.start = function () {

};

CCViewerAbstract.prototype.stop = function () {

};

CCViewerAbstract.prototype.onSelectedDatesChange = function () {

};


/**
 * @extends CCViewerAbstract
 * @param elt
 * @constructor
 */
function CCMonthViewer(elt) {
    CCViewerAbstract.call(this, elt);
    this.$month = elt.$month;
    this.$dayOfWeek = elt.$dayOfWeek;
    this.$instance = elt.$instance;

    this.$month.on('click', this.ev_click)
        .on('mouseenter', this.ev_mouseEnter);
    // this.startingDate = null;

    this.animationSync = Promise.resolve();

    this.isListening = false;
    this.$hoverRow = null;
}

mixClass(CCMonthViewer, CCViewerAbstract);


CCMonthViewer.prototype.updateContent = function () {
    var viewDate = beginOfMonth(this.elt._viewDate);
    var viewMonth = viewDate.getMonth();
    var viewYear = viewDate.getFullYear();

    var bg = beginOfMonth(viewDate);
    var startDayOfWeek = this.elt.startDayOfWeek;
    bg = beginOfWeek(bg, false, startDayOfWeek);
    var weekIdx;
    var shortDayOfWeekNames = getCMLText('shortDayOfWeekNames');
    Array.prototype.forEach.call(this.$dayOfWeek.childNodes, (elt, i) => {
        elt.firstChild.data = shortDayOfWeekNames[(i + startDayOfWeek) % 7];
    });
    var now = new Date();
    var rowElt, cellElt;
    while (this.$month.childNodes.length < 6) {
        rowElt = _({
            class: 'absol-chrome-calendar-week-in-month',
            child: Array(7).fill('div')
        });
        this.$month.addChild(rowElt);
    }
    var i, j;
    var isSelectedRow;
    for (i = 0; i < 6; ++i) {
        rowElt = this.$month.childNodes[i];
        isSelectedRow = false;
        weekIdx = bg.getFullYear() < viewDate.getFullYear() ? 0 : weekIndexOf(bg, false, startDayOfWeek);
        rowElt.attr('data-week-idx-text', zeroPadding(weekIdx + 1, 2) + '');
        // if (this.elt.isSel)
        for (j = 0; j < rowElt.childNodes.length; ++j) {
            cellElt = rowElt.childNodes[j];
            cellElt.attr('data-date', bg.getDate());
            cellElt.attr('data-time', bg.getTime());
            if (bg.getFullYear() !== viewYear) {
                cellElt.addClass('as-not-in-year');
            }
            else {
                cellElt.removeClass('as-not-in-year');
            }
            if (bg.getMonth() === viewMonth) {
                cellElt.removeClass('absol-chrome-calendar-not-in-month');
            }
            else {
                cellElt.addClass('absol-chrome-calendar-not-in-month');
            }

            if (this.elt.level === 'day' && this.elt.isSelectedDate(bg)) {
                cellElt.addClass('absol-chrome-calendar-selected');
            }
            else if (this.elt.level === 'week' && this.elt.isSelectedWeek(bg)) {
                cellElt.addClass('absol-chrome-calendar-selected');
                if (!isSelectedRow && bg.getFullYear() === this.elt._viewDate.getFullYear()) {
                    isSelectedRow = true;
                }
            }
            else {
                cellElt.removeClass('absol-chrome-calendar-selected');
            }

            if (compareDate(bg, now) === 0) {
                cellElt.addClass('absol-chrome-calendar-today');
            }
            else {
                cellElt.removeClass('absol-chrome-calendar-today');
            }
            if (this.elt.dayCmpLimit(bg) === 0) {
                cellElt.removeClass('as-disabled');
            }
            else {
                cellElt.addClass('as-disabled');
            }

            bg = nextDate(bg);
        }
        if (isSelectedRow) {
            rowElt.addClass('as-selected');
        }
        else {
            rowElt.removeClass('as-selected');
        }
    }
};

CCMonthViewer.prototype.animation = function (delta) {
    var oldViewDate = beginOfMonth(this.elt._viewDate);

    var newViewDate = delta < 0 ? prevMonth(oldViewDate) : nextMonth(oldViewDate);
    var startDayOfWeek = this.elt.startDayOfWeek;
    var oldBg = beginOfWeek(oldViewDate, false, startDayOfWeek);
    var newBg = beginOfWeek(newViewDate, false, startDayOfWeek);
    var curDate;
    var additionalRow = Math.round(compareDate(oldBg, newBg) / 7);
    if (delta > 0) {
        additionalRow = -additionalRow;
    }

    var now = new Date();

    var aniMonth = _({
        class: ['absol-chrome-calendar-month', 'as-animation']
    });
    if (delta < 0) {
        aniMonth.addStyle('top', -1.2 * (additionalRow - 1) + 'em');
    }
    else {
        aniMonth.addStyle('top', '1.2em');
    }

    var updateCellClassByViewDate = (viewDate) => {
        curDate = delta < 0 ? newBg : oldBg;
        var isSelectedRow;
        for (i = 0; i < aniMonth.childNodes.length; ++i) {
            rowElt = aniMonth.childNodes[i];
            isSelectedRow = false;
            for (j = 0; j < rowElt.childNodes.length; ++j) {
                cellElt = rowElt.childNodes[j];
                if (curDate.getMonth() !== viewDate.getMonth()) {
                    cellElt.addClass('absol-chrome-calendar-not-in-month');
                }
                else {
                    cellElt.removeClass('absol-chrome-calendar-not-in-month');
                }
                if (!isSelectedRow && this.elt.level === 'week' && curDate.getFullYear() === viewDate.getFullYear() && this.elt.isSelectedWeek(curDate)) {
                    isSelectedRow = true;
                }
                curDate = nextDate(curDate);
            }
            if (isSelectedRow) {
                rowElt.addClass('as-selected');
            }
            else {
                rowElt.removeClass('as-selected');
            }
        }
    }


    var rowElt, cellElt;
    var i, j;

    curDate = delta < 0 ? newBg : oldBg;
    var weekIdx;
    for (i = 0; i < 6 + additionalRow; ++i) {
        rowElt = _({
            class: 'absol-chrome-calendar-week-in-month',
            child: Array(7).fill('div')
        });
        aniMonth.addChild(rowElt);
        for (j = 0; j < rowElt.childNodes.length; ++j) {
            cellElt = rowElt.childNodes[j];
            weekIdx = curDate.getFullYear() < newViewDate.getFullYear() ? 0 : weekIndexOf(curDate, false, startDayOfWeek);
            rowElt.attr('data-week-idx-text', zeroPadding(weekIdx + 1, 2) + '');
            cellElt.attr('data-date', curDate.getDate());
            cellElt.attr('data-time', curDate.getTime());
            if (compareDate(curDate, now) === 0) {
                cellElt.addClass('absol-chrome-calendar-today');
            }
            if (this.elt.level === 'day' && this.elt.isSelectedDate(curDate)) {
                cellElt.addClass('absol-chrome-calendar-selected');
            }
            else if (this.elt.level === 'week' && this.elt.isSelectedWeek(curDate)) {
                cellElt.addClass('absol-chrome-calendar-selected');
            }
            if (this.elt.dayCmpLimit(curDate) === 0) {
                cellElt.removeClass('as-disabled');
            }
            else {
                cellElt.addClass('as-disabled');
            }
            curDate = nextDate(curDate);
        }
    }

    updateCellClassByViewDate(oldViewDate);
    this.$instance.addChild(aniMonth);
    requestAnimationFrame(() => {
        if (delta < 0) {
            aniMonth.addStyle('top', '1.2em');
        }
        else {
            aniMonth.addStyle('top', -1.2 * (additionalRow - 1) + 'em');
        }
        updateCellClassByViewDate(newViewDate);

        setTimeout(() => {
            aniMonth.remove();
        }, 200)
    });

};

CCMonthViewer.prototype.canPrev = function () {
    return compareMonth(this.elt._viewDate, this.elt._min) > 0;
};

CCMonthViewer.prototype.canNext = function () {
    return compareMonth(this.elt._viewDate, this.elt._max) < 0;
};

CCMonthViewer.prototype.canViewToday = function () {
    var now = new Date();
    return compareDate(now, this.elt._min) >= 0 && compareDate(now, this.elt._max) <= 0;
};


CCMonthViewer.prototype.prev = function () {
    this.animation(-1);
    this.elt._viewDate = prevMonth(this.elt._viewDate);
    this.updateContent();
    this.elt.headerCtrl.updateTitle();
    this.elt.headerCtrl.updateButtons();

};

CCMonthViewer.prototype.next = function () {
    this.animation(1);
    this.elt._viewDate = nextMonth(this.elt._viewDate);
    this.updateContent();
    this.elt.headerCtrl.updateTitle();
    this.elt.headerCtrl.updateButtons();

};


CCMonthViewer.prototype.viewToday = function () {
    this.elt._viewDate = new Date();
    this.updateContent();
    this.elt.headerCtrl.updateTitle();
    this.elt.headerCtrl.updateButtons();
};

CCMonthViewer.prototype.start = function () {
    this.elt.attr('data-view', 'month');
    this.updateContent();
};

CCMonthViewer.prototype.stop = function () {

};

CCMonthViewer.prototype.getTitle = function () {
    var viewDate = this.elt._viewDate;
    var res = '' + getCMLText('monthNames')[viewDate.getMonth()];
    res += ', ' + viewDate.getFullYear();
    return res;
};


CCMonthViewer.prototype.ev_click = function (event) {
    var dateBtn = event.target;
    var date;
    while (dateBtn && dateBtn !== this.$month) {
        if (dateBtn.attr && dateBtn.attr('data-time')) {
            date = new Date(parseInt(dateBtn.attr('data-time')));
            date = beginOfDay(date);
            this.elt._selectedDates = [date];
            this.onSelectedDatesChange();
            this.elt.emit('pick', {
                type: 'pick', value: date,
                isTrusted: event && event.isTrusted,
                originEvent: event,
                selectedDates: this.elt.selectedDates
            }, this.elt);
            if (dateBtn.hasClass('absol-chrome-calendar-not-in-month')) {
                if (parseInt(dateBtn.attr('data-date')) < 15) {
                    this.next();
                }
                else {
                    this.prev();
                }
            }
            break;
        }
        dateBtn = dateBtn.parentElement;
    }
};

CCMonthViewer.prototype.ev_mouseEnter = function (event) {
    if (this.isListening) return;
    if (this.elt.level !== 'week') return;
    this.isListening = true;
    if (this.$hoverRow) {
        this.$hoverRow.removeClass('as-hover-in-year')
            .removeClass('as-hover-not-in-year');
        this.$hoverRow = null;
    }
    document.addEventListener('mousemove', this.ev_mouseMove);
};

CCMonthViewer.prototype.ev_mouseMove = function (event) {
    if (!hitElement(this.$month, event)) {
        this.isListening = false;
        document.removeEventListener('mousemove', this.ev_mouseMove);

    }
    var viewDate = this.elt._viewDate;

    var target = event.target;
    var date = null;
    var rowElt;
    if (target.attr) {
        if (target.attr('data-time')) {
            date = new Date(parseInt(target.attr('data-time')));
            date = beginOfDay(date);
            rowElt = target.parentElement;
        }
        else if (target.attr('data-week-idx-text')) {
            rowElt = target;
            date = new Date(parseInt(rowElt.childNodes[0].attr('data-time')));
            if (date.getFullYear() !== viewDate.getFullYear()) {
                date = new Date(viewDate.getFullYear(), 0, 1, 0, 0, 0);
            }
        }
    }

    if (this.$hoverRow && this.$hoverRow !== rowElt) {
        this.$hoverRow.removeClass('as-hover-in-year')
            .removeClass('as-hover-not-in-year');
        this.$hoverRow = null;
    }
    if (!date) return;
    this.$hoverRow = rowElt;
    if (viewDate.getFullYear() !== date.getFullYear()) {
        rowElt.removeClass('as-hover-in-year')
            .addClass('as-hover-not-in-year');
    }
    else {
        rowElt.removeClass('as-hover-not-in-year')
            .addClass('as-hover-in-year');
    }

};


CCMonthViewer.prototype.onSelectedDatesChange = function () {
    var rowElt, cellElt;
    var i, j;
    var bg;
    var isSelectedRow;
    for (i = 0; i < this.$month.childNodes.length; ++i) {
        rowElt = this.$month.childNodes[i];
        isSelectedRow = false;
        for (j = 0; j < rowElt.childNodes.length; ++j) {
            cellElt = rowElt.childNodes[j];
            bg = new Date(parseInt(cellElt.attr('data-time')));
            if (this.elt.level === 'day' && this.elt.isSelectedDate(bg)) {
                cellElt.addClass('absol-chrome-calendar-selected');
            }
            else if (this.elt.level === 'week' && this.elt.isSelectedWeek(bg)) {
                cellElt.addClass('absol-chrome-calendar-selected');
                if (!isSelectedRow && bg.getFullYear() === this.elt._viewDate.getFullYear()) {
                    isSelectedRow = true;
                }
            }
            else {
                cellElt.removeClass('absol-chrome-calendar-selected');
            }

        }
        if (isSelectedRow) {
            rowElt.addClass('as-selected');
        }
        else {
            rowElt.removeClass('as-selected');
        }
    }
};


/**
 * @extends CCViewerAbstract
 * @param {ChromeCalendar}elt
 * @constructor
 */
function CCYearViewer(elt) {
    CCViewerAbstract.call(this, elt);
    this.$years = elt.$years;
    this.$yearScroller = elt.$yearScroller;
    this.$lastOpenYearItem = null;
    this.mouseListening = false;
}

mixClass(CCYearViewer, CCViewerAbstract);

CCYearViewer.prototype.start = function () {
    this.elt.attr('data-view', 'year');
    this.updateContent();
};

CCYearViewer.prototype.updateOpenYear = function () {
    if (this.$lastOpenYearItem) {
        this.$lastOpenYearItem.$months.updateActiveMonth();
    }
};


CCYearViewer.prototype.updateContent = function () {
    if (!this.$yearsContent) {
        this.$yearsContent = _({
            class: 'absol-chrome-calendar-years-content',
            child: Array(200).fill(0).map((u, i) => {
                return {
                    class: 'absol-chrome-calendar-year',
                    attr: { 'data-year': i + 1890 },
                    child: [
                        {
                            class: 'absol-chrome-calendar-year-head',
                            child: { text: i + 1890 + '' },
                        }
                    ],
                    props: {
                        __year__: i + 1890
                    },
                    on: {
                        click: () => {
                            this.viewYear(i + 1890);
                            // thisCal.expandYear(this.__year__);
                        },
                        mouseenter: this.ev_mouseEnter
                    }
                };
            })
        });
        this.$years.addChild(this.$yearsContent);
        this.$yearItems = Array.prototype.slice.call(this.$yearsContent.childNodes);
    }

    this.viewYear(this.elt._viewDate.getFullYear());
};

CCYearViewer.prototype.createMonths = function (year) {
    var now = new Date();
    var shortMonthNames = getCMLText('shortMonthNames');
    var res = _({
        class: 'absol-chrome-calendar-year-months',
        child: Array(3).fill('').map((u, i) => {
            return {
                class: 'absol-chrome-calendar-year-row-months',
                child: Array(4).fill(0).map((v, j) => {
                    var date = new Date(year, i * 4 + j, 1, 0, 0, 0, 0);
                    var quarter = Math.floor((i * 4 + j) / 3);
                    return {
                        class: ['absol-chrome-calendar-year-month']
                            .concat((year === now.getFullYear() && now.getMonth() === i * 4 + j) ? ['absol-chrome-calendar-today'] : [])
                            .concat(this.elt.isSelectedMonth(date) ? ['absol-chrome-calendar-selected'] : [])
                        ,
                        attr: {
                            'data-quarter': quarter + '',
                            'data-date': date.getTime() + '',
                            'data-month': i * 4 + j + ''
                        },
                        child: { text: shortMonthNames[i * 4 + j] },
                        on: {
                            click: function () {

                            }
                        },
                        props: {
                            __date__: date,
                            __quarter__: quarter
                        }
                    }
                })
            }
        }),
        on: {
            click: this.ev_clickMonth
        }
    });
    res.$monthList = $$('.absol-chrome-calendar-year-month', res)


    res.updateActiveMonth = () => {
        res.$monthList.forEach((e) => {
            now = new Date();
            if (datetime.compareMonth(e.__date__, now) === 0) {
                e.addClass('absol-chrome-calendar-today');
            }
            else {
                e.removeClass('absol-chrome-calendar-today');
            }

            if (this.elt.isSelectedMonth(e.__date__)) {
                e.addClass('absol-chrome-calendar-selected');
            }
            else {
                e.removeClass('absol-chrome-calendar-selected');
            }


            if (this.elt.isSelectedQuarter(e.__date__)) {
                e.addClass('as-quarter-selected');
            }
            else {
                e.removeClass('as-quarter-selected');
            }


            var beginOfMonth = datetime.beginOfMonth(e.__date__);
            var endOfMonth = datetime.prevDate(datetime.nextMonth(e.__date__));
            if (datetime.compareDate(this.elt._min, endOfMonth) > 0 || datetime.compareDate(beginOfMonth, this.elt._max) > 0) {
                e.addClass('absol-chrome-calendar-date-disabled');
            }
            else {
                e.removeClass('absol-chrome-calendar-date-disabled');
            }
        });
    }
    return res;
};

CCYearViewer.prototype.viewYear = function (year) {
    var viewDate = this.elt._viewDate;
    if (viewDate.getFullYear() !== year) {
        viewDate = new Date(year, 0, 1, 0, 0, 0, 0);
        this.elt._viewDate = viewDate;
    }

    //todo: update button, title
    var fontSize = this.elt.getFontSize() || 14;
    var lastItemElt = this.$lastOpenYearItem;
    var itemElt = this.$yearItems[year - 1890];
    var lastYear = 100000000;
    if (lastItemElt && lastItemElt.__year__ !== year) {
        lastYear = lastItemElt.__year__;
        lastItemElt.addClass('start-closing');
        setTimeout(function () {
            lastItemElt.removeClass('start-closing').addClass('closing');
        }, 0);
        setTimeout(function () {
            lastItemElt.removeClass('closing');
            lastItemElt.$months.remove();
            lastItemElt.$months = undefined;
        }, 100);
    }

    if (lastItemElt !== itemElt) {
        if (!itemElt.$months) {
            itemElt.$months = this.createMonths(year).addTo(itemElt);
            itemElt.addClass('start-opening');

            setTimeout(function () {
                itemElt.removeClass('start-opening').addClass('opening');
            }, 1);
            setTimeout(function () {
                itemElt.removeClass('opening');
            }, 100);
        }
    }
    var dy = itemElt.getBoundingClientRect().top - this.$yearScroller.getBoundingClientRect().top - fontSize * 0.45;
    if (itemElt.__year__ > lastYear) {
        dy -= 6 * fontSize + 1;
    }

    this.$yearScroller.scrollBy(dy, 100);
    this.$lastOpenYearItem = itemElt;
    itemElt.$months.updateActiveMonth();
    this.elt.headerCtrl.updateTitle();
    this.elt.headerCtrl.updateButtons();
};

CCYearViewer.prototype.stop = function () {
};

CCYearViewer.prototype.canNext = function () {
    return this.elt._viewDate.getFullYear() < this.elt._max.getFullYear();
};

CCYearViewer.prototype.canPrev = function () {
    return this.elt._viewDate.getFullYear() > this.elt._min.getFullYear();
};

CCYearViewer.prototype.canViewToday = function () {
    var viewDate = new Date();
    var year = viewDate.getFullYear();
    return year >= this.elt._min.getFullYear() && year <= this.elt._max.getFullYear();
}

CCYearViewer.prototype.prev = function () {
    this.elt._viewDate = new Date(this.elt._viewDate.getFullYear() - 1, 0, 1);
    this.viewYear(this.elt._viewDate.getFullYear());
};


CCYearViewer.prototype.next = function () {
    this.elt._viewDate = new Date(this.elt._viewDate.getFullYear() + 1, 0, 1);
    this.viewYear(this.elt._viewDate.getFullYear());
};

CCYearViewer.prototype.viewToday = function () {
    this.elt._viewDate = new Date();
    this.viewYear(new Date().getFullYear());
};

CCYearViewer.prototype.getTitle = function () {
    var viewDate = this.elt._viewDate;
    return '' + viewDate.getFullYear();
};


CCYearViewer.prototype.onSelectedDatesChange = function () {
    // console.log(this.elt.selectedDates);

};

CCYearViewer.prototype.ev_clickMonth = function (event) {
    var monthElt = event.target;
    var date;
    if (monthElt && monthElt.attr)
        date = monthElt.attr('data-date');
    if (!date) return;
    date = new Date(parseInt(date));
    var level = this.elt.level;
    switch (level) {
        case 'month':
        case 'quarter':
            this.elt._selectedDates = [date];
            this.updateOpenYear();
            this.elt.emit('pick', {
                type: 'pick', value: date,
                isTrusted: event && event.isTrusted,
                originEvent: event
            }, this.elt);
            break;
        case 'year':
            break;
        case 'day':
        case 'week':
            this.elt._viewDate = date;
            this.elt.startViewer('month');
            break;
    }
};

CCYearViewer.prototype.ev_mouseEnter = function (event) {
    if (this.mouseListening) return;
    this.mouseListening = true;
    document.addEventListener('mousemove', this.ev_mouseMove);
};

CCYearViewer.prototype.ev_mouseMove = function (event) {
    if (!hitElement(this.$yearsContent, event)) {
        this.mouseListening = false;
        document.removeEventListener('mousemove', this.ev_mouseMove);
        this.$yearsContent.attr('data-hover-quarter', undefined);

        return;
    }

    if (typeof event.target.__quarter__ === "number") {
        if (this.$yearsContent.attr('data-hover-quarter') !== event.target.__quarter__ + '')
            this.$yearsContent.attr('data-hover-quarter', event.target.__quarter__ + '');
    }
    else {
        this.$yearsContent.attr('data-hover-quarter', undefined);
    }

};


function CCEraViewer(elt) {
    CCViewerAbstract.call(this, elt);
    this.$era = elt.$era;
    this.$yearScroller = elt.$yearScroller;
    this.$instance = elt.$instance;

    this._lastStartDecade = -1;
    this._decadeScrollTimeout = -1;
    this.scrollIntoDecadeResolve = null;
    this.title = '1980-2089';
    this.$era.on('scroll', this.ev_scroll)
        .on('click', this.ev_click);
}

mixClass(CCEraViewer, CCViewerAbstract);

CCEraViewer.prototype.start = function () {
    this.elt.attr('data-view', 'era');
    this.updateContent();
    this.viewEra(false);
    this.updatePickedYear();
};

CCEraViewer.prototype.canNext = function () {
    var viewDate = this.elt._viewDate;
    var year = viewDate.getFullYear();
    var eraIdx = Math.floor(year / 10);
    var maxEraIdx = Math.floor(this.elt._max.getFullYear() / 10);
    return (eraIdx < maxEraIdx);
};

CCEraViewer.prototype.canPrev = function () {
    var viewDate = this.elt._viewDate;
    var year = viewDate.getFullYear();
    var eraIdx = Math.floor(year / 10);
    var minEraIdx = Math.floor(this.elt._min.getFullYear() / 10);
    return eraIdx > minEraIdx;
};

CCEraViewer.prototype.canViewToday = function () {
    var viewDate = this.elt._viewDate;
    var year = viewDate.getFullYear();
    var eraIdx = Math.floor(year / 10);
    var minEraIdx = Math.floor(this.elt._min.getFullYear() / 10);
    var maxEraIdx = Math.floor(this.elt._max.getFullYear() / 10);
    return eraIdx >= minEraIdx && eraIdx <= maxEraIdx;
};


CCEraViewer.prototype.prev = function () {
    this.elt._viewDate = new Date(this.elt._viewDate.getFullYear() - 10, 0, 1);
    this.scrollIntoDecade(Math.floor(this.elt._viewDate.getFullYear() / 10) * 10, true)
};

CCEraViewer.prototype.next = function () {
    this.elt._viewDate = new Date(this.elt._viewDate.getFullYear() + 10, 0, 1);
    this.scrollIntoDecade(Math.floor(this.elt._viewDate.getFullYear() / 10) * 10, true);
};

CCEraViewer.prototype.viewToday = function () {
    this.elt._viewDate = new Date();
    this.scrollIntoDecade(Math.floor(this.elt._viewDate.getFullYear() / 10) * 10, true);
};


CCEraViewer.prototype.updateContent = function () {
    if (this.$era.childNodes.length === 0) {
        var now = new Date();
        var cYear = now.getFullYear();
        var rows = Array(50).fill(0).map(function (u, i) {
            return _({
                class: 'absol-chrome-calendar-era-row',
                child: Array(4).fill(0).map(function (u1, j) {
                    var classList = ['absol-chrome-calendar-era-year'];
                    var year = 1890 + i * 4 + j;
                    if (cYear === year) {
                        classList.push('absol-chrome-calendar-today');
                    }
                    return {
                        class: classList,
                        child: { text: year + '' },
                        props: {
                            __year__: year
                        }
                    };
                })
            });
        });
        this.$era.addChild(rows);
    }


    this.updateDisabledYearInEra();
};

CCEraViewer.prototype.viewEra = function (animation) {
    this.elt.removeClass('view-month')
        .removeClass('view-year')
        .addClass('view-era');
    this.scrollIntoDecade(Math.floor(this.elt._viewDate.getFullYear() / 10) * 10, animation)
};

CCEraViewer.prototype.getTitle = function () {
    return this.title;
};

CCEraViewer.prototype.updatePickedYear = function () {
    var yearElt;
    while (this.$lastPickYears && this.$lastPickYears.length > 0) {
        yearElt = this.$lastPickYears.pop();
        yearElt.removeClass('absol-chrome-calendar-selected');
    }
    this.$lastPickYears = this.elt._selectedDates.map((date) => {
        var yearElt = this.yearInEra(date.getFullYear());
        yearElt.addClass('absol-chrome-calendar-selected');
        return yearElt;
    });
};


CCEraViewer.prototype.updateDisabledYearInEra = function () {
    var i, j;
    var rowElt, cellElt, date;
    for (i = 0; i < this.$era.childNodes.length; ++i) {
        rowElt = this.$era.childNodes[i];
        for (j = 0; j < rowElt.childNodes.length; ++j) {
            cellElt = rowElt.childNodes[j];
            date = new Date(cellElt.__year__, 0, 1);
            if (this.elt.yearCmpLimit(date) === 0) {
                cellElt.removeClass('absol-chrome-calendar-date-disabled');
            }
            else {
                cellElt.addClass('absol-chrome-calendar-date-disabled');
            }
        }
    }
};

CCEraViewer.prototype.scrollIntoDecade = function (startYear, animation) {
    if (!this.elt.isDescendantOf(document.body)) {
        return this;
    }
    return new Promise((resolve) => {
        var eraBound = this.$era.getBoundingClientRect();
        var rowIdx = Math.floor((startYear - 1890) / 4);
        if (this._decadeScrollTimeout > 0) {
            clearTimeout(this._decadeScrollTimeout);
            this._decadeScrollTimeout = -1;
        }
        if (this.scrollIntoDecadeResolve) {
            this.scrollIntoDecadeResolve();
            this.scrollIntoDecadeResolve = null;
        }
        this.scrollIntoDecadeResolve = resolve;

        var t0 = new Date().getTime();
        var t1 = t0 + 250;
        var y0 = this.$era.scrollTop;
        var y1 = rowIdx * eraBound.height / 4;
        var tick;
        if (animation) {
            tick = () => {
                var tc = new Date().getTime();
                var yc = Math.min(1, Math.pow((tc - t0) / (t1 - t0), 2)) * (y1 - y0) + y0;
                this.$era.scrollTop = yc;
                if (tc < t1) {
                    this._decadeScrollTimeout = setTimeout(tick, 1000 / 30);
                }
                else {
                    this._decadeScrollTimeout = -1;
                    this.scrollIntoDecadeResolve = null;
                    resolve();
                }
            };
            this._decadeScrollTimeout = setTimeout(tick, 100);
        }
        else {
            this.$era.scrollTop = y1;
        }
    });
};

CCEraViewer.prototype.updateYearInEra = function () {
    var eraBound = this.$era.getBoundingClientRect();
    var startYear = 1890 + 4 * Math.ceil((this.$era.scrollTop - eraBound.height / 16) * 4 / eraBound.height);
    var startDecade = Math.floor(startYear / 10) * 10;
    if ((startDecade + 10 - startYear) < 8) startDecade += 10;
    if (this._lastStartDecade !== startDecade) {
        if (this._lastStartDecade > 0) {
            this.clearYearInEra(this._lastStartDecade);
        }
        this._lastStartDecade = startDecade;
        this.activeYearInEra(startDecade);
        this.title = startDecade + '-' + (startDecade + 10);

        if (this.elt._level === 'year') {
            //todo
            if (!this._decadeScrollTimeout || this._decadeScrollTimeout < 0) {
                if (this.elt.yearCmpLimit(new Date(startDecade, 0, 1)) === 0)
                    this.elt._viewDate = new Date(startDecade, 0, 1);
            }
        }
        this.elt.headerCtrl.updateTitle();
        this.elt.headerCtrl.updateButtons();
    }
};

CCEraViewer.prototype.clearYearInEra = function (startYear) {
    var cellElt;
    for (var i = 0; i < 10; ++i) {
        cellElt = this.yearInEra(startYear + i);
        if (cellElt) cellElt.removeClass('absol-chrome-calendar-in-decade');
    }
};

CCEraViewer.prototype.yearInEra = function (year) {
    var d = year - 1890;
    var rowIdx = Math.floor(d / 4);
    var colIdx = d % 4;
    return this.$era.childNodes[rowIdx] && this.$era.childNodes[rowIdx].childNodes[colIdx];
};

CCEraViewer.prototype.activeYearInEra = function (startYear) {
    var cellElt;
    for (var i = 0; i < 10; ++i) {
        cellElt = this.yearInEra(startYear + i);
        if (cellElt) cellElt.addClass('absol-chrome-calendar-in-decade');
    }
}

CCEraViewer.prototype.ev_scroll = function (event) {
    this.updateYearInEra();
};

CCEraViewer.prototype.ev_click = function (event) {
    var yearElt = event.target;
    var year = yearElt.__year__;
    if (typeof year !== "number") return;

    var date = new Date(year, 0, 1, 0, 0, 0, 0);
    if (this.elt.level === 'year') {
        this.elt._selectedDates = [date];
        this.updatePickedYear();
        this.scrollIntoDecade(Math.floor(year / 10) * 10, true);
        this.elt.emit('pick', {
            type: 'pick', value: date,
            isTrusted: event && event.isTrusted,
            originEvent: event,
        });
    }
    else {
        this.elt._viewDate = date;
        this.elt.startViewer('year');
    }
};

/**
 *
 * @param {ChromeCalendar} elt
 * @constructor
 */
function CCHeaderController(elt) {
    this.elt = elt;
    this.$prevBtn = elt.$prevBtn;
    this.$nextBtn = elt.$nextBtn;
    this.$todayBtn = elt.$todayBtn;
    this.$titleTime = elt.$titleTime;
    this.$title = elt.$title;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }

    this.$prevBtn.on('click', this.ev_clickPrev);
    this.$nextBtn.on('click', this.ev_clickNext);
    this.$todayBtn.on('click', this.ev_clickToday);
    this.$title.on('click', this.ev_clickTitle);
}

CCHeaderController.prototype.updateTitle = function () {
    this.$titleTime.innerHTML = this.elt.viewer.getTitle();
};

CCHeaderController.prototype.updateButtons = function () {
    this.$prevBtn.disabled = !this.elt.viewer.canPrev();
    this.$nextBtn.disabled = !this.elt.viewer.canNext();
    this.$todayBtn.disabled = !this.elt.viewer.canViewToday();
}

CCHeaderController.prototype.ev_clickPrev = function () {
    this.elt.viewer.prev();
};

CCHeaderController.prototype.ev_clickNext = function () {
    this.elt.viewer.next();
};

CCHeaderController.prototype.ev_clickToday = function () {
    this.elt.viewer.viewToday();
};

CCHeaderController.prototype.ev_clickTitle = function () {
    var curViewer = this.elt.viewer;
    curViewer.stop();
    if (curViewer === this.elt.viewers.month) {
        this.elt.startViewer('year');
    }
    else if (curViewer === this.elt.viewers.year) {
        this.elt.startViewer('era');
    }

};

/**
 *
 * @param {AElement|HTMLElement} element
 * @param calendarProps
 * @param anchor
 * @param {function} calendarPickListener
 * @param {boolean=} darkTheme
 * @returns {CCShareDropDownInstance}
 */
ChromeCalendar.showWhenClick = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    var opt = {
        props: calendarProps,
        anchor: anchor,
        onPick: calendarPickListener,
        darkTheme: darkTheme,
        triggerElt: element
    };

    return new CCShareDropDownInstance(element, opt);
};


ChromeCalendar.show = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    var opt = {
        props: calendarProps,
        anchor: anchor,
        onPick: calendarPickListener,
        darkTheme: darkTheme,
    };

    var instance = new CCShareDropDownInstance(element, opt);
    return instance.id;
};


ChromeCalendar.close = function (session) {
    var share = CCShareDropDownInstance.prototype.share;
    var instance = share.instances[session];
    if (instance) {
        instance.close();
        if (!instance.opt.triggerElt) instance.remove();
    }
};


export default ChromeCalendar;


/**
 *
 * @param {AElement} elt
 * @param {{props?:object, anchor?: number[], onPick?: function, darkTheme?: boolean, triggerElt?:AElement }} opt
 * @constructor
 */
function CCShareDropDownInstance(elt, opt) {
    this.id = Math.random() * 10000000000 >> 0;
    this.elt = elt;
    this.opt = Object.assign({}, opt);
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.ev_click = this.ev_click.bind(this);

    if (this.opt.triggerElt) {
        this.opt.triggerElt.on('click', this.ev_click);
    }
    this.share.instances[this.id] = this;
}

CCShareDropDownInstance.prototype.share = {
    $follower: null,
    $picker: null,
    session: null,
    onPick: null,
    holder: null,
    instances: {}
};

CCShareDropDownInstance.prototype.prepare = function () {
    var share = this.share;
    if (share.$follower) return;
    /**
     *
     * @type {Follower|AElement}
     */
    share.$follower = _({
        tag: Follower
    });
    share.$follower.cancelWaiting();
    share.$picker = _({
        tag: ChromeCalendar,
        on: {
            pick: (event) => {
                if (typeof share.onPick === "function") share.onPick(event.value, event, this);
            }
        }
    }).addTo(share.$follower);
    share.session = Math.random() * 10000000000 >> 0;
    share.onPick = null;
}

/**
 *

 */
CCShareDropDownInstance.prototype.show = function () {
    this.prepare();
    var share = this.share;
    if (share.holder) share.holder.close();
    share.holder = this;
    var props = this.opt.props;
    if (props instanceof Date) props = { selectedDates: [props] };
    if (props instanceof Array) props = { selectedDates: props };
    props.maxDateLimit = props.maxDateLimit || null;
    props.minDateLimit = props.minDateLimit || null;
    share.$follower.addTo(document.body);
    Object.assign(share.$picker, props);
    share.$follower.addStyle('visibility', 'hidden');
    if (this.opt.darkTheme) {
        share.$picker.addClass('dark');
    }
    else {
        share.$picker.removeClass('dark');
    }
    if (this.opt.triggerElt) {
        setTimeout(() => {
            document.addEventListener('click', this.ev_clickOut, false);
        }, 30);
    }
    share.$follower.sponsorElement = this.opt.triggerElt || this.elt;
    share.$follower.anchor = this.opt.anchor;
    share.$follower.followTarget = this.elt;
    share.$follower.updatePosition();
    share.onPick = ()=>{
        var value = share.$picker.selectedDates[0];
        if (value && this.opt.onPick) {
            this.opt.onPick(value);
            if (this.opt.triggerElt) {
                this.close();
            }
        }
    }
    setTimeout(() => {
        if (share.holder === this) {
            share.$follower.removeStyle('visibility', 'hidden');
        }
    }, 10);
};


CCShareDropDownInstance.prototype.close = function () {
    var share = this.share;
    if (!share.$follower) return;
    if (share.holder !== this) return;
    share.holder = null;
    if (this.opt.triggerElt) {
        document.removeEventListener('click', this.ev_clickOut, false);
    }
    share.onPick = null;
    share.$follower.selfRemove();
};

/**
 *
 * @param {Date} value
 */
CCShareDropDownInstance.prototype.setDateValue = function (value) {
    var share = this.share;
    if (share.holder === this) {
        share.$picker.selectedDates = [value];
    }
};

CCShareDropDownInstance.prototype.cancel = function () {
    this.close();
};

CCShareDropDownInstance.prototype.remove = function () {
    this.close();
    if (this.opt.triggerElt) {
        this.opt.triggerElt.removeEventListener('click', this.ev_click);
    }
    delete this.share.instances[this.id];
};

CCShareDropDownInstance.prototype.ev_clickOut = function (event) {
    if (!hitElement(this.elt, event))
        this.close();
};


CCShareDropDownInstance.prototype.ev_click = function (event) {
    this.show();
};




