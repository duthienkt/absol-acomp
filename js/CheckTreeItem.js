import ACore, { _, $ } from "../ACore";
import { ExpNode } from "./ExpTree";
import { getDescriptionOfListItem, getTextOfListItem } from "./SelectListItem";
import '../css/checktreeitem.css';
import { hitElement } from "absol/src/HTML5/EventEmitter";


/***
 * @extends ExpNode
 * @constructor
 */
function CheckTreeItem() {
    this._itemData = null;
    this.$name = $('span.absol-exp-node-name', this);
    this.$desc = $('span.absol-exp-node-desc', this);
    this.$iconCtn = $('div.absol-exp-node-ext-icon', this);
    this.$level = $('.absol-exp-node-level', this);
    this.$checkbox = $('checkboxbutton', this)
        .on('change', this.eventHandler.checkboxChange);
    this.$toggleIcon = $('toggler-ico', this);
    this.on('click', this.eventHandler.click);
}

CheckTreeItem.tag = 'CheckTreeItem'.toLowerCase();

CheckTreeItem.render = function () {
    return _({
        tag: 'button',
        extendEvent: ['select', 'presstoggle'],
        class: ['as-check-tree-item', 'absol-exp-node'],
        child: [
            '.absol-exp-node-level',
            'toggler-ico',
            'checkboxbutton',
            'img.absol-exp-node-ext-icon',
            'div.absol-exp-node-ext-icon',
            'span.absol-exp-node-name',
            'span.absol-exp-node-desc'
        ]
    });
};

CheckTreeItem.property = {};

CheckTreeItem.property.icon = ExpNode.property.icon;
CheckTreeItem.property.text = ExpNode.property.name;
CheckTreeItem.property.level = ExpNode.property.level;
CheckTreeItem.property.desc = ExpNode.property.desc;
CheckTreeItem.property.status = ExpNode.property.status;


CheckTreeItem.property.data = {
    set: function (itemData) {
        this._itemData = itemData;
        var text = getTextOfListItem(itemData);
        this.text = text;
        this.attr('title', itemData.value + '')
        var desc = getDescriptionOfListItem(itemData);
        this.desc = desc;
        if (itemData && itemData.icon) {
            this.icon = itemData.icon;
        }
        else {
            this.icon = null;
        }
        this.noSelect = itemData.noSelect;
    },
    get: function () {
        return this._itemData;
    }
};

CheckTreeItem.property.selected = {
    set: function (value) {
        this.$checkbox.disabled = value === 'empty';
        if (value === 'all') {
            this.$checkbox.removeClass('as-has-minus')
                .removeClass('as-has-minus');
            this.$checkbox.checked = true;
        }
        else if (value === 'child') {
            this.$checkbox.checked = false;
            this.$checkbox.addClass('as-has-minus');
        }
        else if (value === 'empty') {
            this.$checkbox.removeClass('as-has-minus')
            this.$checkbox.checked = false;
        }
        else {
            this.$checkbox.removeClass('as-has-minus');
            this.$checkbox.checked = false;
        }
    },
    get: function () {
        if (this.$checkbox.checked) {
            return 'all';
        }
        else {
            if (this.$checkbox.hasClass('as-has-minus')) {
                return 'child';
            }
            else {
                return 'none';
            }
        }
    }
};

CheckTreeItem.property.noSelect = {
    set: function (value) {
        if (value) {
            this.addClass('as-no-select');
        }
        else {
            this.removeClass('as-no-select');
        }
    },
    get: function () {
        return this.hasClass('as-no-select');
    }
};


CheckTreeItem.eventHandler = {};


CheckTreeItem.eventHandler.checkboxChange = function (event) {
    this.emit('select', {
        type: 'select',
        target: this,
        originalEvent: event.originalEvent || event.originEvent || event
    });
};

CheckTreeItem.eventHandler.click = function (event) {
    var tBound;
    if (this.status === 'open' || this.status === 'close') {
        tBound = this.$toggleIcon.getBoundingClientRect();
        if (event.clientX <= tBound.right || this.noSelect) {
            this.emit('presstoggle', { type: 'presstoggle', target: this, originalEvent: event }, this);
        }
        else if (!hitElement(this.$checkbox, event) && !this.$checkbox.disabled) {
            this.$checkbox.checked = !this.$checkbox.checked;
            this.eventHandler.checkboxChange(event);
        }
    }
    else {
        if (!hitElement(this.$checkbox, event) && !this.noSelect && !this.$checkbox.disabled) {
            this.$checkbox.checked = !this.$checkbox.checked;
            this.eventHandler.checkboxChange(event);
        }
    }
};

ACore.install(CheckTreeItem);


export default CheckTreeItem;