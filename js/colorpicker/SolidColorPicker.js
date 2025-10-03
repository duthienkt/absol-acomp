import { MoqupsClassicSwathes, iOsSwatches, MaterialSwatches, BootstrapSwatches, ColorCell } from "./SwatchesTable";
import Color from "absol/src/Color/Color";
import ACore, { _, $ } from "../../ACore";
import QuickMenu from "../QuickMenu";
import '../../css/solidcolorpicker.css';
import SpectrumColor from "./SpectrumColor";
import OOP from "absol/src/HTML5/OOP";
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import { base64EncodeUnicode } from "absol/src/Converter/base64";
import red_cross_tpl from '../../assets/icon/red_cross.tpl';
import { isRealNumber } from "../utils";

/**
 * @extends AElement
 * @constructor
 */
function SolidColorPicker() {
    if (!SolidColorPicker.css) {
        SolidColorPicker.css = new DynamicCSS()
            .setProperty('.as-color-cell.as-solid-color-picker-selected.as-null .as-color-cell-value',
                'background-image',
                `url("data:image/svg+xml;base64,${base64EncodeUnicode(red_cross_tpl.replace(/\$width/g, '58').replace(/\$height/g, '22'))}")`)
            .commit();
    }
    this.swatchMode = new SCPSWatchMode(this);
    this.pickerMode = new SCPPickerMode(this);
    this.modes = [this.swatchMode, this.pickerMode];
    this.modeCtrl = new SCPSWatchModeController(this);
    OOP.drillProperty(this, this.modeCtrl, 'mode');


    this.footerCtrl = new SCPFooterController(this);
    this.$opacity = this.footerCtrl.$opacity;
    this.$hex = this.footerCtrl.$hex;
    this.$selected = this.footerCtrl.$selected;

    this.historyCtrl = new SCPHistoryController(this);
    this.$swatchesName = this.modeCtrl.$swatchesName;

    this.on('keydown', this.eventHandler.keydown);
    this._lastEmitHex8 = '';
    this.rawValue = new Color([1, 0, 0, 1]);

    this._swatchesNames = ['Material Design', 'Moqups Classic', 'Bootstrap', 'iOS'];
    this._swatchesShortName = ['material', 'moqups', 'bootstrap', 'ios'];
    this._swatchesIcons = ['span.mdi.mdi-palette', 'span.mdi.mdi-material-design', 'span.mdi.mdi-bootstrap', 'span.mdi.mdi-apple-ios'];

    this._swatchesData = [MaterialSwatches, MoqupsClassicSwathes, BootstrapSwatches, iOsSwatches];


    /**
     * @type {import('absol-acomp/js/BScroller').default}
     */
    this.$swatchesTableCtn = this.swatchMode.$swatchesTableCtn;
    this.$selectedDot = _('.as-solid-color-picker-selected-dot');//share

    /**
     * @type {import('./SwatchesTable').default}
     */
    this.$swatchesTable = this.swatchMode.$swatchesTable;

    this.$recentSwatchesTable = this.historyCtrl.$recentSwatchesTable;


    this.$attachhook = _('attachhook')
        .on('attached', this.eventHandler.attached).addTo(this);


    this.$spectrum = this.pickerMode.$spectrum;
    this.$spectrumDot = this.pickerMode.$spectrumDot;

    this.$alpha = this.pickerMode.$alpha;


    this.$submitBtn = $('.as-solid-color-picker-submit-btn', this)
        .on('click', this.notifySubmit.bind(this));


    /**
     * @name hasOpacity
     * @type {boolean}
     * @memberof SolidColorPicker#
     */


    /**
     * @name nullable
     * @type {boolean}
     * @memberof SolidColorPicker#
     */


    /**
     * @name value
     * @type {Color|null}
     * @memberof SolidColorPicker#
     */

    /**
     * @name hex8Value
     * @type {string}
     * @memberof SolidColorPicker#
     */
}


SolidColorPicker.tag = 'SolidColorPicker'.toLowerCase();

SolidColorPicker.render = function () {
    return _({
        attr: {
            tabindex: '1'
        },
        extendEvent: ['change', 'sizechange', 'submit'],
        class: ['as-solid-color-picker', 'as-has-opacity'],
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
                        class: ['as-solid-color-picker-swatches-select-ctn'],
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
                                child: { text: 'Material Design' }
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
                                data: MaterialSwatches
                            }
                        }
                    },
                    {
                        tag: SpectrumColor,
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
                        class: 'as-solid-color-picker-none-ctn',
                        child: [
                            {
                                tag: ColorCell,
                                class: 'as-solid-color-picker-none-cell',
                                props: {
                                    value: null
                                }
                            },
                            {
                                child: { text: 'None' }
                            }
                        ]
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
                        tag: ColorCell,
                        class: 'as-solid-color-picker-selected'
                    },
                    {
                        tag: 'flexiconinput',
                        class: 'as-solid-color-picker-color-hex',
                        style:{
                            size: 'small'
                        },
                        props: {
                            value: 'ffffff',
                            icon: '<svg viewBox="0 0 64 64" id="mq-icon-hex"><path d="M60 24v-6H46V4h-6v14H24V4h-6v14H4v6h14v16H4v6h14v14h6V46h16v14h6V46h14v-6H46V24h14zM40 40H24V24h16v16z"></path></svg>'
                        }
                    },
                    {
                        tag: 'flexiconinput',
                        class: 'as-solid-color-picker-color-opacity',
                        style:{
                            size: 'small'
                        },
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
    } catch (e) {
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
        }
        if (instance === elt) found = true;
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
        }
    }
    while (aliveInstance.length > 0) {
        instance = aliveInstance.pop();
        instances.push(instance);
        instance.reloadSetting();
    }
};

SolidColorPicker.$instances = [];

SolidColorPicker.css = null;

/**
 * @param {Color} color
 */
SolidColorPicker.pushColorHistory = function (color) {
    if (!color) return;
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
    this.swatchMode.viewValue();
};


SolidColorPicker.prototype.notifyCanBeChanged = function () {
    var cHex8 = this.hex8Value;
    if (cHex8 !== this._lastEmitHex8) {
        this._lastEmitHex8 = cHex8;
        this.notifyChange();
    }
};

SolidColorPicker.prototype.notifyChange = function () {
    this.emit('change', { target: this, value: this.value, type: 'change' }, this);
};

SolidColorPicker.prototype.notifySizeCanBeChanged = function () {
    var bound = this.getBoundingClientRect();
    if (!this._lastSize || this._lastSize.width !== bound.width || this._lastSize.height !== bound.height) {
        this._lastSize = { width: bound.width, height: bound.height };
        this.notifySizeChange();
    }
};

SolidColorPicker.prototype.notifySizeChange = function () {
    this.emit('sizechange', { target: this, size: this._lastSize, type: 'sizechange' }, this);
};

SolidColorPicker.prototype.notifySubmit = function () {
    SolidColorPicker.pushColorHistory(this.rawValue);
    this.emit('submit', { target: this, value: this.rawValue, type: 'submit' }, this);
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
        value = value || null;
        if (value && !value.toHex8) {//is
            try {
                value = Color.parse(value + '');
            } catch (e) {
                value = new Color([0, 0, 0, 0]);
            }
        }
        this.rawValue = value;
        this._lastEmitHex8 = this.hex8Value;

        this.footerCtrl.viewValue();
        this.pickerMode.viewValue();
        this.swatchMode.viewValue();
    },
    get: function () {
        var nullable = this.nullable;
        var hasOpacity = this.hasOpacity;
        var value = this.rawValue || null;//
        if (!nullable && !value) value = new Color([0, 0, 0, 0]);
        if (!hasOpacity && value) value.rgba[3] = 1;
        return value;
    }
};

SolidColorPicker.property.hex8Value = {
    get: function () {
        var value = this.value;
        if (value) return value.toHex8();
        return 'null';
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
        this.swatchMode.viewValue();
    },
    get: function () {
        return this._swatches;
    }
};


SolidColorPicker.property.nullable = {
    set: function (value) {
        if (value) {
            this.addClass('as-nullable');
        }
        else {
            this.removeClass('as-nullable');
        }
        this.footerCtrl.viewValue();
        this.pickerMode.viewValue();
        this.swatchMode.viewValue();
    },
    get: function () {
        return this.hasClass('as-nullable');
    }
};

SolidColorPicker.property.hasOpacity = {
    /**
     * @this SolidColorPicker#
     * @param value
     */
    set: function (value) {
        if (value) {
            this.addClass('as-has-opacity');
        }
        else {
            this.removeClass('as-has-opacity');
        }
        this.footerCtrl.viewValue();
        this.swatchMode.viewValue();
        this.pickerMode.viewValue();
    },
    get: function () {
        return this.hasClass('as-has-opacity');
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


SolidColorPicker.eventHandler.keydown = function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
        this.notifySubmit();
    }
};

ACore.install('solidcolorpicker', SolidColorPicker);

/**
 *
 * @param {SolidColorPicker} elt
 *
 * @constructor
 */
function SCPHistoryController(elt) {
    this.elt = elt;
    this.$recentSwatchesTable = $('.as-solid-color-picker-recent-swatches-ctn swatchestable',
        this.elt)
        .on('presscell', this.elt.swatchMode.ev_pressCell.bind(this));
}


/**
 *
 * @param {SolidColorPicker} elt
 * @constructor
 */
function SCPSWatchModeController(elt) {
    this.elt = elt;
    this.$swatchesName = $('.as-solid-color-picker-swatches-name', this.elt);

    QuickMenu.toggleWhenClick(this.$swatchesName, {
        anchor: [1, 6],
        getMenuProps: () => {
            return {
                extendClasses: 'as-solid-color-picker-swatches-name-menu',
                extendStyle: {
                    'font-size': this.elt.getComputedStyleValue('font-size')
                },
                items: this.elt._swatchesNames.map((name, i) => {
                    return { text: name, value: this.elt._swatchesShortName[i], icon: this.elt._swatchesIcons[i] };
                })
            }
        },
        onSelect: (item) => {
            this.elt.swatches = item.value;
        }
    });
    this.$mode = $('.as-solid-color-picker-mode', this.elt)
        .on('change', this.updateMode.bind(this));
    this.viewingMode = null;
    this.updateMode();
}


SCPSWatchModeController.prototype.updateMode = function () {
    var value = this.$mode.value;
    if (value === this.viewingMode) return;
    this.elt.removeClass('as-solid-color-picker-mode-' + this.viewingMode);
    this.viewingMode = value + '';
    this.elt.addClass('as-solid-color-picker-mode-' + this.viewingMode);
    this.$mode.value = this.viewingMode;
    this.elt.notifySizeCanBeChanged();
};

Object.defineProperty(SCPSWatchModeController.prototype, 'mode', {
    set: function (value) {
        this.$mode.value = value;
        this.updateMode();
    },
    get: function () {
        return this.$mode.value;
    }
});

/**
 *
 * @param {SolidColorPicker} elt
 * @constructor
 */
function SCPSWatchMode(elt) {
    this.elt = elt;
    /**
     *
     * @type {BScroller}
     */
    this.$swatchesTableCtn = $('.as-solid-color-picker-swatches-ctn', this.elt);

    /**
     * @type {SwatchesTable}
     */
    this.$swatchesTable = $('.as-solid-color-picker-swatches-ctn swatchestable', this.elt)
        .on('presscell', this.ev_pressCell.bind(this));
    this.$noneCtn = $('.as-solid-color-picker-none-ctn', this.elt).on('click', this.ev_clickNone.bind(this));


}

SCPPickerMode.prototype.name = "swatches";
SCPPickerMode.prototype.displayName = "SWATCHES";


SCPSWatchMode.prototype.ev_pressCell = function (event) {
    try {
        var value = Color.parse(event.value + '');
        var hC = value.getContrastYIQ();
        hC.rgba[3] = 0.7;
        value.rgba[3] = this.elt.footerCtrl.opacity;
        this.elt.rawValue = value;
        this.elt.footerCtrl.viewValue();
        this.elt.$selectedDot.addStyle('box-shadow', `inset 0px 0px 0.3em 0.125em ${hC.toString('rgba')}`);

        event.cellElt.addChild(this.elt.$selectedDot);
        this.$noneCtn.removeClass('as-selected');
        this.elt.pickerMode.viewValue();

        //
    } catch (e) {
        // this.$selectedDot.removeStyle('box-shadow');
        // this.$hex.value = 'ffffff';
    }
    this.elt.notifyCanBeChanged();
};

SCPSWatchMode.prototype.ev_clickNone = function (event) {
    this.elt.rawValue = null;
    this.viewValue();
    this.elt.footerCtrl.viewValue();
    this.elt.swatchMode.viewValue();
    this.elt.pickerMode.viewValue();
    this.elt.notifyCanBeChanged();
};


SCPSWatchMode.prototype.viewValue = function () {
    this.elt.$selectedDot.remove();
    var cell, hC;
    /**
     *
     * @type {Color|null}
     */
    var value = this.elt.value;
    if (!value) this.$noneCtn.addClass('as-selected');
    else this.$noneCtn.removeClass('as-selected');

    if (this.elt.modeCtrl.mode === 'swatches' && value) {
        cell = this.$swatchesTable.getCell(value.toString('hex6'));
        if (cell) this.$swatchesTableCtn.scrollInto(cell);
    }

    if (!cell && value) {
        cell = this.elt.$recentSwatchesTable.getCell(value.toString('hex6'));
    }
    if (cell) {
        hC = value.getContrastYIQ();
        hC.rgba[3] = 0.7;
        this.elt.$selectedDot.addStyle('box-shadow', `inset 0px 0px 0.3em 0.125em ${hC.toString('rgba')}`);
        cell.addChild(this.elt.$selectedDot);
    }
};


/**
 *
 * @param {SolidColorPicker} elt
 * @constructor
 */
function SCPPickerMode(elt) {
    this.elt = elt;
    this.$spectrum = _({
        tag: 'hanger', elt: $('.as-solid-color-picker-spectrum', this.elt)
    })
        .on('predrag', this.ev_spectrumDrag.bind(this))
        .on('drag', this.ev_spectrumDrag.bind(this));
    this.$hueDot = $('.as-solid-color-picker-hue-dot', this.elt);
    this.$spectrumDot = $('.as-solid-color-picker-spectrum-dot', this.elt);

    this.$alpha = _({ tag: 'hanger', elt: $('.as-solid-color-picker-alpha', this.elt) })
        .on('predrag', this.ev_alphaDrag.bind(this))
        .on('drag', this.ev_alphaDrag.bind(this));
    this.$alphaDot = $('.as-solid-color-picker-alpha-dot', this.elt);

    this.$hue = _({ tag: 'hanger', elt: $('.as-solid-color-picker-hue', this.elt) })
        .on('predrag', this.ev_hueDrag.bind(this))
        .on('drag', this.ev_hueDrag.bind(this));

    this.$near = $('.as-solid-color-picker-near', this.elt)
        .on('presscell', this.ev_nearPressCell.bind(this));

    this._hue = 0;
    this._sat = 1;
    this._brightness = 1;

}

SCPPickerMode.prototype.name = 'picker';
SCPPickerMode.prototype.displayName = 'PICKER';


SCPPickerMode.prototype.viewValue = function () {
    var value = this.elt.value || new Color([0, 0, 0, 1]);
    var hsba = Color.rgbaToHSBA(value.rgba);
    this._setHue(hsba[0] * 360);
    this._setSatBrightness(hsba[1] * 100, hsba[2] * 100);
    this._updateOpacity();
    this._updateNear();
};


SCPPickerMode.prototype._updateSpectrumDot = function () {
    var value = this.elt.value || new Color([0, 0, 0, 1]);
    var dotColor = value.getContrastYIQ();
    dotColor.rgba[3] = 0.7;
    this.$spectrumDot.addStyle({
        bottom: 'calc(' + this._brightness + '% - 0.5em)',
        left: 'calc(' + this._sat + '% - 0.5em)',
        'box-shadow': 'inset 0px 0px 0.3em 0.125em ' + dotColor.toString()
    });
};


SCPPickerMode.prototype._updateNear = function () {
    var value = this.elt.value || new Color([0, 0, 0, 1]);
    var hsba = Color.rgbaToHSBA(value.rgba);
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

SCPPickerMode.prototype._setHue = function (hue) {
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


SCPPickerMode.prototype._setSatBrightness = function (sat, brightness) {
    this._sat = sat;
    this._brightness = brightness;
    this._updateSpectrumDot();
};

SCPPickerMode.prototype._updateOpacity = function () {
    this.$alphaDot.addStyle('left', 'calc(' + (this.elt.footerCtrl.opacity * 100) + '% - 0.5em)');
};

SCPPickerMode.prototype.ev_spectrumDrag = function (event) {
    event.preventDefault();
    var sBound = this.$spectrum.getBoundingClientRect();
    var brightness = (sBound.bottom - event.clientY) * 100 / sBound.height;
    brightness = Math.max(0, Math.min(100, Math.round(brightness)));
    var sat = (event.clientX - sBound.left) * 100 / sBound.width;
    sat = Math.max(0, Math.min(100, Math.round(sat)));
    this.elt.rawValue = Color.fromHSBA(this._hue / 360, sat / 100, brightness / 100, this.elt.footerCtrl.opacity);
    this._setSatBrightness(sat, brightness);
    this._updateNear();
    this.elt.footerCtrl.viewValue();
    this.elt.swatchMode.viewValue();
    this.elt.notifyCanBeChanged();
};


SCPPickerMode.prototype.ev_alphaDrag = function (event) {
    event.preventDefault();
    var aBound = this.$alpha.getBoundingClientRect();
    var opacity = (event.clientX - aBound.left) * 100 / aBound.width;
    opacity = Math.max(0, Math.min(100, Math.round(opacity)));
    var color = this.elt.value || new Color([0, 0, 0, 0]);
    color.rgba[3] = opacity / 100;
    this.elt.rawValue = color;
    this.elt.footerCtrl.viewValue();
    this._updateOpacity();
    // this._setOpacityPercent(opacity);
    this.elt.notifyCanBeChanged();
};

SCPPickerMode.prototype.ev_hueDrag = function (event) {
    event.preventDefault();
    var hBound = this.$hue.getBoundingClientRect();
    var hue = (event.clientX - hBound.left) * 360 / hBound.width;
    hue = Math.max(0, Math.min(360, Math.round(hue)));
    this.elt.rawValue = Color.fromHSBA(hue / 360, this._sat / 100, this._brightness / 100, this.elt.footerCtrl.opacity);
    this._setHue(hue);
    this.elt.footerCtrl.viewValue();
    this.elt.swatchMode.viewValue();
    this._updateNear();
    this.elt.notifyCanBeChanged();
};

SCPPickerMode.prototype.ev_nearPressCell = function (event) {
    var value = event.value.clone();
    value.rgba[3] = this.elt.footerCtrl.opacity;
    this.elt.rawValue = value;
    this.viewValue();
    this.elt.footerCtrl.viewValue();
    this.elt.pickerMode.viewValue();
};

/**
 *
 * @param {SolidColorPicker} elt
 * @constructor
 */
function SCPFooterController(elt) {
    this.elt = elt;
    this.$selected = $('.as-solid-color-picker-selected', this.elt);
    this.$opacity = $('.as-solid-color-picker-color-opacity', this.elt)
        .on('change', this.ev_opacityChange.bind(this))
        .on('keyup', this.ev_opacityKeyUp.bind(this));

    this.$hex = $('.as-solid-color-picker-color-hex', this.elt)
        .on('keyup', this.ev_hexKeyUp.bind(this))
        .on('change', this.ev_hexChange.bind(this));
}

SCPFooterController.prototype.ev_opacityChange = function (event) {
    var color = this.elt.value;
    var opacityTxt = color ? Math.round(color.rgba[3] * 100) : '100';
    if (color && this.$opacity.value !== opacityTxt) {
        this.$opacity.value = opacityTxt;
    }
};

SCPFooterController.prototype.ev_opacityKeyUp = function (event) {
    var opacity = parseFloat(this.$opacity.value);
    if (!isNaN(opacity)) {
        opacity = Math.round(Math.max(0, Math.min(opacity, 100)));
        var color = this.elt.value || new Color(0, 0, 0, 1);
        color.rgba[3] = opacity / 100;
        this.elt.rawValue = color;
        this.elt.pickerMode.viewValue();
        this.$selected.value = color;
        this.elt.notifyCanBeChanged();
    }
};

SCPFooterController.prototype.ev_hexKeyUp = function (event) {
    // var prevValue = this.elt.value;
    var value;
    var nullable = this.elt.nullable;
    var hex = this.$hex.value.trim();
    try {
        if (nullable && hex.length === 0) {
            value = null;
        }
        else {
            value = Color.parse('#' + hex);
        }
    } catch (e) {
        // console.error(e);
    }

    if (!value && !nullable) return;
    if (value)
        value.rgba[3] = this.opacity;
    this.elt.rawValue = value;
    this.$selected.value = value;
    this.elt.pickerMode.viewValue();
    this.elt.swatchMode.viewValue();
    this.elt.notifyCanBeChanged();


};


SCPFooterController.prototype.ev_hexChange = function (event) {
    var value = this.elt.value;
    if (value)
        this.$hex.value = value.toHex6();
};

SCPFooterController.prototype.viewValue = function () {
    var value = this.elt.value;
    var hasOpacity = this.elt.hasOpacity;
    this.$selected.value = value;
    this.$hex.value = value ? (value.toHex6()) : '';
    if (hasOpacity && value) {
        this.$opacity.value = Math.round(value.rgba[3] * 100) + '';
    }
    else this.$opacity.value = '100';
};


Object.defineProperty(SCPFooterController.prototype, 'opacity', {
    get: function () {
        if (!this.elt.hasOpacity) return 1;
        var opFromText = parseFloat(this.$opacity.value) / 100;
        if (isRealNumber(opFromText)) {
            opFromText = Math.max(0, Math.min(opFromText, 1));
            return opFromText;
        }
        var value = this.elt.value;
        if (!value) return 1;
        return value.rgba[3];
    }
});

export default SolidColorPicker;