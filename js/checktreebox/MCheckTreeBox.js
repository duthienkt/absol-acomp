import '../../css/dropdownbox.css';
import { $, _ } from "../../ACore";
import CTBPropHandlers from "./CTBPropHandlers";
import SearchTextInput from "../Searcher";
import { CTBModeNormal, CTBModeSearch } from "./CTBModes";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { addElementAfter, copySelectionItemArray, keyStringOf } from "../utils";
import CTIPropHandlers from "./CTIPropHandlers";
import OOP from "absol/src/HTML5/OOP";
import ListDictionary from "../list/ListDictionary";
import prepareSearchForItem, { calcItemMatchScore, prepareSearchForList } from "../list/search";


/***
 * not optimize
 * @param {MCheckTreeBox} elt
 * @constructor
 */
function MCTBItemListController(elt) {
    this.elt = elt;
}

OOP.mixClass(MCTBItemListController, ListDictionary);


MCTBItemListController.prototype.setItems = function (items) {
    items = items || [];
    if (!items.forEach || !items.map) items = [];
    this.items = copySelectionItemArray(items, { removeNoView: true });
    this.update();
};

MCTBItemListController.prototype.update = function () {
    var mode = new this.elt.classes.ModeNormal(this.elt, this.items);
    this.elt.modes.normal = mode;
    if (mode.hasDesc) {
        this.elt.$list.addClass('as-has-desc');
    }
    else {
        this.elt.$list.removeClass('as-has-desc');
    }
    if (mode.hasIcon) {
        this.elt.$list.addClass('as-has-icon');
    }
    else {
        this.elt.$list.removeClass('as-has-icon');
    }
    this.elt.mode = mode;
    mode.onStart();
    this._searchItems = prepareSearchForList(copySelectionItemArray(this.items));
    this._searchCache = {};
};

MCTBItemListController.prototype.getItems = function () {
    return copySelectionItemArray(this.items);
};

MCTBItemListController.prototype.makeSearch = function (query) {
    if (this._searchCache[query]) return this._searchCache[query].resetAndGet();
    var searchItem = prepareSearchForItem({ text: query });

    var minScore = Infinity;
    var maxScore = -Infinity;
    var scoredHolders = this._searchItems.map(function visit(item) {
        var holder = {
            item: item,
            score: calcItemMatchScore(searchItem, item),
            childMaxScore: -Infinity
        };
        minScore = Math.min(minScore, holder.score);
        maxScore = Math.max(maxScore, holder.score);

        if (item.items && item.items.length > 0) {
            holder.children = item.items.map(visit);
            holder.childMaxScore = holder.children.reduce((ac, cr) => {
                return Math.max(ac, cr.score, cr.childMaxScore);
            }, 0)
        }
        return holder;
    });

    var threshHold = maxScore - (maxScore - minScore) / 3;

    var result = scoredHolders.reduce(function filterVisit(ac, cr) {
        var subItems;
        if (Math.max(cr.score, cr.childMaxScore) >= threshHold) {
            ac.items.push(cr.item);
            if (cr.children && cr.childMaxScore >= cr.score) {
                ac.status[keyStringOf(cr.item.value)] = 'open';
                subItems = cr.children.reduce(filterVisit, { items: [], status: ac.status }).items;
                cr.item.items = subItems;
            }
            else {
                if (cr.children && cr.children.length > 0) {
                    ac.status[keyStringOf(cr.item.value)] = 'open';
                }
            }
        }

        return ac;
    }, { items: [], status: {} });
    var normalMode = this.elt.modes.normal;
    result.mode = new this.elt.classes.ModeSearch(this.elt, result.items);
    result.resetAndGet = function () {
        this.mode.children && this.mode.children.forEach(function resetVisit(holder) {
            var key = keyStringOf(holder.data.value);

            holder.ref = normalMode.getHolderByValue(holder.data.value);
            if (holder.status === 'open' && result.status[key] !== 'open') {
                holder.status = 'close';
                if (holder._elt) {
                    holder._elt.status = 'close';
                }
            }
            else if (holder.status === 'close' && result.status[key] === 'open') {
                holder.status = 'open';
                if (holder._elt) {
                    holder._elt.status = 'open';
                }
            }
            if (holder.children) holder.children.forEach(resetVisit);
        });
        return this.mode;
    };

    this._searchCache[query] = result;

    return result.resetAndGet();
};



/***
 * @extends AElement
 * @constructor
 */
export function MCheckTreeItem() {
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



/***
 *
 * @param {MCheckTreeBox} boxElt
 * @param {MCTBItemHolder|CTBModeNormal|CTBModeSearch}parent
 * @param data
 * @constructor
 */
export function MCTBItemHolder(boxElt, parent, data) {
    this.ref = null;
    this.boxElt = boxElt;
    this.$list = this.boxElt.$list;
    this.data = data;
    this.parent = parent;
    this.level = parent ? parent.level + 1 : 0;
    this._elt = null;
    this.children = null;
    this.hasIcon = !!data.icon;
    this.hasDesc = !!data.desc;
    this.status = 'none';
    this.selected = 'none';
    this.hasLeaf = data.isLeaf;
    this.noSelect = data.noSelect;
    this.hasNoSelect = this.noSelect;
    if (data.items && data.items.map && data.items.length > 0) {
        this.children = data.items.map(it => new MCTBItemHolder(boxElt, this, it));
        this.hasIcon = this.hasIcon || this.children.some(child => child.hasIcon);
        this.hasDesc = this.hasDesc || this.children.some(child => child.hasDesc);
        this.hasLeaf = this.hasLeaf || this.children.some(child => child.hasLeaf);
        this.hasNoSelect = this.hasNoSelect || this.children.some(child => child.hasNoSelect);
        this.status = 'close';
    }
}


MCTBItemHolder.prototype.getViewElements = function (ac) {
    ac = ac || [];
    ac.push(this.elt);
    if (this.status === 'open' && this.children) {
        this.children.forEach(child => child.getViewElements(ac));
    }
    return ac;
};


Object.defineProperty(MCTBItemHolder.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: this.boxElt.classes.ItemElement,
                props: {
                    data: this.data,
                    level: this.level,
                    status: this.status,
                    selected: this.selected,
                    hasLeaf: this.hasLeaf,
                    noSelect: this.hasNoSelect
                },
                on: {
                    checkedchange: this.ev_checkedChange.bind(this),
                    statuschange: this.ev_statusChange.bind(this),
                }
            });
        }
        return this._elt;
    }
});


MCTBItemHolder.prototype.ev_checkedChange = function () {
    var selected = this._elt.selected;
    if (this.ref) {
        if (selected === 'all') {
            this.ref.select(true);
        }
        else {
            this.ref.select(false);
        }
        this.getRoot().updateSelectedFromRef();
    }
    else {
        if (selected === 'all') {
            this.select(true);
        }
        else {
            this.select(false);
        }
    }
    this.boxElt.notifyChange();
};

MCTBItemHolder.prototype.ev_statusChange = function () {
    if (this._elt.status === this.status) return;
    var viewElements;
    if (this.status === 'open') {
        viewElements = this.getViewElements();
        viewElements.shift();
        viewElements.forEach((elt) => {
            elt.remove();
        });
        this.status = this._elt.status;
    }
    else if (this.status === 'close') {
        this.status = this._elt.status;
        viewElements = this.getViewElements();
        viewElements.shift();
        addElementAfter(this.$list, viewElements, this._elt);
    }
};

MCTBItemHolder.prototype.updateUp = function () {
    var selected = { child: 0, all: 0, none: 0, /*dont: 0*/ };
    var childN = this.children.length;
    this.children.reduce((ac, child) => {
        ac[child.selected]++;
        return ac;
    }, selected);
    if (childN === selected.all) {
        this.selected = 'all';
    }
    else if (childN === selected.none) {
        this.selected = "none";
    }
    else {
        this.selected = 'child';
    }
    if (this._elt) {
        this._elt.selected = this.selected;
    }
    if (this.parent)
        this.parent.updateUp();
}

MCTBItemHolder.prototype.select = function (flag, isDownUpdate) {
    var leafOnly = this.boxElt.leafOnly;
    if (flag && ((leafOnly && !this.hasLeaf))) return;
    var selected = { child: 0, all: 0, none: 0, exclude: 0/*dont: 0*/ };
    var childN = 0;
    if (this.children && this.children.length > 0) {
        childN = this.children.length;
        this.children.reduce((ac, child) => {
            child.select(flag, true);
            if (leafOnly && !child.hasLeaf) {
                ac.exclude++;
            }
            else {
                ac[child.selected]++;
            }
            return ac;
        }, selected);
        if (leafOnly) {
            if (this.hasLeaf) {
                if (childN === selected.all + selected.exclude) {
                    this.selected = 'all';
                }
                else if (selected.all + selected.child > 0) {
                    this.selected = 'child';
                }
                else {
                    this.selected = 'none';
                }
            }
            else {
                this.selected = "none";
            }
        }
        else {
            if (childN === selected.all) {
                this.selected = 'all';
            }
            else if (childN === selected.none) {
                this.selected = "none";
            }
            else {
                this.selected = 'child';
            }
        }
    }
    else {
        if (flag && (!leafOnly ||this.hasLeaf)) {
            this.selected = 'all';
        }
        else {
            this.selected = 'none';
        }
    }

    if (this._elt) {
        this._elt.selected = this.selected;
    }

    if (!isDownUpdate && this.parent) {
        this.parent.updateUp();
    }
};

MCTBItemHolder.prototype.getRoot = function () {
    var c = this;
    while (c.parent) {
        c = c.parent;
    }
    return c;
}



/*********************************** ADAPT OLD VERSION ***************************************************************/

Object.defineProperty(MCTBItemHolder.prototype, 'item', {
    get: function (){
        return this.data;
    }
});