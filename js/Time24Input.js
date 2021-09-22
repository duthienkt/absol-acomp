import ACore, {$, _} from "../ACore";
import ChromeTime24Picker from "./ChromeTime24Picker";
import {beginOfDay, formatDateTime, MILLIS_PER_DAY} from "absol/src/Time/datetime";
import {hitElement} from "absol/src/HTML5/EventEmitter";
import {isRealNumber} from "./utils";

/**
 * @extends AElement
 * @constructor
 */
function Time24Input() {
    this.$clockBtn = $('.as-time-input-icon-btn', this)
        .on('click', this.eventHandler.clickClockBtn);
    this.$text = $('.as-time-input-text', this);
    this.$clearBtn = $('button.as-time-input-clear-btn', this)
        .on('click', this.clear.bind(this));
    this._dayOffset = 0;
    this._value = 0;
    this._format = 'HH:mm';
    this.dayOffset = this._dayOffset;
    this.value = this._value;
    this.format = this._format;
    this.notNull = true;
}

Time24Input.tag = 'Time24Input'.toLowerCase();

Time24Input.render = function () {
    return _({
        class: ['ac-time-input', 'as-time-24-input'],
        extendEvent: ['change'],
        child: [
            {
                tag: 'input',
                class: 'as-time-input-text',
                attr: {
                    readOnly: 'true',
                    type: 'text'
                }
            },
            {
                tag: 'button',
                class: 'as-time-input-clear-btn',
                child: 'span.mdi.mdi-close-circle'
            },
            {
                tag: 'button',
                class: 'as-time-input-icon-btn',
                child: 'span.mdi.mdi-clock-outline'
            }
        ]
    });
};


Time24Input.prototype._updateText = function () {
    var text;
    if (isRealNumber(this._value) && isRealNumber(this._dayOffset)) {
        text = formatDateTime(new Date(beginOfDay(new Date).getTime() + this._value + this._dayOffset), this._format);
        if (this._value + this._dayOffset >= MILLIS_PER_DAY) text += '(hôm sau)';
        this.removeClass('as-value-null');
    } else {
        text = this._format;
        this.addClass('as-value-null');
    }
    this.$text.value = text;
};


Time24Input.prototype._notifyChange = function (event) {
    this.emit('change', {type: 'change', originalEvent: event.originalEvent || event.originEvent || event}, this);
};


Time24Input.prototype.clear = function (event) {
    if (this._value !== null && !this.notNull){
        this.value = null;
        this._notifyChange(event);
    }
};


Time24Input.prototype.share = {
    $picker: null,
    /***
     * @type Time24Input
     */
    $holdingInput: null,
    $follower: null
};


Time24Input.prototype._preparePicker = function () {
    if (this.share.$picker) return;
    this.share.$picker = _({
        tag: ChromeTime24Picker.tag
    });
    this.share.$follower = _({
        tag: 'follower',
        class: 'as-chrome-time-24-picker-follower',
        child: this.share.$picker
    });
};

Time24Input.prototype._attachPicker = function () {
    this._preparePicker();
    if (this.share.$holdingInput) {
        this.share.$holdingInput._releasePicker();
    }
    this.share.$holdingInput = this;
    this.share.$follower.addTo(document.body);
    this.share.$follower.followTarget = this;
    this.share.$follower.addStyle('visibility', 'hidden');
    this.share.$picker.on('change', this.eventHandler.pickerChange);
    this.$clockBtn.off('click', this.eventHandler.clickClockBtn);
    this.share.$picker.dayOffset = isRealNumber(this._dayOffset) ? this._dayOffset : 0;
    this.share.$picker.value = isRealNumber(this._value) ? this._value : 0;

    setTimeout(function () {
        document.body.addEventListener('click', this.eventHandler.clickOut);
        this.share.$follower.removeStyle('visibility');
    }.bind(this), 5);
};


Time24Input.prototype._releasePicker = function () {
    if (this.share.$holdingInput !== this) return;
    this.share.$picker.off('change', this.eventHandler.pickerChange);
    this.share.$follower.remove();
    this.share.$follower.followTarget = null;
    this.share.$holdingInput = null;
    document.body.removeEventListener('click', this.eventHandler.clickOut);
    setTimeout(function () {
        this.$clockBtn.on('click', this.eventHandler.clickClockBtn);
    }.bind(this), 10)
};

Time24Input.property = {};

Time24Input.property.dayOffset = {
    set: function (value) {
        this._dayOffset = isRealNumber(value) ? value : null;
        this._updateText();
    },
    get: function () {
        return this._dayOffset;
    }
};

Time24Input.property.value = {
    set: function (value) {
        this._value = isRealNumber(value) ? value : (this.notNull ? 0 : null);
        this._updateText();
    },
    get: function () {
        return this._value;
    }
};

Time24Input.property.displayTime = {
    get: function () {
        if (isRealNumber(this._value) && isRealNumber(this._dayOffset)) {
            return this._value + this._dayOffset;
        } else {
            return null;
        }
    }
};


Time24Input.property.notNull = {
    set: function (value) {
        if (value) {
            if (this.value === null) {
                this.value = 0;
            }
            this.addClass('as-must-not-null');

        } else {
            this.removeClass('as-must-not-null');
        }
    },
    get: function () {
        return this.containsClass('as-must-not-null');
    }
};

Time24Input.property.disabled = {
    set: function (value) {
        value = !!value;
        this._disabled = value;
        if (value) this.addClass('as-disabled');
        else this.removeClass('as-disabled');
        this.$text.disabled = value;
    },
    get: function () {
        return this._disabled;
    }
};


Time24Input.property.format = {
    set: function (value) {
        this._format = value || 'HH:mm';
        this._updateText();
    },
    get: function () {
        return this._format;
    }
}


Time24Input.eventHandler = {};

Time24Input.eventHandler.pickerChange = function (event) {
    if (this.dayOffset === null) this.dayOffset = 0;
    this.value = this.share.$picker.value;
    this._notifyChange(event);
};

Time24Input.eventHandler.clickOut = function (event) {
    if (hitElement(this.share.$follower, event)) return;
    this._releasePicker();
};


Time24Input.eventHandler.clickClockBtn = function () {
    this._attachPicker();
};


ACore.install(Time24Input);

export default Time24Input;
