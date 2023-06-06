import { $, _ } from "../../ACore";
import CTIPropHandlers from "./CTIPropHandlers";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { keyStringOf } from "../utils";

/***
 * @extends AElement
 * @constructor
 */
function MCheckTreeItem() {
    this._data = null;
    this._status = 'none';
    this.$text = $('.am-check-tree-item-text', this).firstChild;
    this.$desc = $('.am-check-tree-item-desc', this).firstChild;
    this.$iconCtn = $('.am-check-tree-item-icon-ctn', this);
    this.$checkbox = $('checkboxinput', this)
        .on('change', this.eventHandler.checkboxChange);
    this.addEventListener('click', this.eventHandler.click);

}

MCheckTreeItem.tag = 'MCheckTreeItem'.toLowerCase();

MCheckTreeItem.render = function () {
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

MCheckTreeItem.prototype._updateData = function () {
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

    if (this._data && this._data.isLeaf) {
        this.addClass('as-is-leaf');
    }
    else {
        this.removeClass('as-is-leaf');
    }
};

MCheckTreeItem.eventHandler = {};

MCheckTreeItem.eventHandler.click = function (event) {
    if (hitElement(this.$checkbox, event)) return;
    var  checkboxBound = this.$checkbox.getBoundingClientRect();
    var canCheck = this.$checkbox.getComputedStyleValue('pointer-events') !== 'none' && !this.$checkbox.disabled && checkboxBound.width > 0;
    if (this.status === 'none' && canCheck) {
        this.$checkbox.checked = !this.$checkbox.checked;
        this.$checkbox.notifyChange();
    }
    else if (this.status !== 'none') {
        if (!checkboxBound.width) {
            checkboxBound = this.$iconCtn.getBoundingClientRect();
        }
        if (!checkboxBound.width) {
            checkboxBound = { left: this.getBoundingClientRect().left + parseFloat(this.$text.parentElement.getComputedStyleValue('padding-left').replace('px')) };
        }
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


MCheckTreeItem.eventHandler.checkboxChange = function () {
    this.emit('checkedchange', { type: 'checkedchange' }, this);
};

MCheckTreeItem.property = CTIPropHandlers;

/***
 * @name data
 * @memberOf MCheckTreeItem#
 */

/***
 * @name text
 * @type {string}
 * @memberOf MCheckTreeItem#
 */

/***
 * @name desc
 * @type {string}
 * @memberOf MCheckTreeItem#
 */

/***
 * @name value
 * @memberOf MCheckTreeItem#
 */



export default MCheckTreeItem;
