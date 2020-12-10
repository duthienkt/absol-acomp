import ACore from "../ACore";
import AElement from "absol/src/HTML5/Element";
import '../css/countdownclock.css';
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import {numberAutoFixed} from "absol/src/Math/int";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function CountdownClock() {
    var thisC = this;
    this.$attachhook = _('attachhook').addTo(this)
        .on('attached', function () {
            ResizeSystem.add(this);
            this.requestUpdateSize();
            if (thisC.autoStart) {
                thisC.start();
            }
        });

    this.$attachhook.requestUpdateSize = this._updateBorder.bind(this);
    this._tick = this._tick.bind(this);
    this.$border = $(".as-countdown-clock-border", this);
    this.$min = $(".as-countdown-clock-min", this);
    this.$sec = $(".as-countdown-clock-sec", this);
    this._prevText = -1;
    this._startTime = new Date().getTime();
    this._totalSecond = 60;
    this._remainSecond = 0;

    this.totalSecond = 60;
    this.remainSecond = 0;
    this._intvId = -1;

}

CountdownClock.tag = 'CountdownClock'.toLowerCase();

CountdownClock.render = function () {
    return _({
        extendEvent: ['finish', 'update'],
        class: 'as-countdown-clock',
        child: [
            {
                class: 'as-countdown-clock-text',
                child: [
                    { tag: 'span', class: 'as-countdown-clock-min', child: { text: 0 } },
                    { text: ':' },
                    { tag: 'span', class: 'as-countdown-clock-sec', child: { text: '60' } }
                ]
            },
            {
                class: 'as-countdown-clock-border-wrapper',
                child: {
                    class: 'as-countdown-clock-border'
                }
            }
        ]
    });
};


CountdownClock.prototype._makePolygon = function (end) {
    var n = Math.ceil(Math.max(end / 0.2, 2));
    var fan = Array(n).fill(0).map(function (u, i) {
        var angle = -Math.PI / 2 + end * i / n;
        return [numberAutoFixed(50 + 60 * Math.cos(angle), 5) + '%', numberAutoFixed(50 + 60 * Math.sin(angle), 5) + '%'].join(' ')
    });
    fan.push('50% 50%');
    return 'polygon('+fan.join(', ')+')';

};


CountdownClock.prototype._setBorderValue = function (val) {
    if (val >= 1 || !isFinite(val)) {
        this.$border.removeStyle("clip-path");
        return;
    }
    var bound = this.$border.getBoundingClientRect();
    var angle = val * Math.PI * 2;
    this.$border.addStyle("-webkit-clip-path", this._makePolygon(angle));
    this.$border.addStyle("clip-path", this._makePolygon(angle));

};

CountdownClock.prototype._updateBorder = function () {
    this._setBorderValue(this._remainSecond / Math.max(0.001, this._totalSecond));
};

CountdownClock.prototype._updateText = function () {
    if (this._prevText === this.remainSecond) return;
    var remainSecond = this.remainSecond;
    var min = Math.floor(remainSecond / 60);
    var sec = remainSecond % 60;
    this.$sec.innerHTML = (sec < 10 ? "0" : "") + sec;
    this.$min.innerHTML = min;
}

CountdownClock.prototype._tick = function () {
    var now = new Date().getTime();
    var prevSec = this.remainSecond;
    this.remainSecond = Math.max(0, Math.ceil(this.totalSecond - (now - this._startTime) / 1000));
    if (prevSec !== this.remainSecond) {
        this._updateText();
        this.emit('update', { target: this, type: 'update' }, this);
        if (this.remainSecond === 0) {
            clearInterval(this._intvId);
            this._intvId = -1;
            this.emit('finish', { target: this, type: 'finish' }, this);
        }
    }

};

CountdownClock.prototype.start = function () {
    if (this.remainSecond == 0) this.remainSecond = this.totalSecond;
    this._startTime = new Date().getTime() - (this.totalSecond - this.remainSecond) * 1000;
    this.resume();
};

CountdownClock.prototype.resume = function () {
    if (this._intvId > 0) return;
    this._intvId = setInterval(this._tick, 200);
};

CountdownClock.prototype.pause = function () {
    if (this._intvId > 0) {
        clearInterval(this._intvId);
        this._intvId = -1;
    }
};

CountdownClock.prototype.stop = function () {
    this.pause();
    this.remainSecond = 0;
};

CountdownClock.prototype.reset = function () {
    this.remainSecond = this.totalSecond;
    this._startTime = new Date().getTime();
}


CountdownClock.property = {};

CountdownClock.property.totalSecond = {
    set: function (value) {
        if (!(value >= 0)) {
            value = 0;
        }
        this._totalSecond = value;
        this._updateBorder();
    },
    get: function () {
        return this._totalSecond;
    }
};


CountdownClock.property.remainSecond = {
    set: function (value) {
        if (!(value >= 0)) {
            value = 0;
        }
        this._remainSecond = value;
        this._updateBorder();
        this._updateText();
    },
    get: function () {
        return this._remainSecond;
    }
}


ACore.install(CountdownClock);

export default CountdownClock;