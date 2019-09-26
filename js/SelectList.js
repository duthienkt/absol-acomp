import Acore from "../ACore";
import { measureText } from "./utils";

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
            self.emit('pressitem', { type: 'pressitem', target: self, itemElt: this, value: this.value, lastValue: lastValue });
            if (this.value != lastValue) {
                self.emit('change', { type: 'change', target: self, itemElt: this, value: this.value, lastValue: lastValue });
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
                console.warn('List has more than 1 element with value = ' + this.$items[i].value);
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
        // not select one
        // if (value.length > 0) {
        //     var newSelectedItemElt = this.$itemByValue[this.value];

        //     if (!newSelectedItemElt) {
        //         this.value = this.$items[0].value;
        //     }
        //     else {
        //         this.value = this.value;
        //     }
        // }
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
Acore.creator.selectlist = SelectList;





function SelectListItem() {
    var res = _({
        class: 'absol-selectlist-item',
        child: [
            {
                tag: 'span',
                class: 'absol-selectlist-item-text'
            },
            {
                class: 'absol-selectlist-item-desc-container',
                child: {
                    tag: 'span',
                    class: 'absol-selectlist-item-desc'
                }
            }
        ]
    });
    res.$text = $('span.absol-selectlist-item-text', res);
    res.$descCtn = $('.absol-selectlist-item-desc-container', res);
    res.$desc = $('span.absol-selectlist-item-desc', res.$descCtn);
    res._extendClasses = [];
    res._extendStyle = {};
    res._data = "";
    return res;
}

//bold 14pt arial


SelectListItem.property = {};


SelectListItem.property.extendClasses = {
    set: function (value) {
        var i;
        for (i = 0; i < this._extendClasses.length; ++i) {
            this.removeClass(this._extendClasses[i]);
        }
        this._extendClasses = [];
        if (typeof value == 'string') value = value.trim().split(/\s+/);
        value = value || [];
        for (i = 0; i < value.length; ++i) {
            this._extendClasses.push(value[i]);
            this.addClass(value[i]);
        }
    },
    get: function () {
        return this._extendClasses;
    }
};

SelectListItem.property.extendStyle = {
    set: function (value) {
        this.removeStyle(this._extendStyle);
        this._extendStyle = Object.assign({}, value || {});
        this.addStyle(this._extendStyle);
    },
    get: function () {
        return this._extendClasses;
    }
};



SelectListItem.property.data = {
    set: function (value) {
        this._data = value;
        this.$desc.clearChild();
        if (typeof value == 'string') {
            this.$text.clearChild().addChild(_({ text: value }));
        }
        else {
            this.$text.clearChild().addChild(_({ text: value.text || '' }));
            if (value.desc) {
                this.$desc.addChild(_({ text: value.desc }));
            }

            this.extendClasses = value.extendClasses;
            this.extendStyle = value.extendStyle;
        }
    },
    get: function () {
        return this._data;
    }
};

SelectListItem.property.value = {
    get: function () {
        return (typeof this._data == "string") ? this._data : this._data.value;
    }
};

SelectListItem.property.text = {
    get: function () {
        return (typeof this._data == "string") ? this._data : this._data.text;
    }
};

SelectListItem.property.desc = {
    get: function () {
        return (typeof this._data == "string") ? undefined : this._data.desc;
    }
};






Acore.install('SelectListItem'.toLowerCase(), SelectListItem);



export default SelectList;