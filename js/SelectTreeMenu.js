import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { wordsMatch } from "absol/src/String/stringMatching";
import treeListToList from "./list/treeListToList";
import {prepareSearchForList, searchTreeListByText} from "./list/search";

var _ = ACore._;
var $ = ACore.$;

function SelectTreeMenu() {
    var res = this;

    //only event is different with selectmenu

    this.$holderItem = $('.absol-selectmenu-holder-item', res);

    this.$anchorCtn = SelectMenu.getAnchorCtn();
    this.$anchor = _('.absol-selectmenu-anchor.absol-disabled').addTo(this.$anchorCtn);
    this.$anchorContentCtn = _('.absol-selectmenu-anchor-content-container').addTo(this.$anchor);

    this.$dropdownBox = _('.absol-selectmenu-dropdown-box').addTo(this.$anchorContentCtn);
    this.$searchTextInput = _('searchtextinput').addStyle('display', 'none').addTo(this.$dropdownBox);
    this.$vscroller = _('bscroller').addTo(this.$dropdownBox);
    this.$selectlist = _('selectlist', this).addTo(this.$vscroller)
        .on('sizechangeasync', this.eventHandler.listSizeChangeAsync)
        .on('valuevisibilityasync', this.eventHandler.listValueVisibility);

    this.$scrollTrackElts = [];
    this.$removableTrackElts = [];

    this._itemsByValue = {};
    this.$searchTextInput.on('stoptyping', this.eventHandler.searchModify);
    this._searchCache = {};
    this.$selectlist.on('pressitem', this.eventHandler.selectlistPressItem, true);
    this.$selectlist.on('pressitem', function () {
        res.isFocus = false;
    }, true);


    this.on('mousedown', this.eventHandler.click, true);
    this.on('blur', this.eventHandler.blur);

    OOP.drillProperty(this, this.$selectlist, 'selectedIndex');

    this.selectListBound = { height: 0, width: 0 };
    this.$attachhook = $('attachhook', res)
        .on('error', res.eventHandler.attached);

    this.sync = new Promise(function (rs) {
        $('attachhook', res).once('error', function () {
            rs();
        });
    });
    this._selectListScrollSession = null;

    this._resourceReady = true;
    return res;
}

SelectTreeMenu.tag = 'SelectTreeMenu'.toLowerCase();

SelectTreeMenu.render = function () {
    return _({
        class: ['absol-selectmenu'],
        extendEvent: ['change', 'minwidthchange'],
        attr: {
            tabindex: '1'
        },
        child: [
            '.absol-selectmenu-holder-item',
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });
};

SelectTreeMenu.prototype.updateItem = SelectMenu.prototype.updateItem;


SelectTreeMenu.prototype.init = SelectMenu.prototype.init;
SelectTreeMenu.prototype.updateDropdownPostion = SelectMenu.prototype.updateDropdownPostion;
SelectTreeMenu.prototype.scrollToSelectedItem = SelectMenu.prototype.scrollToSelectedItem;
SelectTreeMenu.prototype.startTrackScroll = SelectMenu.prototype.startTrackScroll;
SelectTreeMenu.prototype.stopTrackScroll = SelectMenu.prototype.stopTrackScroll;
SelectTreeMenu.prototype._dictByValue = SelectMenu.prototype._dictByValue;
SelectTreeMenu.prototype.startListenRemovable = SelectMenu.prototype.startListenRemovable;
SelectTreeMenu.prototype.stopListenRemovable = SelectMenu.prototype.stopListenRemovable;

SelectTreeMenu.prototype._releaseResource = SelectMenu.prototype._releaseResource;
SelectTreeMenu.prototype._requestResource = function () {
    this.$selectlist.items = this.__searchcache__['__EMPTY_QUERY__'] || {};
};

SelectTreeMenu.eventHandler = {};

SelectTreeMenu.eventHandler.scrollParent = SelectMenu.eventHandler.scrollParent;
SelectTreeMenu.eventHandler.click = SelectMenu.eventHandler.click;
SelectTreeMenu.eventHandler.bodyClick = SelectMenu.eventHandler.bodyClick;
SelectTreeMenu.eventHandler.selectlistPressItem = SelectMenu.eventHandler.selectlistPressItem;
SelectTreeMenu.eventHandler.removeParent = SelectMenu.eventHandler.removeParent;


SelectTreeMenu.eventHandler.listSizeChangeAsync = SelectMenu.eventHandler.listSizeChangeAsync;
SelectTreeMenu.eventHandler.listValueVisibility = SelectMenu.eventHandler.listValueVisibility;

SelectTreeMenu.property = {};
SelectTreeMenu.property.disabled = SelectMenu.property.disabled;
SelectTreeMenu.property.hidden = SelectMenu.property.hidden;
SelectTreeMenu.property.value = SelectMenu.property.value;
SelectTreeMenu.property.enableSearch = SelectMenu.property.enableSearch;

SelectTreeMenu.eventHandler.attached = SelectMenu.eventHandler.attached;
SelectTreeMenu.eventHandler.removeParent = SelectMenu.eventHandler.removeParent;

SelectTreeMenu.treeToList = treeListToList;


SelectTreeMenu.eventHandler.searchModify = function (event) {
    var value = this.$searchTextInput.value;
    this.search(value);

}

SelectTreeMenu.prototype.notifyChange = function (eventData) {
    setTimeout(function () {
        this.emit('change', Object.assign({}, eventData), this)
    }.bind(this), 1)
}



SelectTreeMenu.property.items = {
    set: function (value) {
        value = value || [];
        this._items = value;
        this.__searchcache__ = {};
        this.__searchcache__['__EMPTY_QUERY__'] = SelectTreeMenu.treeToList(value);

        this.selectListBound = this.$selectlist.setItemsAsync(this.__searchcache__['__EMPTY_QUERY__']);
        this._resourceReady = true;
        this._itemsByValue = this._dictByValue(this.__searchcache__['__EMPTY_QUERY__']);
        if (this._itemsByValue[this.value] === undefined) {
            this.value = this.__searchcache__['__EMPTY_QUERY__'][0].value;
        }

        this.addStyle('min-width', this.selectListBound.width + 2 + 37 + 'px');
        this.emit('minwidthchange', { target: this, value: this.selectListBound.width + 2 + 37, type: 'minwidthchange' }, this);
        this.updateItem();

    },
    get: function () {
        return this._items;
    }
};



SelectTreeMenu.property.isFocus = {
    set: function (value) {
        var self = this;
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.startTrackScroll();
            this.$anchor.removeClass('absol-disabled');
            var isAttached = false;
            setTimeout(function () {
                if (isAttached) return;
                $('body').on('mousedown', this.eventHandler.bodyClick);
                isAttached = true;
            }.bind(this), 1000);
            $('body').once('click', function () {
                setTimeout(function () {
                    if (isAttached) return;
                    $('body').on('mousedown', this.eventHandler.bodyClick);
                    isAttached = true;
                }.bind(this), 10);
            }.bind(this));

            if (this.enableSearch) {
                setTimeout(function () {
                    this.$searchTextInput.focus();
                }.bind(this), 50);
            }

            this.updateDropdownPostion();
            this.scrollToSelectedItem();
        }
        else {
            this.$anchor.addClass('absol-disabled');
            this.stopTrackScroll();
            $('body').off('mousedown', this.eventHandler.bodyClick);
            setTimeout(function () {
                if (self.$searchTextInput.value != 0) {
                    self.$searchTextInput.value = '';
                    // different with SelectMenu
                    self.$selectlist.items = self.__searchcache__['__EMPTY_QUERY__'];
                    this._resourceReady = true;
                }
            }, 100)
            this.updateItem();
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};


/***
 *
 * @param {String} query
 * @param {Array<SelectionItem>} items
 * @return {Array<SelectionItem>}
 */
SelectTreeMenu.queryTree = function (query, items) {
    if (query.length == 0 || items.length == 0) return treeListToList(items);
    if (!items[0].__nvnText__)
        prepareSearchForList(items);
    var resultTree = searchTreeListByText(query, items);
    return treeListToList(resultTree);
};

SelectTreeMenu.prototype.search = function (query) {
    if (query.length == 0) {
        this.$selectlist.items = this.__searchcache__['__EMPTY_QUERY__'];
        this._resourceReady = true;
        this.updateItem();
        this.updateDropdownPostion(true);
        this.scrollToSelectedItem();
    }
    else {
        var searchResult = this.__searchcache__[query] || SelectTreeMenu.queryTree(query, this.items);
        this.__searchcache__[query] = searchResult;
        this.$selectlist.items = searchResult;
        this.updateItem();
        this.updateDropdownPostion(true);
        this.$vscroller.scrollTop = 0;
    }
};



ACore.creator.selecttreemenu = SelectTreeMenu;

export default SelectTreeMenu;
