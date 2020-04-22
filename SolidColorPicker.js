import CPCore from "./CPCore";
import { MoqupsClassicSwathes, iOsSwatches, MaterialSwatches, BootstrapSwatches } from "./SwatchesTable";
import QuickMenu from "absol-acomp/js/QuickMenu";
import Color from "absol/src/Color/Color";
var _ = CPCore._;
var $ = CPCore.$;

function SolidColorPicker() {
    this.$swatchesName = $('.as-solid-color-picker-swatches-name', this);
    var thisSP = this;
    this._lastEmitHex8 = '';
    this._rgb = 'ffffff';
    this._opatictyPercent = 100;
    this._value = new Color([1, 1, 1, 1]);
    this._swatchesNames = ['Moqups Classic', 'Material Design', 'Bootstrap', 'iOS'];
    this._swatchesShortName = ['moqups', 'material', 'bootstrap', 'ios'];
    this._swatchesIcons = ['span.mdi.mdi-palette', 'span.mdi.mdi-material-design', 'span.mdi.mdi-bootstrap', 'span.mdi.mdi-apple-ios'];

    this._swatchesData = [MoqupsClassicSwathes, MaterialSwatches, BootstrapSwatches, iOsSwatches];

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
            console.log(item.value);
            thisSP.swatches = item.value;
        }
    });

    this.$hex = $('.as-solid-color-picker-color-hex', this)
        .on('keyup', this.eventHandler.hexKeyup)
        .on('change', this.eventHandler.hexChange);
    this.$opacity = $('.as-solid-color-picker-color-opacity', this)
        .on('change', this.eventHandler.opacityChange)
        .on('keyup', this.eventHandler.opacityKeyUp);
    this.$selected = $('.as-solid-color-picker-selected', this);
    this._autoAddDotCell();
};

SolidColorPicker.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-solid-color-picker',
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
                                    { text: 'SWATCHES', value: 0 },
                                    { text: 'PICKER', value: 1 },
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

                ]
            }
        ]
    });
};

SolidColorPicker.prototype._addDotToCell = function (cell, cellColor) {
    var shadowColor = cellColor.getContrastYIQ();
    shadowColor.rgba[3] = 0.7;
    this.$selectedDot.addStyle('box-shadow', 'inset 0px 0px 0.3em 0.125em ' + shadowColor.toString());
    cell.addChild(this.$selectedDot);
};

SolidColorPicker.prototype._autoAddDotCell = function () {
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


SolidColorPicker.property = {};


/**
 * @type {SolidColorPicker}
 */
SolidColorPicker.property.value = {
    set: function (value) {
        value = value || 'transparent';
        if (!value.toHex8) {
            try {
                value = Color.parse(value + '');
            } catch (e) {
                value = new Color([0, 0, 0, 0]);
            }
        }
        this._value = value;
        this._lastEmitHex8 = value.toHex8();
        this._rgb = value.toHex6();
        this._opatictyPercent = Math.round(value.rgba[3] * 100);
        this._autoAddDotCell();
        this.$selected.addStyle('background-color', value.toString());
        this.$hex.value = this._rgb;
        this.$opacity.value = this._opatictyPercent;
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
        this._autoAddDotCell();
    },
    get: function () {
        return this._swatches;
    }
};


/**
 * @type {SolidColorPicker}
 */
SolidColorPicker.eventHandler = {};

SolidColorPicker.eventHandler.swatchesPressCell = function (event) {
    try {
        var valueColor = Color.parse(event.value);
        this._addDotToCell(event.cellElt, valueColor);
        this._rgb = valueColor.toHex6();
        this.$hex.value = this._rgb;
        valueColor.rgba[3] = this._opatictyPercent / 100;
        this._value = valueColor;
        this.$selected.addStyle('background-color', valueColor.toString())
    }
    catch (e) {
        this.$selectedDot.removeStyle('box-shadow');
        this.$hex.value = 'ffffff';

    }
    this.notifyCanBeChanged();
};

SolidColorPicker.eventHandler.hexKeyup = function () {
    try {
        var color = Color.parse('#' + this.$hex.value.trim());
        if (color.rgba[3] == 1) {
            this._rgb = color.toHex6();
            color.rgba[3] = this._opatictyPercent / 100;
            this._value = color;
            this.$selected.addStyle('background-color', color.toString());
            this._autoAddDotCell();
        }
    }
    catch (e) {
    }
};


SolidColorPicker.eventHandler.hexChange = function () {
    if (this.$hex.value != this._rgb)
        this.$hex.value = this._rgb;
    this.notifyCanBeChanged();
};


SolidColorPicker.eventHandler.opacityKeyUp = function () {
    var opacity = parseFloat(this.$opacity.value);
    if (!isNaN(opacity)) {
        opacity = Math.round(Math.max(0, Math.min(opacity, 100)));
        this._opatictyPercent = opacity;
        var color = Color.parse('#' + this._rgb);
        color.rgba[3] = opacity / 100;
        this._value = color;
        this.$selected.addStyle('background-color', color.toString())
    }
};

SolidColorPicker.eventHandler.opacityChange = function () {
    var opacity = this._opatictyPercent;
    if (this.$opacity.value != opacity) {
        this.$opacity.value = opacity + '';
    }
    this.notifyCanBeChanged();
};


CPCore.install('solidcolorpicker', SolidColorPicker);

export default SolidColorPicker;