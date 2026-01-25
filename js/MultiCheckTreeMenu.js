import CheckTreeBox from "./CheckTreeBox";
import ACore, { $, _ } from "../ACore";
import SelectBoxItem from "./SelectBoxItem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import MultiSelectMenu from "./MultiSelectMenu";
import CheckTreeLeafOnlyBox from "./CheckTreeLeafOnlyBox";
import { copySelectionItemArray, isNaturalNumber, legacyKeyStringOf } from "./utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import CheckUnsafeTreeLeafOnlyBox from "./CheckUnsafeTreeLeafOnlyBox";
import { arrayCompare, arrayUnique } from "absol/src/DataStructure/Array";
import { AbstractInput, AbstractStyleExtended } from "./Abstraction";
import { mixClass } from "absol/src/HTML5/OOP";
import Rectangle from "absol/src/Math/Rectangle";


/***
 * @augments AbstractStyleExtended
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeMenu() {
    this._items = [];
    this._values = [];//commited value
    this._viewValues = [];
    /***
     * @type {CheckTreeBox|CheckTreeLeafOnlyBox}
     */
    this.$checkTreeBox = _({
        tag: this.renderProps.leafOnly ? (this.attr('data-version') === '2.0' ? CheckUnsafeTreeLeafOnlyBox.tag : CheckTreeLeafOnlyBox.tag) : CheckTreeBox.tag,
        // forceMobile: true,
        on: {
            change: this.eventHandler.boxChange,
            preupdateposition: this.eventHandler.preUpdateListPosition,
            toggleitem: this.eventHandler.boxToggleItem,
            cancel: this.eventHandler.boxCancel,
            close: this.eventHandler.boxClose
        },
        props: {
            initOpened: isNaturalNumber(this.renderProps.initOpened) ? this.renderProps.initOpened : 3,
            enableSearch: this.renderProps.enableSearch
        }
    });

    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$checkTreeBox.followTarget = this;
    this.$checkTreeBox.sponsorElement = this;
    this.on('mousedown', this.eventHandler.click);
    this.dropdownCtrl = new MCTMDropController(this);
    // this.placeholder = LangSys.getText('txt_select_value') || '-- Select values --';
    AbstractInput.call(this);
    var options = {
        root: document.body,
    };

    this.observer = new IntersectionObserver((entries, observer) => {
        if (entries.length > 0) {
            this.eventHandler.viewChange();
        }
    }, options);

    this.observer.observe(this.$itemCtn);

    //todo: auto disconnect observer when not needed

    /**
     * @name readOnly
     * @type {boolean}
     * @memberOf MultiCheckTreeMenu#
     */

    /**
     * @name disabled
     * @type {boolean}
     * @memberOf MultiCheckTreeMenu#
     */


    /**
     * parent will be selected if all off leaf selected, sub tree can not select if had no leaf
     * @name leafOnly
     * @type {boolean}
     * @memberOf MultiCheckTreeMenu#
     */
    /**
     * parent will be selected if all off leaf selected, sub tree can not select if had no leaf
     * @name initOpened
     * @type {number}
     * @memberOf MultiCheckTreeMenu#
     */

    /**
     * @name readOnlyValues
     * @type {Array}
     * @memberOf MultiCheckTreeMenu#
     */
}

mixClass(MultiCheckTreeMenu, AbstractInput);

MultiCheckTreeMenu.tag = 'MultiCheckTreeMenu'.toLowerCase();

MultiCheckTreeMenu.render = function (data, domDesc) {
    var leafOnly = domDesc.props && domDesc.props.leafOnly;
    var props = domDesc.props || {};
    /**
     * @name renderProps
     * @memberof MultiCheckTreeMenu#
     */
    var res = _({
        class: ['as-multi-select-menu', 'as-multi-check-tree-menu'],
        extendEvent: ['change', 'blur'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller'],
                attr: {
                    "data-ml-key": 'txt_select_value'
                },
            },
            {
                tag: 'button',
                class: 'as-multi-select-menu-toggle-btn',
                child: 'dropdown-ico'
            },
            'attachhook'
        ],
        props: {
            renderProps: props
        }
    });
    if (props.version === 2) {
        res.attr('data-version', '2');
    }
    if (leafOnly) res.addClass('as-leaf-only');
    if (BrowserDetector.isMobile) res.addClass('am-multi-select-menu');

    return res;
};

MultiCheckTreeMenu.prototype.tokenPool = [];


MultiCheckTreeMenu.prototype.styleHandlers.maxWidth = {
    set: function (value) {
        var parsedValue = parseMeasureValue(value);
        if (parsedValue && parsedValue.unit === 'px') {
            this.addClass('as-has-max-width');
            this.addStyle('--max-width', value);
        }
        else {
            this.removeClass('as-has-max-width');
        }
        return value;
    }
};


MultiCheckTreeMenu.prototype.styleHandlers.width = {
    set: function (value) {
        var parsedValue = parseMeasureValue(value);
        if (parsedValue && parsedValue.unit === 'px') {
            this.addClass('as-has-max-width');
            this.addStyle('--max-width', value);
            this.style.width = value;
        }
        else if (parsedValue && parsedValue.unit === '%') {
            this.style.width = value;
            this.classList.add('as-width-percent');
        }
        else {
            this.style.width = value;
            this.removeClass('as-has-max-width');
            this.classList.remove('as-width-percent');
        }
        return value;
    }
};

MultiCheckTreeMenu.prototype.styleHandlers.flexGrow = {
    set: function (value) {
        if (value !== 'auto' && value) {
            this.classList.add('as-width-percent');
        }
        else {
            this.classList.remove('as-width-percent');
        }
        this.style.flexGrow = value;
        return value;
    }
}

MultiCheckTreeMenu.prototype.styleHandlers.overflow = {
    /**
     * @this MultiCheckTreeMenu
     * @param value
     * @returns {*}
     */
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


MultiCheckTreeMenu.prototype._requestToken = function () {
    var token = this.tokenPool.pop();
    if (!token) {
        token = _({
            tag: SelectBoxItem.tag,
            props: {
                menu: this
            },
            on: {
                close: function (event) {
                    setTimeout(function () {
                        if (this.menu) this.menu.eventHandler.pressCloseToken(this, event);
                    }.bind(this), 1)
                }
            }
        });
    }
    return token;
};

MultiCheckTreeMenu.prototype._releaseToken = function (token) {
    token.menu = null;
    this.tokenPool.push(token);
};

MultiCheckTreeMenu.prototype._filToken = function (n) {
    while (this.$itemCtn.childNodes.length > n) {
        this.$itemCtn.removeChild(this.$itemCtn.lastChild);
    }
    while (this.$itemCtn.childNodes.length < n) {
        this.$itemCtn.addChild(this._requestToken());
    }
};


MultiCheckTreeMenu.prototype._assignTokens = function (items) {
    for (var i = 0; i < items.length; ++i) {
        this.$itemCtn.childNodes[i].data = items[i];
    }
};

MultiCheckTreeMenu.prototype.updateReadOnlyItems = function () {
    //TODO: only support leafOny true
    var readOnlyValues = this._readOnlyValues || [];
    var items = Array.prototype.slice.call(this.$itemCtn.childNodes);
    var dict = readOnlyValues.reduce((ac, cr) => {
        ac[legacyKeyStringOf(cr)] = true;
        return ac;
    }, {});

    items.forEach(function (it) {
        if (dict[legacyKeyStringOf(it.data.value)]) {
            it.readOnly = true;
        }
        else {
            it.readOnly = false;
        }
    })

};


MultiCheckTreeMenu.prototype.findItemsByValues = function (values) {
    return values.map(function (value) {
        var holders = this.$checkTreeBox.findItemHoldersByValue(value);
        if (holders.length > 0) return holders[0].item;
        return null;
    }.bind(this)).filter(function (it) {
        return !!it;
    });
};

MultiCheckTreeMenu.prototype.findItemByValue = function (value) {
    return this.$checkTreeBox.findItemByValue(value);
};


MultiCheckTreeMenu.prototype.viewValues = function (values) {
    values = values.slice();
    var items = this.findItemsByValues(values);
    this._filToken(items.length);
    this._assignTokens(items);
    this.updateReadOnlyItems();
    this._viewValues = values;
    if (this.isFocus) {
        var bound = this.getBoundingClientRect();
        this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
        ResizeSystem.update();
    }
    setTimeout(this._updateOverflow.bind(this), 100)
    this.eventHandler.viewChange();
};

MultiCheckTreeMenu.prototype._updateOverflow = function () {
    var bound;
    if (this.getComputedStyleValue('overflow') === 'hidden') {
        bound = this.getBoundingClientRect();
        if (bound.width === 0) return;
        this.$itemCtn.removeClass('as-has-more');
        var hasMore = false;
        var elt;
        for (var i = 0; i < this.$itemCtn.childNodes.length; ++i) {
            elt = this.$itemCtn.childNodes[i];
            if (!hasMore) {
                elt.removeStyle('display');
                var cBound = elt.getBoundingClientRect();
                if (cBound.bottom > bound.bottom) {
                    hasMore = true;
                }
            }
            if (hasMore) {
                elt.addStyle('display', 'none');
            }
        }
        if (hasMore) this.$itemCtn.addClass('as-has-more');
    }
};

MultiCheckTreeMenu.prototype.commitView = function () {
    var values = this._values;
    var newValues = this.$checkTreeBox.values.slice();
    if (!arrayCompare(values, newValues)) {
        this._values = this.$checkTreeBox.values.slice();
        this.emit('change', { type: 'change', target: this }, this);
    }
};

MultiCheckTreeMenu.prototype.cancelView = function () {
    this.$checkTreeBox.values = this._values.slice();
    this.viewValues(this.$checkTreeBox.viewValues);
};

MultiCheckTreeMenu.prototype.init = function (props) {
    props = props || {};
    var cProps = Object.assign({}, props);
    if ('initOpened' in props) {
        this.initOpened = props.initOpened;
        delete cProps.initOpened;
    }

    if ('leafOnly' in props) {
        this.leafOnly = props.leafOnly;
        delete cProps.leafOnly;
    }
    if ('items' in props) {
        this.items = props.items;
        delete cProps.items;
    }
    if ('values' in props) {
        this.values = props.values;
        delete cProps.values;
    }

    Object.assign(this, cProps);
}


MultiCheckTreeMenu.property.initOpened = {
    set: function (value) {
        if (value === true) value = 100;
        if (isNaturalNumber(value)) {
            this._initOpened = value;
        }
        else {
            this._initOpened = 0;
        }
        this.$checkTreeBox.initOpened = this._initOpened;
    },
    get: function () {
        return this._initOpened;
    }
}

MultiCheckTreeMenu.property.isFocus = {
    /***
     * @this MultiCheckTreeMenu
     * @param value
     */
    set: function (value) {
        this.dropdownCtrl.isFocus = value;
    },
    get: function () {
        return this.dropdownCtrl.isFocus;
    }
};

MultiCheckTreeMenu.property.items = {
    set: function (items) {
        this._items = copySelectionItemArray(items || [], { removeNoView: true });
        this.$checkTreeBox.items = this._items;
        this.addStyle('--list-min-width', Math.max(145 + 20, this.$checkTreeBox.estimateSize.lv0Width || this.$checkTreeBox.estimateSize.width) + 'px');
        this.viewValues(this.$checkTreeBox.viewValues);
        this._values = this.$checkTreeBox.values.slice();
        this.eventHandler.viewChange();
    },
    get: function () {
        return this.$checkTreeBox.items || [];
    }
};

MultiCheckTreeMenu.property.values = {
    /***
     * @this MultiCheckTreeMenu
     * @param values
     */
    set: function (values) {
        if (!(values instanceof Array)) values = [];
        values = arrayUnique(values);
        this.$checkTreeBox.values = values;
        this.viewValues(this.$checkTreeBox.viewValues);
        this._values = this.$checkTreeBox.values.slice();
        this.eventHandler.viewChange();
    },
    /***
     * @this MultiCheckTreeMenu
     */
    get: function () {
        if (this.isFocus) return this._values.slice();
        return this.$checkTreeBox.values.slice();
    }
};

MultiCheckTreeMenu.property.checkedValues = {
    get: function () {
        return this.$checkTreeBox.viewValues.slice();
    }
};

MultiCheckTreeMenu.property.leafOnly = {
    set: function (value) {
        if (!!value === this.hasClass('as-leaf-only'))
            return;

        throw Error("Can not change leafOnly value!");
    },
    get: function () {
        return this.hasClass('as-leaf-only');
    }
};

MultiCheckTreeMenu.property.placeholder = {
    set: function (value) {
        if (value) {
            this.$itemCtn.attr('data-placeholder', value + '');
        }
        else {
            this.$itemCtn.attr('data-placeholder', null);
        }
    },
    get: function () {
        return this.$itemCtn.attr('data-placeholder');
    }
};

MultiCheckTreeMenu.property.readOnlyValues = {
    /**
     * @this MultiCheckTreeMenu
     * @param values
     */
    set: function (values) {
        if (!Array.isArray(values)) values = [];
        else values = arrayUnique(values);
        this._readOnlyValues = values;
        this.$checkTreeBox.readOnlyValues = this._readOnlyValues;
        this.updateReadOnlyItems();

    },
    get: function () {
        return (this._readOnlyValues || []).slice();
    }
};

MultiCheckTreeMenu.property.disabled = MultiSelectMenu.property.disabled;
MultiCheckTreeMenu.property.readOnly = MultiSelectMenu.property.readOnly;


MultiCheckTreeMenu.eventHandler = {};

/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.clickOut = function (event) {
    if ((event.target.hasClass && event.target.hasClass('am-modal')) || event.target === this || event.target === this.$itemCtn || (!hitElement(this, event) && !hitElement(this.$checkTreeBox, event))) {
        this.isFocus = false;
        this.commitView();
        this.eventHandler.viewChange();
    }
};

/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.boxClose = function (event) {
    this.commitView();
    this.isFocus = false;
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.click = function (event) {
    if (!this.readOnly && (event.target === this || event.target === this.$itemCtn)) {
        this.isFocus = true;
    }
};


/***
 * @this MultiCheckTreeMenu
 * @param event
 */
MultiCheckTreeMenu.eventHandler.boxChange = function (event) {
    this.viewValues(this.$checkTreeBox.viewValues);
    ResizeSystem.update();
    this.eventHandler.viewChange();
};

MultiCheckTreeMenu.eventHandler.boxCancel = function (event) {
    this.cancelView();
    this.isFocus = false;
};


/***
 * @this MultiCheckTreeMenu
 * @param {SelectBoxItem} tokenElt
 * @param event
 */
MultiCheckTreeMenu.eventHandler.pressCloseToken = function (tokenElt, event) {
    var value = tokenElt.value;
    var holders = this.$checkTreeBox.findItemHoldersByValue(value);
    holders.forEach(function (holder) {
        holder.unselectAll();
    });
    this.$checkTreeBox.updateSelectedInViewIfNeed();
    var newValues = this.$checkTreeBox.viewValues.slice();
    this.viewValues(newValues);
    if (!arrayCompare(this._values, newValues)) {
        this._values = newValues;
        this.emit('change', { type: 'change', target: this }, this);
    }
};


MultiCheckTreeMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom - 50;
    this.$checkTreeBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};

MultiCheckTreeMenu.eventHandler.boxToggleItem = function (event) {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$checkTreeBox.addStyle('--max-height', (this.$checkTreeBox._lastAnchor < 4 ? availableBot : availableTop) + 'px');
    this.$checkTreeBox.updatePosition();
};


/**
 * @this MultiCheckTreeMenu
 */
MultiCheckTreeMenu.eventHandler.viewChange = function () {
    var t, d;
    /**
     *
     * @type {Rectangle[]}
     */
    var rects = Array.prototype.map.call(this.$itemCtn.childNodes, e => {
        var rect = Rectangle.fromClientRect(e.getBoundingClientRect());
        if (!t) {
            t = t || e.getComputedStyleValue('margin-top') || '4px';
            d = (t.replace('px', ''))
        }

        rect.y -= d;
        rect.height += d * 2;
        return rect;
    });
    var height;
    if (rects.length === 0) height = 27;
    else height = rects.reduce((ac, cr) => {
        return ac.merge(cr);
    }, rects[0]).height;

    if (!height) return;
    this.addStyle('--content-height', Math.min(height, 90) + 'px');
};


MultiCheckTreeMenu.property.enableSearch = {
    set: function (value) {
        this.$checkTreeBox.enableSearch = !!value;
    },
    get: function () {
        return this.$checkTreeBox.enableSearch;
    }
};


ACore.install(MultiCheckTreeMenu);

export default MultiCheckTreeMenu;


/**
 * @constructor
 * @param {MultiCheckTreeMenu} elt
 * @constructor
 */
function MCTMDropController(elt) {
    this.elt = elt;
}


MCTMDropController.prototype.open = function () {
    if (this.elt.readOnly || this.elt.disabled) return;
    if (this.elt.hasClass('as-focus')) return;
    this.elt.addClass('as-focus');
    this.elt.off('mousedown', this.elt.eventHandler.click);
    var bound = this.elt.getBoundingClientRect();
    this.elt.$checkTreeBox.addStyle('min-width', bound.width + 'px'); // Set dropdown width
    this.elt.$checkTreeBox.addTo(document.body); // Attach dropdown to the body
    this.elt.$checkTreeBox.updatePosition(); // Update dropdown position

    if (this.elt._focusTimeout > 0) {
        clearTimeout(this.elt._focusTimeout); // Clear any existing timeout
    }

    // Set a timeout to handle focus and add event listener for clicking outside
    this.elt._focusTimeout = setTimeout(() => {
        document.addEventListener('mousedown', this.elt.eventHandler.clickOut);
        this.elt._focusTimeout = -1;
        this.elt.$checkTreeBox.focus(); // Focus on the dropdown
    }, 5);

};

MCTMDropController.prototype.close = function () {
    if (!this.elt.hasClass('as-focus')) return;
    this.elt.removeClass('as-focus');
    this.elt.$checkTreeBox.selfRemove(); // Detach dropdown from the body
    this.elt.$checkTreeBox.resetSearchState(); // Reset search state
    document.removeEventListener('mousedown', this.elt.eventHandler.clickOut); // Remove click-out listener

    // Re-enable the click event after a delay
    const waitMouseUp = () => {
        document.removeEventListener('mouseup', waitMouseUp);
        setTimeout(() => {
            this.elt.on('mousedown', this.elt.eventHandler.click);
        }, 5);
    };

    setTimeout(waitMouseUp, 100);
    this.elt.defineEvent('blur');
    this.elt.emit('blur', { type: 'blur' }, this.elt);
};

MCTMDropController.prototype.ev_clickOut = function (event) {

};


Object.defineProperty(MCTMDropController.prototype, "isFocus", {
    set: function (value) {
        if (value) this.open();
        else this.close();
    },
    get: function () {
        return this.elt.hasClass('as-focus');
    }
});
