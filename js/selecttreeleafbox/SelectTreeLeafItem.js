import { $, _ } from "../../ACore";
import STLIPropHandlers from "./STLIPropHandlers";
import { keyStringOf } from "../utils";
import '../../css/selecttreeeleafbox.css';

/***
 * @extends AElement
 * @constructor
 */
function SelectTreeLeafItem() {
    this.$text = $('.am-select-tree-leaf-item-text', this);
    this.$desc = $('.am-select-tree-leaf-item-desc', this);
    this.$iconCtn = $('.am-select-tree-leaf-item-icon-ctn', this);
    this.addEventListener('click', this.eventHandler.click);
}

SelectTreeLeafItem.tag = 'SelectTreeLeafItem'.toLowerCase();

SelectTreeLeafItem.render = function () {
    return _({
        extendEvent: ['click', 'statuschange'],
        class: ['am-select-tree-leaf-item', 'am-dropdown-box-item'],
        child: [
            {
                class: 'am-select-tree-leaf-item-toggle-ctn',
                child: 'toggler-ico'
            },
            {
                class: 'am-select-tree-leaf-item-icon-ctn'
            },
            {
                class: 'am-select-tree-leaf-item-text',
                child: { text: '' }
            },
            {
                class: 'am-select-tree-leaf-item-desc',
                child: { text: '' }
            }
        ]
    });
};

SelectTreeLeafItem.prototype._updateData = function () {
    this.$text.firstChild.data = this.text;
    this.attr('data-key', keyStringOf(this.value));
    this.$iconCtn.clearChild();
    var icon = this.data && this.data.icon;
    if (icon) {
        icon = _(icon);
        if (icon.parentElement) icon = $(icon.cloneNode(true));
        this.$iconCtn.addChild(icon);
        this.addClass('as-has-icon');
    }
    else {
        this.removeClass('as-has-icon');
    }

    if (this.data && this.data.isLeaf) {
        this.addClass('as-is-leaf');
    }
    else {
        this.removeClass('as-is-leaf');
    }
};

SelectTreeLeafItem.property = STLIPropHandlers;


SelectTreeLeafItem.eventHandler = {};

SelectTreeLeafItem.eventHandler.click = function (event) {
    if (this._data && this._data.isLeaf) {
        this.emit('click', { type: 'click', target: this, originalEvent: event }, this);
    }
    else {
        if (this.status !== 'none') {
            this.status = this.status === 'open' ? 'close' : 'open';
            this.emit('statuschange', { type: 'statuschange', target: this, originalEvent: event }, this);
        }
    }
};


export default SelectTreeLeafItem;