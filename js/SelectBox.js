import '../css/selectbox.css';
import ACore from "../ACore";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import PositionTracker from "./PositionTracker";
import './SelectBoxItem';
import {measureText} from "./utils";
import SelectList, {measureMaxTextWidth, measureMaxDescriptionWidth} from "./SelectList";
import prepareSearchForItem, {calcItemMatchScore} from "./list/search";
import Dom from "absol/src/HTML5/Dom";
import SearchTextInput from "./Searcher";

var isSupportedVar = window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 'red');

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends PositionTracker
 * @return {SelectBox}
 * @constructor
 */
function SelectBox() {
    _({
        tag: 'positiontracker',
        elt: this,
        on: {
            positionchange: this.eventHandler.positionChange
        }
    });
    this.on('click', this.eventHandler.click);

    this.$anchor = _('.as-select-anchor.as-hidden');
    this._anchor = 0;//not display
    this.forceDown = false;
    this.selectListBound = { width: 0, height: 0 };
    this.$attachhook = $('attachhook', this)
        .on('error', this.eventHandler.attached);

    this.$dropdownBox = _('.absol-selectmenu-dropdown-box').addTo(this.$anchor);
    this.$searchTextInput = _('searchtextinput').addStyle('display', 'none').addTo(this.$dropdownBox);
    this.$vscroller = _('bscroller').addTo(this.$dropdownBox);
    this.$selectlist = _('.absol-selectlist').addTo(this.$vscroller);//reuse css
    this.$searchList = _('selectlist').addStyle('display', 'none')
        .on('pressitem', this.eventHandler.searchListPressItem).addTo(this.$vscroller);

    this.$listItems = [];
    this._listItemViewCount = 0;
    this.$listItemByValue = {};

    this.$boxItems = [];
    this._boxItemViewCount = 0;
    this._valueDict = {};

    this.$searchTextInput.on('stoptyping', this.eventHandler.searchModify);
    this._searchCache = {};

    this._resourceReady = true;// alway true
    this.disableClickToFocus = false;
    return this;
}

SelectBox.tag = 'selectbox';
SelectBox.render = function () {
    return _({
        tag: 'bscroller',
        class: ['absol-selectbox', 'absol-bscroller'],
        extendEvent: ['change', 'add', 'remove', 'minwidthchange'],
        attr: {
            tabindex: '1'
        },
        child: 'attachhook'
    }, true);
};


SelectBox.prototype.updateDropdownPosition = function (keepAnchor) {
    if (this.isFocus) {
        var bound = this.getBoundingClientRect();
        var outBound = Dom.traceOutBoundingClientRect(this);
        if (!keepAnchor) {
            if (bound.top > outBound.bottom || bound.bottom < outBound.top) {
                this.isFocus = false;
                return;
            }
            var screenSize = Dom.getScreenSize();
            var searchHeight = 0;
            if (this.enableSearch) {
                searchHeight = this.$searchTextInput.getBoundingClientRect().height + 10;
            }

            var availableTop = bound.top - searchHeight - 20;
            var availableBottom = screenSize.height - bound.bottom - searchHeight - 20;
            if (this.forceDown || availableBottom > availableTop || availableBottom > this.selectListBound.height) {
                this._anchor = 1;
                if (this.$dropdownBox.firstChild !== this.$searchTextInput) {
                    this.$searchTextInput.selfRemove();
                    this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);
                }
                this.$vscroller.addStyle('max-height', availableBottom + 'px');
            }
            else {
                this._anchor = -1;
                if (this.$dropdownBox.lastChild != this.$searchTextInput) {
                    this.$searchTextInput.selfRemove();
                    this.$dropdownBox.addChild(this.$searchTextInput);
                }
                this.$vscroller.addStyle('max-height', availableTop + 'px');
            }
            this.$dropdownBox.addStyle('min-width', bound.width + 'px');
        }

        this.$anchor.addStyle('left', bound.left + 'px');
        if (this._anchor === -1) {
            this.$anchor.addStyle({
                top: bound.top - this.$dropdownBox.clientHeight - 1 + 'px',
            });
        }
        else if (this._anchor === 1) {
            this.$anchor.addStyle({
                top: bound.bottom + 'px'
            });
        }
    }
    else {
        if (this.$anchor.parentElement) {
            this.$anchor.remove();
        }
    }
};

SelectBox.prototype.startListenRemovable = function () {
};// do not track, keep attached work
SelectBox.prototype.stopListenRemovable = function () {
};
SelectBox.prototype.startListenRemovable = function () {
};
;
SelectBox.prototype.stopListenRemovable = function () {
};

SelectBox.prototype._releaseResource = SelectMenu.prototype._releaseResource;
SelectBox.prototype._requestResource = SelectMenu.prototype._requestResource;


SelectBox.prototype._measureDescriptionWidth = SelectList.prototype._measureDescriptionWidth;


SelectBox.prototype._measureTextWidth = SelectList.prototype._measureTextWidth;


SelectBox.eventHandler = {};

SelectBox.eventHandler.attached = function () {
    if (this._updateInterval) return;
    this.$attachhook.updateSize = this.$attachhook.updateSize || this.updateDropdownPosition.bind(this);
    Dom.addToResizeSystem(this.$attachhook);
    this.stopListenRemovable();
    this.startListenRemovable();
    if (!this._resourceReady) {
        this._requestResource();
        this._resourceReady = true;
    }
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$anchor.selfRemove();
            this.stopTrackPosition();
            this.stopListenRemovable();
            this.eventHandler.removeParent();
        }
    }.bind(this), 10000);
};

SelectBox.eventHandler.removeParent = function () {
};

SelectBox.eventHandler.positionChange = function () {
    this.updateDropdownPosition(false);
}

SelectBox.eventHandler.scrollParent = SelectMenu.eventHandler.scrollParent;
SelectBox.eventHandler.listSizeChangeAsync = SelectMenu.eventHandler.listSizeChangeAsync;

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
            this.startTrackPosition();
            this.$anchor.addClass('as-hidden')
                .addTo(document.body);
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
            this.updateDropdownPosition();
            setTimeout(function () {
                self.$anchor.removeClass('as-hidden');
            }, 10);
        }
        else {
            this.stopTrackPosition();
            this.$anchor.addClass('as-hidden');
            this.$anchor.remove();
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
        this._textWidth = measureMaxTextWidth(items);
        this._descWidth = measureMaxDescriptionWidth(items);
        this._height = this.items.length * 20;
        this.selectListBound = { height: items.length * 20 + 2, width: this._descWidth + this._textWidth + 14 + 2 };

        function mousedownItem(event) {
            if (EventEmitter.isMouseRight(event)) return;
            self.values.push(this.value);
            self.values = self.values;//update
            self.isFocus = false;//close after click item
            self.emit('add', {
                type: 'add',
                itemData: this.data,
                itemElt: this,
                value: this.value,
                values: self.values,
                target: self
            }, self);
            self.emit('change', { type: 'change', values: self.values, target: self }, self);
            self.scrollTop = self.scrollHeight;
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

        this.addStyle('min-width', this.selectListBound.width + 2 + 37 + 14 + 'px');
        this.emit('minwidthchange', {
            target: this,
            value: this.selectListBound.width + 2 + 37 + 14,
            type: 'minwidthchange'
        }, this);

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
            var eltIndex = self.$boxItems.indexOf(this);
            if (index >= 0) {
                this.remove();
                self.$boxItems = self.$boxItems.slice(0, eltIndex).concat(self.$boxItems.slice(eltIndex + 1));
                self._boxItemViewCount--;
                self.values = self.values.slice(0, index).concat(self.values.slice(index + 1));
                self.emit('remove', {
                    type: 'remove',
                    values: self.values,
                    target: self,
                    itemElt: this,
                    value: this.value,
                    itemData: this.data
                }, self);
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
};

SelectBox.property.disableClickToFocus = {
    set: function (value) {
        if (value){
            this.addClass('as-disable-click-to-focus');
        }
        else{
            this.removeClass('as-disable-click-to-focus');
        }
    },
    get: function () {
        return this.containsClass('as-disable-click-to-focus');
    }
};

SelectBox.eventHandler.click = function (event) {
    if (event.target === this && !this.disableClickToFocus) {
        this.isFocus = !this.isFocus;
    }
};


SelectBox.eventHandler.clickBody = function (event) {
    if (!EventEmitter.hitElement(this.$anchor, event) && event.target != this) {
        this.isFocus = false;
    }
};

SelectBox.eventHandler.searchListPressItem = function (event) {
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
                return prepareSearchForItem(item);
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
            var queryItem = prepareSearchForItem({ text: filterText });
            view = this._searchCache['__EMPTY_QUERY__'].map(function (it) {
                var score = calcItemMatchScore(queryItem, it);
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
        this.$searchList.value = "NOTHING BE SELECTED";
    }
    this.updateDropdownPosition(true);
    this.$vscroller.scrollTop = 0;
};


ACore.install(SelectBox);

export default SelectBox;