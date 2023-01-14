import '../css/chromecalendar.css';
import ACore from "../ACore";

import * as datetime from 'absol/src/Time/datetime';
import EventEmitter from 'absol/src/HTML5/EventEmitter';
import Dom from "absol/src/HTML5/Dom";
import {VScroller} from "./Scroller";
import {
    beginOfDay,
    beginOfMonth, beginOfWeek, beginOfYear,
    compareDate,
    compareMonth, ddmmyyyy,
    formatDateString,
    nextDate, nextMonth,
    prevDate, prevMonth, weekIndexOf
} from "absol/src/Time/datetime";
import DomSignal from "absol/src/HTML5/DomSignal";
import OOP from "absol/src/HTML5/OOP";
import {zeroPadding} from "./utils";

var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function ChromeCalendar() {
    var thisCal = this;
    this._startDayOfWeek = 0;
    this._level = "day";
    this.$years = $('.absol-chrome-calendar-years', this);
    this._fillYearList(this.$years);
    this.$title = $('.absol-chrome-calendar-title', this)
        .on('click', this.eventHandler.clickTitle);
    this.$titleTime = $('.title-time', this.$title);

    this.$instance = $('.absol-chrome-calendar-instance', this);
    this.$era = $('.absol-chrome-calendar-era', this)
        .on('scroll', this.eventHandler.eraScroll)
        .on('click', this.eventHandler.clickEra);
    this._fillEra();
    this.$month = $('.absol-chrome-calendar-month', this);
    this.$dayOfWeek = $('.absol-chrome-calendar-dayofweek', this);
    this._min = new Date(1890, 0, 1);
    this._max = new Date(2090, 0, 1);

    this._selectedDates = [datetime.beginOfDay(new Date())];
    this._viewDate = new Date();

    this.$prevBtn = $('.absol-chrome-calendar-header-buttons > button.prev-btn', this)
        .on('click', this.eventHandler.clickPrev);
    this.$todayBtn = $('.absol-chrome-calendar-header-buttons > button.today-btn', this)
        .on('click', this.eventHandler.clickToday);
    this.$nextBtn = $('.absol-chrome-calendar-header-buttons > button.next-btn', this)
        .on('click', this.eventHandler.clickNext);

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

    this.domSignal = new DomSignal((this.$attachHook))
        .on('level_change', this.eventHandler.levelChange)
        .on('request_update_buttons', this._updateButtons.bind(this))
        .on('request_update_month', this._updateMonth.bind(this, this.$month))
        .on('request_update_open_year', this._updateOpenYear.bind(this))
        .on('request_update_disabled_year_in_era', this._updateDisabledYearInEra.bind(this))
        .on('request_update_picked_years', this._updatePickedYears.bind(this));

    this.sync = new Promise(function (rs) {
        thisCal.$attachHook.on('attached', rs);
    });
    this.domSignal.emit('level_change');
    this.sync.then('attached', function () {
        thisCal.$yearScroller.requestUpdateSize();
        thisCal.expandYear(thisCal._viewDate.getFullYear());
        thisCal._updateYearInEra();
    });
    OOP.drillProperty(this, this, 'minLimitDate', 'min');
    OOP.drillProperty(this, this, 'minDateLimit', 'min');
    OOP.drillProperty(this, this, 'maxLimitDate', 'max');
    OOP.drillProperty(this, this, 'maxDateLimit', 'max');
}


ChromeCalendar.tag = 'ChromeCalendar'.toLowerCase();
ChromeCalendar.render = function () {
    return _({
        class: ['absol-chrome-calendar', 'as-level-day'],
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
                                child: {text: 'Septemper, 2019'}
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
                        child: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(function (text) {
                            return {
                                child: {text: text}
                            }
                        })
                    },
                    {

                        class: 'absol-chrome-calendar-month',
                        child: Array(6).fill(0).map(function (u, i) {
                            return {
                                class: 'absol-chrome-calendar-week-in-month',
                                child: Array(7).fill(0).map(function (v, j) {
                                    return {
                                        child: {text: i * 7 + j + ''}
                                    }
                                })
                            }
                        })

                    },
                    {
                        tag: 'vscroller',
                        class: 'absol-chrome-calendar-years',
                        child: {}
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
ChromeCalendar.prototype._isSelectedDate = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (compareDate(date, this._selectedDates[i]) === 0) return true;
    }
    return false;
};
/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype._isSelectedMonth = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (compareMonth(date, this._selectedDates[i]) === 0) return true;
    }
    return false;
};

/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype._isSelectedYear = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (date.getFullYear() === this._selectedDates[i].getFullYear()) return true;
    }
    return false;
};

ChromeCalendar.prototype._dayCmpLimit = function (date) {
    if (compareDate(date, this._min) < 0) return -1;
    if (compareDate(date, this._max) > 0) return 1;
    return 0;
};

ChromeCalendar.prototype._monthCmpLimit = function (date) {
    var startOfMonth = beginOfMonth(date);
    var endOfMonth = nextMonth(date);
    var minMil = Math.max(startOfMonth.getTime(), this._min.getTime());
    var maxMil = Math.min(endOfMonth.getTime(), nextDate(this._max).getTime());
    if (minMil < maxMil) return 0;
    return this._dayCmpLimit(date);
};

ChromeCalendar.prototype._yearCmpLimit = function (date) {
    var startOfYear = beginOfYear(date);
    var endOfYear = new Date(date.getFullYear() + 1, 0, 1);
    var minMil = Math.max(startOfYear.getTime(), this._min.getTime());
    var maxMil = Math.min(endOfYear.getTime(), nextDate(this._max).getTime());
    if (minMil < maxMil) return 0;
    return this._dayCmpLimit(date);
};


/***
 *
 * @param {Date} date
 * @param event
 */
ChromeCalendar.prototype.pickDate = function (date, event) {
    date = beginOfDay(date);
    this._selectedDates = [date];
    this._updateMonth(this.$month);
    if (this.$lastOpenYearItem) this.$lastOpenYearItem.$months.updateActiveMonth();

    this.emit('pick', {
        type: 'pick', value: date,
        isTrusted: event && event.isTrusted,
        originEvent: event,
        selectedDates: this.selectedDates
    });
};

/***
 *
 * @param {Date} date
 * @param event
 */
ChromeCalendar.prototype.pickMonth = function (date, event) {
    date = beginOfMonth(date);
    this._selectedDates = [date];
    if (this.$lastOpenYearItem) this.$lastOpenYearItem.$months.updateActiveMonth();
    this.emit('pick', {
        type: 'pick', value: date,
        isTrusted: event && event.isTrusted,
        originEvent: event,
        selectedDates: this.selectedDates
    });
};

ChromeCalendar.prototype._updatePickedYears = function () {
    var yearElt;
    var self = this;
    while (this.$lastPickYears && this.$lastPickYears.length > 0) {
        yearElt = this.$lastPickYears.pop();
        yearElt.removeClass('absol-chrome-calendar-selected');
    }
    this.$lastPickYears = this._selectedDates.map(function (date) {
        var yearElt = self._yearInAre(date.getFullYear());
        yearElt.addClass('absol-chrome-calendar-selected');
        return yearElt;
    })

};

ChromeCalendar.prototype.pickYear = function (year, event) {
    var date = new Date(year, 0, 1, 0, 0, 0, 0);
    this._selectedDates = [date];
    this.domSignal.emit('request_update_picked_years');
    this.scrollIntoDecade(Math.floor(year / 10) * 10, true);
    this.emit('pick', {
        type: 'pick', value: date,
        isTrusted: event && event.isTrusted,
        originEvent: event,
    });
};


/**
 * @param {Element} monthElt
 * @param {Date} date
 */
ChromeCalendar.prototype._fillMonth = function (monthElt, date) {
    var self = this;
    if (monthElt.$cells === undefined) {//for faster, attach event to element
        monthElt.$cells = [];
        Array.prototype.forEach.call(monthElt.childNodes, function (row) {
            row.on('click', function (event) {
                if (event.target !== this) return;
                var pickedElt = this.firstChild;
                var pickDate = this.firstChild.__date__;
                self.pickDate(pickDate, event);
                if (pickedElt.hasClass('absol-chrome-calendar-not-in-month')) {
                    if (pickDate.getDate() < 15) {
                        self.viewNexMonth();
                    } else {
                        self.viewPrevMonth();
                    }
                }
            });
        });
        $('.absol-chrome-calendar-week-in-month > div', this.$month, function (elt) {
            monthElt.$cells.push(elt);

            elt.on('click', function (event) {
                var pickedElt = elt;
                var pickDate = this.__date__;
                if (self._level === 'week') {
                    pickDate = beginOfWeek(pickDate, false, self._startDayOfWeek);
                    pickedElt = elt.parentElement.firstChild;
                }
                self.pickDate(pickDate, event);
                if (pickedElt.hasClass('absol-chrome-calendar-not-in-month')) {
                    if (pickDate.getDate() < 15) {
                        self.viewNexMonth();
                    } else {
                        self.viewPrevMonth();
                    }
                }

            });
        });
    }

    var currentDate = datetime.beginOfWeek(datetime.beginOfMonth(date), false, this._startDayOfWeek);


    var d;
    var cell;
    for (var i = 0; i < monthElt.$cells.length; ++i) {
        cell = monthElt.$cells[i];
        d = currentDate.getDate();
        cell.innerHTML = '' + d;
        cell.__date__ = datetime.beginOfDay(currentDate);
        currentDate = datetime.nextDate(currentDate);
    }
    Array.prototype.forEach.call(monthElt.childNodes, function (row) {
        var weekIdx = weekIndexOf(row.firstChild.__date__, false, self._startDayOfWeek);
        row.attr('data-week-idx-text', zeroPadding(1 + weekIdx, 2) + '');
    });
};

ChromeCalendar.prototype._updateMonth = function (monthElt) {
    if (!monthElt.$cells) return; // days weren't filled
    var now = new Date();
    var viewM = this._viewDate.getMonth();
    var m;
    var cell;
    var currentDate;
    var selectedWeeks = {};
    for (var i = 0; i < monthElt.$cells.length; ++i) {
        cell = monthElt.$cells[i];
        currentDate = cell.__date__;
        m = currentDate.getMonth();
        if (m != viewM)
            cell.addClass('absol-chrome-calendar-not-in-month');
        else
            cell.removeClass('absol-chrome-calendar-not-in-month');
        if (datetime.compareDate(currentDate, now) === 0)
            cell.addClass('absol-chrome-calendar-today');
        else
            cell.removeClass('absol-chrome-calendar-today');

        if (this._isSelectedDate(currentDate)) {
            cell.addClass('absol-chrome-calendar-selected');
            selectedWeeks[weekIndexOf(currentDate, false, this._startDayOfWeek)] = true;
        } else
            cell.removeClass('absol-chrome-calendar-selected');

        if (datetime.compareDate(this._min, currentDate) > 0 || datetime.compareDate(currentDate, this._max) > 0) {
            cell.addClass('absol-chrome-calendar-date-disabled');
        } else {
            cell.removeClass('absol-chrome-calendar-date-disabled');
        }
    }
    Array.prototype.forEach.call(monthElt.childNodes, function (row) {
        var weekIdx = weekIndexOf(row.firstChild.__date__, false, this._startDayOfWeek);
        if (selectedWeeks[weekIdx]) {
            row.addClass('as-week-selected');

        } else {
            row.removeClass('as-week-selected');
        }
    }.bind(this))

};

ChromeCalendar.prototype._fillYearList = function (ctn) {
    var thisCal = this;
    _({
        child: Array(200).fill(0).map(function (u, i) {
            return {
                class: 'absol-chrome-calendar-year',
                child: [
                    {
                        class: 'absol-chrome-calendar-year-head',
                        child: {text: i + 1890 + ''},
                    }
                ],
                props: {
                    __year__: i + 1890
                },
                on: {
                    click: function () {
                        thisCal.expandYear(this.__year__);
                    }
                }
            };
        })
    }).addTo(ctn);
};


ChromeCalendar.prototype._fillEra = function () {
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
                    child: {text: year + ''},
                    props: {
                        __year__: year
                    }
                };
            })
        });
    });
    this.$era.addChild(rows);
}

ChromeCalendar.prototype.viewNexMonth = function () {
    var self = this;
    this.sync = this.sync.then(function () {
        return new Promise(function (rs) {
            var oldBound = self.$month.getBoundingClientRect();
            var oldMonth = self.$month.cloneNode(true);
            var instanceBound = self.$instance.getBoundingClientRect();
            if (self.$lastAnimationCtn) {
                self.$lastAnimationCtn.removeClass('new').addClass('old');
            }
            var oldMonthCnt = _({
                class: ['absol-chrome-calendar-month-animation-container', 'old'],
                style: {
                    top: oldBound.top - instanceBound.top + 'px',
                    height: oldBound.height + 'px',
                    width: oldBound.width + 'px'
                },
                child: oldMonth
            }).addTo(self.$instance);

            self._viewDate = datetime.nextMonth(self._viewDate);
            self.viewMonth();

            var newMonth = self.$month.cloneNode(true);
            var overlap = 0;
            var j = 41;
            while (j >= 0 && self.$month.$cells[j].hasClass('absol-chrome-calendar-not-in-month')) {
                overlap += oldBound.height / 6;
                j -= 7;
            }

            var newMonthCtn = _({
                class: ['absol-chrome-calendar-month-animation-container', 'new'],
                style: {
                    top: oldBound.top + oldBound.height - instanceBound.top - overlap + 'px',
                    height: oldBound.height + 'px',
                    width: oldBound.width + 'px'
                },
                child: newMonth
            }).addTo(self.$instance);

            self.$lastAnimationCtn = newMonthCtn;
            setTimeout(function () {
                oldMonthCnt.addStyle('top', oldBound.top - oldBound.height + overlap - instanceBound.top + 'px');
                newMonthCtn.addStyle('top', oldBound.top - instanceBound.top + 'px');
            }, 20);
            setTimeout(function () {
                self.$lastAnimationCtn = undefined;
                oldMonthCnt.remove();
                newMonthCtn.remove();
            }, 220);
            setTimeout(rs, 22);
        });
    });
    return this.sync;
};

ChromeCalendar.prototype.viewPrevMonth = function () {
    var self = this;
    this.sync = this.sync.then(function () {
        return new Promise(function (rs) {
            var oldBound = self.$month.getBoundingClientRect();
            var oldMonth = self.$month.cloneNode(true);
            var instanceBound = self.$instance.getBoundingClientRect();
            if (self.$lastAnimationCtn) {
                self.$lastAnimationCtn.removeClass('new').addClass('old');
            }
            var oldMonthCnt = _({
                class: ['absol-chrome-calendar-month-animation-container', 'old'],
                style: {
                    top: oldBound.top - instanceBound.top + 'px',
                    height: oldBound.height + 'px',
                    width: oldBound.width + 'px'
                },
                child: oldMonth
            }).addTo(self.$instance);
            self._viewDate = datetime.prevMonth(self._viewDate);
            self.viewMonth();
            var newMonth = self.$month.cloneNode(true);
            var overlap = 0;
            var j = 0;
            while (j < 42 && self.$month.$cells[j].hasClass('absol-chrome-calendar-not-in-month')) {
                overlap += oldBound.height / 6;
                j += 7;
            }

            var newMonthCtn = _({
                class: ['absol-chrome-calendar-month-animation-container', 'new'],
                style: {
                    top: oldBound.top - oldBound.height + overlap - instanceBound.top + 'px',
                    height: oldBound.height + 'px',
                    width: oldBound.width + 'px'
                },
                child: newMonth
            }).addTo(self.$instance);

            self.$lastAnimationCtn = newMonthCtn;
            setTimeout(function () {
                oldMonthCnt.addStyle('top', oldBound.top + oldBound.height - overlap - instanceBound.top + 'px');
                newMonthCtn.addStyle('top', oldBound.top - instanceBound.top + 'px');
            }, 20);
            setTimeout(function () {
                self.$lastAnimationCtn = undefined;
                oldMonthCnt.remove();
                newMonthCtn.remove();
            }, 220);
            setTimeout(rs, 22);
        })
    });
    return this.sync;
};


ChromeCalendar.prototype.viewToday = function () {
    this._viewDate = new Date();
    switch (this._level) {
        case "day":
        case 'week':
            this.viewMonth();
            break;
        case "month":
            break;
        case "year":
            this.viewEra(true);
            break;
    }
};

ChromeCalendar.prototype.viewMonth = function () {
    this._updateButtons();
    this.removeClass('view-year')
        .removeClass('view-era')
        .addClass('view-month');
    this._fillMonth(this.$month, this._viewDate);
    this._updateMonth(this.$month);
    this.$titleTime.innerHTML = datetime.formatDateString(this._viewDate, 'mmmm, yyyy');
};


ChromeCalendar.prototype.viewYear = function () {
    this.removeClass('view-month')
        .removeClass('view-era')
        .addClass('view-year');
    this.expandYear(this._viewDate.getFullYear());
    this.$yearScroller.requestUpdateSize();
};

ChromeCalendar.prototype.viewEra = function (animation) {
    this.removeClass('view-month')
        .removeClass('view-year')
        .addClass('view-era');
    this.scrollIntoDecade(Math.floor(this._viewDate.getFullYear() / 10) * 10, animation);
};

ChromeCalendar.prototype.viewNextDecade = function (animation) {
    this._viewDate = new Date(Math.min(2080, Math.floor(this._viewDate.getFullYear() / 10) * 10 + 10), 0, 1);
    this._viewDate = new Date(Math.min(this._viewDate.getTime(), prevDate(this._max).getTime()));
    this.viewEra(animation);
};

ChromeCalendar.prototype.viewPrevDecade = function (animation) {
    this._viewDate = new Date((Math.max(1890, Math.floor(this._viewDate.getFullYear() / 10) * 10 - 10)), 0, 1);
    this._viewDate = new Date(Math.max(this._viewDate.getTime(), this._min.getTime()));
    this.viewEra(animation);
};


ChromeCalendar.prototype.expandYear = function (year) {
    if (this._level === 'month') {
        this._viewDate = new Date(year, 0, 1);
        this.$titleTime.innerHTML = formatDateString(this._viewDate, 'mmmm, yyyy');
        this.domSignal.emit('request_update_buttons');
    }

    var fontSize = this.getFontSize();
    var self = this;
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
            itemElt.$months = this._createMonths(year).addTo(itemElt);
            itemElt.addClass('start-opening');

            setTimeout(function () {
                itemElt.removeClass('start-opening').addClass('opening');
            }, 1);
            setTimeout(function () {
                itemElt.removeClass('opening');
            }, 100);
        }
    }
    var dy = itemElt.getBoundingClientRect().top - self.$yearScroller.getBoundingClientRect().top - fontSize * 0.45;
    if (itemElt.__year__ > lastYear) {
        dy -= 6 * fontSize;
    }

    self.$yearScroller.scrollBy(dy, 100);
    this.$lastOpenYearItem = itemElt;
    itemElt.$months.updateActiveMonth();
};

ChromeCalendar.prototype.scrollIntoDecade = function (startYear, animation) {
    if (!this.isDescendantOf(document.body)) {
        return this;
    }
    var thisCal = this;
    return new Promise(function (resolve) {
        var eraBound = thisCal.$era.getBoundingClientRect();
        var rowIdx = Math.floor((startYear - 1890) / 4);
        if (thisCal._decadeScrollTimeout > 0) {
            clearTimeout(thisCal._decadeScrollTimeout);
            thisCal._decadeScrollTimeout = -1;
        }
        if (thisCal.scrollIntoDecadeResolve) {
            thisCal.scrollIntoDecadeResolve();
            thisCal.scrollIntoDecadeResolve = null;
        }
        thisCal.scrollIntoDecadeResolve = resolve;

        var t0 = new Date().getTime();
        var t1 = t0 + 250;
        var y0 = thisCal.$era.scrollTop;
        var y1 = rowIdx * eraBound.height / 4;
        if (animation) {
            thisCal._decadeScrollTimeout = setTimeout(function tick() {
                var tc = new Date().getTime();
                var yc = Math.min(1, Math.pow((tc - t0) / (t1 - t0), 2)) * (y1 - y0) + y0;
                thisCal.$era.scrollTop = yc;
                console.log(yc)
                if (tc < t1) {
                    thisCal._decadeScrollTimeout = setTimeout(tick, 500);
                } else {
                    thisCal._decadeScrollTimeout = -1;
                    thisCal.scrollIntoDecadeResolve = null;
                    resolve();
                }
            }, 500);
        } else {
            thisCal.$era.scrollTop = y1;
        }
    });

};


ChromeCalendar.prototype._updateButtons_day = function () {
    if (this._monthCmpLimit(prevMonth(this._viewDate)) < 0) {
        this.$prevBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$prevBtn.removeClass('absol-chrome-calendar-button-disabled');

    }
    if (this._monthCmpLimit(nextMonth(this._viewDate)) > 0) {
        this.$nextBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$nextBtn.removeClass('absol-chrome-calendar-button-disabled');
    }

    var now = new Date();
    if (this._monthCmpLimit(now) === 0) {
        this.$todayBtn.removeClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$todayBtn.addClass('absol-chrome-calendar-button-disabled');
    }
};

ChromeCalendar.prototype._updateButtons_week = ChromeCalendar.prototype._updateButtons_day;

ChromeCalendar.prototype._updateButtons_year = function () {
    if (!this._viewDate) return;
    var year = Math.floor(this._viewDate.getFullYear() / 10) * 10;
    if (this._yearCmpLimit(new Date(year - 1, 0, 1)) < 0) {
        this.$prevBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$prevBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
    if (this._yearCmpLimit(new Date(year + 10, 0, 1)) > 0) {
        this.$nextBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$nextBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
    var now = new Date();
    if (this._yearCmpLimit(now) === 0) {
        this.$todayBtn.removeClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$todayBtn.addClass('absol-chrome-calendar-button-disabled');
    }
};

ChromeCalendar.prototype._updateButtons_month = function () {
    if (this._yearCmpLimit(new Date(this._viewDate.getFullYear() + 1, 0, 1)) > 0) {
        this.$nextBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$nextBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
    if (this._yearCmpLimit(new Date(this._viewDate.getFullYear() - 1, 0, 1)) < 0) {
        this.$prevBtn.addClass('absol-chrome-calendar-button-disabled');
    } else {
        this.$prevBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
};

ChromeCalendar.prototype._updateButtons = function () {
    var fName = '_updateButtons_' + this._level;
    this[fName] && this[fName]();
};

ChromeCalendar.prototype._createMonths = function (year) {
    var now = new Date();
    var self = this;
    var res = _({
        class: 'absol-chrome-calendar-year-mounths',
        child: Array(3).fill('').map(function (u, i) {
            return {
                class: 'absol-chrome-calendar-year-row-months',
                child: Array(4).fill(0).map(function (v, j) {
                    var date = new Date(year, i * 4 + j, 1, 0, 0, 0, 0, 0);
                    return {
                        class: ['absol-chrome-calendar-year-month']
                            .concat((year == now.getFullYear() && now.getMonth() == i * 4 + j) ? ['absol-chrome-calendar-today'] : [])
                            .concat(self._isSelectedMonth(date) ? ['absol-chrome-calendar-selected'] : [])
                        ,
                        child: {text: datetime.monthNames[i * 4 + j].substr(0, 3)},
                        on: {
                            click: function () {

                            }
                        },
                        props: {
                            __date__: date
                        }
                    }
                })
            }
        }),
        on: {
            click: this.eventHandler.clickMonthsInYear
        }
    });
    res.$monthList = [];
    $('.absol-chrome-calendar-year-month', res, function (e) {
        res.$monthList.push(e);
    });

    res.updateActiveMonth = function () {
        res.$monthList.forEach(function (e) {
            now = new Date();
            if (datetime.compareMonth(e.__date__, now) == 0) {
                e.addClass('absol-chrome-calendar-today');
            } else {
                e.removeClass('absol-chrome-calendar-today');
            }

            if (self._isSelectedMonth(e.__date__)) {
                e.addClass('absol-chrome-calendar-selected');
            } else {
                e.removeClass('absol-chrome-calendar-selected');

            }
            var beginOfMonth = datetime.beginOfMonth(e.__date__);
            var endOfMonth = datetime.prevDate(datetime.nextMonth(e.__date__));
            if (datetime.compareDate(self._min, endOfMonth) > 0 || datetime.compareDate(beginOfMonth, self._max) > 0) {
                e.addClass('absol-chrome-calendar-date-disabled');
            } else {
                e.removeClass('absol-chrome-calendar-date-disabled');
            }
        });
    }
    return res;
};

ChromeCalendar.prototype._yearInAre = function (year) {
    var d = year - 1890;
    var rowIdx = Math.floor(d / 4);
    var colIdx = d % 4;
    return this.$era.childNodes[rowIdx] && this.$era.childNodes[rowIdx].childNodes[colIdx];
};

ChromeCalendar.prototype._clearYearInAre = function (startYear) {
    var cellElt;
    for (var i = 0; i < 10; ++i) {
        cellElt = this._yearInAre(startYear + i);
        if (cellElt) cellElt.removeClass('absol-chrome-calendar-in-decade');
    }
};

ChromeCalendar.prototype._activeYearInAre = function (startYear) {
    var cellElt;
    for (var i = 0; i < 10; ++i) {
        cellElt = this._yearInAre(startYear + i);
        if (cellElt) cellElt.addClass('absol-chrome-calendar-in-decade');
    }
};

ChromeCalendar.prototype._updateYearInEra = function () {
    var eraBound = this.$era.getBoundingClientRect();
    var startYear = 1890 + 4 * Math.ceil((this.$era.scrollTop - eraBound.height / 16) * 4 / eraBound.height);
    var startDecade = Math.floor(startYear / 10) * 10;
    if ((startDecade + 10 - startYear) < 8) startDecade += 10;
    if (this._lastStartDecade !== startDecade) {
        if (this._lastStartDecade > 0) {
            this._clearYearInAre(this._lastStartDecade);
        }
        this._lastStartDecade = startDecade;
        this._activeYearInAre(startDecade);
        if (this._level === 'year') {
            this.$titleTime.innerHTML = startDecade + '-' + (startDecade + 10);
            if (!this._decadeScrollTimeout || this._decadeScrollTimeout < 0) {
                if (this._yearCmpLimit(new Date(startDecade, 0, 1)) === 0)
                    this._viewDate = new Date(startDecade, 0, 1);
            }
        }
        this.domSignal.emit('request_update_buttons');
    }
};

ChromeCalendar.prototype._updateDisabledYearInEra = function () {
    var self = this;
    Array.prototype.forEach.call(this.$era.childNodes, function (rowElt) {
        Array.prototype.forEach.call(rowElt.childNodes, function (cellElt) {
            if (cellElt.__year__) {
                if (self._yearCmpLimit(new Date(cellElt.__year__, 0, 1)) === 0) {
                    cellElt.removeClass('absol-chrome-calendar-date-disabled');
                } else {
                    cellElt.addClass('absol-chrome-calendar-date-disabled');
                }
            }
        });
    });
};

ChromeCalendar.prototype._updateOpenYear = function () {
    if (this.$lastOpenYearItem) {
        this.$lastOpenYearItem.$months.updateActiveMonth();
    }
};


ChromeCalendar.property = {};

ChromeCalendar.property.selectedDates = {
    set: function (value) {
        value = value || [];
        if (value instanceof Date) value = [value];
        this._selectedDates = value;
        this._viewDate = this._selectedDates[0] || new Date();
        this.domSignal.emit('level_change');
        if (this._level === 'year')
            this.domSignal.emit('request_update_picked_years');
    },
    get: function () {
        return this._selectedDates;
    }
};


ChromeCalendar.property.min = {
    set: function (value) {
        if (!value) value = new Date(1890, 0, 1);
        if (typeof value == 'number') value = new Date(value);
        value = beginOfDay(value);
        value = new Date(Math.max(new Date(1890, 0, 1).getTime(), value.getTime()));
        this._min = value;
        this.domSignal.emit('request_update_buttons');
        this.domSignal.emit('request_update_month');
        this.domSignal.emit('request_update_open_year');
        this.domSignal.emit('request_update_disabled_year_in_era');

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
        this.domSignal.emit('request_update_buttons');
        this.domSignal.emit('request_update_month');
        this.domSignal.emit('request_update_open_year');
        this.domSignal.emit('request_update_disabled_year_in_era');
    },
    get: function () {
        return this._max;
    }
};


ChromeCalendar.property.multiSelect = {
    set: function (value) {
        throw new Error('Not support yet!')
        var lastValue = this.multiSelect;
        value = !!value;
        if (lastValue != value) {
            if (value) {
                this.addClass('multi-select')
            } else {
                this.removeClass('multi-select');
            }
            this._updateMonth(this.$month);
        }
    },
    get: function () {
        return this.hasClass('multi-select');
    }
};


ChromeCalendar.property.level = {
    set: function (value) {
        value = (value || '') + '';
        value = value.toLowerCase();
        if (['day', 'week', 'month', 'year'].indexOf(value) < 0) value = 'day';
        if (this._level === value) return;
        this.removeClass('as-level-' + this._level);
        this._level = value;
        this.addClass('as-level-' + this._level);
        this.domSignal.emit('level_change');
        if (this._level === 'year')
            this.domSignal.emit('request_update_picked_years');
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
        this._updateMonth(this.$month);
    },
    get: function () {
        return this._startDayOfWeek;
    }
};


ChromeCalendar.property.viewDate = {
    set: function (date) {
        this._viewDate = date;
        this.domSignal.emit('level_change');
    },
    get: function () {
        return this._viewDate;
    }
}

ChromeCalendar.eventHandler = {};

ChromeCalendar.eventHandler.eraScroll = function () {
    this._updateYearInEra();
};

ChromeCalendar.eventHandler.clickEra = function (event) {
    var yearElt = event.target;
    var year = yearElt.__year__;
    if (typeof year !== "number") return;
    this.pickYear(year, event);
};


ChromeCalendar.eventHandler.clickPrev = function () {
    switch (this._level) {
        case "day":
        case 'week':
            this.viewPrevMonth();
            break;
        case "month":
            this.expandYear(Math.min(this._max.getFullYear(), this._viewDate.getFullYear() - 1));
            break;
        case "year":
            if (!this._decadeScrollTimeout || this._decadeScrollTimeout < 0)
                this.viewPrevDecade(true);
            break;

    }
};

ChromeCalendar.eventHandler.clickNext = function () {
    switch (this._level) {
        case "day":
        case 'week':
            this.viewNexMonth();
            break;
        case "month":
            this.expandYear(Math.max(prevDate(this._min).getFullYear(), this._viewDate.getFullYear() + 1));
            break;
        case "year":
            if (!this._decadeScrollTimeout || this._decadeScrollTimeout < 0)
                this.viewNextDecade(true);
            break;
    }
};


ChromeCalendar.eventHandler.clickToday = function (event) {
    this.viewToday();
    switch (this._level) {
        case "day":
            this.pickDate(new Date(), event);
            break;
        case 'week':
            this.pickDate(beginOfWeek(new Date(), false, this.startDayOfWeek), event)
            break;
        case "month":
            this.expandYear(new Date().getFullYear());
            this.pickMonth(beginOfMonth(new Date()), event);
            break;
        case "year":
            this.pickYear(new Date().getFullYear());
            this._viewDate = new Date(new Date().getFullYear(), 0, 1);
            this.viewEra(true);
            break;
    }
};

ChromeCalendar.eventHandler.clickTitle = function (event) {
    switch (this._level) {
        case "day":
        case "week":
            this.viewYear();
            break;
        case "month":
            break;
        case "year":
            break;
    }
};


ChromeCalendar.eventHandler.clickMonthsInYear = function (event) {
    var monthElt = event.target;
    var date = monthElt.__date__;
    if (!date) return;
    switch (this._level) {
        case "day":
        case "week":
            this._viewDate = date;
            this.viewMonth();
            break;
        case "month":
            this.pickMonth(date, event);
            break;
        case "year":
            break;
    }
};


ChromeCalendar.eventHandler.levelChange = function () {
    switch (this._level) {
        case "day":
        case "week":
            this.viewMonth();
            break;
        case "month":
            this.viewYear();
            break;
        case "year":
            this.viewEra();
            break;
    }
};

ACore.install(ChromeCalendar);


ChromeCalendar._session = Math.random() * 10000000000 >> 0;
ChromeCalendar._listener = undefined;


ChromeCalendar.showWhenClick = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    var res = {
        calendarProps: Object.assign({maxDateLimit: null, minDateLimit: null}, calendarProps),
        anchor: anchor,
        currentSession: undefined,
        element: element,
        calendarPickListener: calendarPickListener,
        darkTheme: darkTheme,
        setDateValue: function (value) {
            if (this.currentSession == ChromeCalendar._session) {
                ChromeCalendar.$calendar.selectedDates = [value];
            }
        },
        cancel: function () {
        }
    };

    var clickHandler = function () {
        if (element.hasClass('as-read-only')) return;
        if (ChromeCalendar._session == res.currentSession) return;

        res.currentSession = ChromeCalendar.show(res.element, res.calendarProps, res.anchor, res.calendarPickListener, res.darkTheme);

        var finish = function (event) {
            if (event && event.target && EventEmitter.hitElement(ChromeCalendar.$calendar, event)) return;
            document.body.removeEventListener('click', finish, false);
            ChromeCalendar.close(res.currentSession);
            ChromeCalendar.$calendar.off('pick', finish);

            res.currentSession = undefined;
            res.cancel = function () {
            };
        };

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
            ChromeCalendar.$calendar.on('pick', finish);
            res.cancel = finish;
        }, 10)
    };

    res.remove = function () {
        element.removeEventListener('click', clickHandler, false);
    };

    element.addEventListener('click', clickHandler, false);
    return res;
};


ChromeCalendar.show = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    ChromeCalendar._session = Math.random() * 10000000000 >> 0;

    function exec() {
        if (!ChromeCalendar.$ctn) {
            ChromeCalendar.$ctn = _('.absol-context-hinge-fixed-container');
            ChromeCalendar.$follower = _('follower').addTo(ChromeCalendar.$ctn);

            ChromeCalendar.$calendar = _('chromecalendar.as-dropdown-box-common-style')
                .on('pick', function (event) {
                    if (typeof ChromeCalendar._listener == 'function') {
                        ChromeCalendar._listener(event.value);
                    }
                }).addTo(ChromeCalendar.$follower);
        }

        ChromeCalendar.$ctn.addTo(document.body);
        // only one value need
        if (calendarProps instanceof Date) calendarProps = {selectedDates: [calendarProps]};
        if (calendarProps instanceof Array) calendarProps = {selectedDates: calendarProps};

        Object.assign(ChromeCalendar.$calendar, calendarProps);
        if (darkTheme) ChromeCalendar.$ctn.addClass('dark');
        else ChromeCalendar.$ctn.removeClass('dark');
        ChromeCalendar.$follower.followTarget = element;
        ChromeCalendar.$follower.anchor = anchor;
        ChromeCalendar.$calendar.addStyle('visibility', 'hidden');//for prevent size change blink
        ChromeCalendar._listener = calendarPickListener;
        setTimeout(function () {
            ChromeCalendar.$follower.updatePosition();
            ChromeCalendar.$calendar.removeStyle('visibility');
        }, 2);
    }

    if (document.body)
        exec();
    else
        Dom.documentReady.then(exec);

    return ChromeCalendar._session;
};


ChromeCalendar.close = function (session) {
    if (session !== true && session != ChromeCalendar._session) return;

    function exec() {
        ChromeCalendar.followTarget = undefined;
        ChromeCalendar._listener = undefined;
        ChromeCalendar.$ctn.remove();
    }

    if (document.body) exec();
    else Dom.documentReady.then(exec);

};


export default ChromeCalendar;