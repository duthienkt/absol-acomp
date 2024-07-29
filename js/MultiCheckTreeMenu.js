import CheckTreeBox from "./CheckTreeBox";
import ACore, { _, $, $$ } from "../ACore";
import SelectBoxItem from "./SelectBoxItem";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import MultiSelectMenu from "./MultiSelectMenu";
import CheckTreeLeafOnlyBox from "./CheckTreeLeafOnlyBox";
import { copySelectionItemArray, isNaturalNumber, rootTreeValues2CheckedValues } from "./utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import AElement from "absol/src/HTML5/AElement";
import { parseMeasureValue } from "absol/src/JSX/attribute";
import CheckUnsafeTreeLeafOnlyBox from "./CheckUnsafeTreeLeafOnlyBox";
import { arrayCompare, arrayUnique } from "absol/src/DataStructure/Array";
import LangSys from "absol/src/HTML5/LanguageSystem";


/***
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
            initOpened: this.renderProps.initOpened,
            enableSearch: this.renderProps.enableSearch
        }
    });

    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$checkTreeBox.followTarget = this;
    this.$checkTreeBox.sponsorElement = this;
    this.on('click', this.eventHandler.click);
    this.placeholder = LangSys.getText('txt_select_value') || '-- Select values --';


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

    /***
     * todo: TREE has noSelect
     */

}


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
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller']
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

MultiCheckTreeMenu.prototype.styleHandlers = {};

MultiCheckTreeMenu.prototype.styleHandlers.maxWidth = function (value) {
    var parsedValue = parseMeasureValue(value);
    if (parsedValue.unit === 'px') {
        this.addClass('as-has-max-width');
        this.addStyle('--max-width', value);
    }
    else {
        this.removeClass('as-has-max-width');
    }
};

MultiCheckTreeMenu.prototype.styleHandlers['max-width'] = MultiCheckTreeMenu.prototype.styleHandlers.maxWidth;

MultiCheckTreeMenu.prototype.styleHandlers.width = function (value) {
    var parsedValue = parseMeasureValue(value);
    if (parsedValue.unit === 'px') {
        this.addClass('as-has-max-width');
        this.addStyle('--max-width', value);
        this.style.width = value;
    }
    else {
        this.removeClass('as-has-max-width');
    }
};

MultiCheckTreeMenu.prototype.styleHandlers.overflow = function (value) {
    if (value === 'hidden') {
        this.style.overflow = 'hidden';
    }
    else {
        this.style.overflow = '';
    }
};


MultiCheckTreeMenu.prototype.addStyle = function (arg0, arg1) {
    if ((typeof arg0 === "string") && (this.styleHandlers[arg0])) {
        this.styleHandlers[arg0].apply(this, Array.prototype.slice.call(arguments, 1));
        return this;
    }
    else {
        return AElement.prototype.addStyle.apply(this, arguments);
    }
};

MultiCheckTreeMenu.prototype.removeStyle = function (arg0) {
    if ((typeof arg0 === "string") && (this.styleHandlers[arg0])) {
        this.styleHandlers[arg0].call(this, '');
        return this;
    }
    else {
        return AElement.prototype.removeStyle.apply(this, arguments);
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


MultiCheckTreeMenu.prototype.findItemsByValues = function (values) {
    return values.map(function (value) {
        var holders = this.$checkTreeBox.findItemHoldersByValue(value);
        if (holders.length > 0) return holders[0].item;
        return null;
    }.bind(this)).filter(function (it) {
        return !!it;
    });
};


MultiCheckTreeMenu.prototype.viewValues = function (values) {
    values = values.slice();
    var items = this.findItemsByValues(values);
    this._filToken(items.length);
    this._assignTokens(items);
    this._viewValues = values;
    if (this.isFocus) {
        var bound = this.getBoundingClientRect();
        this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
        ResizeSystem.update();
    }
    setTimeout(this._updateOverflow.bind(this), 100)
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


MultiCheckTreeMenu.property = {};

MultiCheckTreeMenu.property.initOpened = {
    set: function (value) {
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
        if (value && (this.disabled || this.readOnly)) return;
        var self = this;
        value = !!value;
        var c = this.hasClass('as-focus');
        if (value === c) return;
        if (value) {
            self.off('click', self.eventHandler.click);
            var bound = this.getBoundingClientRect();
            this.$checkTreeBox.addStyle('min-width', bound.width + 'px');
            this.addClass('as-focus');
            this.$checkTreeBox.addTo(document.body);
            this.$checkTreeBox.updatePosition();
            if (this._focusTimeout > 0) {
                clearTimeout(this._focusTimeout);
            }
            this._focusTimeout = setTimeout(function () {
                document.addEventListener('mousedown', this.eventHandler.clickOut);
                this._focusTimeout = -1;
                this.$checkTreeBox.focus();
            }.bind(this), 5);

        }
        else {
            this.removeClass('as-focus');
            this.$checkTreeBox.selfRemove();
            this.$checkTreeBox.resetSearchState();
            document.removeEventListener('mousedown', this.eventHandler.clickOut);

            function waitMouseUp() {
                document.removeEventListener('mouseup', waitMouseUp);
                setTimeout(function () {
                    self.on('click', self.eventHandler.click);
                }, 5)
            }

            // document.addEventListener('mouseup', waitMouseUp);why?
            setTimeout(waitMouseUp, 100);
        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};

MultiCheckTreeMenu.property.items = {
    set: function (items) {
        this._items = copySelectionItemArray(items || [], { removeNoView: true });
        this.$checkTreeBox.items = this._items;
        this.addStyle('--list-min-width', Math.max(145 + 20, this.$checkTreeBox.estimateSize.width) + 'px');
        this.viewValues(this.$checkTreeBox.viewValues);
        this._values = this.$checkTreeBox.values.slice();
    },
    get: function () {
        return this.$checkTreeBox.items;
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
        this.$itemCtn.attr('data-placeholder', value || '');
    },
    get: function () {
        return this.$itemCtn.attr('data-placeholder');
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
    console.log(this._values, newValues)
    if (!arrayCompare(this._values, newValues)) {
        this._values = newValues;
        this.emit('change', { type: 'change', target: this }, this);
    }
};


MultiCheckTreeMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
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

