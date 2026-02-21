import ACore, { _, $ } from "../ACore";
import { ExpNode } from "./ExpTree";
import { getDescriptionOfListItem, getTextOfListItem } from "./SelectListItem";
import '../css/checktreeitem.css';
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";


/***
 * @extends ExpNode
 * @constructor
 */
function CheckTreeItem() {
    /**
     * @type {any}
     * @private
     */
    this._itemData = null;
    /**
     * @type {HTMLSpanElement|AElement}
     * Tên của node (hiển thị tên mục)
     */
    this.$name = $('span.absol-exp-node-name', this);
    /**
     * @type {HTMLSpanElement|AElement}
     * Mô tả của node (hiển thị mô tả mục)
     */
    this.$desc = $('span.absol-exp-node-desc', this);
    this.$iconCtn = $('div.absol-exp-node-ext-icon', this);
    /**
     * @type {HTMLElement|AElement}
     * Hiển thị mức (level) của node trong cây
     */
    this.$level = $('.absol-exp-node-level', this);
    this.$checkbox = $('checkboxbutton', this)
        .on('change', this.eventHandler.checkboxChange);
    this.$toggleIcon = $('toggler-ico', this);
    this.on('click', this.eventHandler.click);
    /**
     * @type {string}
     * @name name
     * @memberOf CheckTreeItem#
     */

    /**
     * @type {string}
     * @name text
     * @memberOf CheckTreeItem#
     */
    /**
     * @type {string}
     * @name highlightedText
     * @memberOf CheckTreeItem#
     */
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
CheckTreeItem.property.level = ExpNode.property.level;
CheckTreeItem.property.desc = ExpNode.property.desc;
CheckTreeItem.property.status = ExpNode.property.status;

CheckTreeItem.prototype.updateName = function () {
    this.$name.clearChild();
    var value = this.name;
    var highlightedText = this.highlightedText.toLowerCase();
    var parts = [];
    var idx;
    if (value && value.length > 0) {
        if (highlightedText) {
            while (value) {
                idx = nonAccentVietnamese(value.toLowerCase()).indexOf(highlightedText);
                if (idx < 0) {
                    parts.push(_({ text: value }));
                    value = '';
                }
                else {
                    if (idx > 0) {
                        parts.push(_({ text: value.substring(0, idx) }));
                    }
                    parts.push(_({ tag: 'mark', child: { text: value.substring(idx, idx + highlightedText.length) } }));
                    value = value.substring(idx + highlightedText.length);
                }
            }
            this.$name.addChild(parts);
        }
        else {
            this.$name.addChild(_({ text: value }));
        }
    }

};

CheckTreeItem.property.name = {
    set: function (value) {
        value = value + '';
        this._name = value;
        this.updateName();
    },
    get: function () {
        return this._name || '';
    }
};

CheckTreeItem.property.text = {
    set: function (value) {
        this.name = value;
    },
    get: function () {
        return this.name;
    }
};


CheckTreeItem.property.highlightedText = {
    set: function (value) {
        value = value || '';
        this._highlightedText = (value + '').trim();
        this.updateName();
    },
    get: function () {
        return this._highlightedText || '';
    }
};


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
        this._selected = value;
        this.$checkbox.disabled = value === 'empty';
        if (value === 'all') {
            this.$checkbox.minus = false;
            this.$checkbox.checked = true;
        }
        else if (value === 'child') {
            this.$checkbox.checked = false;
            this.$checkbox.minus = true;
        }
        else if (value === 'empty') {
            this.$checkbox.minus = false;
            this.$checkbox.checked = false;
        }
        else {
            this.$checkbox.minus = false;
            this.$checkbox.checked = false;
        }
    },
    get: function () {
        if (this.$checkbox.disabled) return 'empty';
        if (this.$checkbox.checked) return 'all';
        else if (this.$checkbox.minus) return 'child';
        return 'none';
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

CheckTreeItem.property.readOnly = {
    /**
     * @this CheckTreeItem
     * @param value
     */
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
            this.$checkbox.readOnly = true;
            this.$checkbox.addClass('as-border-none');
        }
        else {
            this.removeClass('as-read-only');
            this.$checkbox.readOnly = false;
            this.$checkbox.removeClass('as-border-none');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
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