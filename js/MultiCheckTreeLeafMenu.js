import ACore, { _, $ } from '../ACore';
import MultiCheckTreeLeafBox from "./MultiCheckTreeLeafBox";
import SelectTreeLeafMenu from "./SelectTreeLeafMenu";
import SelectBoxItem from "./SelectBoxItem";
import MultiSelectMenu from "./MultiSelectMenu";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu2";

/****
 * Only leafs have checkbox
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeLeafMenu() {
    this.$selectBox = _({
        tag: MultiCheckTreeLeafBox.tag,
        on: {
            change: this.eventHandler.selectBoxChange,
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });

    this.$selectlistBox = this.$selectBox;

    OOP.drillProperty(this, this.$selectBox, 'enableSearch');

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
            this.$itemCtn.childNodes[i].removeStyle('display', 'none');
        }
        else {
            this.$itemCtn.childNodes[i].addStyle('display', 'none');
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
        values = values ||[];
        this.pendingValues = values ;
        this.$selectBox.values = values ;
        this._updateSelectedItems();

    },
    get: function () {
        if ('pendingValues' in this) return this.pendingValues;
        return this.$selectBox.values.slice().filter(value=>{
            return !!this.$selectBox.$itemByValue[value];
        });
    }
};


MultiCheckTreeLeafMenu.property.isFocus = SelectTreeLeafMenu.property.isFocus;

MultiCheckTreeLeafMenu.property.disabled = MultiSelectMenu.property.disabled;
MultiCheckTreeLeafMenu.property.readOnly = MultiSelectMenu.property.readOnly;


MultiCheckTreeLeafMenu.eventHandler = {};

MultiCheckTreeLeafMenu.eventHandler.clickOut = SelectTreeLeafMenu.eventHandler.clickOut;
MultiCheckTreeLeafMenu.eventHandler.preUpdateListPosition = SelectMenu.eventHandler.preUpdateListPosition;

MultiCheckTreeLeafMenu.eventHandler.click = function (event) {
    if (!this.readOnly&&(event.target === this || event.target === this.$itemCtn)) {
        this.isFocus = true;
    }
};

MultiCheckTreeLeafMenu.eventHandler.selectBoxChange = function () {
    delete this.pendingValues;
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
