import Acore from "../ACore";
import { measureText } from "./utils";

import './SelectListItem';

var _ = Acore._;
var $ = Acore.$;

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
    var res = _('.absol-selectlist');
    res.defineEvent(['change', 'pressitem']);
    res.$attachhook = _('attachhook').addTo(res);
    res.sync = new Promise(function (rs) {
        res.$attachhook.once('error', rs);
    });
    res.$items = [];
    res.$itemByValue = {};//quick find element
    res._itemViewCount = 0;//for reuse
    res.$selectedItem = undefined;
    return res;
};



SelectList.property = {};
SelectList.property.items = {
    set: function (value) {
        value = value || [];
        this._items = value;
        var itemCout = value.length;
        var i;
        var self = this;

        function mousedownItem(params) {
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
        var maxDescWidth = 0;

        for (i = 0; i < value.length; ++i) {
            if (value[i].desc) {
                maxDescWidth = Math.max(measureText(value[i].desc).width, maxDescWidth);
            }

        }
        this._descWidth = maxDescWidth;
        this.$itemByValue = {};
        for (i = 0; i < itemCout; ++i) {
            this.$items[i].data = this._items[i];
            this.$items[i].__index__ = i;
            if (this.$itemByValue[this.$items[i].value]) {
                console.warn('Value  ' + this.$items[i].value + ' is duplicated!');
            }
            this.$itemByValue[this.$items[i].value] = this.$items[i];
        }

        if (isSupportedVar) {
            this.style.setProperty('--select-list-desc-width', maxDescWidth + 'px'); //addStyle notWork because of convert to cameCase 
        }
        else {
            for (i = 0; i < this._itemViewCount; ++i) {
                this.$items[i].$text.addStyle('margin-right', 'calc(1em + ' + maxDescWidth + 'px)');
                this.$items[i].$descCtn.addStyle('width', maxDescWidth + 'px');
            }
        }
        this.value = this.value;
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

Acore.creator.selectlist = SelectList;



export default SelectList;