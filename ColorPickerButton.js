import './ColorPicker';
import CPCore from "./CPCore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
var _ = CPCore._;
var $ = CPCore.$;

function ColorIconInput() {
    this.$icon = $('.as-color-picker-input-icon', this);
    
    this.prepare();
    this.on('click', this.eventHandler.click);
}

ColorIconInput.eventHandler = {};

ColorIconInput.eventHandler.click = function (event) {
    this.togglePicker();
};

ColorIconInput.eventHandler.changeColor = function(event){
    this.$icon.addStyle("background-color",event.value.toString());
    this._value = event.value;
    this.emit('change', event, this);
}

ColorIconInput.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$ColorPicker, event)) return;
    this.closePicker();
};

ColorIconInput.prototype.togglePicker = function () {
    if (this.containsClass('as-color-picker-selecting')) {
        this.closePicker();
    }
    else {
        this.openPicker();
    }
};


ColorIconInput.prototype.openPicker = function () {
    if (ColorIconInput.lastOpen) {
        ColorIconInput.lastOpen.closePicker();
    }
    ColorIconInput.lastOpen = this;
    this.addClass('as-color-picker-selecting');
    this.$ColorPicker.on('change', this.eventHandler.changeColor);
    this.$ctn.addTo(document.body);
    this.$follower.followTarget = this;
    $(document.body).on('click', this.eventHandler.clickBody);
    ColorIconInput.$ColorPicker.value = this.value;
};


ColorIconInput.prototype.closePicker = function () {
    this.removeClass('as-color-picker-selecting');
    if (ColorIconInput.lastOpen == this) {
        ColorIconInput.lastOpen == null;
        this.$ctn.remove();
    }
    this.$ColorPicker.off('change', this.eventHandler.changeColor);
    $(document.body).off('click', this.eventHandler.clickBody);
};

ColorIconInput.prototype.prepare = function () {
    if (!ColorIconInput.$ColorPicker) {
        ColorIconInput.$ctn = _('.absol-context-hinge-fixed-container');
        ColorIconInput.$follower = _('follower').addTo(ColorIconInput.$ctn);
        ColorIconInput.$ColorPicker = _({
            tag:'colorpicker',
            props:{
                mode:'RGBA'
            }
        }).addTo(ColorIconInput.$follower);
        
        ColorIconInput.lastOpen = null;
    }

    this.$follower = ColorIconInput.$follower;

    this.$ColorPicker = ColorIconInput.$ColorPicker;
    this.$ctn = ColorIconInput.$ctn;
};

ColorIconInput.render = function () {
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

ColorIconInput.property = {};
ColorIconInput.property.value = {
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

CPCore.creator.coloriconinput = ColorIconInput;

export default ColorIconInput;