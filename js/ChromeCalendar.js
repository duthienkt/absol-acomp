import '../css/chromecalendar.css';
import ACore from "../ACore";

import * as datetime from 'absol/src/Time/datetime';
import EventEmitter from 'absol/src/HTML5/EventEmitter';
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;


function ChromeCalendar() {
    var thisCal = this;
    this.$years = $('.absol-chrome-calendar-years', this);
    _({
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

                        thisCal.expandYear(this.__year__);
                    }
                }
            };
        })
    }).addTo(this.$years);
    this.$title = $('.absol-chrome-calendar-title', this)
        .on('click', function () {
            thisCal.viewYear();
        });
    this.$titleTime = $('.absol-chrome-calendar-title > .title-time', this);

    this.$instance = $('.absol-chrome-calendar-instance', this);

    this.$month = $('.absol-chrome-calendar-month', this);
    this._minLimitDate = new Date(1890, 0, 1, 0, 0, 0, 0, 0);
    this._maxLimitDate = new Date(2090, 0, 1, 0, 0, 0, 0, 0);

    this._selectedDates = [datetime.beginOfDay(new Date())];
    this._viewDate = new Date();

    this.$prevBtn = $('.absol-chrome-calendar-header-buttons > button.prev-btn', this)
        .on('click', function () {
            thisCal.viewPrevMonth();
        });
    this.$todayBtn = $('.absol-chrome-calendar-header-buttons > button.today-btn', this)
        .on('click', function () {
            thisCal.viewToday();
            thisCal.pickDate(new Date());
        });
    this.$nextBtn = $('.absol-chrome-calendar-header-buttons > button.next-btn', this)
        .on('click', function () {
            thisCal.viewNexMounth();
        });

    this.$yearScroller = $('vscroller.absol-chrome-calendar-years', this);
    this.$yearItems = [];

    $('.absol-chrome-calendar-year', this.$yearScroller, function (e) {
        thisCal.$yearItems.push(e);
    });

    this.$attachHook = _('attachhook').addTo(this)
        .on('error', function () {
            thisCal.$yearScroller.requestUpdateSize();
            thisCal.expandYear(thisCal._viewDate.getFullYear());
        });

    this.sync = new Promise(function (rs) {
        thisCal.$attachHook.on('error', rs);
    });

    return this;
}


ChromeCalendar.tag = 'ChromeCalendar'.toLowerCase();
ChromeCalendar.render = function () {
    return _({
        class: 'absol-chrome-calendar',
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

                    },
                    {
                        tag: 'vscroller',
                        class: 'absol-chrome-calendar-years',
                        child: {

                        }
                    }
                ]
            }
        ]
    });

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
 * @param {Date} date
 * @returns {Boolean}
 */
ChromeCalendar.prototype._isSelectedMonth = function (date) {
    for (var i = 0; i < this._selectedDates.length; ++i) {
        if (datetime.compareMonth(date, this._selectedDates[i]) == 0) return true;
    }
    return false;
};


ChromeCalendar.prototype.pickDate = function (date, event) {
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

/**
 * @param {Element} monthElt
 * @param {Date} date
 */
ChromeCalendar.prototype._fillMonth = function (monthElt, date) {
    var self = this;
    if (monthElt.$cells === undefined) {//for faster, attach event to element 
        monthElt.$cells = [];
        $('.absol-chrome-calendar-week-in-mounth > div', this.$month, function (elt) {
            monthElt.$cells.push(elt);
            elt.on('click', function (event) {
                self.pickDate(this.__date__, event);
                if (elt.containsClass('absol-chrome-calendar-not-in-month')) {
                    if (this.__date__.getDate() < 15) {
                        self.viewNexMounth();
                    }
                    else {
                        self.viewPrevMonth();
                    }
                }
            });
        });
    }

    var currentDate = datetime.beginOfWeek(datetime.beginOfMonth(date));
    var d;
    var cell;
    for (var i = 0; i < monthElt.$cells.length; ++i) {
        var cell = monthElt.$cells[i];
        d = currentDate.getDate();
        cell.innerHTML = '' + d;
        cell.__date__ = datetime.beginOfDay(currentDate);
        currentDate = datetime.nextDate(currentDate);
    }
};

ChromeCalendar.prototype._updateMonth = function (monthElt) {
    if (!monthElt.$cells) return; // days weren't filled
    var now = new Date();
    var viewM = this._viewDate.getMonth();
    var m;
    var cell;
    var currentDate;
    for (var i = 0; i < monthElt.$cells.length; ++i) {
        cell = monthElt.$cells[i];
        currentDate = cell.__date__;
        m = currentDate.getMonth();
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

        if (datetime.compareDate(this._minLimitDate, currentDate) > 0 || datetime.compareDate(currentDate, this._maxLimitDate) > 0) {
            cell.addClass('absol-chrome-calendar-date-disabled');
        }
        else {
            cell.removeClass('absol-chrome-calendar-date-disabled');
        }
    }
};

ChromeCalendar.prototype.viewNexMounth = function () {
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
            while (j >= 0 && self.$month.$cells[j].containsClass('absol-chrome-calendar-not-in-month')) {
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
            while (j < 42 && self.$month.$cells[j].containsClass('absol-chrome-calendar-not-in-month')) {
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
    this.viewMonth();
};

ChromeCalendar.prototype.viewMonth = function () {
    this._updateButtons();
    this.removeClass('view-year').addClass('view-month');
    this._fillMonth(this.$month, this._viewDate);
    this._updateMonth(this.$month);
    this.$titleTime.innerHTML = datetime.formartDateString(this._viewDate, 'mmmm, yyyy');
};


ChromeCalendar.prototype.viewYear = function () {
    this.removeClass('view-month')
        .addClass('view-year');
    this.expandYear(this._viewDate.getFullYear());
    this.$yearScroller.requestUpdateSize();
};

ChromeCalendar.prototype.expandYear = function (year) {
    var fontSize = this.getFontSize();

    var self = this;
    var lastItemElt = this.$lastOpenYearItem;

    var itemElt = this.$yearItems[year - 1890];
    var lastYear = 100000000;
    if (lastItemElt && lastItemElt.__year__ != year) {
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

    if (lastItemElt != itemElt) {
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


ChromeCalendar.prototype._updateButtons = function () {
    var endOfPrevMonth = datetime.prevDate(datetime.beginOfMonth(this._viewDate));

    if (datetime.compareDate(endOfPrevMonth, this._minLimitDate) < 0) {
        this.$prevBtn.addClass('absol-chrome-calendar-button-disabled');
    }
    else {
        this.$prevBtn.removeClass('absol-chrome-calendar-button-disabled');
    }

    var beginOfNextMonth = datetime.nextMonth(this._viewDate);

    if (datetime.compareDate(beginOfNextMonth, this._maxLimitDate) > 0) {
        this.$nextBtn.addClass('absol-chrome-calendar-button-disabled');
    }
    else {
        this.$nextBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
    var now = new Date();
    if (datetime.compareDate(now, this._maxLimitDate) > 0 || datetime.compareDate(now, this._minLimitDate) < 0) {
        this.$todayBtn.addClass('absol-chrome-calendar-button-disabled');
    }
    else {
        this.$todayBtn.removeClass('absol-chrome-calendar-button-disabled');
    }
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
                        child: { text: datetime.monthNames[i * 4 + j].substr(0, 3) },
                        on: {
                            click: function () {
                                self._viewDate = date;
                                self.viewMonth();
                            }
                        },
                        props: {
                            __date__: date
                        }
                    }
                })
            }
        })
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
            }
            else {
                e.removeClass('absol-chrome-calendar-today');
            }

            if (self._isSelectedMonth(e.__date__)) {
                e.addClass('absol-chrome-calendar-selected');
            }
            else {
                e.removeClass('absol-chrome-calendar-selected');

            }
            var beginOfMonth = datetime.beginOfMonth(e.__date__);
            var endOfMonth = datetime.prevDate(datetime.nextMonth(e.__date__));
            if (datetime.compareDate(self._minLimitDate, endOfMonth) > 0 || datetime.compareDate(beginOfMonth, self._maxLimitDate) > 0) {
                e.addClass('absol-chrome-calendar-date-disabled');
            }
            else {
                e.removeClass('absol-chrome-calendar-date-disabled');
            }
        });
    }
    return res;
};



ChromeCalendar.prototype.init = function (props) {
    props = props || {};
    this.super(props);
    this.viewToday();
};

ChromeCalendar.property = {};

ChromeCalendar.property.selectedDates = {
    set: function (value) {
        value = value || [];
        if (value instanceof Date) value = [value];
        this._selectedDates = value;
        this.sync = this.sync.then(function () {
            this._viewDate = this._selectedDates[0] || new Date();//default is today
            this.viewMonth();
        }.bind(this));
    },
    get: function () {
        return this._selectedDates;
    }
};


ChromeCalendar.property.minLimitDate = {
    set: function (value) {
        if (!value) value = new Date(1890, 0, 1, 0, 0, 0, 0, 0);
        if (typeof value == 'number') value = new Date(value);
        this._minLimitDate = value;
        //todo
        this._updateButtons();
        this.sync = this.sync.then(function () {
            this._updateMonth(this.$month);
            if (this.$lastOpenYearItem) {
                this.$lastOpenYearItem.$months.updateActiveMonth();
            }
        }.bind(this));
    },
    get: function () {
        return this._minLimitDate;
    }
};

ChromeCalendar.property.maxLimitDate = {
    set: function (value) {
        if (!value) value = new Date(2090, 0, 1, 0, 0, 0, 0, 0);
        if (typeof value == 'number') value = new Date(value);
        this._maxLimitDate = value;
        this._updateButtons();
        this.sync = this.sync.then(function () {
            this._updateMonth(this.$month);
            if (this.$lastOpenYearItem) {
                this.$lastOpenYearItem.$months.updateActiveMonth();
            }
        }.bind(this));
    },
    get: function () {
        return this._minLimitDate;
    }
};


ChromeCalendar.property.minDateLimit = ChromeCalendar.property.minLimitDate;
ChromeCalendar.property.maxDateLimit = ChromeCalendar.property.maxLimitDate;


ChromeCalendar.property.multiSelect = {
    set: function (value) {
        throw new Error('Not support yet!')
        var lastValue = this.multiSelect;
        value = !!value;
        if (lastValue != value) {
            if (value) {
                this.addClass('multi-select')
            }
            else {
                this.removeClass('multi-select');
            }
            this._updateMonth(this.$month);
        }
    },
    get: function () {
        return this.containsClass('multi-select');
    }
};

ACore.install(ChromeCalendar);




ChromeCalendar._session = Math.random() * 10000000000 >> 0;
ChromeCalendar._listener = undefined;


ChromeCalendar.showWhenClick = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    var res = {
        calendarProps: Object.assign({ maxDateLimit: null, minDateLimit: null }, calendarProps),
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
        cancel: function () { }
    };

    var clickHandler = function () {

        if (ChromeCalendar._session == res.currentSession) return;

        res.currentSession = ChromeCalendar.show(res.element, res.calendarProps, res.anchor, res.calendarPickListener, res.darkTheme);

        var finish = function (event) {
            if (event && event.target && EventEmitter.hitElement(ChromeCalendar.$calendar, event)) return;
            document.body.removeEventListener('click', finish, false);
            ChromeCalendar.close(res.currentSession);
            ChromeCalendar.$calendar.off('pick', finish);

            res.currentSession = undefined;
            res.cancel = function () { };
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

            ChromeCalendar.$calendar = _('chromecalendar')
                .on('pick', function (event) {
                    if (typeof ChromeCalendar._listener == 'function') {
                        ChromeCalendar._listener(event.value);
                    }
                }).addTo(ChromeCalendar.$follower);
        }

        ChromeCalendar.$ctn.addTo(document.body);
        // only one value need
        if (calendarProps instanceof Date) calendarProps = { selectedDates: [calendarProps] };
        if (calendarProps instanceof Array) calendarProps = { selectedDates: calendarProps };

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