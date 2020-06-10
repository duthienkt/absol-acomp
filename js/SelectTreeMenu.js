import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { wordsMatch } from "absol/src/String/stringMatching";

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

SelectTreeMenu.eventHandler = {};
SelectTreeMenu.eventHandler.attached = SelectMenu.eventHandler.attached;
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



SelectTreeMenu.treeToList = function (items) {
    var arr = [];
    function visit(level, node) {
        node.level = level;
        arr.push(node);
        if (node.items && node.items.length > 0) node.items.forEach(visit.bind(null, level + 1));
    }
    items.forEach(visit.bind(null, 0));
    return arr;
};


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
        SelectTreeMenu.prepareData(this._items);

        this.__searchcache__ = {};
        this.__searchcache__['__EMPTY_QUERY__'] = SelectTreeMenu.treeToList(value);
        this.selectListBound = this.$selectlist.setItemsAsync(this.__searchcache__['__EMPTY_QUERY__']);
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
                }
            }, 100)
            this.updateItem();
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};

// SelectTreeMenu.property.value = Sele;


SelectTreeMenu.EXTRA_MATCH_SCORE = 2;
SelectTreeMenu.UNCASE_MATCH_SCORE = 1;
SelectTreeMenu.UVN_MATCH_SCORE = 3;
SelectTreeMenu.EQUAL_MATCH_SCORE = 4;
SelectTreeMenu.WORD_MATCH_SCORE = 3;

/**
 * @typedef {{text:String, __words__: Array<String>, __textNoneCase__: String, __wordsNoneCase__: Array<String>, __nvnText__:String, __nvnWords__:Array<String>, __nvnTextNoneCase__: String, __nvnWordsNoneCase__: Array<String>}} SearchItem
 * @param {SearchItem} item
 * @returns {SearchItem}
 */
SelectTreeMenu.prepareItem = function (item) {
    var spliter = /\s+/;

    item.__text__ = item.text.replace(/([\s\b\-()\[\]]|&#8239;|&nbsp;|&#xA0;|\s)+/g, ' ').trim();
    item.__words__ = item.__text__.split(spliter);

    item.__textNoneCase__ = item.__text__.toLowerCase();
    item.__wordsNoneCase__ = item.__textNoneCase__.split(spliter);


    item.__nvnText__ = nonAccentVietnamese(item.__text__);
    item.__nvnWords__ = item.__nvnText__.split(spliter);

    item.__nvnTextNoneCase__ = item.__nvnText__.toLowerCase();
    item.__nvnWordsNoneCase__ = item.__nvnTextNoneCase__.split(spliter);
    return item;
};


SelectTreeMenu.prepareData = function (items) {
    var item;
    for (var i = 0; i < items.length; ++i) {
        if (typeof items[i] == 'string') {
            items[i] = { text: items[i], value: items[i] };
        }
        item = items[i];
        SelectTreeMenu.prepareItem(item);
        if (item.items) SelectTreeMenu.prepareData(item.items);
    }
    return items;
}

/**
 * @param {SearchItem} queryItem
 * @param {SearchItem} item
 */
SelectTreeMenu.calScore = function (queryItem, item) {
    var score = 0;

    if (item.__text__ == queryItem.__text__)
        score += SelectTreeMenu.EQUAL_MATCH_SCORE * queryItem.__text__.length;

    var extraIndex = item.__text__.indexOf(queryItem.__text__);

    if (extraIndex >= 0) {
        score += SelectTreeMenu.EXTRA_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__textNoneCase__.indexOf(queryItem.__textNoneCase__);
    if (extraIndex >= 0) {
        score += SelectTreeMenu.UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    extraIndex = item.__nvnTextNoneCase__.indexOf(queryItem.__nvnTextNoneCase__);
    if (extraIndex >= 0) {
        score += SelectTreeMenu.UNCASE_MATCH_SCORE * queryItem.__text__.length - extraIndex / item.__text__.length;
    }

    score += wordsMatch(queryItem.__nvnWordsNoneCase__, item.__nvnWordsNoneCase__) / (queryItem.__nvnWordsNoneCase__.length + 1 + item.__nvnWordsNoneCase__.length) * 2 * SelectTreeMenu.WORD_MATCH_SCORE;
    score += wordsMatch(queryItem.__wordsNoneCase__, item.__wordsNoneCase__) / (queryItem.__wordsNoneCase__.length + 1 + item.__wordsNoneCase__.length) * 2 * SelectTreeMenu.WORD_MATCH_SCORE;
    return score;
};

SelectTreeMenu.queryTree = function (query, items) {
    var gmaxScore = 0;
    var gminScore = 1000;
    var queryItem = SelectTreeMenu.prepareItem({ text: query });


    function makeScore(item) {

        var score = SelectTreeMenu.calScore(queryItem, item);
        gmaxScore = Math.max(score, gmaxScore);
        gminScore = Math.min(score, gminScore);

        var children = (item.items || []).map(function (item) {
            return makeScore(item);
        });

        var maxScore = children.reduce(function (ac, cr) {
            return Math.max(ac, cr.maxScore);
        }, score);

        return {
            score: score,
            maxScore: maxScore,
            item: item,
            children: children
        }
    }

    function sortcmp(a, b) {
        return b.maxScore - a.maxScore;
    }
    function makeItems(nodes, medScore) {
        nodes.sort(sortcmp);
        return nodes.filter(function (node) {
            return node.maxScore >= medScore;
        }).map(function (node) {
            var res;
            if (typeof node.item == 'string') {
                res = node.item;
            }
            else {
                res = Object.assign({}, node.item);
                if (node.children && node.children.length > 0) {
                    res.items = makeItems(node.children, medScore);
                    if (res.items.length == 0) delete res.items;
                }
            }
            return res;
        });
    }

    var scoredItems = items.map(makeScore);

    var medianScore = (gminScore + gmaxScore) / 2;
    var items = makeItems(scoredItems, medianScore);

    return SelectTreeMenu.treeToList(items);
};

SelectTreeMenu.prototype.search = function (query) {
    if (query.length == 0) {
        this.$selectlist.items = this.__searchcache__['__EMPTY_QUERY__'];
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
