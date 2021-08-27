import ACore, {_, $} from "../ACore";
import Follower from "./Follower";
import SelectListBox from "./SelectListBox";
import {prepareSearchForList} from "./list/search";
import CheckListItem, {measureCheckListSize} from "./CheckListItem";
import '../css/checklistbox.css'
import DomSignal from "absol/src/HTML5/DomSignal";
import noop from "absol/src/Code/noop";


/***
 * @extends Follower
 * @constructor
 */
function CheckListBox() {
    this.$content = $('.as-select-list-box-content', this);
    this.$checkAll = $('.as-select-list-box-check-all', this)
        .on('change', this.eventHandler.checkAllChange);
    this.$OKBtn = $('.as-select-list-box-ok-btn', this)
        .on('click', this.eventHandler.clickOKBtn);
    this.$domSignal = $('attachhook.as-dom-signal', this);
    this.domSignal = new DomSignal(this.$domSignal);
    this.$searchInput = $('searchtextinput', this);
    this.$itemByValue = {};
    this.itemByValue = {};
    this.checkedValueDict = {};
    this._items = [];
    this._values = [];
    this.items = this._items;
    this.values = [];
}

CheckListBox.tag = 'CheckListBox'.toLowerCase();


CheckListBox.render = function () {
    return _({
        tag: Follower.tag,
        extendEvent: ['change', 'submit'],
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
                    '.as-select-list-box-content'
                ]
            },
            {
                class: 'as-select-list-box-footer',
                child: [
                    {
                        tag: 'checkbox',
                        class: 'as-select-list-box-check-all',
                        props: {
                            checked: false,
                            text: 'Check All'
                        }
                    },
                    {
                        tag: 'a',
                        class: 'as-select-list-box-ok-btn',
                        child: {text: 'OK'}
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ]
    });
};

CheckListBox.prototype.findItemsByValue = SelectListBox.prototype.findItemsByValue;

CheckListBox.prototype.viewListAtFirstSelected = noop;
CheckListBox.prototype._updateItemNodeIndex = SelectListBox.prototype._updateItemNodeIndex;

CheckListBox.prototype._updateItems = function () {
    this._estimateSize = measureCheckListSize(this._items);
    this._estimateWidth = this._estimateSize.width;
    this.addStyle('--select-list-estimate-width', this._estimateSize.width + 'px');
    this._updateItemNodeIndex();
    this.$content.clearChild();
    var onSelectListener = this.eventHandler.itemSelect;
    var selectedDict = this.checkedValueDict;
    this.$items = this._items.map(function (item) {
        var itemElt = _({
            tag: CheckListItem.tag,
            props: {
                data: item
            }
        });
        itemElt.selected = ((itemElt.value + '') in selectedDict);
        itemElt.on('select', onSelectListener.bind(null, itemElt));
        return itemElt;
    });
    this.$itemByValue = this.$items.reduce(function (ac, cr) {
        ac[cr.value] = cr;
        return ac;
    }, {});
    this.$content.addChild(this.$items);
};

CheckListBox.prototype._updateSelectedItems = function () {
    var dict = this.checkedValueDict;
    this.$items.forEach(function (itemElt) {
        itemElt.selected = ((itemElt.value + '') in dict);
    });
};

CheckListBox.prototype.resetSearchState = noop;


CheckListBox.property = {};

CheckListBox.property.values = {
    set: function (values) {
        this._values = values;
        this.checkedValueDict = values.reduce(function (ac, cr) {
            ac[cr + ''] = cr;
            return ac;
        }.bind(this), {});
        this._updateSelectedItems();
        if (this._values.length < this.items.length) this.$checkAll.checked = false;
    },
    /***
     * @this CheckListBox
     * @return {string[]}
     */
    get: function () {
        var dict = this.checkedValueDict;
        return Object.keys(dict).map(function (key) {
            return dict[key];
        });
    }
};

CheckListBox.property.items = {
    /***
     * @this CheckListBox
     * @param items
     */
    set: function (items) {
        items = items || [];
        prepareSearchForList(items);
        this._items = items;
        this._updateItems();
    },

    get: function () {
        return this._items;
    }
};

CheckListBox.property.enableSearch = SelectListBox.property.enableSearch;


CheckListBox.eventHandler = {};


/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.checkAllChange = function (event) {
    var checked = this.$checkAll.checked;
    this.$items.reduce(function (ac, it) {
        var value = it.value;
        it.selected = checked;
        if (checked) {
            ac[value] = value;
        } else {
            delete ac[value];
        }
        return ac;
    }, this.checkedValueDict);
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event
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
    if (selected) {
        this.checkedValueDict[value + ''] = value;
    } else {
        delete this.checkedValueDict[value + ''];
        this.$checkAll.checked = false;
    }
    this.emit('change', {
        target: this,
        type: 'change',
        originalEvent: event.originalEvent || event.originEvent || event
    }, this);
};


/***
 * @this CheckListBox
 * @param event
 */
CheckListBox.eventHandler.clickOKBtn = function (event) {
    this.emit('submit', {type: 'submit', target: this, originalEvent: event}, this);
};

ACore.install(CheckListBox);


export default CheckListBox;