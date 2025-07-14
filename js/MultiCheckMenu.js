import MultiSelectMenu from "./MultiSelectMenu";
import ACore, { _, $ } from "../ACore";
import OOP, { drillProperty, mixClass } from "absol/src/HTML5/OOP";
import { CheckListBox } from "./CheckListBox";
import EventEmitter, { hitElement } from "absol/src/HTML5/EventEmitter";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import { isNaturalNumber } from "./utils";
import { arrayCompare } from "absol/src/DataStructure/Array";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import AElement from "absol/src/HTML5/AElement";
import { loadLanguageModule } from "./MultiLanguageCSS";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import MCheckListModal from "./multicheckmenu/MCheckListModal";
import { AbstractStyleExtended } from "./Abstraction";
import TIHistory from "./tokenizeiput/TIHistory";


var hitItem = event => {
    var target = event.target;
    for (var i = 0; i < 5 && target; ++i) {
        if (target.hasClass && target.hasClass('absol-selectbox-item')) return true;
        target = target.parentElement;
    }
    return false;
}

var hitClose = event => {
    var target = event.target;
    if (target.hasClass && target.hasClass('absol-selectbox-item-close')) return true;
    target = target.parentElement;
    return !!(target.hasClass && target.hasClass('absol-selectbox-item-close'));
};


/***
 * @augments AbstractStyleExtended
 * @extends AElement
 * @constructor
 */
function MultiCheckMenu() {
    loadLanguageModule();
    this.addClass('as-multi-check-menu');

    // this.on('click', this.eventHandler.click);
    /***
     * @type {CheckListBox|MCheckListModal}
     */
    this.$selectlistBox = _({
        tag: BrowserDetector.isMobile ? MCheckListModal : CheckListBox,//use new version//TODO: in process
        props: {
            anchor: [1, 6, 2, 5],
        }
    });
    drillProperty(this, this.$selectlistBox, 'debug')

    this.addStyle('--as-width-limit', Math.max(140, (this.$selectlistBox.widthLimit || 0)) + 'px');

    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$attachhook = $('attachhook', this)
        .on('attached', this.eventHandler.attached);
    this.$attachhook.requestUpdateSize = this.updateSize.bind(this);

    this.boxCtrl = new MSMBoxController(this);
    this.itemsViewCtrl = new MSMItemsViewController(this);


    OOP.drillProperty(this, this.boxCtrl, 'isFocus');
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');
    OOP.drillProperty(this, this.itemsViewCtrl, '$items');//adapt
    this.commitedValues = [];//commit value


    this.$selectlistBox.followTarget = this;
    this.$selectlistBox.sponsorElement = this;
    this.disableClickToFocus = false;
    this.orderly = true;//always true
    this.itemFocusable = false;

    AbstractStyleExtended.call(this);
    /**
     * @type {boolean}
     * @memberof MultiCheckMenu#
     * @name disabled
     */

    /**
     * @type {boolean}
     * @memberof MultiCheckMenu#
     * @name readOnly
     */

    /**
     * @type {Array<number|null|string|Date>}
     * @memberof MultiCheckMenu#
     * @name values
     */


}

mixClass(MultiCheckMenu, AbstractStyleExtended);

MultiCheckMenu.tag = 'MultiCheckMenu'.toLowerCase();

MultiCheckMenu.render = MultiSelectMenu.render;

Object.assign(MultiCheckMenu.prototype, MultiSelectMenu.prototype);
MultiCheckMenu.property = Object.assign({}, MultiSelectMenu.property);
MultiCheckMenu.eventHandler = Object.assign({}, MultiSelectMenu.eventHandler);
delete MultiCheckMenu.property.isFocus;
delete MultiCheckMenu.property.orderly;



MultiCheckMenu.prototype.styleHandlers.maxWidth = {
    set:  function (value) {
        var parsedValue = parseMeasureValue(value);
        if (parsedValue && parsedValue.unit === 'px') {
            this.addClass('as-has-max-width');
            this.addStyle('--max-width', value);
        }
        else {
            this.removeClass('as-has-max-width');
        }
        if (value === 'unset') {
            this.style.maxWidth = "unset";
        }
        return value;
    }
}

MultiCheckMenu.prototype.styleHandlers['max-width'] = MultiCheckMenu.prototype.styleHandlers.maxWidth;

MultiCheckMenu.prototype.styleHandlers.width = {
    set: function (value) {
        var parsedValue = parseMeasureValue(value);
        if (parsedValue.unit === 'px') {
            this.addClass('as-has-max-width');
            this.addStyle('--max-width', value);
            this.style.width = value;
        }
        else if(parsedValue && parsedValue.unit === '%'){
            this.style.width = value;
        }
        else {
            this.removeClass('as-has-max-width');
        }
        return value;
    }
};

/**
 * @this MultiCheckMenu
 * @param value
 */
MultiCheckMenu.prototype.styleHandlers.maxHeight = {
    set: function (value) {
        var psValue = parseMeasureValue(value);
        if (psValue) {
            switch (psValue.unit) {
                case 'px':
                    psValue.value = Math.min(psValue.value, 90);
                    break;
                case 'em':
                case 'rem':
                    psValue.value = Math.min(psValue.value, 90 / 14);
                    break;
            }
            this.$itemCtn.addStyle('max-height', psValue.value + psValue.unit);
        }
        else {
            this.$itemCtn.removeStyle('max-height');
        }
        return value;
    }
};

MultiCheckMenu.prototype.styleHandlers['max-height'] = MultiCheckMenu.prototype.styleHandlers.maxHeight;
MultiCheckMenu.prototype.styleHandlers.overflow = {
    set: function (value) {
        if (value === 'hidden') {
            this.style.overflow = 'hidden';
            this.$itemCtn.style.overflow = 'hidden';
        }
        else {
            this.style.overflow = '';
            this.$itemCtn.style.overflow = '';

        }
        return value;
    }
};



MultiCheckMenu.prototype._updateOverflow = function () {
    //todo: calc item size before render
    var bound, i;
    var fromIdx = Infinity;
    if (this.getComputedStyleValue('overflow') === 'hidden') {
        bound = this.getBoundingClientRect();
        if (bound.width === 0) return;
        this.$itemCtn.removeClass('as-has-more');
        var hasMore = false;
        var elt;
        for (i = 0; i < this.$itemCtn.childNodes.length; ++i) {
            elt = this.$itemCtn.childNodes[i];
            if (!hasMore) {
                elt.removeStyle('display');
                var cBound = elt.getBoundingClientRect();
                if (cBound.bottom > bound.bottom) {
                    hasMore = true;
                    fromIdx = i - 1;
                    break;
                }
            }
        }
        if (hasMore) {
            this.$itemCtn.addClass('as-has-more');
            for (i = 0; i < this.$itemCtn.childNodes.length; ++i) {
                elt = this.$itemCtn.childNodes[i];
                if (i > 0 && i >= fromIdx) {
                    elt.addStyle('display', 'none');
                }
                else {
                    elt.removeStyle('display');
                }
            }
        }
        else {
            for (i = 0; i < this.$itemCtn.childNodes.length; ++i) {
                elt = this.$itemCtn.childNodes[i];
                elt.removeStyle('display');
            }
        }
    }
};


MultiCheckMenu.property.values = {
    set: function (values) {
        if (values === undefined || values === null) values = [];
        else if (!Array.isArray(values)) values = [values];
        this.$selectlistBox.values = values;
        this.commitedValues = this.$selectlistBox.values;
        this.itemsViewCtrl.update();
    },
    get: function () {
        return this.commitedValues;
    }
};

MultiCheckMenu.property.items = {
    /**
     * @this MultiCheckMenu
     * @param items
     */
    set: function (items) {
        this.$selectlistBox.items = items;
        this.commitedValues = this.$selectlistBox.values;

        this.addStyle('--list-min-width', Math.max(140, this.$selectlistBox._estimateWidth || 0) + 'px');
        this.itemsViewCtrl.update();
    },
    get: function () {
        return this.$selectlistBox.items;
    }
};

MultiCheckMenu.property.placeholder = {
    set: function (value) {
        if (typeof value === "string") value = value.trim();
        if (value) {
            this.$itemCtn.attr('data-placeholder', value + '');
        }
        else {
            this.$itemCtn.attr('data-placeholder', null);
        }
    },
    get: function () {
        return this.$itemCtn.attr('data-placeholder') || '';
    }
};

MultiCheckMenu.prototype.updateSize = function () {
    var bound;
    if (this.boxCtrl.isFocus) {
        bound = this.getBoundingClientRect();
        if (!BrowserDetector.isMobile)
            this.$selectlistBox.addStyle('min-width', Math.max(bound.width, this.$selectlistBox.getFontSize() * 18.5) + 'px');
        this.$selectlistBox.refollow();
        this.$selectlistBox.updatePosition();
    }
};


MultiCheckMenu.prototype.findItemsByValue = function (value) {
    return this.$selectlistBox.findItemsByValue(value);
};


MultiCheckMenu.prototype.findItemByValue = function (value) {
    return this.$selectlistBox.findItemByValue(value);
}


MultiCheckMenu.property.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
}

/***
 * call after close checklistbox
 * @param event
 */


MultiCheckMenu.eventHandler.selectListBoxPressItem = function (event) {
    console.log('press')
    var prevValues = this.commitedValues;
    var prevDict = prevValues.reduce(function (ac, cr) {
        ac[cr + ''] = cr;
        return ac;
    }, {});
    this.$selectlistBox.updatePosition();
    var curValues = this.$selectlistBox.values;
    var changed = false;
    var curDict = curValues.reduce(function (ac, cr) {
        ac[cr + ''] = cr;
        return ac;
    }, {});
    this.commitedValues = curValues.slice();
    prevValues.forEach(function (value) {
        if ((value + '') in curDict) return;
        var holders = this.$selectlistBox.findItemsByValue(value);
        if (!holders || holders.length === 0) return;
        var item = holders[0].item;
        this.emit('remove', Object.assign({}, event, {
            type: 'remove',
            target: this,
            value: item.value,
            data: item,
            itemData: item
        }), this);
        changed = true;
    }.bind(this));

    curValues.forEach(function (value) {
        if ((value + '') in prevDict) return;
        var holders = this.$selectlistBox.findItemsByValue(value);
        if (!holders || holders.length === 0) return;
        var item = holders[0].item;
        this.emit('add', Object.assign({}, event, {
            type: 'add',
            target: this,
            value: item.value,
            data: item,
            itemData: item
        }), this);
        changed = true;
    }.bind(this));
    this._updateItems();
    this.isFocus = false;
    if (changed)
        this.emit('change', Object.assign({}, event, {
            type: 'change',
            action: 'submit',
            target: this,
            values: this.values
        }), this);
};


ACore.install(MultiCheckMenu);

export default MultiCheckMenu;


/**
 *
 * @param {MultiCheckMenu} elt
 * @constructor
 */
function MSMItemsViewController(elt) {
    this.elt = elt;
    this.$items = [];
}

MSMItemsViewController.prototype.share = {
    pool: [],
    pressCloseEventHandle: function pressCloseEventHandle(event) {
        var parentElt = this.$parent;
        if (!parentElt) return;
        parentElt.itemsViewCtrl.ev_pressCloseItem(this, event);
    },
    pressHandler: function pressHandler(event) {
        var parentElt = this.$parent;
        if (!parentElt) return;
        parentElt.itemsViewCtrl.ev_pressItem(this, event);
    }
};


MSMItemsViewController.prototype.revokeResource = function () {
    delete this.elt;
};


MSMItemsViewController.prototype.makeItem = function () {
    return _({
        tag: 'selectboxitem',
        on: {
            close: this.share.pressCloseEventHandle,
            press: this.share.pressHandler
        }
    });
};

MSMItemsViewController.prototype.releaseItem = function (itemElt) {
    this.share.pool.push(itemElt);
    itemElt.$parent = null;
};

MSMItemsViewController.prototype.requireItem = function () {
    var itemElt;
    if (this.share.pool.length > 0) {
        itemElt = this.share.pool.pop();
    }
    else {
        itemElt = this.makeItem();
    }
    itemElt.$parent = this.elt;
    return itemElt;
}


MSMItemsViewController.prototype.requireListLength = function (n) {
    if (!isNaturalNumber(n)) n = 0;
    var itemElt;
    while (this.$items.length < n) {
        itemElt = this.requireItem();
        this.elt.$itemCtn.addChild(itemElt);
        this.$items.push(itemElt);
    }

    while (this.$items.length > n) {
        itemElt = this.$items.pop();
        this.elt.$itemCtn.removeChild(itemElt);
        this.releaseItem(itemElt);
    }

};

MSMItemsViewController.prototype.assignItems = function (items) {
    for (var i = 0; i < this.$items.length && i < items.length; ++i) {
        this.$items[i].data = items[i];
    }
};


MSMItemsViewController.prototype.viewItems = function (items) {
    var cBound = this.elt.getBoundingClientRect();
    this.requireListLength(items.length);
    this.assignItems(items);
    setTimeout(this.elt._updateOverflow.bind(this.elt), 10)
    setTimeout(this.elt._updateOverflow.bind(this.elt), 100)
    setTimeout(this.elt._updateOverflow.bind(this.elt), 150)

    var nBound = this.elt.getBoundingClientRect();
    if (nBound.width !== cBound.width || nBound.height !== cBound.height) {
        ResizeSystem.updateUp(this.elt);
    }
};

MSMItemsViewController.prototype.viewItemsByIndexes = function (indexes) {
    var items = [];
    var item;
    for (var i = 0; i < indexes.length; ++i) {
        item = this.elt.$selectlistBox.getItemByIndex(indexes[i]);
        if (item) items.push(item);
    }
    this.viewItems(items);
};

MSMItemsViewController.prototype.viewItemsByValues = function (values) {
    values = values || [];
    var items = [];
    var holders;
    for (var i = 0; i < values.length; ++i) {
        holders = this.elt.$selectlistBox.findItemHoldersByValue(values[i]);
        if (holders) {
            holders = holders.map(hd => hd.item);
            items = items.concat(holders);
        }
    }
    this.viewItems(items);
};

MSMItemsViewController.prototype.update = function () {
    this.viewItemsByValues(this.elt.values);
};


MSMItemsViewController.prototype.ev_pressCloseItem = function (itemElt, event) {
    var values = this.elt.$selectlistBox.values;
    var value = itemElt.value;
    var newValues = values.filter(x => x !== value);
    var data = itemElt.data;

    this.elt.$selectlistBox.values = newValues;
    if (this.elt.boxCtrl.isFocus) {
        this.viewItemsByValues(newValues);
    }
    else {
        this.elt.commitedValues = this.elt.$selectlistBox.values;
        this.update();
        this.elt.emit('change', { type: 'change', action: 'remove', data: data, value: value, target: this.elt });
    }
};

MSMItemsViewController.prototype.ev_pressItem = function (itemElt, event) {
    if (!this.disableClickToFocus && this.itemFocusable) {
        this.elt.$selectlistBox.viewListAtItem(itemElt.data);
        //todo: focus
    }
};


Object.defineProperty(MSMItemsViewController.prototype, 'disableClickToFocus', {
    set: function (value) {
        if (value) {
            this.elt.addClass('as-disable-click-to-focus');
        }
        else {
            this.elt.removeClass('as-disable-click-to-focus');
        }
    },
    get: function () {
        return this.elt.hasClass('as-disable-click-to-focus');
    }
});


Object.defineProperty(MSMItemsViewController.prototype, 'itemFocusable', {
    set: function (value) {
        if (value) {
            this.elt.addClass('as-item-focusable');
        }
        else {
            this.elt.removeClass('as-item-focusable');
        }
        this._updateFocusItem();
    },
    get: function () {
        return this.elt.hasClass('as-item-focusable');
    }
});


Object.defineProperty(MSMItemsViewController.prototype, 'activeValue', {
    set: function (value) {
        this._activeValue = value;
        if (this.itemFocusable) {
            this._updateFocusItem();
            //todo
        }
    },
    get: function () {
        return this._activeValue;
    }
});


/**
 *
 * @param {MultiCheckMenu} elt
 * @constructor
 */
function MSMBoxController(elt) {
    Object.keys(this.constructor.prototype).forEach(key => {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    });
    this.elt = elt;
    if (this.elt.$selectlistBox.cancelWaiting)
        this.elt.$selectlistBox.cancelWaiting();
    this.lockOpen = false;
    this.elt.on('mousedown', this.ev_click);
    this.elt.$selectlistBox.on({
        preupdateposition: this.ev_preUpdateListPosition,
        change: this.ev_listChange,
        cancel: this.ev_listCancel,
        close: this.ev_listClose
    });
}

Object.defineProperty(MSMBoxController.prototype, 'isFocus', {
    /**
     * @this MSMBoxController
     * @returns {*}
     */
    set: function (value) {
        value = !!value;
        if (value) {
            this.open();
        }
        else {
            this.close();
        }
    },
    /**
     * @this MSMBoxController
     * @returns {*}
     */
    get: function () {
        return this.elt.hasClass('as-focus');
    }
});


MSMBoxController.prototype.open = function () {
    if (this.lockOpen || this.elt.disabled || this.elt.readOnly) return;
    if (this.elt.hasClass('as-focus')) return;
    this.elt.addClass('as-focus');
    this.elt.$selectlistBox.addTo(document.body);
    this.elt.off('mousedown', this.ev_click);
    var bound = this.elt.getBoundingClientRect();
    if (!BrowserDetector.isMobile)// not modal
        this.elt.$selectlistBox.addStyle('min-width', Math.max(bound.width, this.elt.$selectlistBox.getFontSize() * 18.5) + 'px');
    this.elt.$selectlistBox.followTarget = this.elt;
    this.addListennerTO = setTimeout(() => {
        document.addEventListener('mousedown', this.ev_mousedownOut);
        if (!BrowserDetector.isMobile) {
            this.elt.$selectlistBox.focus();
            this.elt.$selectlistBox.viewListAtFirstSelected();
        }
    }, 50);
};


MSMBoxController.prototype.close = function () {
    if (!this.elt.hasClass('as-focus')) return;
    this.elt.removeClass('as-focus');
    this.elt.$selectlistBox.resetSearchState();
    this.elt.$selectlistBox.selfRemove();
    clearTimeout(this.addListennerTO);
    document.removeEventListener('mousedown', this.ev_mousedownOut);
    this.elt.on('mousedown', this.ev_click);
    var values = this.elt.$selectlistBox.values;
    if (!arrayCompare(values, this.elt.commitedValues)) {
        this.elt.commitedValues = values;
        this.elt.emit('change', Object.assign({}, event, {
            type: 'change',
            action: 'submit',
            target: this,
        }), this);
    }
};

MSMBoxController.prototype.ev_click = function (event) {
    if (hitClose(event)) return;
    this.open();
};

MSMBoxController.prototype.ev_preUpdateListPosition = function () {
    var bound = this.elt.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.elt.$selectlistBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this.elt);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        if (!BrowserDetector.isMobile)
            this.close();
    }
};


MSMBoxController.prototype.ev_listChange = function (event) {
    setTimeout(() => {
        this.elt.itemsViewCtrl.viewItems(this.elt.$selectlistBox.selectedItems);
    }, 1);
};

MSMBoxController.prototype.ev_listCancel = function () {
    this.elt.$selectlistBox.values = this.elt.commitedValues;
    this.close();
    this.elt.itemsViewCtrl.update();
};

MSMBoxController.prototype.ev_listClose = function (event) {
    var newValues = this.elt.$selectlistBox.values;
    if (!arrayCompare(this.elt.commitedValues, newValues)) {
        this.elt.commitedValues = newValues;
        this.elt.emit('change', Object.assign({}, event, {
            type: 'change',
            target: this.elt,
            originalEvent: event.originalEvent || event
        }));
    }
    this.elt.itemsViewCtrl.update();
    this.close();
};


MSMBoxController.prototype.ev_mousedownOut = function (event) {
    if (hitElement(this.elt.$selectlistBox, event)) return;
    if (!this.elt.disableClickToFocus && this.elt.itemFocusable && hitItem(event)) return;
    this.lockOpen = true;
    this.close();
    document.addEventListener('mouseup', this.ev_mouseupOut);
};

MSMBoxController.prototype.ev_mouseupOut = function () {
    setTimeout(() => {
        this.lockOpen = false;
    }, 50);
};

ACore.install(MultiCheckMenu);