import SearchTextInput from "../Searcher";
import { $, $$, _ } from "../../ACore";
import DSBPropHandlers from "./DSBPropHandlers";
import MDSBItemListController from "./MDSBItemListController";
import { DSBModeNormal } from "./DSBModes";
import '../../css/dualselectbox.css';
import { keyStringOf } from "../utils";
import { hitElement } from "absol/src/HTML5/EventEmitter";

/***
 * @extends {AElement}
 * @constructor
 */
function MDualSelectBox() {
    this.$box = $('.am-dropdown-box', this);
    this.$lists = $$('.as-dual-select-box-list', this);
    this.itemListCtrl = new MDSBItemListController(this);
    this.$searchInput = $(SearchTextInput.tag, this)
        .on('stoptyping', this.eventHandler.searchModify);
    this.$closeBtn = $('.am-dropdown-box-close-btn', this);
    this.modes = {
        normal: new DSBModeNormal(this, [])
    }
    this.mode = this.modes.normal;
    this.strictValue = false;
    this.on('click', this.eventHandler.click);
}


MDualSelectBox.tag = 'MDualSelectBox'.toLowerCase();

MDualSelectBox.render = function () {
    return _({
        extendEvent: ['change', 'close'],
        class: ['am-modal', 'am-dropdown-box-modal', 'am-dual-select-modal'],
        child: {
            class: ['am-dual-select-box', 'am-dropdown-box', 'as-dropdown-box-common-style'],
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
                    class: ['am-dropdown-box-body', 'am-check-tree-box-body', 'as-dual-select-box-list-ctn'],
                    child: [
                        {
                            class: ['as-dual-select-box-list', 'absol-selectlist'],
                        },
                        {
                            class: 'as-dual-select-box-arrow-ctn',
                            child: 'span.mdi.mdi-menu-right'
                        },
                        {
                            class: ['as-dual-select-box-list', 'absol-selectlist']
                        }
                    ]
                }
            ]
        }
    });
};


MDualSelectBox.prototype.viewToSelected = function () {
    this.modes.normal.viewToSelected();
};

MDualSelectBox.prototype.notifyChange = function () {
    var newValue = this.value;
    if (keyStringOf(newValue) !== keyStringOf(this['savedValue'])) {
        this.savedValue = newValue;
        this.emit('change', { type: 'change', target: this }, this);
    }
};

MDualSelectBox.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this.eventHandler.searchModify();
}

MDualSelectBox.prototype.focus = function () {
    setTimeout(() => {
        if (this.enableSearch) {
            this.$searchInput.focus();
        }
    }, 10);
}

MDualSelectBox.property = DSBPropHandlers;

MDualSelectBox.eventHandler = {};

MDualSelectBox.eventHandler.searchModify = function () {
    var query = this.$searchInput.value.trim().replace(/\s+/g, ' ');
    if (query.length > 0) {
        if (this.mode === this.modes.normal) {
            this.mode.onStop();
            this.$box.addClass('as-searching');
        }
        this.mode.search = this.itemListCtrl.makeSearch(query);
        this.mode = this.mode.search;
        this.mode.onStart();
    }
    else {
        if (this.mode !== this.modes.normal) {
            this.mode.onStop();
            this.mode = this.modes.normal;
            this.mode.onStart();
            this.$box.removeClass('as-searching');
        }
    }
};


MDualSelectBox.eventHandler.click = function (event) {
    if (event.target === this || hitElement(this.$closeBtn, event)) {
        this.emit('close', { type: 'close', target: this, originalEvent: event }, this);
    }
};


export default MDualSelectBox;

