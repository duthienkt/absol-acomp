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
            <span>hsb(</span>
            <span class="absol-editabe-text num0">0</span><span class="separator0">deg, </span>
            <span class="absol-editabe-text num1">0</span><span class="separator1">, </span>
            <span class="absol-editabe-text num2">0</span><span class="separator02">, </span>
            <span class="absol-editabe-text num3">0</span><span class="separator3">)</span>
        </div>`,
        '    </div>',
        '    <button class="absol-color-picker-mode">HSB</button>',
        '</div>'].join('')
    );

    function onNumClick(event){
        this.edit(true, true);
    };

    res.$num0 = _('editabletext.num0').on('click', onNumClick).on('keydown', function(event){
        if (!event.key.match(/^[0-9]|Backspace|Enter$/)){
            event.preventDefault();
        }
    });
    res.$num1 = _('editabletext.num1').on('click', onNumClick);
    res.$num2 = _('editabletext.num2').on('click', onNumClick);
    res.$num3 = _('editabletext.num3').on('click', onNumClick);
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
    return res;
}

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
        }
        if (/^(HSB|HSL|RGB|RGBA|HSBA|HSLA)$/) {
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
    if (mode.match(/HSB/)) {
        this.$textContainer.value = Color[mode.toLocaleLowerCase() + 'ToText'](hsba);
    }
    else {
        var tempMode = mode.indexOf('A') < 0 ? mode + 'A' : mode;
        var tempColor = Color['hsbaTo' + tempMode](hsba);
        this.$textContainer.value = Color[mode.toLocaleLowerCase() + 'ToText'](tempColor);
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
    this.emit('change', { target: this });
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
    this.emit('change');

};



ColorPicker.eventHandler.huePointerDown = function (event) {
    var newH = this._getHOfEvent(event);
    this.hue = newH;
    event.preventDefault();
    absol.$(document.body)
        .on('pointermove', this.eventHandler.huePointerMove)
        .on('pointerup', this.eventHandler.huePointerFinish)
        .on('pointerleave', this.eventHandler.huePointerFinish);
    this.emit('change');
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
    this.emit('change');
};



ColorPicker.eventHandler.alphaPointerDown = function (event) {
    var newA = this._getAOfEvent(event);
    this.alpha = newA;


    absol.$(document.body)
        .on('pointermove', this.eventHandler.alphaPointerMove)
        .on('pointerup', this.eventHandler.alphaPointerFinish)
        .on('pointerleave', this.eventHandler.alphaPointerFinish);
    event.preventDefault();
    this.emit('change');
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
    this.emit('change');

};

ColorPicker.eventHandler.modeClick = function (event) {
    this.mode = this.switchMode[this.mode];
    event.preventDefault();
};



CPCore.creator.colorpicker = ColorPicker;

export default ColorPicker;