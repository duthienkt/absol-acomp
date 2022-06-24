import ACore, { _, $ } from "../ACore";
import Follower from "./Follower";
import SelectListBox, { VALUE_HIDDEN } from "./SelectListBox";
import CheckListItem from "./CheckListItem";
import '../css/checklistbox.css'
import noop from "absol/src/Code/noop";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";


var itemPool = [];


export function makeItem() {
    return _({
        tag: CheckListItem,
        on: {
            select: function (event) {
                this.$parent.eventHandler.itemSelect(this, event)
            }
        }
    });
}

export function requireItem($parent) {
    var item;
    if (itemPool.length > 0) {
        item = itemPool.pop();
    }
    else {
        item = makeItem();
    }
    item.$parent = $parent;
    return item;
}

export function releaseItem(item) {
    item.$parent = null;
    item.selected = false;
    itemPool.push(item);
}


/***
 * @extends SelectListBox
 * @constructor
 */
function CheckListBox() {
    this._initDomHook();
    this._initControl();
    this._initScroller();
    this._initFooter();
    this._initProperty();
    this.domSignal.on('viewListAtValue', this.viewListAtValue.bind(this));
}

CheckListBox.tag = 'CheckListBox'.toLowerCase();

CheckListBox.render = function () {
    return _({
        tag: Follower.tag,
        extendEvent: ['change', 'cancel', 'close'],
        attr: {
            tabindex: 0
        },
        class: ['as-select-list-box', 'as-check-list-box'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller'],
                child: [
                    {
                        class: 'as-select-list-box-content',
                        child: Array(this.prototype.preLoadN).fill('.as-select-list-box-page')
                    }
                ]
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
                                attr:{
                                    'data-ml-key':'txt_cancel'
                                }
                            },
                            {
                                tag: 'a',
                                class: 'as-select-list-box-close-btn',
                                attr:{
                                    'data-ml-key':'txt_close'
                                }
                            }]
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ],
        props:{
            anchor: [1, 6, 2, 5]
        }
    });
};

Object.assign(CheckListBox.prototype, SelectListBox.prototype);
CheckListBox.property = Object.assign({}, SelectListBox.property);
CheckListBox.eventHandler = Object.assign({}, SelectListBox.eventHandler);
CheckListBox.prototype.itemHeight = 25;
CheckListBox.prototype.footerMinWidth = 110;


CheckListBox.prototype._initFooter = function () {
    this.$checkAll = $('.as-select-list-box-check-all', this)
        .on('change', this.eventHandler.checkAllChange);
    this.$cancelBtn = $('.as-select-list-box-cancel-btn', this)
        .on('click', this.eventHandler.clickCancelBtn);
    this.$closeBtn = $('.as-select-list-box-close-btn', this);
    if (this.$closeBtn)//mobile ref
        this.$closeBtn.on('click', this.eventHandler.clickCloseBtn);

};


CheckListBox.prototype._requireItem = function (pageElt, n) {
    var itemElt;
    while (pageElt.childNodes.length > n) {
        itemElt = pageElt.lastChild;
        itemElt.selfRemove();
        releaseItem(itemElt);
    }
    while (pageElt.childNodes.length < n) {
        itemElt = requireItem(this);
        pageElt.addChild(itemElt);
    }
};


CheckListBox.prototype.viewListAtFirstSelected = noop;

CheckListBox.prototype.viewListAtValue = function (value) {
    if (!this.isDescendantOf(document.body)) {
        this.domSignal.emit('viewListAtValue', value);
        return;
    }
    if (this._displayValue == VALUE_HIDDEN) {
        return false;
    }


    var itemHolders = this._displayItemHolderByValue[value + ''];
    if (itemHolders) {
        this.domSignal.once('scrollIntoValue', function () {
            var holder = itemHolders[0];
            this.viewListAt(holder.idx);
            var itemElt = $('.as-check-list-item', this.$listScroller, function (elt) {
                return elt.value === value;
            });
            if (itemElt) {
                var scrollBound = this.$listScroller.getBoundingClientRect();
                var itemBound = itemElt.getBoundingClientRect();
                this.$listScroller.scrollTop += itemBound.top - scrollBound.top;
            }
        }.bind(this));
        this.domSignal.emit('scrollIntoValue');
        return true;
    }
    else return false;

};

CheckListBox.prototype.focus = SelectListBox.prototype.focus;

CheckListBox.property.values = {
    set: function (value) {
        SelectListBox.property.values.set.apply(this, arguments);
        this.$checkAll.checked = this._values.length === this.items.length;
    },
    get: SelectListBox.property.values.get
};

/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.checkAllChange = function (event) {
    var checked = this.$checkAll.checked;
    if (checked) {
        this._values = this.items.map(function (cr) {
            return typeof cr === "object" ? cr.value : cr;
        });
        this._valueDict = this._values.reduce(function (ac, value) {
            ac[value + ''] = true;
            return ac;
        }, {});
    }
    else {
        this._values = [];
        this._valueDict = {};
    }
    this._updateSelectedItem();
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event,
        action: checked ? 'check_all' : "uncheck_all"
    }, this);
};


/***
 * @this CheckListBox
 * @param itemElt
 * @param event
 */
CheckListBox.eventHandler.itemSelect = function (itemElt, event) {
    var selected = itemElt.selected;
    var value = itemElt.value;
    var itemData = itemElt.data;
    var idx;
    if (selected) {
        this._values.push(value);
        this._valueDict[value + ''] = true;
    }
    else {
        idx = this._values.indexOf(value);
        delete this._valueDict[value + ''];
        if (idx >= 0) {
            this._values.splice(idx, 1);
        }
        else {
            console.error("Violation data");
        }
    }
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event,
        action: selected ? 'check' : 'uncheck',
        value: value,
        itemData: itemData
    }, this);
};


/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.clickCancelBtn = function (event) {
    this.emit('cancel', { type: 'cancel', target: this, originalEvent: event }, this);
};

/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.clickCloseBtn = function (event) {
    this.emit('close', { type: 'close', target: this, originalEvent: event }, this);
};

ACore.install(CheckListBox);


export default CheckListBox;