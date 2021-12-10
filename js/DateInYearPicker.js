import '../css/dateinyearinput.css';
import {$, $$, _} from "../ACore";
import DomSignal from "absol/src/HTML5/DomSignal";
import {compareDate, nextMonth} from "absol/src/Time/datetime";


/***
 * @extends AElement
 * @constructor
 */
function DateInYearPicker() {
    this._month = null;
    this._date = null;
    this.$domSignal = _('attachhook').addTo(this);
    this.domSignal = new DomSignal(this.$domSignal);
    this._setupMonth();
    this._setupDate();
}


DateInYearPicker.tag = 'DateInYearPicker'.toLowerCase();

DateInYearPicker.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-date-in-year-picker',
        child: [
            {
                class: 'as-date-in-year-picker-table',
                child: [
                    {
                        class: 'as-date-in-year-picker-row',
                        child: [
                            {
                                class: 'as-date-in-year-picker-cell',
                                child: {tag: 'span', child: {text: 'Month'}}

                            },
                            {
                                class: 'as-date-in-year-picker-cell',
                                child: {tag: 'span', child: {text: 'Date'}}
                            }
                        ]
                    },
                    {
                        class: 'as-date-in-year-picker-row',
                        child: [
                            {
                                class: 'as-date-in-year-picker-cell',

                                child: {
                                    class: 'as-date-in-year-picker-month-col',
                                    child: [
                                        {
                                            class: 'as-date-in-year-picker-month-viewport',
                                            child: [
                                                {
                                                    class: 'as-date-in-year-picker-month-scroller',
                                                    child: Array(36).fill(null).map(function (u, i) {
                                                        return {
                                                            tag: 'button',
                                                            class: 'as-date-in-year-picker-month',
                                                            child: {
                                                                tag: 'span',
                                                                child: {text: 1 + i % 12 + ''}
                                                            },
                                                            props: {
                                                                monthL: i % 12
                                                            }
                                                        }
                                                    })
                                                }
                                            ]
                                        },
                                        {
                                            tag: 'button',
                                            class: ['as-date-in-year-picker-month-btn', 'as-up'],
                                            child: 'span.mdi.mdi-chevron-up'
                                        },
                                        {
                                            tag: 'button',
                                            class: ['as-date-in-year-picker-month-btn', 'as-down'],
                                            child: 'span.mdi.mdi-chevron-down'
                                        }
                                    ]
                                }
                            },
                            {
                                class: 'as-date-in-year-picker-cell',
                                child: {
                                    class: 'as-date-in-year-picker-days',
                                    child: Array(5).fill(null).map(function (u, i) {
                                        return {
                                            class: 'as-date-in-year-picker-week',
                                            child: Array(7).fill(null).map(function (u1, j) {
                                                return {
                                                    class: 'as-date-in-year-picker-day',
                                                    child: {
                                                        tag: 'span',
                                                        child: {text: i * 7 + j + 1 + ''}
                                                    }
                                                };
                                            })
                                        };

                                    })
                                }
                            }
                        ]
                    }
                ]
            }
        ]

    });
};


DateInYearPicker.prototype._setupMonth = function () {
    this._monthScrollDy = 0;
    this.$monthScroller = $('.as-date-in-year-picker-month-scroller', this)
        .on('scroll', this.eventHandler.monthScroll)
        .once('wheel', this.eventHandler.monthScroll);
    this.$monthUpBtn = $('.as-date-in-year-picker-month-btn.as-up', this)
        .on('pointerdown', this.eventHandler.monthPressDown);
    this.$monthDownBtn = $('.as-date-in-year-picker-month-btn.as-down', this)
        .on('pointerdown', this.eventHandler.monthPressUp);
    this.$months = $$('.as-date-in-year-picker-month', this);
    for (var i = 0; i < 36; ++i)
        this.$months[i].on('click', this.eventHandler.clickMonth.bind(this, i % 12));

};

DateInYearPicker.prototype._setupDate = function () {
    this.$days = $$('.as-date-in-year-picker-day', this);
    var i;
    for (i = 31; i < 35; ++i) {
        this.$days[i].addStyle('visibility', 'hidden');
    }
    for (i = 0; i < 31; ++i) {
        this.$days[i].on('click', this.eventHandler.clickDate.bind(this, i + 1));
    }
};

DateInYearPicker.prototype.scrollIntoSelected = function () {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('scrollIntoSelected');
        return;
    }

    var d = Infinity;
    var dy;
    var y;
    var ly, hy;
    if (this._month !== null) {
        for (var k = 0; k < 3; ++k) {
            y = this._month * 28 + 28 * 12 * k;
            ly = this.$monthScroller.scrollTop;
            hy = ly + 112 - 28;
            if (ly <= y && hy >= y) {
                dy = 0;
                break;
            }
            if (y < ly && ly - y < d) {
                d = ly - y;
                dy = y - ly;
            }

            if (y > hy && y - hy < d) {
                d = y - hy;
                dy = y - hy;
            }
        }

        this.$monthScroller.scrollTop += dy;
    }
};

/***
 * @memberOf DateInYearPicker#
 * @type {{}}
 */
DateInYearPicker.eventHandler = {};


/***
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.monthPressDown = function () {
    document.addEventListener('pointerup', this.eventHandler.monthRelease);
    this._monthScrollDy = -8;
    this.eventHandler.monthTick();

};

/**
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.monthPressUp = function () {
    document.addEventListener('pointerup', this.eventHandler.monthRelease);
    this._monthScrollDy = 8;
    this.eventHandler.monthTick();
};

/**
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.monthTick = function () {
    if (!this._monthScrollDy) return;
    var d = this._monthScrollDy;
    if (this.$monthScroller.scrollTop + d < 0) d += 28 * 12;
    this.$monthScroller.scrollTop += d;
    setTimeout(this.eventHandler.monthTick, 30);
};

DateInYearPicker.eventHandler.monthRelease = function () {
    document.removeEventListener('pointerup', this.eventHandler.monthRelease);
    this._monthScrollDy = 0;
};

/**
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.monthScroll = function () {
    var scrollTop = this.$monthScroller.scrollTop;
    if (scrollTop < 28 * 12) {
        this.$monthScroller.scrollTop += 28 * 12;
    } else if (scrollTop > 28 * 12 * 2) {
        this.$monthScroller.scrollTop -= 28 * 12;
    }
};

/**
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.clickMonth = function (month, event) {
    var pDate = this.date;
    if (this.month === month) return;
    this.month = month;
    this.emit('change', {type: 'change', originalEvent: event, target: this}, this);
};


/**
 * @this DateInYearPicker
 */
DateInYearPicker.eventHandler.clickDate = function (date, event) {
    if (this.date === date) return
    this.date = date;
    this.emit('change', {type: 'change', originalEvent: event, target: this}, this);
};


DateInYearPicker.property = {};

DateInYearPicker.property.date = {
    set: function (value) {
        if (typeof value !== 'number') value = null;
        var cM, dim;
        if (this._month === null) {
            dim = 31;
        } else {
            cM = new Date(2000, this._month, 1);
            dim = compareDate(nextMonth(cM), cM);
        }

        value = Math.max(1, Math.min(dim, Math.floor(value)));
        if (isNaN(value)) value = null;
        if (this._date === value) return;
        if (this._date !== null) {
            this.$days[this._date - 1].removeClass('as-selected');
        }
        this._date = value;
        if (this._date !== null) {
            this.$days[this._date - 1].addClass('as-selected');
        }

    },
    get: function () {
        return this._date;
    }
};

DateInYearPicker.property.month = {
    /***
     * @this DateInYearPicker
     * @param value
     */
    set: function (value) {
        if (typeof value !== 'number') value = null;
        value = Math.max(0, Math.min(11, Math.floor(value)));
        if (isNaN(value)) value = null;
        if (this._month === value) return;
        if (this._month !== null) {
            this.$months[this._month].removeClass('as-selected');
            this.$months[this._month + 12].removeClass('as-selected');
            this.$months[this._month + 24].removeClass('as-selected');
        }
        this._month = value;
        var cM, dim;
        if (this._month !== null) {
            this.$months[this._month].addClass('as-selected');
            this.$months[this._month + 12].addClass('as-selected');
            this.$months[this._month + 24].addClass('as-selected');
            this.scrollIntoSelected();
            cM = new Date(2000, this._month, 1);
            dim = compareDate(nextMonth(cM), cM);

        } else {
            dim = 31;
        }
        for (var i = 29; i < 31; ++i) {
            if (i < dim) {
                this.$days[i].removeStyle('visibility');
            } else {
                this.$days[i].addStyle('visibility', 'hidden');
            }
        }
        this.date = Math.min(this.date, dim);
    },
    get: function () {
        return this._month;
    }
};


DateInYearPicker.property.value = {
    set: function (value) {
        value = value || {};
        this.month = value.month;
        this.date = value.date;
    },
    get: function () {
        return {month: this.month, date: this.date};
    }
};


export default DateInYearPicker;
