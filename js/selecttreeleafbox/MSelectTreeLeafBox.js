import ACore, { $, _ } from "../../ACore";
import SearchTextInput from "../Searcher";
import '../../css/selecttreeeleafbox.css';
import MSTLBItemListController from "./MSTLBItemListController";
import { STLBModeNormal } from "./STLBModes";
import STLBPropsHandlers from "./STLBPropsHandlers";
import MCheckTreeBox from "../checktreebox/MCheckTreeBox";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import SelectTreeLeafBox from "../SelectTreeLeafBox";
import { estimateWidth14, keyStringOf } from "../utils";

/****
 * @extends AElement
 * @constructor
 */
function MSelectTreeLeafBox() {
    this.estimateSize = { width: 0, height: 0 };
    this.$box = $('.am-dropdown-box', this);
    this.$list = $('.am-select-tree-leaf-box-list', this);
    this.itemListCtrl = new MSTLBItemListController(this);
    this.$searchInput = $(SearchTextInput.tag, this).on('stoptyping', this.eventHandler.searchTextInputModify);
    this.$boxCloseBtn = $('.am-dropdown-box-close-btn', this);
    this.on('click', function (event) {
        if (event.target === this || hitElement(this.$boxCloseBtn, event)) {
            this.emit('close', { type: 'close', target: this }, this);
        }
    }.bind(this));
    this.modes = {
        normal: new STLBModeNormal(this, []),
        search: null
    };
    this.mode = this.modes.normal;
    this.strictValue = true;


    /**
     * @name items
     * @memberof MSelectTreeLeafBox#
     * @type {Array}
     */


    /**
     * @name value
     * @memberof MSelectTreeLeafBox#
     */

    /**
     * @name strictMode
     * @type {boolean}
     * @memberof MSelectTreeLeafBox#
     */

    /**
     * @name selectedItem
     * @memberof MSelectTreeLeafBox#
     */
}

MSelectTreeLeafBox.tag = 'MSelectTreeLeafBox'.toString();

MSelectTreeLeafBox.render = function () {
    return _({
        extendEvent: ['pressitem', 'close'],
        class: ['am-modal', 'am-dropdown-box-modal'],
        child: {
            class: ['am-select-tree-leaf-box', 'am-dropdown-box', 'as-dropdown-box-common-style'],
            child: [
                {
                    class: 'am-dropdown-box-header',
                    child: [
                        {
                            tag: SearchTextInput.tag
                        },
                        {
                            tag: 'button',
                            class: 'am-dropdown-box-close-btn',
                            child: 'span.mdi.mdi-close'
                        }
                    ]
                },
                {
                    class: ['am-dropdown-box-body', 'am-select-tree-leaf-box-body'],
                    child: {
                        class: 'am-select-tree-leaf-box-list'
                    }
                }
            ]
        }
    });
};

MSelectTreeLeafBox.prototype._calcEstimateSize = SelectTreeLeafBox.prototype._calcEstimateSize;
MSelectTreeLeafBox.prototype._estimateRawItemWidth = SelectTreeLeafBox.prototype._estimateRawItemWidth;


MSelectTreeLeafBox.prototype._estimateItemWidth = function (item, level) {
    var width = 12;//padding
    width += 12 * level;
    width += 14.7 + 5;//toggle icon
    // if (item.icon) width += 21;//icon
    width += 7 + estimateWidth14(item.text) + 5 + 7;//margin-text
    if (item.desc) width += 6 + estimateWidth14(item.desc) * 0.85;
    return width;
};

MSelectTreeLeafBox.prototype._findFirstLeaf = SelectTreeLeafBox.prototype._findFirstLeaf;


MSelectTreeLeafBox.prototype.viewToSelected = function () {
    this.modes.normal.viewToSelected();
};

MSelectTreeLeafBox.prototype.notifyPressItem = function (eventData) {
    delete this.pendingValue;
    this.emit('pressitem', Object.assign({ type: 'pressitem', target: this }, eventData), this);
};

MSelectTreeLeafBox.prototype.getItemByValue = function (value) {
    return this.modes.normal.getItemByValue(value);
};


MSelectTreeLeafBox.prototype.findItemByValue = function (value) {
    return  this.modes.normal.getItemByValue(value);
};

MSelectTreeLeafBox.prototype.resetSearchState = MCheckTreeBox.prototype.resetSearchState;

MSelectTreeLeafBox.property = STLBPropsHandlers;

MSelectTreeLeafBox.property.items = {
    set: function (items) {
        var curValue;
        var selected = true;
        if ('pendingValue' in this) {
            curValue = this.pendingValue;
        }
        else {
            try {
                curValue = this.modes.normal.getValue(this.strictValue);
            } catch (err) {
                selected = false;
            }
        }

        this.estimateSize = this._calcEstimateSize(items);
        this._items = items;//todo: check usage
        this.itemListCtrl.setItems(items);
        if (selected || this.strictValue) this.modes.normal.setValue(curValue, this.strictValue);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
       return this.itemListCtrl.getItems();
    }
};

MSelectTreeLeafBox.property.value = {
    /***
     * @this MSelectTreeLeafBox
     * @param value
     */
    set: function (value) {
        this.pendingValue = value;
        this._value = value;
        this.modes.normal.setValue(this.pendingValue, this.strictValue);

    },
    get: function () {
        if ('pendingValue' in this) {
            return this.pendingValue;
        }
        else {
            try {
                return this.modes.normal.getValue(this.strictValue);
            } catch (err) {
                return undefined;
            }
        }
    }
};

MSelectTreeLeafBox.property.selectedItem = {
    get: function () {
        return  this.modes.normal.getItemByValue(this.value);
    }
};


MSelectTreeLeafBox.property.strictValue = {
    set: function (value) {
        if (value) {
            this.$box.addClass('as-strict-value');
        }
        else {
            this.$box.removeClass('as-strict-value');
        }

        this.modes.normal.setValue(this.pendingValue, this.strictValue);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
    },
    get: function () {
        return this.$box.hasClass('as-strict-value');
    }
};


MSelectTreeLeafBox.eventHandler = {};

MSelectTreeLeafBox.eventHandler.searchTextInputModify = MCheckTreeBox.eventHandler.searchTextInputModify;


ACore.install(MSelectTreeLeafBox);

export default MSelectTreeLeafBox;