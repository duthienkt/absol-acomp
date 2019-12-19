import CPCore from "./CPCore";
import OOP from "absol/src/HTML5/OOP";
import Color from 'absol/src/Color/Color';
var _ = CPCore._;
var $ = CPCore.$;


function ColorPicker() {
    var res = _(['<div class="absol-color-picker">',
        '    <div class="absol-color-picker-color">',
        '        <div class="absol-color-picker-sat">',
        '            <div class="absol-color-picker-val">',
        '                <div class="absol-color-dragger"></div>',
        '            </div>',
        '        </div>',
        '    </div>',
        '    <div class="absol-color-picker-hue-range">',
        '        <div class="absol-color-picker-hue">',
        '            <div class="absol-color-dragger"></div>',
        '        </div>',
        '    </div>',
        '    <div class="absol-color-picker-alpha-range">',
        '        <div class="absol-color-picker-alpha">',
        '            <div class="absol-color-dragger"></div>',
        '        </div>',
        '    </div>',
        '    <div class="absol-color-picker-input">',
        ` <div class="absol-color-picker-text-container">
            <span class="f-mode">hsba(</span>
            <span class="absol-editabe-text num0">0</span><span class="separator0">deg, </span>
            <span class="absol-editabe-text num1">0</span><span class="separator1">%, </span>
            <span class="absol-editabe-text num2">0</span><span class="separator2">%, </span>
            <span class="absol-editabe-text num3">0</span><span>)</span>
        </div>`,
        '    </div>',
        '    <button class="absol-color-picker-mode">HSB</button>',
        '</div>'].join('')
    );

    res.$fMode = $('.f-mode', res);
    res.$sep0 = $('.separator0', res);
    res.$sep1 = $('.separator1', res);
    res.$sep2 = $('.separator2', res);

    res.$num0 = _('editabletext.num0');
    res.$num1 = _('editabletext.num1');
    res.$num2 = _('editabletext.num2');
    res.$num3 = _('editabletext.num3');
    ColorPicker.defaultNumberInputHandle(res.$num0);
    ColorPicker.defaultNumberInputHandle(res.$num1);
    ColorPicker.defaultNumberInputHandle(res.$num2);
    ColorPicker.defaultNumberInputHandle(res.$num3);



    res._num0LimitOption = ColorPicker.numberInputHandleLimit(res.$num0, 0, 360);
    res._num1LimitOption = ColorPicker.numberInputHandleLimit(res.$num1, 0, 100, 0);
    res._num2LimitOption = ColorPicker.numberInputHandleLimit(res.$num2, 0, 100, 0);
    res._num3LimitOption = ColorPicker.numberInputHandleLimit(res.$num3, 0, 1, 3);

    $(".absol-editabe-text.num0", res).selfReplace(res.$num0);
    $(".absol-editabe-text.num1", res).selfReplace(res.$num1);
    $(".absol-editabe-text.num2", res).selfReplace(res.$num2);
    $(".absol-editabe-text.num3", res).selfReplace(res.$num3);

    res.$num0.text = '0';
    res.$num1.text = '0';
    res.$num2.text = '0';
    res.$num3.text = '0';

    res.switchMode = {
        RGBA: 'HSBA',
        HSBA: 'HSLA',
        HSLA: 'RGBA',

        RGB: 'HSB',
        HSB: 'HSL',
        HSL: 'RGB'
    };

    res.toggleAlpha = {
        RGBA: 'RGB',
        HSBA: 'HSB',
        HSLA: 'HSL',

        RGB: 'RGBA',
        HSB: 'HSBA',
        HSL: 'HSLA'
    };

    res.defineEvent(['change']);
    res._saturation = 0;
    res._brightness = 0;
    res._hue = 0;
    res._alpha = 1;
    res.$color = $('.absol-color-picker-color', res);
    res.$colorVal = $('.absol-color-picker-val', res);
    res.$draggerVal = $('.absol-color-dragger', res.$colorVal);
    res.eventHandler = OOP.bindFunctions(res, ColorPicker.eventHandler);
    res.$colorVal.on('pointerdown', res.eventHandler.colorPointerDown, true);
    res.$hue = $('.absol-color-picker-hue', res);
    res.$draggerHue = $('.absol-color-dragger', res.$hue);
    res.$hue.on('pointerdown', res.eventHandler.huePointerDown);
    res.$alpha = $('.absol-color-picker-alpha', res);
    res.$alpha.on('pointerdown', res.eventHandler.alphaPointerDown);
    res.$draggerAlpha = $('.absol-color-dragger', res.$alpha);

    res.$textContainer = $('.absol-color-picker-text-container', res);

    res.$mode = $('.absol-color-picker-mode', res);
    res.$mode.on('click', res.eventHandler.modeClick);
    //todo

    res.$num0.on('blur', res.eventHandler.inputBlur);
    res.$num1.on('blur', res.eventHandler.inputBlur);
    res.$num2.on('blur', res.eventHandler.inputBlur);
    res.$num3.on('blur', res.eventHandler.inputBlur);


    return res;
}


ColorPicker.defaultNumberInputHandle = function (element) {
    element
        .on('keydown', function (event) {
            if (!event.key.match(/^[0-9\.]$/) && event.key.length == 1) {
                event.preventDefault();
            }
            if (event.key == 'Tab') {
                event.preventDefault();
            }
            if (event.key == 'Enter') {
                this.edit(false);
            }
            if (event.key == '.' && this.text.indexOf('.') >= 0) {
                event.preventDefault();
            }
            if (this.text.length >= 6 && event.key.length == 1) event.preventDefault();
        })
        .on('click', function (event) {
            element.edit(true, true);
        })
        .on('keydown', function (event) {
            if (event.key == 'Tab') {
                var parent = element.parentNode;
                var firstFriend;
                var found = false;
                var nextFriend = $('editabletext', parent, function (elt) {
                    if (elt.getComputedStyleValue('display') == "none") return;
                    if (!firstFriend) {
                        firstFriend = elt;
                    }
                    if (elt == element) {
                        found = true;
                    }
                    else if (found) {
                        return true;
                    }
                });

                nextFriend = nextFriend || firstFriend;
                if (nextFriend) {
                    nextFriend.edit(true, true);
                }

            }
        });
};




ColorPicker.numberInputHandleLimit = function (element, min, max, fixed) {
    var option = {
        min: min, max: max, fixed: fixed || 0,
        enable: true
    }
    element.on('blur', function (event) {
        if (!option.enable) return;
        var number = parseFloat(element.text);
        if (isNaN(number)) {
            number = min;
        }
        if (option.fixed == 0) {
            number = Math.round(number);
        }
        number = Math.max(min, Math.min(option.max, number));
        element.text = number.toFixed(option.fixed) + '';
    });
    return option;
};




ColorPicker.property = {};
ColorPicker.property.withAlpha = {
    set: function (value) {
        if (value) {
            this.addClass('with-alpha');
        }
        else {
            this.removeClass('with-alpha');
        }
    },
    get: function () {
        return this.containClass('with-alpha');
    }
};

ColorPicker.property.saturation = {
    set: function (value) {
        value = value || 0;
        value = Math.max(0, Math.min(1, value));
        this._saturation = value;
        this.$draggerVal.addStyle('left', value * 100 + '%');
        this._update();

    },
    get: function () {
        return this._saturation;
    }
};

ColorPicker.property.brightness = {
    set: function (value) {
        value = value || 0;
        value = Math.max(0, Math.min(1, value));
        this._brightness = value;
        this.$draggerVal.addStyle('bottom', value * 100 + '%');
        this._update();

    },
    get: function () {
        return this._brightness;
    }
};

ColorPicker.property.mode = {
    set: function (value) {
        value = (value + '').toUpperCase();
        if (value.indexOf('A') >= 0) {
            this.addClass('with-alpha');
        }
        else {
            this.removeClass('with-alpha');
            this.alpha = 1;
        }

        if (value.match(/^H/)) {
            this._num0LimitOption.max = 360;
            this._num1LimitOption.max = 100;
            this._num2LimitOption.max = 100;
        }
        else if (value.match(/^RGB/)) {
            this._num0LimitOption.max = 255;
            this._num1LimitOption.max = 255;
            this._num2LimitOption.max = 255;
        }

        if (value.match(/^(HSB|HSL|RGB|RGBA|HSBA|HSLA)$/)) {
            this.$mode.innerHTML = value;
            this._updateColorText();
        }
    },
    get: function () {
        return this.$mode.innerHTML;
    }
};


ColorPicker.property.hue = {
    set: function (value) {
        value = value || 0;
        value = Math.max(0, Math.min(1, value));
        this._hue = value;
        this.$draggerHue.addStyle('top', value * 100 + '%');
        this._update();
    },
    get: function () {
        return this._hue;
    }
};

ColorPicker.property.alpha = {
    set: function (value) {
        value = value || 0;
        value = Math.max(0, Math.min(1, value));
        this._alpha = value;
        this.$draggerAlpha.addStyle('top', (1 - value) * 100 + '%');
        this._update();
    },
    get: function () {
        return this._alpha;
    }
};


ColorPicker.property.value = {
    set: function (value) {
        if (typeof value == 'string') {
            value = Color.parse(value)
        }
        if (!value || !value.toHSBA)
            throw new Error('Invalid color type');
        var hsba = value.toHSBA();
        this.hue = hsba[0];
        this.saturation = hsba[1];
        this.brightness = hsba[2];
        this.alpha = hsba[3];
    },
    get: function () {
        return Color.fromHSBA(this.hue, this.saturation, this.brightness, this.alpha);
    }
}


ColorPicker.property.RGBA = {
    set: function (value) {
        var hsba = Color.rgbaToHSBA(value || [0, 0, 0, 0]);
        this.hue = hsba[0];
        this.saturation = hsba[1];
        this.brightness = hsba[2];
        this.alpha = hsba[3];
    },
    get: function () {
        var rgba = Color.hsbaToRGBA([this.hue, this.saturation, this.brightness, this.alpha]);
        return rgba;

    },
}



ColorPicker.prototype._getSVOfEvent = function (event) {
    var valBound = this.$colorVal.getBoundingClientRect();
    var dx = event.clientX - valBound.left;
    var dy = event.clientY - valBound.top;
    var s = Math.max(0, Math.min(1, dx / valBound.width));
    var b = Math.max(0, Math.min(1, 1 - dy / valBound.height));
    return { s, b };
};


ColorPicker.prototype._getHOfEvent = function (event) {
    var hueBound = this.$hue.getBoundingClientRect();
    var h = event.clientY - hueBound.top;
    h = h / hueBound.height;
    h = Math.max(0, Math.min(1, h));
    return h;
};

ColorPicker.prototype._getAOfEvent = function (event) {
    var alphaBound = this.$alpha.getBoundingClientRect();
    var a = alphaBound.bottom - event.clientY;
    a = a / alphaBound.height;
    a = Math.max(0, Math.min(1, a));
    return a;
};

ColorPicker.prototype._getTextColorCode = function () {
    var h = this.hue + 0.5;
    if (h > 1) h -= 1;
    var s = this.saturation > 0.5 ? 0 : 1;
    var b = this.brightness > 0.5 ? 0 : 1;
    var rgba = Color.hsbaToRGBA([h, s, b, 1]);
    return 'rgba(' + rgba.map((x, i) => i < 3 ? x * 255 : x).join(',') + ')';

};

ColorPicker.prototype.init = function (props) {
    this.RGBA = [1, 1, 1, 1];
    this.super(props);
};

ColorPicker.prototype._update = function () {
    //update vs
    var rgba = Color.hsbaToRGBA([this.hue, 1, 1, 1]);
    this.$color.addStyle('background', 'rgba(' + rgba.map((x, i) => i < 3 ? x * 255 : x).join(',') + ')');
    rgba = Color.hsbaToRGBA([this.hue, this.saturation, this.brightness, this.alpha]);
    this.$textContainer.addStyle('background', 'rgba(' + rgba.map((x, i) => i < 3 ? x * 255 : x).join(',') + ')');
    this.$textContainer.addStyle('color', this._getTextColorCode());
    this._updateColorText();
};


ColorPicker.prototype._updateColorText = function () {
    var hsba = [this.hue, this.saturation, this.brightness, this.alpha];
    var mode = this.mode;
    this.$fMode.innerHTML = mode.toLocaleLowerCase() + '(';
    if (mode.match(/^H/)) {
        this.$sep0.innerHTML = 'deg, ';
        this.$sep1.innerHTML = '%, ';
        if (mode.match(/A$/)) {
            this.$sep2.innerHTML = "%, ";
            this.$num3.removeStyle('display');

        }
        else {
            this.$sep2.innerHTML = "%";
            this.$num3.addStyle('display', 'none');

        }
    }
    else {
        this.$sep0.innerHTML = ', ';
        this.$sep1.innerHTML = ', ';
        if (mode.match(/A$/)) {
            this.$sep2.innerHTML = ", ";
            this.$num3.removeStyle('display');

        }
        else {
            this.$num3.addStyle('display', 'none');
            this.$sep2.innerHTML = "";
        }

    }
    if (mode.match(/HSB/)) {
        this.$num0.text = '' + Math.round(hsba[0] * 360);
        this.$num1.text = '' + Math.round(hsba[1] * 100);
        this.$num2.text = '' + Math.round(hsba[2] * 100);
        this.$num3.text = hsba[3].toFixed(3);
    }
    else {
        var cBytes = Color['hsbaTo' + (mode.match(/A$/) ? mode : mode + 'A')](hsba);
        if (mode.match(/^H/)) {
            this.$num0.text = '' + Math.round(cBytes[0] * 360);
            this.$num1.text = '' + Math.round(cBytes[1] * 100);
            this.$num2.text = '' + Math.round(cBytes[2] * 100);
            this.$num3.text = hsba[3].toFixed(3);
        }
        else {
            this.$num0.text = '' + Math.round(cBytes[0] * 255);
            this.$num1.text = '' + Math.round(cBytes[1] * 255);
            this.$num2.text = '' + Math.round(cBytes[2] * 255);
            this.$num3.text = hsba[3].toFixed(3);
        }
        // var tempMode = mode.indexOf('A') < 0 ? mode + 'A' : mode;
        // var tempColor = Color['hsbaTo' + tempMode](hsba);
        // this.$textContainer.value = Color[mode.toLocaleLowerCase() + 'ToText'](tempColor);
    }
};

ColorPicker.eventHandler = {};

ColorPicker.eventHandler.colorPointerDown = function (event) {
    var newSV = this._getSVOfEvent(event);
    this.saturation = newSV.s;
    this.brightness = newSV.b;

    absol.$(document.body)
        .on('pointermove', this.eventHandler.colorPointerMove)
        .on('pointerup', this.eventHandler.colorPointerFinish)
        .on('pointerleave', this.eventHandler.colorPointerFinish);
    this.emit('change', { target: this, originEvent: event, value: this.value });
};

ColorPicker.eventHandler.colorPointerFinish = function (event) {
    absol.$(document.body)
        .off('pointermove', this.eventHandler.colorPointerMove)
        .off('pointerup', this.eventHandler.colorPointerFinish)
        .off('pointerleave', this.eventHandler.colorPointerFinish);
};

ColorPicker.eventHandler.colorPointerMove = function (event) {
    var newSV = this._getSVOfEvent(event);
    this.saturation = newSV.s;
    this.brightness = newSV.b;
    event.preventDefault();
    this.emit('change', { target: this, originEvent: event, value: this.value });
};



ColorPicker.eventHandler.huePointerDown = function (event) {
    var newH = this._getHOfEvent(event);
    this.hue = newH;
    event.preventDefault();
    absol.$(document.body)
        .on('pointermove', this.eventHandler.huePointerMove)
        .on('pointerup', this.eventHandler.huePointerFinish)
        .on('pointerleave', this.eventHandler.huePointerFinish);
    this.emit('change', { target: this, originEvent: event, value: this.value });
};

ColorPicker.eventHandler.huePointerFinish = function (event) {
    absol.$(document.body)
        .off('pointermove', this.eventHandler.huePointerMove)
        .off('pointerup', this.eventHandler.huePointerFinish)
        .off('pointerleave', this.eventHandler.huePointerFinish);
    event.preventDefault();

};

ColorPicker.eventHandler.huePointerMove = function (event) {
    var newH = this._getHOfEvent(event);
    this.hue = newH;
    event.preventDefault();
    this.emit('change', { target: this, originEvent: event, value: this.value });
};



ColorPicker.eventHandler.alphaPointerDown = function (event) {
    var newA = this._getAOfEvent(event);
    this.alpha = newA;

    absol.$(document.body)
        .on('pointermove', this.eventHandler.alphaPointerMove)
        .on('pointerup', this.eventHandler.alphaPointerFinish)
        .on('pointerleave', this.eventHandler.alphaPointerFinish);
    event.preventDefault();
    this.emit('change', { target: this, originEvent: event, value: this.value });
};

ColorPicker.eventHandler.alphaPointerFinish = function (event) {
    absol.$(document.body)
        .off('pointermove', this.eventHandler.alphaPointerMove)
        .off('pointerup', this.eventHandler.alphaPointerFinish)
        .off('pointerleave', this.eventHandler.alphaPointerFinish);
    event.preventDefault();
};

ColorPicker.eventHandler.alphaPointerMove = function (event) {
    var newA = this._getAOfEvent(event);
    this.alpha = newA;
    event.preventDefault();
    this.emit('change', { target: this, originEvent: event, value: this.value });
};

ColorPicker.eventHandler.modeClick = function (event) {
    this.mode = this.switchMode[this.mode];
    event.preventDefault();
};


ColorPicker.eventHandler.inputBlur = function () {
    var mode = this.mode;
    var alpha = 1;
    if (mode.match(/A$/)) {
        alpha = parseFloat(this.$num3.text);
    }
    var bytes;
    if (mode.match(/^H/)) {
        bytes = [parseFloat(this.$num0.text) / 360, parseFloat(this.$num1.text) / 100, parseFloat(this.$num2.text) / 100, alpha];
    }
    else if (mode.match(/^RGB/)) {
        bytes = [parseFloat(this.$num0.text) / 255, parseFloat(this.$num1.text) / 255, parseFloat(this.$num2.text) / 255, alpha];
    }

    var hsba = mode.match(/^HSB/) ? bytes : Color[(mode.match(/A$/) ? mode.toLocaleLowerCase() : mode.toLocaleLowerCase() + 'a') + 'ToHSBA'](bytes);
    this.hue = hsba[0];
    this.saturation = hsba[1];
    this.brightness = hsba[2];
    this.alpha = hsba[3];
};

CPCore.creator.colorpicker = ColorPicker;

export default ColorPicker;