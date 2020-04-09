import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";

import './SelectBoxItem';
import { measureText } from "./utils";

var isSupportedVar = window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 'red');

var _ = ACore._;
var $ = ACore.$;


function SelectBox() {
    this.on('click', this.eventHandler.click);

    this.$anchorCtn = SelectMenu.getAnchorCtn();
    this.$anchor = _('.absol-selectmenu-anchor.absol-disabled').addTo(this.$anchorCtn);
    this.$anchorContentCtn = _('.absol-selectmenu-anchor-content-container').addTo(this.$anchor);
    this.$scrollTrackElts = [];

    this.$attachhook = $('attachhook', this)
        .on('error', this.eventHandler.attached);

    this.$dropdownBox = _('.absol-selectmenu-dropdown-box').addTo(this.$anchorContentCtn);
    this.$searchTextInput = _('searchtextinput').addStyle('display', 'none').addTo(this.$dropdownBox);
    this.$vscroller = _('bscroller').addTo(this.$dropdownBox);
    this.$selectlist = _('.absol-selectlist').addTo(this.$vscroller);//reuse css
    this.$searchList = _('selectlist').addStyle('display', 'none')
        .on('change', this.eventHandler.searchListChange).addTo(this.$vscroller);//todo: event

    this.$listItems = [];
    this._listItemViewCount = 0;
    this.$listItemByValue = {};

    this.$boxItems = [];
    this._boxItemViewCount = 0;
    this._valueDict = {};

    this.$searchTextInput.on('stoptyping', this.eventHandler.searchModify);
    this._searchCache = {};

    return this;
};

SelectBox.render = function () {
    return _({
        tag: 'boardtable',
        class: ['absol-selectbox', 'absol-bscroller'],
        extendEvent: ['change', 'add', 'remove', 'minwidthchange'],
        attr: {
            tabindex: '1'
        },
        child: 'attachhook'
    }, true);
};



SelectBox.prototype.startTrackScroll = SelectMenu.prototype.startTrackScroll;
SelectBox.prototype.stopTrackScroll = SelectMenu.prototype.stopTrackScroll;
SelectBox.prototype.updateDropdownPostion = SelectMenu.prototype.updateDropdownPostion;



SelectBox.eventHandler = {};
SelectBox.eventHandler.attached = SelectMenu.eventHandler.attached;

SelectBox.eventHandler.scrollParent = SelectMenu.eventHandler.scrollParent;

SelectBox.property = {};
SelectBox.property.disabled = SelectMenu.property.disabled;
SelectBox.property.hidden = SelectMenu.property.hidden;
SelectBox.property.enableSearch = SelectMenu.property.enableSearch;


SelectBox.prototype.init = function (props) {
    props = props || [];
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });
    this.super(props);
};


SelectBox.prototype.resetFilter = function () {
    Array.prototype.forEach.call(this.$selectlist.childNodes, function (e) {
        e.removeStyle('display');
    }.bind(this));
};


SelectBox.prototype.scrollToSelectedItem = function () {
    //nothing to do;
};


SelectBox.prototype.queryValues = function () {
    return Array.prototype.map.call(this.$holderItem.childNodes, function (e) {
        var data = e.data;
        return (typeof data == 'string') ? data : data.value;
    })
};
SelectBox.prototype.querySelectedItems = function () {
    return Array.prototype.map.call(this.$holderItem.childNodes, function (e) {
        return e.data;
    });
};



SelectBox.prototype.init = SelectMenu.prototype.init;



SelectBox.property.isFocus = {
    set: function (value) {
        value = !!value;
        if (value == this.isFocus) return;
        var self = this;
        this._isFocus = value;
        if (value) {
            this.startTrackScroll();
            this.$anchor.removeClass('absol-disabled');
            var isAttached = false;
            setTimeout(function () {
                if (isAttached) return;
                $('body').on('mousedown', self.eventHandler.clickBody);
                isAttached = true;
            }, 1000);
            $('body').once('click', function () {
                setTimeout(function () {
                    if (isAttached) return;
                    $('body').on('mousedown', self.eventHandler.clickBody);
                    isAttached = true;
                }, 10);
            });

            if (this.enableSearch) {
                setTimeout(function () {
                    self.$searchTextInput.focus();
                }, 50);
            }
            this.updateDropdownPostion();
        }
        else {
            this.$anchor.addClass('absol-disabled');
            this.stopTrackScroll();
            $('body').off('mousedown', this.eventHandler.clickBody);
            setTimeout(function () {
                if (self.$searchTextInput.value != 0) {
                    self.$searchTextInput.value = '';
                    // different with SelectMenu
                    self.$searchList.addStyle('display', 'none');
                    self.$selectlist.removeStyle('display');
                }
            }, 100);
        }
    },
    get: SelectMenu.property.isFocus.get
};



SelectBox.property.items = {
    set: function (items) {
        var i;
        var self = this;

        items = items || [];
        this._items = items;
        this._searchCache = {};

        var itemCount = items.length;

        measureText('', 'italic 14px  sans-serif')//cache font style
        this._descWidth = 0;
        for (i = 0; i < itemCount; ++i) {
            if (items[i].desc) {
                this._descWidth = Math.max(this._descWidth, measureText(items[i].desc).width);
            }
        }


        function mousedownItem(event) {
            if (EventEmitter.isMouseRight(event)) return;
            self.values.push(this.value);
            self.values = self.values;//update
            self.isFocus = false;//close after click item
            self.emit('add', { type: 'add', itemData: this.data, itemElt: this, value: this.value, values: self.values, target: self }, self);
            self.emit('change', { type: 'change', values: self.values, target: self }, self);
        }

        while (this.$listItems.length < itemCount) {
            this.$listItems.push(_({
                tag: 'selectlistitem',
                on: {
                    mousedown: mousedownItem
                }
            }))
        }

        this.$listItemByValue = {};
        for (i = 0; i < itemCount; ++i) {
            this.$listItems[i].data = items[i];
            this.$listItems[i].__index__ = i;
            this.$listItemByValue[this.$listItems[i].value] = this.$listItems[i];
        }

        while (this._listItemViewCount < itemCount) {
            this.$selectlist.addChild(this.$listItems[this._listItemViewCount++]);
        }

        while (this._listItemViewCount > itemCount) {
            this.$listItems[--this._listItemViewCount].remove();
        }


        if (isSupportedVar) {
            this.$selectlist.style.setProperty('--select-list-desc-width', this._descWidth + 'px'); //addStyle notWork because of convert to cameCase 
        }
        else {
            for (i = 0; i < this._itemViewCount; ++i) {
                this.$items[i].$text.addStyle('margin-right', 'calc(1em + ' + this._descWidth + 'px)');
                this.$items[i].$descCtn.addStyle('width', this._descWidth + 'px');
            }
        }

        this.selectListBound = this.$selectlist.getBoundingClientRect();
        this.addStyle('min-width', this.selectListBound.width + 2 + 37 + 'px');
        this.emit('minwidthchange', { target: this, value: this.selectListBound.width + 2 + 37, type: 'minwidthchange' }, this);

        this.values = this.values;
    },
    get: function () {
        return this._items;
    }
};

SelectBox.property.values = {
    set: function (values) {
        values = values || [];
        values = (values instanceof Array) ? values : [values];
        this._values = values;
        this._searchCache = {};
        var self = this;
        var i, key;
        var listItemElt;
        var boxItemElt;
        var lastDict = this._valueDict;

        function closeBoxItem(event) {
            var itemValue = this.value;
            var index = self.values.indexOf(itemValue);
            if (index >= 0) {
                self.values = self.values.slice(0, index).concat(self.values.slice(index + 1));
                self.emit('remove', { type: 'remove', values: self.values, target: self, itemElt: this, value: this.value, itemData: this.data }, self);
                self.emit('change', { type: 'change', values: self.values, target: self }, self);
            }
        }
        if (this._orderly)
            values.sort(function (a, b) {
                var itA = self.$listItemByValue[a];
                var itB = self.$listItemByValue[b];
                var indexA = itA ? itA.__index__ : -10000;
                var indexB = itA ? itB.__index__ : 10000;
                return indexA - indexB;
            });

        for (key in lastDict) {
            listItemElt = self.$listItemByValue[key];
            if (listItemElt) listItemElt.removeStyle('display');
        }

        this._valueDict = {};
        for (i = 0; i < this._values.length; ++i) {
            this._valueDict[this._values[i]] = true;
            listItemElt = this.$listItemByValue[values[i]];
            if (listItemElt)
                listItemElt.addStyle('display', 'none');
        }

        //clear all item 
        for (i = 0; i < this._boxItemViewCount; ++i) {
            this.$boxItems[i].remove();
        }
        this._boxItemViewCount = 0;

        for (i = 0; i < values.length; ++i) {
            listItemElt = this.$listItemByValue[values[i]];
            if (listItemElt) {
                if (this._boxItemViewCount >= this.$boxItems.length) {
                    boxItemElt = _({
                        tag: 'selectboxitem',
                        on: {
                            close: closeBoxItem
                        }
                    });
                    this.$boxItems.push(boxItemElt);
                }
                else {
                    boxItemElt = this.$boxItems[this._boxItemViewCount];
                }

                boxItemElt.data = listItemElt.data;
                this.addChild(boxItemElt);
                this._boxItemViewCount++;
            }
        }

    },
    get: function () {
        return this._values || [];
    }
};

SelectBox.property.orderly = {
    set: function (value) {
        this._orderly = !!value;
        if (value) {
            this.values = this.values;
        }
    },
    get: function () {
        return !!this._orderly;
    }

}

SelectBox.eventHandler.click = function (event) {
    if (event.target == this) {
        this.isFocus = !this.isFocus;
    }
};


SelectBox.eventHandler.clickBody = function (event) {
    if (!EventEmitter.hitElement(this.$anchor, event) && event.target != this) {
        this.isFocus = false;
    };
};

SelectBox.eventHandler.searchListChange = function (event) {
    this.values.push(event.value);
    this.values = this.values;
    this.isFocus = false;
    this.emit('add', { type: 'add', itemData: event.itemElt.data, value: event.value, values: this.values }, this);
    this.emit('change', { type: 'change', values: self.values, target: self }, self);
};

SelectBox.eventHandler.searchModify = function (event) {
    var self = this;
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this.$searchList.addStyle('display', 'none');
        this.$selectlist.removeStyle('display');
    }
    else {
        if (!this._searchCache['__EMPTY_QUERY__']) {
            this._searchCache['__EMPTY_QUERY__'] = this.items.map(function (item) {
                return SelectMenu.prepareItem(item);
            }).filter(function (it) {// filter items were added
                return !self._valueDict[it.value];
            });
        }
        this.$selectlist.addStyle('display', 'none');
        this.$searchList.removeStyle('display');

        var view = [];
        if (!this._searchCache[filterText]) {
            var gmaxScore = 0;
            var gminScore = 1000;
            var queryItem = SelectMenu.prepareItem({ text: filterText });
            view = this._searchCache['__EMPTY_QUERY__'].map(function (it) {
                var score = SelectMenu.calScore(queryItem, it);
                gmaxScore = Math.max(gmaxScore, score);
                gminScore = Math.min(gminScore, score);
                return Object.assign({ score: score }, it);
            });

            var medianScore = (gminScore + gmaxScore) / 2;
            view = view.filter(function (it) {
                return it.score >= medianScore;
            });
            this._searchCache[filterText] = view;
        }
        else {
            view = this._searchCache[filterText];
        }
        this.$searchList.items = view;
    }

    this.selectListBound = this.$selectlist.getBoundingClientRect();
    this.updateDropdownPostion(true);
};



ACore.install('SelectBox'.toLowerCase(), SelectBox);

export default SelectBox;