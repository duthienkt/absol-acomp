import Acore from "../ACore";

import * as datetime from 'absol/src/Time/datetime';


var _ = Acore._;
var $ = Acore.$;



function ChromeCalendar() {
    var res = _({
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

                                            res.expandYear(this.__year__);
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

    res.$instance = $('.absol-chrome-calendar-instance', res);

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
            res.pickDate(new Date());
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
        res.expandYear(res._viewDate.getFullYear());
    });

    res.sync = new Promise(function (rs) {
        res.$attachHook.on('error', rs);
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
   
    
    this.emit('pick',{
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
    this.removeClass('view-year').addClass('view-month');
    this._fillMonth(this.$month, this._viewDate);
    this._updateMonth(this.$month);
    this.$titleTime.innerHTML = datetime.formartDateString(this._viewDate, 'mmmm, yyyy');
};


ChromeCalendar.prototype.viewYear = function () {
    this.removeClass('view-month')
        .addClass('view-year');
    this.expandYear(this._viewDate.getFullYear());
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
        var dy = itemElt.getBoundingClientRect().top - self.$yearScroller.getBoundingClientRect().top - fontSize * 0.45;
        if (itemElt.__year__ > lastYear) {
            dy -= 6 * fontSize;
        }
        self.$yearScroller.scrollBy(dy, 100);
        this.$lastOpenYearItem = itemElt;
        itemElt.$months.updateActiveMonth();
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
        });
    }
    return res;
};



ChromeCalendar.prototype.init = function (props) {
    props = props || {};
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

Acore.install('chromecalendar', ChromeCalendar);

ChromeCalendar.$ctn = _('.absol-context-hinge-fixed-container');
ChromeCalendar.$follower = _('follower').addTo(ChromeCalendar.$ctn);
ChromeCalendar._session = Math.random() * 10000000000 >> 0;
ChromeCalendar.$calendar = _('chromecalendar')
    .on('pick', function (event) {
       
        if (typeof ChromeCalendar._listener == 'function'){
            ChromeCalendar._listener(event.value);
        }
    }).addTo(ChromeCalendar.$follower);
ChromeCalendar._listener = undefined;

ChromeCalendar.showWhenClick = function (element, calendarProps, anchor, calendarPickListener, darkTheme) {
    var res = {
        calendarProps: calendarProps,
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
        
        var finish = function () {
            document.body.removeEventListener('click', finish, false);
            ChromeCalendar.close(res.currentSession);
            ChromeCalendar.$calendar.off('pick', calendarPickListener)
            res.currentSession = undefined;
            res.cancel = function () { };
        };

        setTimeout(function () {
            document.body.addEventListener('click', finish, false);
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

    return ChromeCalendar._session;
};


ChromeCalendar.close = function (session) {
    if (session !== true && session != ChromeCalendar._session) return;
    ChromeCalendar.followTarget = undefined;
    ChromeCalendar._listener = undefined;

    ChromeCalendar.$ctn.remove();
};


export default ChromeCalendar;