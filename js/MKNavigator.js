import ACore, { $, $$, _ } from "../ACore";
import '../css/mknavigator.css';
import BoardTable from "./BoardTable";
import MKNavigatorItem from "./MKNavigatorItem";

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
    this.$itemByValue = {};

    this.$header = $('.mk-nav-header', this);
    this.$body = $('.mk-nav-body', this)
        .on('orderchange', this.eventHandler.bodyOrderChange);
    this.$footer = $('.mk-nav-footer', this);
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
        extendEvent: ['orderchange', 'checkedchange', 'press'],
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
    for (var iValue in this.$itemByValue){
        if (iValue+'' !== value+''){
            this.$itemByValue[iValue].removeClass('mk-current');
        }
    }
    var order = this.order;
    if (this.$itemByValue[value]){
        this.$itemByValue[value].addClass('mk-current');
    }
    else if (order.length > 0) {
        this.$itemByValue[order[0]].addClass('mk-current');
    }
    var idx = order.indexOf(value);
    if (idx >= 0) {
        this.addStyle('--mk-nav-line-top', idx * 40 + 'px');
    }
    else {
        this.removeStyle('--mk-nav-line-top');
    }
};

MKNavigator.prototype.mkItem = function (data) {
    var self = this;
    return _({
        tag: MKNavigatorItem.tag,
        props: {
            data: data
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


MKNavigator.property = {};

MKNavigator.property.items = {
    /***
     * @this MKNavigator
     * @param items
     */
    set: function (items) {
        items = items || [];
        this._items = items;
        this.$itemByValue = {};
        var i = 0;
        var item;
        var itemElt;
        this.$header.clearChild();
        this.$body.clearChild();
        this.$footer.clearChild();
        var draggable = false;
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
    },
    get: function () {
        return this._items;
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

/***
 * @memberOf MKNavigator#
 * @type {{}}
 */
MKNavigator.eventHandler = {};

MKNavigator.eventHandler.bodyOrderChange = function (event) {
    this.updateValue();
    this.emit('orderchange', { type: 'orderchange', target: this }, this);
};


ACore.install(MKNavigator);


export default MKNavigator;