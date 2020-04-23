import CPCore from "./CPCore";
import { MoqupsClassicSwathes, iOsSwatches, MaterialSwatches, BootstrapSwatches } from "./SwatchesTable";
import QuickMenu from "absol-acomp/js/QuickMenu";
import Color from "absol/src/Color/Color";
import Draggable from "absol-acomp/js/Draggable";
var _ = CPCore._;
var $ = CPCore.$;

function SolidColorPicker() {
    this.on('keydown', this.eventHandler.keydown);
    this.$swatchesName = $('.as-solid-color-picker-swatches-name', this);
    var thisSP = this;
    this._lastEmitHex8 = '';
    this._rgb = 'ff0000';
    this._opatictyPercent = 100;
    this._value = new Color([1, 0, 0, 1]);
    this._hue = 0;
    this._sat = 1;
    this._brightness = 1;
    this._swatchesNames = ['Moqups Classic', 'Material Design', 'Bootstrap', 'iOS'];
    this._swatchesShortName = ['moqups', 'material', 'bootstrap', 'ios'];
    this._swatchesIcons = ['span.mdi.mdi-palette', 'span.mdi.mdi-material-design', 'span.mdi.mdi-bootstrap', 'span.mdi.mdi-apple-ios'];

    this._swatchesData = [MoqupsClassicSwathes, MaterialSwatches, BootstrapSwatches, iOsSwatches];

    this._mode = 'swatches';
    this.$mode = $('.as-solid-color-picker-mode', this)
        .on('change', this.eventHandler.modeChange);

    /**
     * @type {import('absol-acomp/js/BScroller').default}
     */
    this.$swatchesTableCtn = $('.as-solid-color-picker-swatches-ctn', this);

    /**
     * @type {import('./SwatchesTable').default}
     */
    this.$swatchesTable = $('.as-solid-color-picker-swatches-ctn swatchestable', this)
        .on('presscell', this.eventHandler.swatchesPressCell);
    this.$recentSwatchesTable = $('.as-solid-color-picker-recent-swatches-ctn swatchestable', this)
        .on('presscell', this.eventHandler.swatchesPressCell);

    this.$selectedDot = _('.as-solid-color-picker-selected-dot');
    QuickMenu.toggleWhenClick(this.$swatchesName, {
        anchor: [1, 6],
        getMenuProps: function () {
            return {
                extendClasses: 'as-solid-color-picker-swatches-name-menu',
                extendStyle: {
                    'font-size': thisSP.getComputedStyleValue('font-size')
                },
                items: thisSP._swatchesNames.map(function (name, i) {
                    return { text: name, value: thisSP._swatchesShortName[i], icon: thisSP._swatchesIcons[i] };
                })
            }
        },
        onSelect: function (item) {
            thisSP.swatches = item.value;
        }
    });

    this.$attachhook = _('attachhook').on('error', this.eventHandler.attached);

    this.$hex = $('.as-solid-color-picker-color-hex', this)
        .on('keyup', this.eventHandler.hexKeyup)
        .on('change', this.eventHandler.hexChange);
    this.$opacity = $('.as-solid-color-picker-color-opacity', this)
        .on('change', this.eventHandler.opacityChange)
        .on('keyup', this.eventHandler.opacityKeyUp);
    this.$selected = $('.as-solid-color-picker-selected', this);

    this.$spectrum = Draggable($('.as-solid-color-picker-spectrum', this))
        .on('predrag', this.eventHandler.spectrumDrag)
        .on('drag', this.eventHandler.spectrumDrag);
    this.$spectrumDot = $('.as-solid-color-picker-spectrum-dot', this);

    this.$alpha = Draggable($('.as-solid-color-picker-alpha', this))
        .on('predrag', this.eventHandler.alphaDrag)
        .on('drag', this.eventHandler.alphaDrag);
    this.$alphaDot = $('.as-solid-color-picker-alpha-dot', this);

    this.$hue = Draggable($('.as-solid-color-picker-hue', this))
        .on('predrag', this.eventHandler.hueDrag)
        .on('drag', this.eventHandler.hueDrag);
    this.$hueDot = $('.as-solid-color-picker-hue-dot', this);
    this.$near = $('.as-solid-color-picker-near', this)
        .on('presscell', this.eventHandler.nearPressCell);

    this.$submitBtn = $('.as-solid-color-picker-submit-btn', this)
        .on('click', this.notifySubmit.bind(this));
    this._updateNear();
};

SolidColorPicker.render = function () {
    return _({
        attr: {
            tabindex: '1'
        },
        extendEvent: ['change', 'sizechange', 'submit'],
        class: ['as-solid-color-picker', 'as-solid-color-picker-mode-swatches'],
        child: [
            {
                class: 'as-solid-color-picker-header',
                child: [
                    {
                        class: 'as-solid-color-picker-mode-ctn',
                        child: {
                            tag: 'buttonarray',
                            class: 'as-solid-color-picker-mode',
                            props: {
                                items: [
                                    { text: 'SWATCHES', value: 'swatches' },
                                    { text: 'PICKER', value: 'picker' },
                                ]
                            }
                        }
                    },
                ]
            },
            {
                class: 'as-solid-color-picker-body',
                child: [
                    {
                        class: ['as-solid-color-picker-swatches-select-ctn',],
                        child: [
                            {
                                tag: 'span',
                                child: {
                                    text: 'Color Scheme: '
                                }
                            },
                            {
                                class: 'as-solid-color-picker-swatches-name',
                                tag: 'a',
                                child: { text: 'Moqups Classic' }
                            },
                            'span.mdi.mdi-menu-down'
                        ]
                    },
                    {
                        tag: 'bscroller',
                        class: ['as-solid-color-picker-swatches-ctn'],
                        child: {
                            tag: 'swatchestable',
                            props: {
                                data: MoqupsClassicSwathes
                            }
                        }
                    },
                    {
                        tag: 'spectrumcolor',
                        class: 'as-solid-color-picker-spectrum',
                        child: '.as-solid-color-picker-spectrum-dot'
                    },
                    {
                        class: 'as-solid-color-picker-hue',
                        child: '.as-solid-color-picker-hue-dot'
                    },
                    {
                        class: 'as-solid-color-picker-alpha',
                        child: [
                            '.as-solid-color-picker-alpha-color',
                            '.as-solid-color-picker-alpha-dot',
                        ]
                    },
                    {
                        tag: 'swatchestable',
                        class: 'as-solid-color-picker-near'
                    },
                    {
                        class: 'as-solid-color-picker-recent-title',
                        child: { text: 'RECENT COLOR' }
                    },
                    {
                        class: ['as-solid-color-picker-recent-swatches-ctn'],
                        child: {
                            tag: 'swatchestable',
                            props: {
                                data: MoqupsClassicSwathes.slice(0, 2)
                            }
                        }
                    }
                ]
            },
            {
                class: 'as-solid-color-picker-footer',
                child: [
                    {
                        class: 'as-solid-color-picker-selected-ctn',
                        child: {
                            class: 'as-solid-color-picker-selected',
                            style: {
                                'background-color': '#ffffffff'
                            }
                        }
                    },
                    {
                        tag: 'flexiconinput',
                        class: 'as-solid-color-picker-color-hex',
                        props: {
                            value: 'ffffff',
                            icon: '<svg viewBox="0 0 64 64" id="mq-icon-hex"><path d="M60 24v-6H46V4h-6v14H24V4h-6v14H4v6h14v16H4v6h14v14h6V46h16v14h6V46h14v-6H46V24h14zM40 40H24V24h16v16z"></path></svg>'
                        }
                    },
                    {
                        tag: 'flexiconinput',
                        class: 'as-solid-color-picker-color-opacity',
                        props: {
                            icon: 'span.mdi.mdi-opacity',
                            unit: '%',
                            value: 100
                        }
                    },
                    {
                        tag: 'flexiconbutton',
                        class: 'as-solid-color-picker-submit-btn',
                        props: {
                            icon: 'span.mdi.mdi-check-bold'
                        }
                    }

                ]
            }
        ]
    });
};

SolidColorPicker._settingKey = "absol_solid_color_setting";

//only Hex6
SolidColorPicker.setting = {
    recentColors: ['#ffffff', '#00ffff', '#0000ff', '#ffffff', '#000000']
};

SolidColorPicker._loadSetting = function () {
    var setting = localStorage.getItem(SolidColorPicker._settingKey);
    try {
        setting = JSON.parse(setting);
    }
    catch (e) {
        setting = {};
    }
    if (setting) {
        Object.assign(SolidColorPicker.setting, setting);
    }
};

SolidColorPicker._loadSetting();

SolidColorPicker._writeSetting = function () {
    localStorage.setItem(SolidColorPicker._settingKey, JSON.stringify(SolidColorPicker.setting));
    SolidColorPicker.updateInstancesSetting();
};

SolidColorPicker.pushInstances = function (elt) {
    var instances = SolidColorPicker.$instances;
    var aliveInstance = [];
    var instance;
    var found = false;
    while (instances.length > 0) {
        instance = instances.pop();
        if (instance.isDescendantOf(document.body)) {
            aliveInstance.push(instance);
        };
        if (instance == elt) found = true;
    }
    while (aliveInstance.length > 0) {
        instances.push(aliveInstance.pop());
    }
    if (!found) {
        instances.push(elt);
    }
};

SolidColorPicker.updateInstancesSetting = function () {
    var instances = SolidColorPicker.$instances;
    var aliveInstance = [];
    var instance;
    while (instances.length > 0) {
        instance = instances.pop();
        if (instance.isDescendantOf(document.body)) {
            aliveInstance.push(instance);
        };
    }
    while (aliveInstance.length > 0) {
        instance = aliveInstance.pop();
        instances.push(instance);
        instance.reloadSetting();
    }
};

SolidColorPicker.$instances = [];

/**
 * @param {Color} color
 */
SolidColorPicker.pushColorHistory = function (color) {
    var hex6Color = color.toString('hex6');
    var recentColors = SolidColorPicker.setting.recentColors;
    var index = recentColors.indexOf(hex6Color);
    if (index >= 0) {
        recentColors.splice(index, 1);
    }
    recentColors.unshift(hex6Color);
    while (recentColors.length > 24) recentColors.pop();
    setTimeout(SolidColorPicker._writeSetting.bind(SolidColorPicker), 1)
};


SolidColorPicker.prototype.reloadSetting = function () {
    var recentColors = SolidColorPicker.setting.recentColors.slice();
    var swatches = [];
    while (recentColors.length > 0) {
        swatches.push(recentColors.splice(0, 12));
    }
    this.$recentSwatchesTable.data = swatches;
    this._autoAdDotToCell();
};

SolidColorPicker.prototype._addDotToCell = function (cell, cellColor) {
    var shadowColor = cellColor.getContrastYIQ();
    shadowColor.rgba[3] = 0.7;
    this.$selectedDot.addStyle('box-shadow', 'inset 0px 0px 0.3em 0.125em ' + shadowColor.toString());
    cell.addChild(this.$selectedDot);
};

SolidColorPicker.prototype._autoAdDotToCell = function () {
    this.$selectedDot.remove();
    var cell = this.$swatchesTable.getCell('#' + this._rgb);
    if (cell) {
        this._addDotToCell(cell, this._value);
        this.$swatchesTableCtn.scrollInto(cell);
    }
    else {
        cell = this.$recentSwatchesTable.getCell('#' + this._rgb);
        if (cell) {
            this._addDotToCell(cell, this._value);
            this.$swatchesTableCtn.scrollInto(cell);
        }
    }
};


/**
 * Need to call first
 * @param {Color} color
 */
SolidColorPicker.prototype._setValue = function (color) {
    this._value = color;
    this.$selected.addStyle('background-color', color.toString());
    this._updateNear();
};

SolidColorPicker.prototype._setRGB = function (rgb) {
    this._rgb = rgb;
    this.$hex.value = this._rgb;
    this.$selectedDot.remove();
    this._autoAdDotToCell();
};

SolidColorPicker.prototype._setOpacityPercent = function (opacity) {
    this._opatictyPercent = opacity;
    this.$opacity.value = opacity;
    this._updateOpacityPercent();
};

SolidColorPicker.prototype._updateOpacityPercent = function () {
    this.$alphaDot.addStyle('left', 'calc(' + this._opatictyPercent + '% - 0.5em)');
};

SolidColorPicker.prototype._setHue = function (hue) {
    this._hue = hue;
    var spectrumColor = Color.fromHSB(hue / 360, 1, 1);
    var hueDotColor = spectrumColor.getContrastYIQ();
    hueDotColor.rgba[3] = 0.7;
    this.$hueDot.addStyle({
        'box-shadow': 'inset 0px 0px 0.3em 0.125em ' + hueDotColor.toString(),
        left: 'calc(' + (hue / 3.6) + '% - 0.5em)'
    })
    this.$spectrum.addStyle('background-color', spectrumColor.toString());
    this._updateSpectrumDot();
};

SolidColorPicker.prototype._setSatBrightness = function (sat, brightness) {
    this._sat = sat;
    this._brightness = brightness;
    this._updateSpectrumDot();
};

SolidColorPicker.prototype._updateSpectrumDot = function () {
    var dotColor = this._value.getContrastYIQ();
    dotColor.rgba[3] = 0.7;
    this.$spectrumDot.addStyle({
        bottom: 'calc(' + this._brightness + '% - 0.5em)',
        left: 'calc(' + this._sat + '% - 0.5em)',
        'box-shadow': 'inset 0px 0px 0.3em 0.125em ' + dotColor.toString()
    });
};


SolidColorPicker.prototype._updateNear = function () {
    var hsba = Color.rgbaToHSBA(this._value.rgba);
    var sat = hsba[1];
    var hue = hsba[0];
    var brightness = hsba[2];

    var whiterColors = Array(7).fill(null).map(function (u, i) {
        return Color.fromHSB(hue, sat * (7 - i) / 8, brightness);
    });
    var darkerColors = Array(7).fill(null).map(function (u, i) {
        return Color.fromHSB(hue, sat, brightness * (7 - i) / 8);
    });

    var hueNearColors = [-5, -3, -2, 1, 2, 3, 5].map(function (u) {
        var nHue = hue + u / 40;
        if (nHue > 1) nHue -= 1;
        else if (nHue < 0) nHue += 1;

        return Color.fromHSB(nHue, sat, brightness);
    });

    this.$near.data = [whiterColors, darkerColors, hueNearColors];
};

SolidColorPicker.prototype.notifyCanBeChanged = function () {
    var cHex8 = this._value.toHex8();
    if (cHex8 != this._lastEmitHex8) {
        this._lastEmitHex8 = cHex8;
        this.notifyChange();
    }
};

SolidColorPicker.prototype.notifyChange = function () {
    this.emit('change', { target: this, value: this.value, type: 'change' }, this);
};

SolidColorPicker.prototype.notifySizeCanBeChanged = function () {
    var bound = this.getBoundingClientRect();
    if (!this._lastSize || this._lastSize.width != bound.width || this._lastSize.height != bound.height) {
        this._lastSize = { width: bound.width, height: bound.height };
        this.notifySizeChange();
    }
};

SolidColorPicker.prototype.notifySizeChange = function () {
    this.emit('sizechange', { target: this, size: this._lastSize, type: 'sizechange' }, this);
};

SolidColorPicker.prototype.notifySubmit = function () {
    SolidColorPicker.pushColorHistory(this._value);
    this.emit('submit', { target: this, value: this._value, type: 'submit' }, this);
};


SolidColorPicker.property = {};


/**
 * @type {SolidColorPicker}
 */
SolidColorPicker.property.value = {
    /**
     * 
     * @param {Color} value 
     */
    set: function (value) {
        value = value || 'transparent';
        if (!value.toHex8) {
            try {
                value = Color.parse(value + '');
            } catch (e) {
                value = new Color([0, 0, 0, 0]);
            }
        }
        this._lastEmitHex8 = value.toHex8();
        this._setValue(value);
        this._setRGB(value.toHex6());
        this._setOpacityPercent(Math.round(value.rgba[3] * 100));

        var hsba = Color.rgbaToHSBA(value.rgba);
        this._setHue(hsba[0] * 360);
        this._setSatBrightness(hsba[1] * 100, hsba[2] * 100);
        this._updateNear();
    },
    get: function () {
        return this._value;
    }
};

/**
 * @type {SolidColorPicker}
 */
SolidColorPicker.property.swatches = {
    set: function (value) {
        var index = this._swatchesShortName.indexOf(value);
        index = Math.max(index, 0);
        value = this._swatchesShortName[index];

        if (this._swatches != value) {
            this._swatches = value;
            this.$swatchesTable.data = this._swatchesData[index];
            this.$swatchesName.childNodes[0].data = this._swatchesNames[index];
        }
        this._autoAdDotToCell();
    },
    get: function () {
        return this._swatches;
    }
};

SolidColorPicker.property.mode = {
    set: function (value) {
        if (value == this._mode) return;
        this.removeClass('as-solid-color-picker-mode-' + this._mode);
        this._mode = value + '';
        this.addClass('as-solid-color-picker-mode-' + this._mode);
        this.$mode.value = this._mode;
        this.notifySizeCanBeChanged();
    },
    get: function () {
        return this._mode;
    }
};




/**
 * @type {SolidColorPicker}
 */
SolidColorPicker.eventHandler = {};

SolidColorPicker.eventHandler.attached = function () {
    SolidColorPicker.pushInstances(this);
    this.reloadSetting();
};

SolidColorPicker.eventHandler.modeChange = function () {
    var value = this.$mode.value;
    if (value == this._mode) return;
    this.removeClass('as-solid-color-picker-mode-' + this._mode);
    this._mode = value + '';
    this.addClass('as-solid-color-picker-mode-' + this._mode);
    this.$mode.value = this._mode;
    this.notifySizeCanBeChanged();
};

SolidColorPicker.eventHandler.swatchesPressCell = function (event) {
    try {
        var value = Color.parse(event.value + '');
        value.rgba[3] = this._opatictyPercent / 100;
        this._setValue(value);
        this._addDotToCell(event.cellElt, value);
        this._rgb = value.toHex6();
        this.$hex.value = this._rgb;

        var hsba = Color.rgbaToHSBA(value.rgba);
        this._setHue(hsba[0] * 360);
        this._setSatBrightness(hsba[1] * 100, hsba[2] * 100);
    }
    catch (e) {
        this.$selectedDot.removeStyle('box-shadow');
        this.$hex.value = 'ffffff';
    }
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.nearPressCell = function (event) {
    try {
        var value = Color.parse(event.value + '');
        value.rgba[3] = this._opatictyPercent / 100;
        this._setValue(value);
        this._setRGB(value.toHex6());

        var hsba = Color.rgbaToHSBA(value.rgba);
        this._setHue(hsba[0] * 360);
        this._setSatBrightness(hsba[1] * 100, hsba[2] * 100);
    }
    catch (e) {
        this.$selectedDot.removeStyle('box-shadow');
        this.$hex.value = 'ffffff';
    }
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.hexKeyup = function () {
    try {
        var value = Color.parse('#' + this.$hex.value.trim());
        if (value.rgba[3] == 1) {
            value.rgba[3] = this._opatictyPercent / 100;
            this._setValue(value);
            this._rgb = value.toHex6();
            this._autoAdDotToCell();

            var hsba = Color.rgbaToHSBA(value.rgba);
            this._setHue(hsba[0] * 360);
            this._setSatBrightness(hsba[1] * 100, hsba[2] * 100);
            this.notifyCanBeChanged();
        }
    }
    catch (e) {
    }
};


SolidColorPicker.eventHandler.hexChange = function () {
    if (this.$hex.value != this._rgb)
        this.$hex.value = this._rgb;
};


SolidColorPicker.eventHandler.opacityKeyUp = function () {
    var opacity = parseFloat(this.$opacity.value);
    if (!isNaN(opacity)) {
        opacity = Math.round(Math.max(0, Math.min(opacity, 100)));
        this._opatictyPercent = opacity;
        var color = Color.parse('#' + this._rgb);
        color.rgba[3] = opacity / 100;
        this._setValue(color);
        this._updateOpacityPercent();
        this.notifyCanBeChanged();
    }
};

SolidColorPicker.eventHandler.opacityChange = function () {
    var opacity = this._opatictyPercent;
    if (this.$opacity.value != opacity) {
        this.$opacity.value = opacity + '';
    }
};

SolidColorPicker.eventHandler.alphaDrag = function (event) {
    var aBound = this.$alpha.getBoundingClientRect();
    var opacity = (event.clientX - aBound.left) * 100 / aBound.width;
    opacity = Math.max(0, Math.min(100, Math.round(opacity)));
    var color = Color.parse('#' + this._rgb);
    color.rgba[3] = opacity / 100;
    this._setValue(color);
    this._setOpacityPercent(opacity);
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.hueDrag = function (event) {
    var hBound = this.$hue.getBoundingClientRect();
    var hue = (event.clientX - hBound.left) * 360 / hBound.width;
    hue = Math.max(0, Math.min(360, Math.round(hue)));
    var value = Color.fromHSBA(hue / 360, this._sat / 100, this._brightness / 100, this._opatictyPercent / 100);
    this._setValue(value);
    this._setHue(hue);
    this._setRGB(value.toHex6());
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.spectrumDrag = function (event) {
    var sBound = this.$spectrum.getBoundingClientRect();
    var brightness = (sBound.bottom - event.clientY) * 100 / sBound.height;
    brightness = Math.max(0, Math.min(100, Math.round(brightness)));
    var sat = (event.clientX - sBound.left) * 100 / sBound.width;
    sat = Math.max(0, Math.min(100, Math.round(sat)));
    var value = Color.fromHSBA(this._hue / 360, sat / 100, brightness / 100, this._opatictyPercent / 100);
    this._setValue(value);
    this._setSatBrightness(sat, brightness);
    this._setRGB(value.toHex6());
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.keydown = function (event) {
    if (event.key == 'Enter') {
        event.preventDefault();
        event.target.blur();
        this.notifySubmit();
    }
};

CPCore.install('solidcolorpicker', SolidColorPicker);

export default SolidColorPicker;