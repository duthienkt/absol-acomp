import '../../css/dropdownbox.css';
import { $, _ } from "../../ACore";
import CTBPropHandlers from "./CTBPropHandlers";
import MCTBItemListController from "./MCTBItemListController";
import SearchTextInput from "../Searcher";
import MCheckTreeItem from "./MCheckTreeItem";
import { CTBModeNormal, CTBModeSearch } from "./CTBModes";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";


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
    this.$closeBtn = $('.as-select-list-box-close-btn', this)
        .on('click', function () {
            this.emit('close', { type: 'close', target: this }, this);
        }.bind(this));
    this.pendingValues = null;
    this.modes = {};
    this.mode = null;
    this.itemListCtrl = new MCTBItemListController(this);
}


MCheckTreeBox.tag = 'MCheckTreeBox'.toLowerCase();

MCheckTreeBox.render = function () {
    return _({
        extendEvent: ['change', 'close', 'cancel'],
        class: 'am-modal',
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

MCheckTreeBox.prototype.findHolderByValue = function (value) {
    return this.modes.normal.getHolderByValue(value);
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