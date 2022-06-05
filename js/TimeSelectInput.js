import '../css/timeselectinput.css';

import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";
import {beginOfHour, MILLIS_PER_DAY, MILLIS_PER_HOUR, MILLIS_PER_MINUTE} from "absol/src/Time/datetime";
import TimeInput from "./TimeInput";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import {positiveIntMod} from "./utils";
import {getScreenSize, traceOutBoundingClientRect} from "absol/src/HTML5/Dom";


var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function TimeSelectInput() {
    /***
     *
     * @type {SelectListBox}
     */
    this.$selectlistBox = _({
        tag: 'selectlistbox',
        props: {
            anchor: [1, 6, 2, 5]
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    this.$text = $('.as-time-select-input-text', this)
        .on('change', this.eventHandler.textChange)
        .on('keyup', this.eventHandler.textKeyUp)
        .on('keydown', this.eventHandler.textKeyDown);


    this.$toggleBtn = $('absol-selectmenu-btn', this);
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.followTarget = this;
    this._makeTimeList(0, MILLIS_PER_DAY, MILLIS_PER_MINUTE * 15);
    this._hour = 0;
    this._minute = 0;
    this._lastDayOffset = 0;
    this.dayOffset = 0;
    this.on('click', this.eventHandler.click);

}

TimeSelectInput.tag = 'TimeSelectInput'.toLowerCase();

TimeSelectInput.render = function () {
    return _({
        class: 'as-time-select-input',
        extendEvent: 'change',
        attr: {
            tabindex: 0
        },
        child: [
            {
                tag: 'input',
                class: 'as-time-select-input-text',
                attr: {
                    type: 'text'
                }
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            }
        ]
    });
};


TimeSelectInput.prototype._makeTimeList = function (start, end, step) {
    var items = [];
    for (var t = 0; t < end; t += step) {
        items.push({
            text: this._mil2Text(t),
            value: t
        });
    }
    this.$selectlistBox.items = items;
    this.addStyle('--list-min-width', this.$selectlistBox._estimateWidth/14 + 'em');
};

TimeSelectInput.prototype.textRegx = /^((1[0-2])|[1-9]):([0-5][0-9]) (AM|PM)$/;

TimeSelectInput.prototype._mil2Text = function (mil) {
    if (mil < 0) {
        mil = mil + Math.ceil(-mil / MILLIS_PER_DAY) * MILLIS_PER_DAY;
    }
    var min = Math.floor(mil / (MILLIS_PER_MINUTE));
    var hour = Math.floor(min / 60) % 24;
    min = min % 60;
    return (hour % 12 == 0 ? 12 : (hour % 12)) + ':' + (min < 10 ? '0' : '') + min + ' ' + (hour < 12 ? 'AM' : 'PM');
};

/***
 *
 * @param {string} s
 * @private
 */
TimeSelectInput.prototype._text2mil = function (s) {
    s = s.toLowerCase();
    var nums = s.match(/[0-9]+/g) || [0, 0];
    while (nums.length < 2) {
        nums.push(0);
    }
    var h = positiveIntMod(parseInt(nums[0]), 24);
    var m = positiveIntMod(parseInt(nums[1]), 60);
    var pm = s.indexOf('pm') > 0 || h > 12;
    if (pm) {
        if (h < 12) h += 12;
    }
    else {
        if (h == 12) h = 0;
    }
    return h * MILLIS_PER_HOUR + m * MILLIS_PER_MINUTE;
};


TimeSelectInput.prototype.isActive = function () {
    return document.activeElement == this || AElement.prototype.isDescendantOf.call(document.activeElement, this)
        || AElement.prototype.isDescendantOf.call(document.activeElement, this.$selectlistBox);
};

TimeSelectInput.prototype._updateValueText = function () {
    this.$text.value = this._mil2Text(this.dayOffset);
};

TimeSelectInput.prototype.notifyCanBeChange = function () {
    var dayOffset = this.dayOffset;
    if (this._lastDayOffset !== dayOffset) {
        this.emit('change', {
            type: 'change',
            lastDayOffset: this._lastDayOffset,
            dayOffset: dayOffset,
            target: this
        }, this);
        this._lastDayOffset = dayOffset;
    }
};


TimeSelectInput.property = {};

TimeSelectInput.property.isFocus = {
    get: function () {
        return this.containsClass('as-focus');
    },
    set: function (value) {
        value = !!value;
        if (this.isFocus == value) return;
        if (value) {
            this.addClass('as-focus');
        }
        else {
            this.removeClass('as-focus');
        }
        var thisI = this;
        if (value) {
            document.body.appendChild(this.$selectlistBox);
            this.$selectlistBox.domSignal.$attachhook.emit('attached');
            var bound = this.getBoundingClientRect();
            this.$selectlistBox.addStyle('min-width', bound.width + 'px');
            this.$selectlistBox.refollow();
            this.$selectlistBox.updatePosition();
            setTimeout(function () {
                if (thisI.enableSearch) {
                    thisI.$selectlistBox.$searchInput.focus();
                }
                $(document.body).on('click', thisI.eventHandler.bodyClick);
            }, 1);
            this.$selectlistBox.viewListAtFirstSelected();
        }
        else {
            $(document.body).off('click', thisI.eventHandler.bodyClick);
            this.$selectlistBox.selfRemove();
            this.$selectlistBox.unfollow();
            this.$selectlistBox.resetSearchState();
        }
    }
};


TimeSelectInput.property.hour = {
    set: function (value) {
        this._hour = positiveIntMod(value, 24);
        this._lastDayOffset = this.dayOffset;
        this._updateValueText();
    },
    get: function () {
        return this._hour;
    }
};

TimeSelectInput.property.minute = {
    set: function (value) {
        this._minute = positiveIntMod(value, 60);
        this._lastDayOffset = this.dayOffset;
        this._updateValueText();
    },
    get: function () {
        return this._minute;
    }
};

TimeSelectInput.property.dayOffset = TimeInput.property.dayOffset;
TimeSelectInput.property.disabled = {
    set: function (value) {
        this.$text.disabled = !!value;
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    }
    ,
    get: function () {
        return this.containsClass('as-disabled');
    }
};


/***
 *
 * @type {{}|TimeSelectInput}
 */
TimeSelectInput.eventHandler = {};

TimeSelectInput.eventHandler.selectListBoxPressItem = function (event) {
    var lastValue = this._lastDayOffset;
    var value = event.value;
    var text = this._mil2Text(value);
    this.dayOffset = value;
    this.$selectlistBox.values = [value];
    this.focus();
    setTimeout(function () {
        this.isFocus = false;
    }.bind(this), 100);
    this._lastDayOffset = lastValue;// restore last value after set dayOffset
    this.notifyCanBeChange();
};

TimeSelectInput.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$selectlistBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};

TimeSelectInput.eventHandler.textChange = function () {
    setTimeout(function () {
        if (!this.textRegx.test(this.$text.value)) {
            this.$text.value = this._mil2Text(this.dayOffset);
        }
    }.bind(this), 10);
};

/***
 *
 * @param {KeyboardEvent} event
 */
TimeSelectInput.eventHandler.textKeyDown = function (event) {
    if (event.key == 'Enter') {
        this.isFocus = false;
        this.$text.blur();
        this.notifyCanBeChange();
    }
};


TimeSelectInput.eventHandler.textKeyUp = function (event) {
    var s = this.$text.value;
    var mil = this._text2mil(s);
    this._hour = Math.floor(mil / MILLIS_PER_HOUR);
    this._minute = Math.floor(mil / MILLIS_PER_MINUTE) % 60;
    this.$selectlistBox.values = [mil];
    this.$selectlistBox.viewListAtFirstSelected();
};

TimeSelectInput.eventHandler.click = function (event) {
    if (!EventEmitter.hitElement(this.$text, event)) {
        this.isFocus = !this.isFocus;
        setTimeout(function () {
            if (this.isFocus && this.$text != document.activeElement) {
                this.$text.select();
            }
        }.bind(this), 1)
    }
    else {
        if (!this.isFocus) this.isFocus = true;
    }
};

TimeSelectInput.eventHandler.bodyClick = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$selectlistBox, event)) return;
    this.isFocus = false;
};


ACore.install(TimeSelectInput);

export default TimeSelectInput;