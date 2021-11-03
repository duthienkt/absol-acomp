import ACore from "../ACore";
import '../css/countdownclock.css';
import '../css/countdowntext.css';

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function CountdownText() {
    this.addClass('as-countdown-text');
    this.defineEvent('update');
    this.defineEvent('finish');
    this._hh = null;
    this._mm = null;

    this._finishTime = null;
    this.finishTime = null;
    this.remainSecond = null;

    this['_tick'] = this._tick.bind(this);
    setTimeout(this.start.bind(this), 0);//auto start
}

CountdownText.tag = 'CountdownText'.toLowerCase();

CountdownText.render = function () {
    return _('span');
};


CountdownText.prototype._tick = function () {
    var remainSecond = this.remainSecond;
    var hh = Math.floor(remainSecond / 3600);
    var mm = Math.floor(remainSecond / 60) % 60;
    mm = mm < 10 ? '0' + mm : '' + mm;
    hh = hh < 10 ? '0' + hh : '' + hh;
    var updated = false;
    if (mm !== this._mm) {
        this.attr('data-mm', mm);
        updated = true;
        this._mm = mm;
    }
    if (hh !== this._hh) {
        this.attr('data-hh', hh);
        updated = true;
        this._hh = hh;
    }

    if (updated) {
        this.emit('update', {target: this, type: 'update'}, this);
    }
    if (remainSecond <= 0) {
        this.stop();
        this.emit('finish', {target: this, type: 'update'}, this);
    }
};

CountdownText.prototype.start = function () {
    this.resume();
};

CountdownText.prototype.resume = function () {
    if (this._intvId > 0) return;
    this._intvId = setInterval(this._tick, 500);
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


CountdownText.property.remainSecond = {
    set: function (value) {
        if (!(value >= 0)) {
            value = 0;
        }
        this.finishTime = new Date(new Date().getTime() + value)
    },
    get: function () {
        if (this.finishTime !== null) {
            return Math.max(0, Math.ceil((this.finishTime.getTime() - new Date().getTime()) / 1000));
        } else return null;
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


ACore.install(CountdownText);

export default CountdownText;