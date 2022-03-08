import ACore, { _, $ } from '../ACore';
import MultiCheckTreeLeafBox from "./MultiCheckTreeLeafBox";
import SelectTreeLeafMenu from "./SelectTreeLeafMenu";
import SelectBoxItem from "./SelectBoxItem";
import MultiSelectMenu from "./MultiSelectMenu";

/****
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeLeafMenu() {
    this.$selectBox = _({
        tag: MultiCheckTreeLeafBox.tag,
        on: {
            change: this.eventHandler.selectBoxChange
        }
    });

    this.on('click', this.eventHandler.click);
    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
}

MultiCheckTreeLeafMenu.tag = 'MultiCheckTreeLeafMenu'.toLowerCase();

MultiCheckTreeLeafMenu.render = function () {
    return _({
        class: ['as-multi-select-menu', 'as-multi-check-tree-leaf-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
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
        }
    }
};

MultiCheckTreeLeafMenu.prototype._makeItem = function () {
    var itemElt = _({
        tag: SelectBoxItem.tag,
    });

    itemElt.on('close', this.eventHandler.itemPressClose.bind(null, itemElt));

    return itemElt;
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


MultiCheckTreeLeafMenu.property = {};

MultiCheckTreeLeafMenu.property.items = {
    set: function (items) {
        this.$selectBox.items = items;
        this.addStyle('--select-list-estimate-width', Math.max(145 + 20, this.$selectBox.estimateSize.width) + 'px');
        this._updateSelectedItems();
    },
    get: function () {
        return this.$selectBox.items;
    }
};

MultiCheckTreeLeafMenu.property.values = {
    set: function (values) {
        this.$selectBox.values = values || [];
        this._updateSelectedItems();

    },
    get: function () {
        return this.$selectBox.values;
    }
};


MultiCheckTreeLeafMenu.property.isFocus = SelectTreeLeafMenu.property.isFocus;

MultiCheckTreeLeafMenu.property.disabled = MultiSelectMenu.property.disabled;

MultiCheckTreeLeafMenu.eventHandler = {};

MultiCheckTreeLeafMenu.eventHandler.clickOut = SelectTreeLeafMenu.eventHandler.clickOut;

MultiCheckTreeLeafMenu.eventHandler.click = function (event) {
    if (event.target === this || event.target === this.$itemCtn) {
        this.isFocus = true;
    }
};

MultiCheckTreeLeafMenu.eventHandler.selectBoxChange = function () {
    this._updateSelectedItems();
    this.emit('change', { type: 'change', target: this }, this);
};

MultiCheckTreeLeafMenu.eventHandler.itemPressClose = function (itemElt, event) {
    var item = itemElt.data;
    this.$selectBox.values = this.$selectBox.values.filter(function (value) {
        return value !== item.value;
    });
    this._updateSelectedItems();
    this.emit('change', { type: 'change', target: this }, this);
};

ACore.install(MultiCheckTreeLeafMenu);

export default MultiCheckTreeLeafMenu;
