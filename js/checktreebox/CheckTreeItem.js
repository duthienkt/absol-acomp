import { $, _ } from "../../ACore";
import CTIPropHandlers from "./CTIPropHandlers";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { keyStringOf } from "../utils";

/***
 * @extends AElement
 * @constructor
 */
function CheckTreeItem() {
    this._data = null;
    this._status = 'none';
    this.$text = $('.am-check-tree-item-text', this).firstChild;
    this.$desc = $('.am-check-tree-item-desc', this).firstChild;
    this.$iconCtn = $('.am-check-tree-item-icon-ctn', this);
    this.$checkbox = $('checkboxinput', this)
        .on('change', this.eventHandler.checkboxChange);
    this.addEventListener('click', this.eventHandler.click);

}

CheckTreeItem.tag = 'CheckTreeItem'.toLowerCase();

CheckTreeItem.render = function () {
    return _({
        extendEvent: ['checkedchange', 'click', 'statuschange'],
        class: ['am-check-tree-item', 'am-dropdown-box-item'],
        child: [
            {
                class: 'am-check-tree-item-toggle-ctn',
                child: 'toggler-ico'
            },
            {
                class: 'am-check-tree-item-icon-ctn'
            },
            {
                class: 'am-check-tree-item-checkbox-ctn',
                child: 'checkboxinput'
            },
            {
                class: 'am-check-tree-item-text',
                child: { text: '' }
            },
            {
                class: 'am-check-tree-item-desc',
                child: { text: '' }
            }
        ]
    });
};

CheckTreeItem.prototype._updateData = function () {
    this.$text.data = this.text;
    this.$desc.data = this.desc;
    this.$iconCtn.clearChild();
    this.$icon = null;
    this.attr('data-key', keyStringOf(this.value))
    if (this._data && this._data.icon) {
        this.$icon = _(this._data.icon);
        if (this.$icon.parentElement) {
            this.$icon = this.$icon.cloneNode(true);
        }
        this.$iconCtn.addChild(this.$icon);
        this.addClass('as-has-icon');
    }
    else {
        this.removeClass('as-has-icon');
    }
};

CheckTreeItem.eventHandler = {};

CheckTreeItem.eventHandler.click = function (event) {
    if (hitElement(this.$checkbox, event)) return;
    var checkboxBound;
    var canCheck = this.$checkbox.getComputedStyleValue('pointer-events') !== 'none' && !this.$checkbox.disabled;
    if (this.status === 'none' && canCheck) {
        this.$checkbox.checked = !this.$checkbox.checked;
        this.$checkbox.notifyChange();
    }
    else if (this.status !== 'none'){
        checkboxBound = this.$checkbox.getBoundingClientRect();
        if (event.clientX < checkboxBound.left || !canCheck) {
            this.status = this.status === 'open' ? 'close' : 'open';
            this.emit('statuschange', { type: 'statuschange', target: this }, this);
        }
        else if (canCheck) {
            this.$checkbox.checked = !this.$checkbox.checked;
            this.$checkbox.notifyChange();
        }
    }
};


CheckTreeItem.eventHandler.checkboxChange = function () {
    this.emit('checkedchange', { type: 'checkedchange' }, this);
};

CheckTreeItem.property = CTIPropHandlers;

/***
 * @name data
 * @memberOf CheckTreeItem#
 */

/***
 * @name text
 * @type {string}
 * @memberOf CheckTreeItem#
 */

/***
 * @name desc
 * @type {string}
 * @memberOf CheckTreeItem#
 */

/***
 * @name value
 * @memberOf CheckTreeItem#
 */



export default CheckTreeItem;
