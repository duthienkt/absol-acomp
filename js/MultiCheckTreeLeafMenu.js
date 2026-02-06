import ACore, { _, $ } from '../ACore';
import MultiCheckTreeLeafBox from "./MultiCheckTreeLeafBox";
import SelectTreeLeafMenu, { STLBoxController } from "./SelectTreeLeafMenu";
import SelectBoxItem from "./SelectBoxItem";
import MultiSelectMenu from "./MultiSelectMenu";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu2";
import { loadLanguageModule } from "./MultiLanguageCSS";
import { AbstractInput } from "./Abstraction";
import { isNaturalNumber } from "./utils";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";

/****
 * Only leafs have checkbox
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeLeafMenu() {
    loadLanguageModule();
    this.$selectBox = _({
        tag: MultiCheckTreeLeafBox.tag,
        on: {
            change: this.eventHandler.selectBoxChange,
            preupdateposition: this.eventHandler.preUpdateListPosition
        },
        props: {
            initOpened: (isNaturalNumber(this.renderProps.initOpened) || this.renderProps.initOpened) ? this.renderProps.initOpened : 3
        }
    });

    this.$selectlistBox = this.$selectBox;

    OOP.drillProperty(this, this.$selectBox, 'enableSearch');

    this.on('mousedown', this.eventHandler.click);
    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.boxCtrl = new STLBoxController(this);
    OOP.drillProperty(this, this.boxCtrl, 'isFocus');
    AbstractInput.call(this);
}

mixClass(MultiCheckTreeLeafMenu, AbstractInput);

MultiCheckTreeLeafMenu.tag = 'MultiCheckTreeLeafMenu'.toLowerCase();

MultiCheckTreeLeafMenu.render = function (data, domDesc) {
    var props = domDesc.props || {};
    return _({
        class: ['as-multi-select-menu', 'as-multi-check-tree-leaf-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        props: {
            renderProps: props
        },
        child: [
            {
                attr: {
                    'data-ml-key': 'txt_select_value'
                },
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller']
            },
            {
                tag: 'button',
                class: 'as-multi-select-menu-toggle-btn',
                child: 'dropdown-ico'
            },
            'attachhook'
        ]
    });
};

MultiCheckTreeLeafMenu.prototype.styleHandlers.overflow = {
    /**
     * @this MultiCheckTreeMenu
     * @param value
     * @returns {*}
     */
    set: function (value) {
        if (value === 'hidden') {
            this.style.overflow = 'hidden';
            this.$itemCtn.style.overflow = 'hidden';
        }
        else {
            this.style.overflow = '';
            this.$itemCtn.style.overflow = '';
        }
        return value;
    }
};

MultiCheckTreeLeafMenu.prototype._updateOverflow = function () {
    var bound;
    var maxHeight, cBound;
    if (this.getComputedStyleValue('overflow') === 'hidden') {
        maxHeight = parseFloat((this.getComputedStyleValue('max-height')||'100px').replace('px'));
        bound = this.getBoundingClientRect();
        if (bound.width === 0) return;
        this.$itemCtn.removeClass('as-has-more');
        var hasMore = false;
        var elt;
        for (var i = 0; i < this.$itemCtn.childNodes.length; ++i) {
            elt = this.$itemCtn.childNodes[i];
            if (!hasMore) {
                elt.removeStyle('display');
                cBound = elt.getBoundingClientRect();
                if (cBound.bottom > bound.top + maxHeight) {
                    hasMore = true;
                }
            }
            if (hasMore) {
                elt.addStyle('display', 'none');
            }
        }
        if (hasMore) {
            this.$itemCtn.addStyle('white-space', 'pre-wrap');
            this.$itemCtn.addClass('as-has-more');
        }
        else {
            this.$itemCtn.removeStyle('white-space');
        }
    }
};

MultiCheckTreeLeafMenu.prototype._updateSelectedItems = function () {
    var values = this.$selectBox.values;
    while (this.$itemCtn.childNodes.length > values.length) {
        this.$itemCtn.removeChild(this.$itemCtn.lastChild);
    }
    while (this.$itemCtn.childNodes.length < values.length) {
        this.$itemCtn.addChild(this._makeItem());
    }

    var item;
    for (var i = 0; i < values.length; ++i) {
        item = this.$selectBox.$itemByValue[values[i]] && this.$selectBox.$itemByValue[values[i]].itemData;
        if (item) {
            this.$itemCtn.childNodes[i].data = item;
            this.$itemCtn.childNodes[i].removeStyle('display', 'none');
        }
        else {
            this.$itemCtn.childNodes[i].addStyle('display', 'none');
        }
    }
    setTimeout(this._updateOverflow.bind(this), 100)
};

MultiCheckTreeLeafMenu.prototype._makeItem = function () {
    var itemElt = _({
        tag: SelectBoxItem.tag,
    });

    itemElt.on('close', this.eventHandler.itemPressClose.bind(null, itemElt));

    return itemElt;
};

MultiCheckTreeLeafMenu.prototype.findItemByValue = function (value) {
    return this.$selectBox.findItemByValue(value);
};

MultiCheckTreeLeafMenu.prototype.init = function (props) {
    props = props || {};
    var cProps = Object.assign({}, props);
    if ('items' in props) {
        this.items = props.items;
        delete cProps.items;
    }
    if ('values' in props) {
        this.values = props.values;
        delete cProps.values;
    }

    Object.assign(this, cProps);
};


MultiCheckTreeLeafMenu.property.items = {
    set: function (items) {
        this.$selectBox.items = items;
        this.addStyle('--select-list-estimate-width', Math.max(145 + 20, this.$selectBox.estimateSize.lv0Width || this.$selectBox.estimateSize.width) + 'px');
        this._updateSelectedItems();
    },
    get: function () {
        return this.$selectBox.items;
    }
};

MultiCheckTreeLeafMenu.property.values = {
    set: function (values) {
        values = values || [];
        this.pendingValues = values;
        this.$selectBox.values = values;
        this._updateSelectedItems();

    },
    get: function () {
        if ('pendingValues' in this) return this.pendingValues;
        return this.$selectBox.values.slice().filter(value => {
            return !!this.$selectBox.$itemByValue[value];
        });
    }
};


MultiCheckTreeLeafMenu.property.disabled = MultiSelectMenu.property.disabled;
MultiCheckTreeLeafMenu.property.readOnly = MultiSelectMenu.property.readOnly;

MultiCheckTreeLeafMenu.property.placeholder = {
    set: function (value) {
        if (value) {
            this.$itemCtn.attr('data-placeholder', value + '');
        }
        else {
            this.$itemCtn.attr('data-placeholder', null);
        }
    },
    get: function () {
        return this.$itemCtn.attr('data-placeholder');
    }
};


MultiCheckTreeLeafMenu.eventHandler = {};

MultiCheckTreeLeafMenu.eventHandler.clickOut = SelectTreeLeafMenu.eventHandler.clickOut;
MultiCheckTreeLeafMenu.eventHandler.preUpdateListPosition =  function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$selectBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};


MultiCheckTreeLeafMenu.eventHandler.click = function (event) {
    if (!this.readOnly && (event.target === this || event.target === this.$itemCtn)) {
        this.isFocus = true;
    }
};

MultiCheckTreeLeafMenu.eventHandler.selectBoxChange = function () {
    delete this.pendingValues;
    this._updateSelectedItems();
    this.emit('change', { type: 'change', target: this }, this);
};

MultiCheckTreeLeafMenu.eventHandler.itemPressClose = function (itemElt, event) {
    delete this.pendingValues;
    var item = itemElt.data;
    this.$selectBox.values = this.$selectBox.values.filter(function (value) {
        return value !== item.value;
    });
    this._updateSelectedItems();
    this.emit('change', { type: 'change', target: this }, this);
};

ACore.install(MultiCheckTreeLeafMenu);

export default MultiCheckTreeLeafMenu;
