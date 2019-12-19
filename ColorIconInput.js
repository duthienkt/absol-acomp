import './ColorPicker';
import CPCore from "./CPCore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
var _ = CPCore._;
var $ = CPCore.$;

function ColorPickerInput() {
    this.$icon = $('.as-color-picker-input-icon', this);
    
    this.prepare();
    this.on('click', this.eventHandler.click);
}

ColorPickerInput.eventHandler = {};

ColorPickerInput.eventHandler.click = function (event) {
    this.togglePicker();
};

ColorPickerInput.eventHandler.changeColor = function(event){
    this.$icon.addStyle("background-color",event.value.toString());
    this._value = event.value;
    this.emit('change', event, this);
}

ColorPickerInput.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$ColorPicker, event)) return;
    this.closePicker();
};

ColorPickerInput.prototype.togglePicker = function () {
    if (this.containsClass('as-color-picker-selecting')) {
        this.closePicker();
    }
    else {
        this.openPicker();
    }
};


ColorPickerInput.prototype.openPicker = function () {
    if (ColorPickerInput.lastOpen) {
        ColorPickerInput.lastOpen.closePicker();
    }
    ColorPickerInput.lastOpen = this;
    this.addClass('as-color-picker-selecting');
    this.$ColorPicker.on('change', this.eventHandler.changeColor);
    this.$ctn.addTo(document.body);
    this.$follower.followTarget = this;
    $(document.body).on('click', this.eventHandler.clickBody);
    ColorPickerInput.$ColorPicker.value = this.value;
};


ColorPickerInput.prototype.closePicker = function () {
    this.removeClass('as-color-picker-selecting');
    if (ColorPickerInput.lastOpen == this) {
        ColorPickerInput.lastOpen == null;
        this.$ctn.remove();
    }
    this.$ColorPicker.off('change', this.eventHandler.changeColor);
    $(document.body).off('click', this.eventHandler.clickBody);
};

ColorPickerInput.prototype.prepare = function () {
    if (!ColorPickerInput.$ColorPicker) {
        ColorPickerInput.$ctn = _('.absol-context-hinge-fixed-container');
        ColorPickerInput.$follower = _('follower').addTo(ColorPickerInput.$ctn);
        ColorPickerInput.$ColorPicker = _({
            tag:'colorpicker',
            props:{
                mode:'RGBA'
            }
        }).addTo(ColorPickerInput.$follower);
        
        ColorPickerInput.lastOpen = null;
    }

    this.$follower = ColorPickerInput.$follower;

    this.$ColorPicker = ColorPickerInput.$ColorPicker;
    this.$ctn = ColorPickerInput.$ctn;
};

ColorPickerInput.render = function () {
    return _({
        extendEvent: 'change',
        tag: 'button',
        extendEvent: 'change',
        class: 'as-color-picker-input',
        child:[
            {
                tag:"div",
                class:"as-color-picker-input-icon"
            }
        ]
    });
}

ColorPickerInput.property = {};
ColorPickerInput.property.value = {
    set: function (value) {
        this._value = value;
        if (this._value) {
            this.$icon.addStyle("background-color",value);
        }
        else {
        }
    },
    get: function () {
        return this._value;
    }
};

CPCore.creator.coloriconinput = ColorPickerInput;

export default ColorPickerInput;