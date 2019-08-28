import Acore from "../ACore";

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
                                child: 'span.mdi.mdi-menu-left'
                            },
                            {
                                tag: 'button',
                                child: 'span.mdi.mdi-circle-medium'
                            },
                            {
                                tag: 'button',
                                child: 'span.mdi.mdi-menu-right'
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
                            child: Array(5).fill(0).map(function (u, i) {
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
                    }
                ]
            }
        ]
    });


    res.$month = $('.absol-chrome-calendar-month', res);
    return res;
}



ChromeCalendar.prototype._fillMonth = function(){

};

// ChromeCalendar.prototype.

Acore.install('chromecalendar', ChromeCalendar);

export default ChromeCalendar;