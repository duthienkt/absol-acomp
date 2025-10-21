import ACore, { $, $$, _ } from "../ACore";
import '../css/mknavigator.css';
import BoardTable from "./BoardTable";
import MKNavigatorItem from "./MKNavigatorItem";
import { measureText } from "./utils";

/***
 * @typedef MKNavigatorItemData
 * @property {string} text
 * @property {string|number} value
 * @property {boolean|number=} checked
 */

/***
 * @extends AElement
 * @constructor
 */
function MKNavigator() {
    this._items = [];
    this._value = 0;
    this._hiddenValues = [];
    this.$itemByValue = {};

    this.$header = $('.mk-nav-header', this);
    this.$body = $('.mk-nav-body', this)
        .on('orderchange', this.eventHandler.bodyOrderChange)
        .on('dragitemstart', this.eventHandler.dragItemStart);
    this.$footer = $('.mk-nav-footer', this);
    this.on('press', (event, sender) => {
        this.emit('clickitem', event, sender);
    });
    /***
     * @type {MKNavigatorItemData[]}
     * @name item
     * @memberOf MKNavigator#
     */

    /***
     * @type {number[]}
     * @name order
     * @memberOf MKNavigator#
     */

}

MKNavigator.tag = 'MKNavigator'.toLowerCase();

MKNavigator.render = function () {
    return _({
        class: 'mk-nav',
        extendEvent: ['orderchange', 'checkedchange', 'press', 'clickitem'],
        child: [
            {
                class: 'mk-nav-header'
            },
            {
                tag: BoardTable.tag,
                class: 'mk-nav-body'
            },
            {
                class: 'mk-nav-footer'
            }
        ]
    });
};

MKNavigator.prototype.updateValue = function () {
    var value = this._value;
    for (var iValue in this.$itemByValue) {
        if (iValue + '' !== value + '') {
            this.$itemByValue[iValue].removeClass('mk-current');
        }
    }
    var order = this.order;
    if (this.$itemByValue[value]) {
        this.$itemByValue[value].addClass('mk-current');
    }
    else if (order.length > 0) {
        this.$itemByValue[order[0]].addClass('mk-current');
    }
    var idx = order.filter(value => !this.$itemByValue[value].hasClass('as-hidden')).indexOf(value);

    if (idx >= 0) {
        this.addStyle('--mk-nav-line-top', `calc(${2 * idx}em + ${12 * idx}px)`);
    }
    else {
        this.removeStyle('--mk-nav-line-top');
    }
};

MKNavigator.prototype.setTextOfItem = function (value, text) {
    var itemElt = this.$itemByValue[value];
    if (!itemElt) return;
    itemElt.data.text = text;
    itemElt.updateText();
};

MKNavigator.prototype.mkItem = function (data) {
    var self = this;
    return _({
        tag: MKNavigatorItem.tag,
        attr: {
            "data-value": data && data.value
        },
        props: {
            data: data,
            level: data.level || 0,
        },
        on: {
            checkedchange: function (event) {
                self.emit('checkedchange', {
                    type: 'checkedchange',
                    target: this,
                    originalEvent: event.originalEvent,
                    itemData: data,
                    checked: data.checked
                }, self);
            },
            press: function (event) {
                self.value = data.value;
                self.emit('press', {
                    type: 'press',
                    itemElt: this,
                    itemData: data,
                    value: data.value,
                    target: this,
                    originalEvent: event.originalEvent
                }, self)
            }
        }
    });
};


MKNavigator.prototype._updateHiddenValues = function () {
    var hiddenDict = this._hiddenValues.reduce((ac, x) => {
        ac[x] = true;
        return ac;
    }, {})
    Object.keys(this.$itemByValue).forEach(value => {
        if (hiddenDict[value]) {
            this.$itemByValue[value].addClass('as-hidden');
        }
        else {
            this.$itemByValue[value].removeClass('as-hidden');
        }
    });
};

MKNavigator.property = {};

MKNavigator.property.items = {
    /***
     * @this MKNavigator
     * @param items
     */
    set: function (items) {
        items = items || [];
        this.rawItems = items;

        var flatList = (items, level, ac) => {
            ac = ac || [];
            level = level || 0;
            items.forEach((it) => {
                ac.push(Object.assign({}, it, { level: level }));
                if (it.items && it.items.length > 0) {
                    flatList(it.items, level + 1, ac);
                }
            });

            return ac;
        }

        this._items = flatList(items, 0, []);
        items = this._items;
        this.$itemByValue = {};
        var i = 0;
        var item;
        var itemElt;
        this.$header.clearChild();
        this.$body.clearChild();
        this.$footer.clearChild();
        var draggable = false;
        var bodyStyle = getComputedStyle(document.body);
        var levelWidth = bodyStyle.getPropertyValue('--distance-4') || '16px';
        levelWidth = levelWidth.replace('px', '');
        levelWidth = parseFloat(levelWidth) || 16;
        var maxTextWidth = items.reduce((ac, it) => {
            var tw = measureText(it.text || '', it.level ? '14px Arial' : '16px Arial').width + (it.level || 0) * levelWidth;
            return Math.max(ac, tw);
        }, 0);
        this.addStyle('--max-text-width', Math.ceil(maxTextWidth) + 'px');

        while (i < items.length) {
            if (items[i].draggable) break;
            item = items[i];
            itemElt = this.mkItem(item);
            this.$itemByValue[item.value] = itemElt;
            this.$header.addChild(itemElt);
            ++i;
        }

        while (i < items.length) {
            if (!items[i].draggable) break;
            draggable = true;
            item = items[i];
            itemElt = this.mkItem(item);
            this.$itemByValue[item.value] = itemElt;
            this.$body.addChild(itemElt);
            ++i;
        }
        while (i < items.length) {
            item = items[i];
            itemElt = this.mkItem(item)
            this.$itemByValue[item.value] = itemElt;
            this.$footer.addChild(itemElt);
            ++i;
        }
        if (draggable) {
            this.addClass('mk-has-draggable');
        }
        else {
            this.removeClass('mk-has-draggable');
        }
        this._updateHiddenValues();
        this.updateValue();
    },
    get: function () {
        return this.rawItems || [];
    }
};


MKNavigator.property.order = {
    get: function () {
        return $$(MKNavigatorItem.tag, this).map(function (e) {
            return e.data.value;
        });
    }
};


MKNavigator.property.value = {
    set: function (value) {
        this._value = value;
        this.updateValue();
    },
    get: function () {
        if (this.$itemByValue[this._value]) return this._value;
        if (this._items.length > 0) return this._items[0];
        return this._value;
    }
};

MKNavigator.property.hiddenValues = {
    set: function (values) {
        values = values || [];
        if (!(values instanceof Array)) values = [];
        this._hiddenValues = values;
        this._updateHiddenValues();
        this.updateValue();
    },
    get: function () {
        return this._hiddenValues;
    }

}


/***
 * @memberOf MKNavigator#
 * @type {{}}
 */
MKNavigator.eventHandler = {};

MKNavigator.eventHandler.bodyOrderChange = function (event) {
    this.updateValue();
    this._items.splice(0, this._items.length);
    $$(MKNavigatorItem.tag, this).reduce(function (ac, cr) {
        ac.push(cr.data);
        return ac;
    }, this._items);
    this.emit('orderchange', { type: 'orderchange', target: this }, this);
};

/***
 * @memberOf MKNavigator#
 * @type {{}}
 */
MKNavigator.eventHandler.dragItemStart = function (event) {
    var bound = this.getBoundingClientRect();
    this.addStyle('--mk-navigator-bound-left', bound.left + 'px');
}


ACore.install(MKNavigator);
ACore.install('mknav', MKNavigator);


export default MKNavigator;

function MKNDragTool(elt) {
    this.elt = elt;
}

