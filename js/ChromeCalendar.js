import Acore from "../ACore";

import * as datetime from './datetime';


var _ = Acore._;
var $ = Acore.$;



function ChromeCalendar() {
    var res = _({
        class: 'absol-chrome-calendar',
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
                            {
                                tag: 'span',
                                child: { text: '\u25bc' }
                            }
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
                                child: { text: text }
                            }
                        })
                    },
                    {
                        class: 'absol-chrome-calendar-month-viewport',
                        child: {
                            class: 'absol-chrome-calendar-month',
                            child: Array(6).fill(0).map(function (u, i) {
                                return {
                                    class: 'absol-chrome-calendar-week-in-mounth',
                                    child: Array(7).fill(0).map(function (v, j) {
                                        return {
                                            child: { text: i * 7 + j + '' }
                                        }
                                    })
                                }
                            })
                        }
                    },
                    {
                        tag: 'vscroller',
                        class: 'absol-chrome-calendar-years',
                        child: {
                            child: Array(200).fill(0).map(function (u, i) {
                                return {
                                    class: 'absol-chrome-calendar-year',
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
                                        click: function () {

                                            res._expandYear(this.__year__);
                                        }
                                    }
                                };
                            })
                        }
                    }
                ]
            }
        ]
    });


    res.$title = $('.absol-chrome-calendar-title', res)
        .on('click', function () {
            res.viewYear();
        });
    res.$titleTime = $('.absol-chrome-calendar-title > .title-time', res);

    res.$month = $('.absol-chrome-calendar-month', res);
    res._selectedDates = [new Date()];
    res._viewDate = new Date();

    res.$preBtn = $('.absol-chrome-calendar-header-buttons > button.prev-btn', res)
        .on('click', function () {
            res.viewPrevMonth();
        });
    res.$todayBtn = $('.absol-chrome-calendar-header-buttons > button.today-btn', res)
        .on('click', function () {
            res.viewToday();
        });
    res.$nextBtn = $('.absol-chrome-calendar-header-buttons > button.next-btn', res)
        .on('click', function () {
            res.viewNexMounth();
        });

    res.$yearScroller = $('vscroller.absol-chrome-calendar-years', res);
    res.$yearItems = [];

    $('.absol-chrome-calendar-year', res.$yearScroller, function (e) {
        res.$yearItems.push(e);
    })

    res.$attachHook = _('attachhook').addTo(res).on('error', function () {
        // res.updateSize();
        res.$yearScroller.requestUpdateSize();
    });

    return res;
}


/**
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype._isSelectedDate = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (datetime.compareDate(date, this._selectedDates[i]) == 0) return true;
    }
    return false;
};


/**
 * @param {Element} monthElt
 * @param {Date} date
 */
ChromeCalendar.prototype._fillMonth = function (monthElt, date) {
    var now = new Date();
    if (monthElt.$cells === undefined) {//for faster 
        monthElt.$cells = [];
        $('.absol-chrome-calendar-week-in-mounth > div', this.$month, function (e) {
            monthElt.$cells.push(e);
        });
    }

    var currentDate = datetime.beginOfWeek(datetime.beginOfMonth(date));
    var viewM = date.getMonth();
    var d, m;
    var cell;
    for (var i = 0; i < monthElt.$cells.length; ++i) {
        var cell = monthElt.$cells[i];
        d = currentDate.getDate();
        m = currentDate.getMonth();
        cell.innerHTML = '' + d;
        cell.__date__ = datetime.beginOfDay(currentDate);

        if (m != viewM)
            cell.addClass('absol-chrome-calendar-not-in-month');
        else
            cell.removeClass('absol-chrome-calendar-not-in-month');
        if (datetime.compareDate(currentDate, now) == 0)
            cell.addClass('absol-chrome-calendar-today');
        else
            cell.removeClass('absol-chrome-calendar-today');

        if (this._isSelectedDate(currentDate))
            cell.addClass('absol-chrome-calendar-selected');
        else
            cell.removeClass('absol-chrome-calendar-selected');

        currentDate = datetime.nextDate(currentDate);
    }
};

ChromeCalendar.prototype.viewNexMounth = function () {
    this._viewDate = datetime.nextMonth(this._viewDate);
    this.viewMonth();
};

ChromeCalendar.prototype.viewPrevMonth = function () {
    this._viewDate = datetime.prevMonth(this._viewDate);
    this.viewMonth();
};


ChromeCalendar.prototype.viewToday = function () {
    this._viewDate = new Date();
    this.viewMonth();
};

ChromeCalendar.prototype.viewMonth = function () {
    this.removeClass('view-year').addClass('view-month');
    this._fillMonth(this.$month, this._viewDate);
    this.$titleTime.innerHTML = datetime.formartDateString(this._viewDate, 'mmmm, yyyy');
};


ChromeCalendar.prototype.viewYear = function () {
    this.removeClass('view-month')
        .addClass('view-year');



};

ChromeCalendar.prototype._expandYear = function (year) {

    var lastItemElt = this.$lastOpenItem;

    var itemElt = this.$yearItems[year - 1890];

    if (this.$lastOpenItem == itemElt) {
        return;//todo
    }

    if (lastItemElt) {
        lastItemElt.addClass('start-closing');
        setTimeout(function () {
            lastItemElt.removeClass('start-closing').addClass('closing');
        }, 0);
        setTimeout(function () {
            lastItemElt.$months.removeClass('closing');
            lastItemElt.$months.remove();
            lastItemElt.$months = undefined;
        }, 100);
    }


    if (!itemElt.$months) {
        itemElt.$months = _({
            class: 'absol-chrome-calendar-year-mounths'

        }).addTo(itemElt);
        itemElt.addClass('start-opening');

        setTimeout(function () {
            itemElt.removeClass('start-opening').addClass('opening');
        }, 0);
        setTimeout(function () {
            itemElt.$months.removeClass('opening')
        }, 100);
    }

    this.$lastOpenItem = itemElt;


    // this.$yearScroller.requestUpdateSize();
    // var fontSize = this.getFontSize();
    // this.$yearScroller.scrollInto(item, fontSize * 0.45);
};



ChromeCalendar.prototype.init = function (props) {
    props = props || {};
    this.viewToday();
};


Acore.install('chromecalendar', ChromeCalendar);

export default ChromeCalendar;