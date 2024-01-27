import './ColorPicker';
import EventEmitter from "absol/src/HTML5/EventEmitter";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import ACore, { $, _ } from "../../ACore";
import SolidColorPicker from "./SolidColorPicker";

var isMobile = BrowserDetector.isMobile;


/***
 * @extends AElement
 * @constructor
 */
function ColorPickerButton() {
    this.mode = 'OBJECT';
    this.$innerValue = $('.as-color-picker-button-inner-value', this);
    this.prepare();
    this.on('click', this.eventHandler.click);
    /***
     * @name value
     * @type {string|Color}
     * @memberOf ColorPickerButton#
     */
    /***
     * @name hasOpacity
     * @type {boolean}
     * @memberOf ColorPickerButton#
     */
}

ColorPickerButton.tag = 'ColorPickerButton'.toLowerCase();

ColorPickerButton.prototype._isClickMenu = function (event) {
    var c = event.target;
    while (c) {
        if (c.classList.contains('as-solid-color-picker-swatches-name-menu')) return true;
        c = c.parentElement;
    }
    return false;
};

ColorPickerButton.prototype.supportedModes = ['OBJECT', 'RGBA', 'RGB', 'HEX8', 'HEX6', 'HEX4', 'HEX3'];
ColorPickerButton.prototype.hasOpacityModes = ['OBJECT', 'RGBA', 'HEX8', 'HEX4'];

ColorPickerButton.eventHandler = {};

ColorPickerButton.eventHandler.click = function (event) {
    this.togglePicker();
};

ColorPickerButton.eventHandler.changeColor = function (event) {
    this.$innerValue.addStyle("background-color", event.value.toString());
    this._value = event.value;
    this.emit('change', event, this);
};


ColorPickerButton.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$ColorPicker, event) || this._isClickMenu(event)) return;
    this.closePicker();
};

ColorPickerButton.eventHandler.submit = function (event) {
    this.closePicker();
};

ColorPickerButton.prototype.togglePicker = function () {
    if (this.containsClass('as-color-picker-selecting')) {
        this.closePicker();
    }
    else {
        this.openPicker();
    }
};


ColorPickerButton.prototype.openPicker = function () {
    if (this.containsClass('as-color-picker-selecting')) return;

    if (ColorPickerButton.lastOpen) {
        ColorPickerButton.lastOpen.closePicker();
    }
    ColorPickerButton.lastOpen = this;
    var thisBt = this;
    this.addClass('as-color-picker-selecting');
    this.$ColorPicker.on('change', this.eventHandler.changeColor)
        .on('submit', this.eventHandler.submit);
    this.$ColorPicker.reloadSetting();

    this.$follower.addStyle('visibility', 'hidden');
    this.$follower.addTo(document.body);
    this.$follower.followTarget = this;
    this.$follower.sponsorElement = this;
    setTimeout(function () {
        document.addEventListener('click', this.eventHandler.clickBody);
    }.bind(this), 100);
    this._lastValue = this.value;
    this.$ColorPicker.hasOpacity = this.hasOpacity;
    ColorPickerButton.$ColorPicker.value = this.value;
    setTimeout(function () {
        thisBt.$follower.removeStyle('visibility');
    }, 1);
//10p
};


ColorPickerButton.prototype.closePicker = function () {
    if (!this.containsClass('as-color-picker-selecting')) return;
    this.removeClass('as-color-picker-selecting');
    if (ColorPickerButton.lastOpen === this) {
        ColorPickerButton.lastOpen = null;
        this.$follower.remove();
    }
    this.$ColorPicker.off('change', this.eventHandler.changeColor)
        .off('submit', this.eventHandler.submit);
    document.removeEventListener('click', this.eventHandler.clickBody);
    if (this.value !== this._lastValue) {
        this.emit('stopchange', { target: this, value: this.value }, this);
    }
};

ColorPickerButton.prototype.prepare = function () {
    if (!ColorPickerButton.$ColorPicker) {
        if (isMobile) {
            ColorPickerButton.$follower = _('modal').on('click', function (event) {
                if (event.tagert === this) {
                    if (ColorPickerButton.lastOpen) ColorPickerButton.lastOpen.closePicker();

                }
            });
        }
        else {
            ColorPickerButton.$follower = _('follower.as-color-picker-button-follower');
        }

        ColorPickerButton.$ColorPicker = _({
            tag: 'solidcolorpicker'
        }).addTo(ColorPickerButton.$follower);

        ColorPickerButton.lastOpen = null;
    }

    this.$follower = ColorPickerButton.$follower;
    this.$ColorPicker = ColorPickerButton.$ColorPicker;
};

ColorPickerButton.render = function () {
    return _({
        tag: 'button',
        extendEvent: ['change', 'stopchange'],
        class: 'as-color-picker-button',
        child: [
            {
                tag: "div",
                class: "as-color-picker-button-inner",
                child: '.as-color-picker-button-inner-value'
            }
        ]
    });
};

ColorPickerButton.property = {};
ColorPickerButton.property.value = {
    set: function (value) {
        this._value = value;
        if (this._value) {
            this.$innerValue.addStyle("background-color", value);
        }
        else {
            this.$innerValue.addStyle("background-color", 'transparent');

        }
    },
    get: function () {
        if (!this._value) return this._value;
        if (this.mode.match(/HEX4|HEX6|HEX8|RGB|RGBA/)) return this._value.toString(this.mode);
        return this._value;
    }
};

ColorPickerButton.property.mode = {
    set: function (value) {
        value = value || 'OBJECT';
        value = value.toUpperCase();
        if (this.supportedModes.indexOf(value) < 0) value = 'OBJECT';
        this._mode = value;
    },
    get: function () {
        return this._mode;
    }
};


ColorPickerButton.property.hasOpacity = {
    get: function () {
        return this.hasOpacityModes.indexOf(this._mode) >= 0;
    }
};


ACore.install(ColorPickerButton);

export default ColorPickerButton;
