import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { wordsMatch } from "absol/src/String/stringMatching";

var _ = Acore._;
var $ = Acore.$;

function SelectTreeMenu() {
    var res = _({
        class: ['absol-selectmenu', 'absol-selecttreemenu'],
        extendEvent: 'change',
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
            {
                class: 'absol-selectmenu-dropdown-box',
                child: [
                    {
                        tag: 'searchtextinput', style: {
                            display: 'none'
                        }
                    },
                    'bscroller.limited-height']
            },
            'attachhook',
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, SelectTreeMenu.eventHandler);
    res.$renderSpace = SelectTreeMenu.getRenderSpace();

    res.$treelist = _('treelist', res).addTo(res.$renderSpace);
    res.$treelist.on('press', res.eventHandler.treelistPress, true);
    res.$vscroller = $('bscroller', res);
    res.on('mousedown', res.eventHandler.click, true);
    res.on('blur', res.eventHandler.blur);

    res.$holderItem = $('.absol-selectmenu-holder-item', res);
    res.$dropdownBox = $('.absol-selectmenu-dropdown-box', res);
    res.$searchTextInput = $('searchtextinput', res);
    res.$searchTextInput.on('stoptyping', res.eventHandler.searchModify);
    res.treeListBound = { height: 0, width: 0 };
    res.$attachhook = $('attachhook', res)
        .on('error', res.eventHandler.attached);

    res.sync = new Promise(function (rs) {
        $('attachhook', res).once('error', function () {
            rs();
        });
    });
    return res;
}

SelectTreeMenu.prototype.updateDropdownPostion = function (searching) {
    var screenBottom = Dom.getScreenSize().height;

    var outBound = Dom.traceOutBoundingClientRect(this);
    var searchBound = this.$searchTextInput.getBoundingClientRect();
    var bound = this.getBoundingClientRect();
    var availableTop = bound.top - outBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    var availableBottom = Math.min(outBound.bottom, screenBottom) - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    if (this.forceDown || (!this.$dropdownBox.containsClass('up') && searching) || (!searching && (availableBottom >= this.treeListBound.height || availableBottom > availableTop))) {
        if (!searching) {
            this.$dropdownBox.removeClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);

        }
        this.$vscroller.addStyle('max-height', availableBottom + 'px');
    }
    else {
        if (!searching) {
            this.$dropdownBox.addClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
        }
        this.$vscroller.addStyle('max-height', availableTop + 'px');
    }
    if (!searching)
        this.scrollToSelectedItem();
};

SelectTreeMenu.prototype.scrollToSelectedItem = function () {
    this._scrolling = true;
    setTimeout(function () {
        if (this.$selectedItem) this.$vscroller.scrollInto(this.$selectedItem);
        this._scrolling = false;
    }.bind(this), 5);
};

SelectTreeMenu.getRenderSpace = SelectMenu.getRenderSpace;

SelectTreeMenu.eventHandler = {};


SelectTreeMenu.eventHandler.bodyClick = function (event) {
    event.preventDefault();
    if (!EventEmitter.hitElement(this, event)) {
        this.isFocus = false;
    }
};

SelectTreeMenu.eventHandler.attached = function () {
    if (this._updateInterval) return;
    if (!this.$treelist.parentNode) this.$content.addTo(this.$renderSpace);
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$treelist.selfRemove();
        }
    }.bind(this), 10000);
};

SelectTreeMenu.eventHandler.click = function (event) {
    if (EventEmitter.hitElement(this.$treelist, event) || (this.isFocus && !EventEmitter.hitElement(this.$dropdownBox, event))) {
        event.preventDefault();
        setTimeout(function () {
            this.isFocus = false;
        }.bind(this), 1);
    }
    else {
        if (!this.isFocus) {
            this.$treelist.addTo(this.$vscroller);
            this.isFocus = true;
        }
    }
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

SelectTreeMenu.eventHandler.treelistPress = function (event) {
    var value = event.target.value;
    if (value != this._value) {
        this._value = value;
        //not need update tree
        this.$holderItem.clearChild()
            .addChild(_(event.target.$parent.cloneNode(true)));
        this.notifyChange(Object.assign({ value: value }, event));
    }
};

SelectTreeMenu.prototype.updateSelectedItem = function (scrollInto) {
    if (this._isUpdateSelectedItem) return;
    this._isUpdateSelectedItem = true;
    var self = this;
    setTimeout(function () {
        $('treelistitem', self.$treelist, function (elt) {
            if (elt.value == self.value) {
                self.$selectedItem = elt;
                self.$holderItem.clearChild();
                self.$holderItem.addChild(elt.$parent.cloneNode(true));
                elt.active = true;
                if (scrollInto) {
                    this.$vscroller.scrollInto(elt);
                }
            }
            else {
                elt.active = false;
            }
        });
        self._isUpdateSelectedItem = false;
    }, 1)
}

SelectTreeMenu.property = {};
SelectTreeMenu.property.items = {
    set: function (value) {
        this._items = value || [];
        this.$treelist.items = SelectTreeMenu.prepareData(this._items);
        this.__searchcache__ = {};
        this.$treelist.realignDescription();

        this.treeListBound = this.$treelist.getBoundingClientRect();
        this.addStyle('min-width', this.treeListBound.width + 37 + 2 + 'px');
        if (typeof this.value == 'undefined' && this._items.length > 0) {
            var first = this._items[0];
            if (typeof first == 'string') {
                this.value = first;
            }
            else {
                this.value = (typeof (first.value) == 'undefined') ? first.text : first.value;
            }
        }
        else {
            this.updateSelectedItem();
        }
    },
    get: function () {
        return this._items;
    }
};

SelectTreeMenu.property.value = {
    set: function (value) {
        this._value = value;
        this.updateSelectedItem();
    },
    get: function () {
        return this._value;
    }
};

SelectTreeMenu.property.enableSearch = {
    set: function (value) {
        this._enableSearch = !!value;
        if (value) {
            this.$searchTextInput.removeStyle('display');
        }
        else {
            this.$searchTextInput.addStyle('display', 'none');
        }
    },
    get: function () {
        return !!this._enableSearch;
    }
};

SelectTreeMenu.property.isFocus = {
    set: function (value) {
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.addClass('focus');
            this.$treelist.addTo(this.$vscroller);
            $('body').on('mousedown', this.eventHandler.bodyClick);
            if (this.enableSearch) {
                setTimeout(function () {
                    this.$searchTextInput.focus();
                }.bind(this), 50);
            }

            this.updateDropdownPostion();
            this.scrollToSelectedItem();
        }
        else {
            this.$treelist.addTo(this.$renderSpace);
            $('body').off('mousedown', this.eventHandler.bodyClick);
            this.removeClass('focus');
            if (this.$searchTextInput.value.length > 0) {
                this.$searchTextInput.value = '';
                setTimeout(function () {
                    this.$treelist.items = this.items;
                    this.$treelist.realignDescription();
                    setTimeout(this.updateSelectedItem.bind(this), 1);
                    this.treeListBound = this.$treelist.getBoundingRecursiveRect();
                }.bind(this), 1)
            }
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};


SelectTreeMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
        }
    },
    get: function () {
        return this.containsClass('disabled');
    }
};


SelectTreeMenu.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('hidden');
        }
        else {
            this.removeClass('hidden');
        }
    },
    get: function () {
        return this.addClass('hidden');
    }
};

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
    var spliter =/\s+/;

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

    return items;
};

SelectTreeMenu.prototype.search = function (query) {
    if (query.length == 0) {
        this.$treelist.items = this.items;
        this.updateSelectedItem();
        this.updateDropdownPostion(true);
        this.scrollToSelectedItem();
    }
    else {
        var searchResult = this.__searchcache__[query] || SelectTreeMenu.queryTree(query, this.items);
        this.__searchcache__[query] = searchResult;
        this.$treelist.items = searchResult;
        this.updateSelectedItem();
        this.updateDropdownPostion(true);
        this.$vscroller.scrollTop = 0;
    }
};


Acore.creator.selecttreemenu = SelectTreeMenu;

export default SelectTreeMenu;