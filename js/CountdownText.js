import ACore from "../ACore";
import '../css/countdownclock.css';
import '../css/countdowntext.css';
import { DATE_TIME_TOKEN_RGX } from "absol/src/Time/datetime";
import { isRealNumber, zeroPadding } from "./utils";

var _ = ACore._;
var $ = ACore.$;

var tokenCache = {};

export function remainSecondToText(remainSecond, format) {
    var tokens = tokenCache[format];
    if (!tokens) {
        tokens = (format.match(new RegExp(DATE_TIME_TOKEN_RGX.source, 'g')) || []).reduce(function (ac, cr) {
            ac[cr] = true;
            return ac;
        }, {});
        tokenCache[format] = tokens;
    }
    var newText;
    var sec, min, hour;

    sec = Math[(tokens['ms'] || tokens['mss']) ? 'floor' : 'ceil'](remainSecond);
    min = Math.floor(remainSecond / 60);
    hour = Math.floor(remainSecond / 60 / 60);
    newText = format.replace(new RegExp(DATE_TIME_TOKEN_RGX.source, 'g'), function (all) {
        switch (all) {
            case 'D':
                return Math.floor(remainSecond / 60 / 60 / 24) + '';
            case 'HH':
            case 'H':
            case 'hh':
                if (tokens['D']) {
                    return zeroPadding(hour % 24, all.length);
                }
                else {
                    return zeroPadding(hour, all.length);
                }
            case 'mm':
            case 'M':
            case 'MM':
                if (tokens['HH'] || tokens['hh']) {
                    return zeroPadding(min % 60, all.length);
                }
                else {
                    return zeroPadding(min, all.length);
                }
            case 'ss':
            case 'S':
            case 'SS':
                if (tokens['m'] || tokens['mm']) {
                    return zeroPadding(sec % 60, all.length);
                }
                else {
                    return zeroPadding(sec, all.length);
                }
            case 'cs':
                return zeroPadding(Math.ceil(remainSecond * 100) % 100, 2);
            case 'ms':
                return zeroPadding(Math.ceil(remainSecond * 1000) % 1000, 3);
            default:
                return all;
        }
    });
    return newText;
}

/***
 * @extends AElement
 * @constructor
 */
function CountdownText() {
    this.addClass('as-countdown-text');
    this.defineEvent('update');
    this.defineEvent('finish');
    this.text = '';
    this._format = 'HH:mm';
    this.format = 'HH:mm';
    this.fps = 5;
    this._finishTime = null;
    this.finishTime = null;
    this['_tick'] = this._tick.bind(this);
    setTimeout(this.start.bind(this), 0);//auto start
    /***
     * @type {number}
     * @name remainSecond
     * @memberOf CountdownText#
     */
    /***
     * @type {Date}
     * @name finishTime
     * @memberOf CountdownText#
     */

    /***
     * @type {string}
     * @name format
     * @memberOf CountdownText#
     */
}

CountdownText.tag = 'CountdownText'.toLowerCase();


CountdownText.render = function () {
    return _('span');
};

CountdownText.prototype.buildinFormat = {
    'standard': function (remainSecond) {
        if (remainSecond >= 24 * 3600) {
            return remainSecondToText(remainSecond, 'D ngày HH:mm:ss');
        }
        else {
            return remainSecondToText(remainSecond, 'HH:mm:ss');
        }
    }
};


CountdownText.prototype._tick = function () {
    var remainSecond = this.remainSecond;
    var prevText = this.text;
    var newText;
    var format = this._format;
    if (this.buildinFormat[format]) format = this.buildinFormat[format];
    if (typeof format === "function") {
        newText = format.call(this, remainSecond);
    }
    else if (typeof format === "string") {
        newText = remainSecondToText(remainSecond, format);
    }

    if (prevText !== newText) {
        this.text = newText;
        this.innerHTML = newText;
        this.emit('update', { target: this, type: 'update' }, this);
    }


    if (remainSecond <= 0) {
        this.stop();
        this.emit('finish', { target: this, type: 'update' }, this);
    }
};

CountdownText.prototype.start = function () {
    this.resume();
};

CountdownText.prototype.resume = function () {
    if (this._intvId > 0) return;
    this._intvId = setInterval(this._tick, 1000 / this.fps);
};

CountdownText.prototype.pause = function () {
    if (this._intvId > 0) {
        clearInterval(this._intvId);
        this._intvId = -1;
    }
};

CountdownText.prototype.stop = function () {
    this.pause();

};


CountdownText.property = {};

CountdownText.property.format = {
    set: function (value) {
        if (typeof value === "string" || typeof value === 'function') {
            this._format = value || 'HH:mm';
        }
        else {
            this._format = 'HH:mm';
        }
    },
    get: function () {
        return this._format;
    }
};

CountdownText.property.remainSecond = {
    set: function (value) {
        if (!(value >= 0)) {
            value = 0;
        }
        this.finishTime = new Date(new Date().getTime() + value)
    },
    get: function () {
        if (this.finishTime !== null) {
            return Math.max(0, (this.finishTime.getTime() - new Date().getTime()) / 1000);
        }
        else return null;
    }
};

CountdownText.property.finishTime = {
    set: function (value) {
        if (typeof value === "number" || typeof value === 'string') {
            value = new Date(value);
        }
        if (!value || !value.getTime) value = null;
        if (value && value.getTime && isNaN(value.getTime())) value = null;
        this._finishTime = value;
    },
    get: function () {
        return this._finishTime;
    }
};

CountdownText.property.fps = {
    set: function (value) {
        this._fps = isRealNumber(value) ? value : 200;
        if (this._intvId > 0) {
            clearInterval(this._intvId);
            this._intvId = setInterval(this._tick, 1000 / this._fps);
        }
    },
    get: function () {
        return this._fps;
    }
};


ACore.install(CountdownText);

export default CountdownText;