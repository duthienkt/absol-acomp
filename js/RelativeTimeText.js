import ACore, { _, $ } from "../ACore";
import { implicitDate } from "absol/src/Time/datetime";

/**
 * @extends AElement
 * @constructor
 */
function RelativeTimeText() {
    if (!this.share.manager) this.share.manager = new RTTManager();
    this.share.manager.add(this);
    this.addClass('as-relative-time-text');
    /**
     *
     * @type {null|Date}
     * @private
     */
    this._time = null;

    /**
     * @name timeText
     * @type {string}
     * @memberOf RelativeTimeText#
     */

    /**
     * @name time
     * @type {Date}
     * @memberOf RelativeTimeText#
     */
}

RelativeTimeText.tag = 'RelativeTimeText'.toLowerCase();

RelativeTimeText.render = function () {
    return _({});
};

RelativeTimeText.prototype.updateText = function () {
    if (!this._time) return;
    var now = Date.now();
    var diff = now - this._time.getTime();
    var min = Math.round(diff / 6e4);
    var lang = this.getLanguage();
    var hour = Math.round(min / 60);
    var day = Math.round(hour / 24);
    if (min < 1) {
        this.timeText = lang === 'vi' ? "Vừa xong" : "Just now";
    }
    else if (min < 60) {
        this.timeText = lang === 'vi' ? min + ' phút' : min + ' minutes';
    }
    else if (hour < 24) {
        this.timeText = lang === 'vi' ? hour + ' giờ' : hour + ' hours';
    }
    else {
        this.timeText = lang === 'vi' ? day + ' ngày' : day + ' days';
    }
};

RelativeTimeText.prototype.getLanguage = function () {
    if (window.systemconfig && window.systemconfig.language) {
        return window.systemconfig.language === 'VN' ? 'vi' : 'en';
    }
    else {
        return navigator.language === 'vi' ? 'vi' : 'en';
    }
};

RelativeTimeText.prototype.share = {
    manager: null
};


RelativeTimeText.property = {};

RelativeTimeText.property.timeText = {
    set: function (value) {
        if (value instanceof Date) {
            value = value.toLocaleDateString() + ' ' + value.toLocaleTimeString();
        }
        this.attr('data-time-text', value);
    },
    get: function () {
        return this.attr('data-time-text');
    }
};

RelativeTimeText.property.time = {
    set: function (value) {
        value = implicitDate(value);
        this._time = value;
        this.updateText();
        if (value) {
            this.attr('title', value.toLocaleDateString() + ' ' + value.toLocaleTimeString());
        }
        else {
            this.attr('title', null);
        }
    },
    get: function () {
        return this._time;
    }
};

export default RelativeTimeText;
ACore.install(RelativeTimeText);

function RTTManager() {
    /**
     *
     * @type {{elt:RelativeTimeText, time: number}[]}
     */
    this.arr = [];
    this.update = this.update.bind(this);
}

RTTManager.prototype.add = function (element) {
    this.arr.push({ elt: element, time: Date.now() });
    if (this.arr.length === 1) {
        setTimeout(this.update, 20000);
    }
};

RTTManager.prototype.update = function () {
    var remainArr = [];
    var now = Date.now();
    var it, ok;
    for (var i = 0; i < this.arr.length; i++) {
        it = this.arr[i];
        ok = now - it.time < 60000;
        if (!ok) {
            if (it.elt.isDescendantOf(document.body)) {
                it.time = now;
                ok = true;
            }
        }
        if (ok) {
            it.elt.updateText();
            remainArr.push(it);
        }
    }
    this.arr = remainArr;
    if (this.arr.length > 0) {
        setTimeout(this.update, 20000);
    }
};
