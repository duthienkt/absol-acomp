import ACore from "../ACore";
import { measureText, estimateWidth14 } from "./utils";

import './SelectListItem';
import EventEmitter from "absol/src/HTML5/EventEmitter";

var _ = ACore._;
var $ = ACore.$;

var isSupportedVar = window.CSS && window.CSS.supports && window.CSS.supports('--fake-var', 'red');
/**
 * Setup css
 */
if (isSupportedVar) {
    SelectList.$dynamicStyle = (function () {
        var cssElt = _('style#selectlist-dynamic-style');
        var cssCode = [
            '.absol-selectlist-item>span {',
            '    margin-right: calc(1em + var(--select-list-desc-width));',
            '}',

            '.absol-selectlist-item-desc-container {',
            '    width: var(--select-list-desc-width);',
            '}'

        ];

        cssElt.innerHTML = cssCode.join('\n');
        cssElt.addTo(document.head);
        return cssElt;
    })();
}

/*global absol*/
function SelectList() {
    var res = this;
    this.defineEvent(['change', 'pressitem', 'cancelasync', 'valuevisibilityasync', 'finishasync', 'sizechangeasync']);
    this.$attachhook = _('attachhook').addTo(this);
    this.sync = new Promise(function (rs) {
        res.$attachhook.once('error', rs);
    });
    this.$items = [];
    this.$itemByValue = {};//quick find element
    this._itemViewCount = 0;//for reuse
    this.$selectedItem = undefined;

    this._itemSession = 0;
    this._descWidth = 0;
    this._textWidth = 0;

    this._valuevisibility = true;
    this._finished = true;

};

SelectList.tag = "SelectList".toLowerCase();

SelectList.render = function () {
    return _('.absol-selectlist');
};

SelectList.prototype._measureDescriptionWidth = function (items) {
    var maxDescWidth = 0;
    var maxText = 0;
    var maxEst = 0;
    var est;
    for (var i = 0; i < items.length; ++i) {
        if (items[i].desc) {
            est = estimateWidth14(items[i].desc);
            if (est > maxEst) {
                maxEst = est;
                maxText = items[i].desc;
            }
        }
    }
    if (maxText)
        maxDescWidth = measureText(maxText, 'italic 14px  sans-serif').width;
    return maxDescWidth;
};


SelectList.prototype._measureTextWidth = function (items) {
    var maxTextWidth = 0;
    var maxText = 0;
    var maxEst = 0;
    var est;
    var text;
    var now = new Date();
    for (var i = 0; i < items.length; ++i) {
        if (items[i].text) {
            text = items[i].text;
            est = estimateWidth14(text);
            if (est > maxEst) {
                maxEst = est;
                maxText = text;
            }
        }
    }
    if (maxText)
        maxTextWidth = measureText(maxText, '14px  sans-serif').width;
    return maxTextWidth;
};

SelectList.prototype.setItemsAsync = function (items) {
    this._valuevisibility = false;
    this._finished = false;

    var thisSL = this;
    var session = Math.floor(Math.random() * 1000000);
    this._itemSession = session;

    this._items = items || [];
    this.$itemByValue = {};
    var i;
    this._descWidth = thisSL._measureDescriptionWidth(items);
    this._textWidth = thisSL._measureTextWidth(items);
    this._height = this.items.length * 20;

    this.style.setProperty('--select-list-desc-width', thisSL._descWidth + 'px'); //addStyle notWork because of convert to cameCase 
    function mousedownItem(event) {
        if (EventEmitter.isMouseRight(event)) return;
        var lastValue = thisSL.value;
        thisSL.value = this.value;
        thisSL.emit('pressitem', { type: 'pressitem', target: thisSL, itemElt: this, value: this.value, lastValue: lastValue, data: this.data });
        if (this.value != lastValue) {
            thisSL.emit('change', { type: 'change', target: thisSL, itemElt: this, value: this.value, lastValue: lastValue, data: this.data });
        }
    }

    i = 0;
    var limit = 20;
    function tick() {
        if (thisSL._itemSession != session) {
            thisSL.emit('cancelasync', { session: session, type: 'cancelasync' }, this);
            return;
        }
        if (i >= items.length) {
            if (!thisSL.$itemByValue[thisSL.value] && items.length > 0) {
                thisSL.value = items[0].value;
            }

            thisSL.value = thisSL.value;//update
            thisSL._finished = false;
            thisSL.emit('finishasync', { session: session, type: 'finishasync' }, this);
            return;
        }

        var n = Math.min(items.length - i, limit);
        limit = Math.floor(limit);
        var itemCout = i + n;
        while (thisSL.$items.length < itemCout) {
            thisSL.$items.push(_({
                tag: 'selectlistitem', on: {
                    mousedown: mousedownItem
                }
            }));
        }

        while (thisSL._itemViewCount < itemCout) {
            thisSL.addChild(thisSL.$items[thisSL._itemViewCount++]);
        }

        while (thisSL._itemViewCount > itemCout) {
            thisSL.$items[--thisSL._itemViewCount].remove();
        }

        for (var k = 0; k < n; ++k) {
            thisSL.$items[i].data = thisSL._items[i];
            thisSL.$items[i].__index__ = i;
            if (thisSL.$itemByValue[thisSL.$items[i].value]) {
                console.warn('Value  ' + thisSL.$items[i].value + ' is duplicated!');
            }
            thisSL.$itemByValue[thisSL.$items[i].value] = thisSL.$items[i];
            if (thisSL.$items[i].value == thisSL.value) {
                thisSL.$selectedItem = thisSL.$items[i];
                thisSL.$selectedItem.addClass('selected')
                thisSL.emit('valuevisibilityasync', {session: session, type: 'valuevisibilityasync', itemElt: thisSL.$items[i] }, thisSL);
            }
            ++i;
        }
        thisSL.emit('sizechangeasync', { session: session, type: 'sizechangeasync' }, this);
        setTimeout(tick, 2);
    }
    setTimeout(tick, 2);
    return {
        session: session,
        width: this._descWidth + this._textWidth + 14,
        height: this._height
    }
};


SelectList.prototype.setItems = function (items) {


    this._itemSession = Math.random();
    this._items = items;
    var itemCout = items.length;
    var i;
    var self = this;

    function mousedownItem(event) {
        if (EventEmitter.isMouseRight(event)) return;
        var lastValue = self.value;
        self.value = this.value;
        self.emit('pressitem', { type: 'pressitem', target: self, itemElt: this, value: this.value, lastValue: lastValue, data: this.data });
        if (this.value != lastValue) {
            self.emit('change', { type: 'change', target: self, itemElt: this, value: this.value, lastValue: lastValue, data: this.data });
        }
    }

    while (this.$items.length < itemCout) {
        this.$items.push(_({
            tag: 'selectlistitem', on: {
                mousedown: mousedownItem
            }
        }));
    }

    while (this._itemViewCount < itemCout) {
        this.addChild(this.$items[this._itemViewCount++]);
    }

    while (this._itemViewCount > itemCout) {
        this.$items[--this._itemViewCount].remove();
    }
    measureText('', 'italic 14px  sans-serif')//cache font style
    this._descWidth = this._measureDescriptionWidth(items);
    this._textWidth = this._measureTextWidth(items);

    this.style.setProperty('--select-list-desc-width', this._descWidth + 'px');
    this.$itemByValue = {};
    for (i = 0; i < itemCout; ++i) {
        this.$items[i].data = this._items[i];
        this.$items[i].__index__ = i;
        if (this.$itemByValue[this.$items[i].value]) {
            console.warn('Value  ' + this.$items[i].value + ' is duplicated!');
        }
        this.$itemByValue[this.$items[i].value] = this.$items[i];
    }
    if (!this.$itemByValue[this.value] && items.length > 0) {
        this.value = items[0].value;
    }
    else {
        this.value = this.value;
    }
    this._valuevisibility = true;
    this._finished = true;
};


SelectList.property = {};

/**
 * @type {SelectList}
 */
SelectList.property.items = {
    set: function (value) {
        value = value || [];
        this.setItems(value);
    },
    get: function () {
        return this._items || [];
    }
};


SelectList.property.value = {
    set: function (value) {
        this._selectValue = value;
        var newSelectedItemElt = this.$itemByValue[value];
        if (newSelectedItemElt != this.$selectedItem) {
            if (this.$selectedItem) {
                this.$selectedItem.removeClass('selected');
            }
            if (newSelectedItemElt) {
                newSelectedItemElt.addClass('selected');
                this.$selectedItem = newSelectedItemElt;
            }
        }
    },

    get: function () {
        return this._selectValue;
    }
};

SelectList.property.item = {
    get: function () {
        if (this.$selectedItem) return this.$selectedItem.data;
        return undefined;
    }
};


SelectList.property.selectedIndex = {
    get: function () {
        if (this.$selectedItem) return this.$selectedItem.__index__;
        return -1;
    }
};


SelectList.prototype.init = function (props) {
    props = props || {};
    var value = props.value;
    delete props.value;
    this.super(props);
    if (value !== undefined)
        this.value = value;
};

SelectList.eventHandler = {};

ACore.install(SelectList);



export default SelectList;