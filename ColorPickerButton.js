import './ColorPicker';
import CPCore from "./CPCore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
var _ = CPCore._;
var $ = CPCore.$;

function ColorPickerButton() {
    this.$innerValue = $('.as-color-picker-button-inner-value', this);

    this.prepare();
    this.on('click', this.eventHandler.click);
}

ColorPickerButton.eventHandler = {};

ColorPickerButton.eventHandler.click = function (event) {
    this.togglePicker();
};

ColorPickerButton.eventHandler.changeColor = function (event) {
    this.$innerValue.addStyle("background-color", event.value.toString());
    this._value = event.value;
    this.emit('change', event, this);
}

ColorPickerButton.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$ColorPicker, event)) return;
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
    if (ColorPickerButton.lastOpen) {
        ColorPickerButton.lastOpen.closePicker();
    }
    ColorPickerButton.lastOpen = this;
    this.addClass('as-color-picker-selecting');
    this.$ColorPicker.on('change', this.eventHandler.changeColor);
    this.$ctn.addTo(document.body);
    this.$follower.followTarget = this;
    $(document.body).on('click', this.eventHandler.clickBody);
    ColorPickerButton.$ColorPicker.value = this.value;
};


ColorPickerButton.prototype.closePicker = function () {
    this.removeClass('as-color-picker-selecting');
    if (ColorPickerButton.lastOpen == this) {
        ColorPickerButton.lastOpen == null;
        this.$ctn.remove();
    }
    this.$ColorPicker.off('change', this.eventHandler.changeColor);
    $(document.body).off('click', this.eventHandler.clickBody);
};

ColorPickerButton.prototype.prepare = function () {
    if (!ColorPickerButton.$ColorPicker) {
        ColorPickerButton.$ctn = _('.absol-context-hinge-fixed-container');
        ColorPickerButton.$follower = _('follower').addTo(ColorPickerButton.$ctn);
        ColorPickerButton.$ColorPicker = _({
            tag: 'colorpicker',
            props: {
                mode: 'RGBA'
            }
        }).addTo(ColorPickerButton.$follower);

        ColorPickerButton.lastOpen = null;
    }

    this.$follower = ColorPickerButton.$follower;

    this.$ColorPicker = ColorPickerButton.$ColorPicker;
    this.$ctn = ColorPickerButton.$ctn;
};

ColorPickerButton.render = function () {
    return _({
        extendEvent: 'change',
        tag: 'button',
        extendEvent: 'change',
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
        }
    },
    get: function () {
        return this._value;
    }
};


CPCore.install('colorpickerbutton', ColorPickerButton);

export default ColorPickerButton;
