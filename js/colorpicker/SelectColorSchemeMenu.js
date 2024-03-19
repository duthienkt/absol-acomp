import OOP from "absol/src/HTML5/OOP";
import Follower from "../Follower";
import { _, $ } from "../../ACore";
import { keyStringOf } from "../utils";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import Color from "absol/src/Color/Color";
import { map } from "absol/src/Math/int";

export var DEFAULT_CHART_COLOR_SCHEMES = [
    ['#f0f0f0', '#d9d9d9', '#bdbdbd', '#969696', '#737373', '#525252'],//gray scale
    ['#a50026', '#f46d43', '#fee08b', '#d9ef8b', '#66bd63', '#006837'],
    ['#7fc97f', '#beaed4', '#fdc086', '#ffff99', '#386cb0', '#f0027f'],
    ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02'],
    ['#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'],
    ['#b3e2cd', '#fdcdac', '#cbd5e8', '#f4cae4', '#e6f5c9', '#fff2ae'],
    ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33'],
    ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f'],
    ['#fff7bc', '#fee391', '#fec44f', '#fe9929', '#ec7014', '#cc4c02'],
    ['#efedf5', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3'],
    ['#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5'],
    ['#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45'],
    ['#7f3b08', '#e08214', '#fee0b6', '#d8daeb', '#8073ac', '#2d004b'],
    ['#543005', '#bf812d', '#f6e8c3', '#c7eae5', '#35978f', '#003c30'],
    ['#40004b', '#9970ab', '#e7d4e8', '#d9f0d3', '#5aae61', '#00441b'],
    ['#f7fcb9', '#d9f0a3', '#addd8e', '#78c679', '#41ab5d', '#238443'],
    ['#e5f5f9', '#ccece6', '#99d8c9', '#66c2a4', '#41ae76', '#238b45'],
    ['#ece7f2', '#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0'],
    ['#fde0dd', '#fcc5c0', '#fa9fb5', '#f768a1', '#dd3497', '#ae017e'],
    ['#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c', '#fc4e2a']
];

var DEFAULT_CHART_COLOR_SCHEMES_OBJS = DEFAULT_CHART_COLOR_SCHEMES.map(scm => scm.map(c => Color.parse(c)));

Color.DEFAULT_CHART_COLOR_SCHEMES = DEFAULT_CHART_COLOR_SCHEMES;


var ColorSchemeGenerators = {};


var scaleArray = (arr, newN) => Array(newN).fill(0).map((u, i) => {
    var k = i * (arr.length - 1) / (newN - 1);
    var l = Math.floor(k);
    var h = Math.ceil(k);
    if (l === h) return arr[l];
    return map(k, l, h, arr[l], arr[h]);
})

export var generatorColorScheme = (id, n) => {
    var hsl6 = DEFAULT_CHART_COLOR_SCHEMES_OBJS[id].map(c => c.toHSLA());
    var h6 = hsl6.map(c => c[0]);
    var s6 = hsl6.map(c => c[1]);
    var l, h, s;
    if ((id >= 1 && id <= 7)|| id === 12 || id ===13) {
        if (n > 6) {
            s = s6.concat(Array(n - 6).fill(0).map((u, i) => 0.6 + (3 * i * 0.3) % 0.35));
        }
    }
    if (id === 1) {
        h6[0] -= 1;

    }
    else if (id === 2) {
        if (n > 6) {
            s = s6.concat(Array(n - 6).fill(0).map((u, i) => 0.5 + (3 * i * 0.3) % 0.45));
        }
    }
    else if (id === 18 && n !== 6) {
        h6[0] = 1;
        h6[1] = 1;
    }
    s = s || scaleArray(s6, n);

    l = l || scaleArray(hsl6.map(c => c[2]), n);
    h = h || scaleArray(h6, n).map(h => h < 0 ? h + 1 : h);
    return Array(n).fill(0).map((u, i) => Color.fromHSL(h[i], s[i], l[i]));
};


// DEFAULT_CHART_COLOR_SCHEMES = Array(20).fill(0).map((u, id) => colorSchemeGenerator(id, 20).map(c => c.toString('hex6')))
// console.log(DEFAULT_CHART_COLOR_SCHEMES)

/**
 * @extends AElement
 * @constructor
 */
function SelectColorSchemeMenu() {
    this.dropdown = new SCSMDropdown(this);
    this.comboboxCtrl = new SCSMComboBoxController(this);
    OOP.drillProperty(this, this.dropdown, ['value', 'items', 'selectedItem']);
    this.dropdown.items = DEFAULT_CHART_COLOR_SCHEMES.map((it, i) => ({
        colors: it,
        value: i
    }));
}

SelectColorSchemeMenu.tag = 'SelectColorSchemeMenu'.toLowerCase();

SelectColorSchemeMenu.render = function () {
    return _({
        class: ['as-select-color-scheme-menu', 'absol-selectmenu'],
        extendEvent: ['change'],
        child: [
            '.as-select-color-scheme-menu-selected-item',
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
        ]
    });
};


export default SelectColorSchemeMenu;

/**
 *
 * @param {SelectColorSchemeMenu} elt
 * @constructor
 */
function SCSMDropdown(elt) {
    this.elt = elt;
    this._items = [];
    this.itemDict = {};
    this.$itemDict = {};
    this.$follower = _({
        tag: Follower,
        class: ['as-select-color-scheme-menu-dropdown', 'as-dropdown-box-common-style'],
        child: {}
    });
}


SCSMDropdown.prototype.updateItems = function () {
    var items = this._items;
    var maxColorLength = items.reduce((ac, cr) => Math.max(ac, cr.colors.length), 0);
    var itRow = Math.max(1, Math.floor(Math.sqrt(maxColorLength)));
    while (itRow > 1 && (maxColorLength % itRow)) itRow--;
    var itCol = maxColorLength / itRow;
    var gridRow = Math.max(1, Math.ceil(Math.sqrt(items.length)));
    while (gridRow < items.length && (items.length % gridRow)) gridRow++;
    var gridCol = Math.ceil(items.length / gridRow);
    this.$follower.clearChild();
    this.$selected = null;
    this.$itemDict = {};
    items.forEach((item, i) => {
        if (i % gridCol === 0) {
            this.$follower.addChild(_('.as-scsm-item-list-row'));
        }
        var itemElt = _({
            class: ['as-scsm-item']
        });
        var wrapper = _({
            class: 'as-scsm-item-wrapper',
            child: itemElt,
            on: {
                click: (event) => {
                    var cValue = this.value;
                    if (cValue !== item.value) {
                        this.value = item.value;
                        this.elt.emit('change', { type: 'change', target: this.elt }, this.elt)
                    }
                }
            }
        })
        this.$itemDict[keyStringOf(item.value)] = itemElt;
        this.$follower.lastChild.addChild(wrapper);
        item.colors.forEach((color, j) => {
            if (j % itCol === 0) {
                itemElt.addChild(_('.as-scsm-item-row'));
            }
            itemElt.lastChild.addChild(_({
                class: 'as-scsm-item-cell', style: {
                    backgroundColor: color
                }
            }));
        });
    });

};


SCSMDropdown.prototype.updateSelected = function () {
    var value = this.value;
    if (this.$selected) this.$selected.removeClass('as-selected');
    this.$selected = this.$itemDict[keyStringOf(value)];
    if (this.$selected) this.$selected.addClass('as-selected');
    this.elt.comboboxCtrl.update();
};

Object.defineProperty(SCSMDropdown.prototype, 'items', {
    set: function (items) {
        if (!(items instanceof Array)) items = [];
        this._items = items;
        this.itemDict = items.reduce((ac, cr) => {
            ac[keyStringOf(cr.value)] = cr;
            return ac;
        }, {});
        this.updateItems();
        this.updateSelected();
    },
    get: function () {
        return this._items;
    }
});

Object.defineProperty(SCSMDropdown.prototype, 'value', {
    set: function (value) {
        this._value = value;
        this.updateSelected();
    },
    get: function () {
        if (this.itemDict[keyStringOf(this._value)] || this._items.length === 0)
            return this._value;
        return this._items[0].value;
    }
});

Object.defineProperty(SCSMDropdown.prototype, 'selectedItem', {
    get: function () {
        return this.itemDict[keyStringOf(this.value)];
    }
});


/**
 *
 * @param {SelectColorSchemeMenu} elt
 * @constructor
 */
function SCSMComboBoxController(elt) {
    this.elt = elt;
    this.$selected = $('.as-select-color-scheme-menu-selected-item', this.elt);
    this.ev_click = this.ev_click.bind(this);
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.elt.on('click', this.ev_click)
}


SCSMComboBoxController.prototype.ev_click = function (event) {
    this.isFocus = true;
};


SCSMComboBoxController.prototype.ev_clickOut = function (event) {
    this.isFocus = false;
};

SCSMComboBoxController.prototype.update = function () {
    var selectedItem = this.elt.dropdown.selectedItem;
    this.$selected.clearChild();
    if (!selectedItem) return;
    this.$selected.addChild(selectedItem.colors.map(color => _({
        class: 'as-scsm-item-cell', style: {
            backgroundColor: color
        }
    })))

};


Object.defineProperty(SCSMComboBoxController.prototype, 'isFocus', {
    set: function (value) {
        if (!!value === this.elt.hasClass('as-focus')) return;
        if (value) {
            this.elt.addClass('as-focus');
        }
        else {
            this.elt.removeClass('as-focus');
        }
        if (value) {
            this.elt.off('click', this.ev_click);
            setTimeout(() => {
                document.addEventListener('click', this.ev_clickOut);
            }, 10);
            this.elt.dropdown.$follower.addTo(document.body);
            this.elt.dropdown.$follower.followTarget = this.elt;

        }
        else {
            this.elt.on('click', this.ev_click);
            document.removeEventListener('click', this.ev_clickOut);
            this.elt.dropdown.$follower.remove();
            this.elt.dropdown.$follower.followTarget = null;
        }
    },
    get: function () {
        return this.elt.hasClass('as-focus');
    }
});


