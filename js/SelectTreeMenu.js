import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { phraseMatch } from "absol/src/String/stringMatching";

var _ = Acore._;
var $ = Acore.$;

function SelectTreeMenu() {
    var res = _({
        class: ['absol-selectmenu'],
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
                    'vscroller.limited-height']
            },
            'attachhook',
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, SelectTreeMenu.eventHandler);
    res.$renderSpace = SelectTreeMenu.getRenderSpace();

    res.$treelist = _('treelist', res).addTo(res.$renderSpace);
    res.$treelist.on('press', res.eventHandler.treelistPress, true);
    res.$vscroller = $('vscroller', res).addStyle('overflow-y', 'hidden');
    res.on('click', res.eventHandler.click, true);
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
        if (availableBottom < this.treeListBound.height) {
            this.$vscroller.addStyle('max-height', availableBottom + 'px');
        }
        else {
            this.$vscroller.addStyle('max-height', this.treeListBound.height + 'px');
        }
    }
    else {
        if (!searching) {
            this.$dropdownBox.addClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
        }
        if (availableTop < this.treeListBound.height) {
            this.$vscroller.addStyle('max-height', availableTop + 'px');

        }
        else {
            this.$vscroller.addStyle('max-height', this.treeListBound.height + 'px');
        }
    }
    this.$vscroller.requestUpdateSize();
    // this.scrollToSelectedItem();
};

SelectTreeMenu.prototype.scrollToSelectedItem = function () {
    var selectedView = $('treelistitem.active', this.$vscroller);
    if (selectedView) this.$vscroller.scrollInto(selectedView);

};

SelectTreeMenu.getRenderSpace = SelectMenu.getRenderSpace;

SelectTreeMenu.eventHandler = {};

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
        this.isFocus = false;
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
    this.emit('change', Object.assign({}, eventData), this)
}

SelectTreeMenu.eventHandler.treelistPress = function (event) {
    var value = event.target.value;
    if (value != this._value) {
        this._value = value;
        //not need update tree
        this.$holderItem.clearChild()
            .addChild(_({
                class: 'absol-selectlist-item',
                child: '<span>' + event.target.text + '</span>'
            }));
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
                self.$holderItem.clearChild();
                self.$holderItem.addChild(_({
                    class: 'absol-selectlist-item',
                    child: '<span>' + elt.text + '</span>'
                }));
                elt.active = true;
                if (scrollInto) {
                    this.$vscroller.scrollInto(elt);
                }
            }
            else {
                elt.active = false;
            }
        });
    }, 1)
}

SelectTreeMenu.property = {};
SelectTreeMenu.property.items = {
    set: function (value) {
        this._items = value || [];
        this.$treelist.items = this._items;

        this.treeListBound = this.$treelist.getBoundingClientRect();
        this.addStyle('min-width', this.treeListBound.width + 'px');
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
            $('body').on('click', this.eventHandler.bodyClick);
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
            $('body').off('click', this.eventHandler.bodyClick);
            this.removeClass('focus');
            this.$searchTextInput.value = '';
            setTimeout(function () {
                this.$treelist.items = this.items;
                setTimeout(this.updateSelectedItem.bind(this), 1);
                this.treeListBound = this.$treelist.getBoundingRecursiveRect();
            }.bind(this), 1)
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



SelectTreeMenu.calScore = function (query, text) {
    var textL = text.length;
    var score = 0;
    var extraIndex = text.indexOf(query);
    if (extraIndex >= 0) {
        score += SelectTreeMenu.EXTRA_MATCH_SCORE * textL - extraIndex / textL;
    }
    var extraIndex = text.toLowerCase().indexOf(query.toLowerCase());
    if (extraIndex >= 0) {
        score += SelectTreeMenu.UNCASE_MATCH_SCORE * textL - extraIndex / textL;
    }
    var queryNVN = nonAccentVietnamese(query).toLowerCase();
    var textNVN = nonAccentVietnamese(text).toLowerCase();
    var nIndex = textNVN.indexOf(queryNVN);
    if (nIndex >= 0) score += SelectTreeMenu.UVN_MATCH_SCORE * textL - nIndex;

    score += phraseMatch(query, text, 1);
    score += phraseMatch(query.toLowerCase(), text.toLowerCase(), 1);
    score += phraseMatch(queryNVN, textNVN, 1);
    return score;
}

SelectTreeMenu.queryTree = function (query, items) {
    var gmaxScore = 0;
    var gminScore = 1000;
    function makeScore(item) {
        var text;
        if (typeof item == 'string') {
            text = item;
        }
        else {
            text = item.text;
        }

        var score = SelectTreeMenu.calScore(query, text);
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
        return b.maxScore - a.makeScore;
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

    return makeItems(scoredItems, medianScore);



};

SelectTreeMenu.prototype.search = function (query) {
    if (query.length == 0) {
        this.$treelist.items = this.items;
        this.updateSelectedItem();
        this.updateDropdownPostion(true);
    }
    else {
        var searchResult = SelectTreeMenu.queryTree(query, this.items);
        this.$treelist.items = searchResult;
        this.updateSelectedItem();
        this.updateDropdownPostion(true);
    }
};


Acore.creator.selecttreemenu = SelectTreeMenu;

export default SelectTreeMenu;