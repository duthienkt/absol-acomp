import './ColorPicker';
import EventEmitter from "absol/src/HTML5/EventEmitter";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import ACore, { $, _ } from "../../ACore";
import SolidColorPicker from "./SolidColorPicker";
import { ColorCell } from "./SwatchesTable";
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import { base64EncodeUnicode } from "absol/src/Converter/base64";
import red_cross_tpl from "../../assets/icon/red_cross.tpl";
import Color from "absol/src/Color/Color";

var isMobile = BrowserDetector.isMobile;


/***
 * @extends AElement
 * @constructor
 */
function ColorPickerButton() {
    if (!ColorPickerButton.css) {
        ColorPickerButton.css = new DynamicCSS()
            .setProperty('.as-color-cell.as-color-picker-button-inner.as-null .as-color-cell-value',
                'background-image',
                `url("data:image/svg+xml;base64,${base64EncodeUnicode(red_cross_tpl.replace(/\$width/g, '33').replace(/\$height/g, '18'))}")`)
            .commit();
    }
    this.mode = 'OBJECT';
    this.$innerValue = $('.as-color-picker-button-inner', this);
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

    /***
     * @name nullable
     * @type {boolean}
     * @memberOf ColorPickerButton#
     */
}

ColorPickerButton.tag = 'ColorPickerButton'.toLowerCase();


ColorPickerButton.prototype.supportedModes = ['OBJECT', 'RGBA', 'RGB', 'HEX8', 'HEX6', 'HEX4', 'HEX3'];
ColorPickerButton.prototype.hasOpacityModes = ['OBJECT', 'RGBA', 'HEX8', 'HEX4'];

ColorPickerButton.eventHandler = {};

ColorPickerButton.eventHandler.click = function (event) {
    this.togglePicker();
};

ColorPickerButton.eventHandler.changeColor = function (event) {
    this._value = event.value;
    this.$innerValue.value = event.value;
    this.emit('change', event, this);
};


ColorPickerButton.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$ColorPicker, event)) return;
    this.closePicker();
};

ColorPickerButton.eventHandler.submit = function (event) {
    this.closePicker();
};

ColorPickerButton.prototype.togglePicker = function () {
    if (this.hasClass('as-color-picker-selecting')) {
        this.closePicker();
    }
    else {
        this.openPicker();
    }
};


ColorPickerButton.prototype.openPicker = function () {
    if (this.hasClass('as-color-picker-selecting')) return;

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
    this.$ColorPicker.nullable = this.nullable;
    this.$ColorPicker.hasOpacity = this.hasOpacity;
    ColorPickerButton.$ColorPicker.value = this.value;

    setTimeout(function () {
        thisBt.$follower.removeStyle('visibility');
    }, 1);
//10p
};


ColorPickerButton.prototype.closePicker = function () {
    if (!this.hasClass('as-color-picker-selecting')) return;
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
                tag: ColorCell,
                class: "as-color-picker-button-inner",
            }
        ]
    });
};

ColorPickerButton.property = {};
ColorPickerButton.property.value = {
    set: function (value) {
        this._value = value;
        this.$innerValue.value = value;
    },
    get: function () {
        var nullable = this.nullable;
        var value = this._value;
        if (!this._value && nullable) return  value;//null, ""
        if (!this._value && !nullable) {
            value = new Color([0, 0, 0, 1]);
        }
        if (this.mode.match(/HEX4|HEX6|HEX8|RGB|RGBA/) && value && value.toHex3) {
            value = this._value.toString(this.mode);
        }
        return value;
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


ColorPickerButton.property.nullable = {
    set: function (value) {
        if (value) {
            this.addClass('as-nullable');
        }
        else {
            this.removeClass('as-null-nullable');
        }
    },
    get: function () {
        return this.hasClass('as-nullable');
    }
}


ACore.install(ColorPickerButton);

export default ColorPickerButton;
