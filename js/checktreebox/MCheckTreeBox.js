import '../../css/dropdownbox.css';
import { $, _ } from "../../ACore";
import CTBPropHandlers from "./CTBPropHandlers";
import MCTBItemListController from "./MCTBItemListController";
import SearchTextInput from "../Searcher";
import { CTBModeNormal, CTBModeSearch } from "./CTBModes";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import MCTBItemHolder from "./MCTBItemHolder";
import MCheckTreeItem from "./MCheckTreeItem";


/***
 * @extends AElement
 * @constructor
 */
function MCheckTreeBox() {
    this.$box = $('.am-check-tree-box', this);
    this.$body = $('.am-check-tree-box-body', this);
    this.$list = $('.am-check-tree-box-list', this);
    this.$chekAll = $('.as-select-list-box-check-all', this)
        .on('change', function () {
            this.modes.normal.select(this.$chekAll.checked);
            if (this.mode.updateSelectedFromRef) this.mode.updateSelectedFromRef();
            this.notifyChange();
        }.bind(this));
    this.$searchInput = $(SearchTextInput.tag, this).on('stoptyping', this.eventHandler.searchTextInputModify);
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this)
        .on('click', function () {
            this.emit('cancel', { type: 'cancel', target: this }, this);
        }.bind(this));
    this.$closeBtn = $('.as-select-list-box-close-btn', this);
    this.$boxCloseBtn = $('.am-dropdown-box-close-btn', this);
    this.on('click', function (event) {
        if (event.target === this || hitElement(this.$closeBtn, event) || hitElement(this.$boxCloseBtn, event)) {
            this.emit('close', { type: 'close', target: this }, this);
        }
    }.bind(this));

    this.pendingValues = null;
    this.modes = {
        normal: new this.classes.ModeNormal(this, [])
    };
    /***
     *
     * @type {CTBModeNormal | CTBModeSearch}
     */
    this.mode = this.modes.normal;
    this.itemListCtrl = new this.classes.ListController(this);
}

MCheckTreeBox.prototype.classes = {
    ListController: MCTBItemListController,
    ModeSearch: CTBModeSearch,
    ModeNormal: CTBModeNormal,
    ItemHolder: MCTBItemHolder,
    ItemElement: MCheckTreeItem
};


MCheckTreeBox.tag = 'MCheckTreeBox'.toLowerCase();

MCheckTreeBox.render = function () {
    return _({
        extendEvent: ['change', 'close', 'cancel'],
        class: ['am-modal', 'am-dropdown-box-modal'],
        child: {
            class: ['am-check-tree-box', 'am-dropdown-box', 'as-dropdown-box-common-style'],
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
                    class: ['am-dropdown-box-body', 'am-check-tree-box-body'],
                    child: {
                        class: 'am-check-tree-box-list',

                    }
                },
                {
                    class: 'as-dropdown-box-footer',
                    child: [
                        {
                            tag: 'checkbox',
                            class: 'as-select-list-box-check-all',
                            props: {
                                checked: false,
                                text: LanguageSystem.getText('txt_check_all') || LanguageSystem.getText('txt_all') || 'Check All'
                            }
                        },
                        {
                            class: 'as-dropdown-box-footer-right',
                            child: [
                                {
                                    tag: 'a',
                                    class: 'as-select-list-box-cancel-btn',
                                    attr: {
                                        "data-ml-key": 'txt_cancel'
                                    }
                                },
                                {
                                    tag: 'a',
                                    class: 'as-select-list-box-close-btn',
                                    attr: {
                                        "data-ml-key": 'txt_close'
                                    }
                                }]
                        }
                    ]
                }
            ]
        }
    });
};

MCheckTreeBox.prototype.getHolderByValue = function (value) {
    return this.modes.normal.getHolderByValue(value);
};

MCheckTreeBox.prototype.select = function (value, flag) {
    var holder = this.modes.normal.getHolderByValue(value);
    if (holder) {
        holder.select(flag);
        if (this.mode !== this.modes.normal) {
            this.mode.updateSelectedFromRef();
        }
        return true;
    }
    return false;
};


MCheckTreeBox.prototype.getItemByValue = function (value) {
    var holder = this.modes.normal.getHolderByValue(value);
    if (holder) return holder.data;
    return null;
};

MCheckTreeBox.prototype.focus = function () {
    if (this.enableSearch) {
        this.$searchInput.focus();
    }
};


MCheckTreeBox.prototype.resetSearchState = function () {
    this.$searchInput.value = '';
    this.eventHandler.searchTextInputModify();
};

MCheckTreeBox.prototype.notifyChange = function () {
    this.pendingValues = null;
    this.emit('change', { type: 'change', target: this }, this);
};

/***
 * @name eventHandler
 * @type {{}}
 * @memberOf MCheckTreeBox#
 */
MCheckTreeBox.eventHandler = {};

MCheckTreeBox.eventHandler.searchTextInputModify = function () {
    var query = this.$searchInput.value.trim().replace(/\s+/g, ' ');
    if (query.length > 0) {
        if (this.mode === this.modes.normal) {
            this.mode.onStop();
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
        }
    }
};


MCheckTreeBox.property = CTBPropHandlers;


export default MCheckTreeBox;

/*********************************** ADAPT OLD VERSION ***************************************************************/

MCheckTreeBox.prototype.findItemHoldersByValue = function (value) {
    var holder = this.getHolderByValue(value);
    if (holder) {
        return [holder];
    }
    else {
        return [];
    }
};