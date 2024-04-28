import ACore, { _, $ } from '../ACore';
import SelectTreeLeafBox from "./SelectTreeLeafBox";
import OOP from "absol/src/HTML5/OOP";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import SelectMenu from "./SelectMenu2";
import { copySelectionItemArray } from "./utils";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import MSelectTreeLeafBox from "./selecttreeleafbox/MSelectTreeLeafBox";


/***
 * @extends AElement
 * @constructor
 */
function SelectTreeLeafMenu() {
    this.$selectBox = _({
        tag: this.mobile ? MSelectTreeLeafBox : SelectTreeLeafBox.tag,
        on: {
            pressitem: this.eventHandler.pressItem,
            preupdateposition: this.eventHandler.preUpdateListPosition,
            close: ()=>{
                this.isFocus = false;
            }
        }
    });
    this.$selectBox.sponsorElement = this;

    OOP.drillProperty(this, this.$selectBox, ['enableSearch', 'selectedItem']);
    this.$holderItem = $('selectlistitem', this);
    // this.on('click', this.eventHandler.click.bind(this));
    this.boxCtrl = new STLBoxController(this);
    OOP.drillProperty(this, this.boxCtrl, 'isFocus');

    /**
     * @name items
     * @type {Array}
     * @memberof SelectTreeLeafMenu#
     */

    /**
     * @name value
     * @memberof SelectTreeLeafMenu#
     */

    /**
     * @name mobile
     * @type {boolean}
     * @memberof SelectTreeLeafMenu#
     */
    /**
     * @name disabled
     * @type {boolean}
     * @memberof SelectTreeLeafMenu#
     */
    /**
     * @name readOnly
     * @type {boolean}
     * @memberof SelectTreeLeafMenu#
     */
}

SelectTreeLeafMenu.tag = 'SelectTreeLeafMenu'.toLowerCase();

SelectTreeLeafMenu.render = function () {
    var mobile = BrowserDetector.isMobile;
    return _({
        class: ['absol-selectmenu', 'as-select-menu', 'as-select-tree-leaf-menu', 'as-strict-value'],
        extendEvent: ['change'],
        props: {
            mobile: mobile
        },
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: 'selectlistitem'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            }
        ]
    });
};


SelectTreeLeafMenu.prototype.init = function (props) {
    props = props || {};
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });
    if (props.strictValue) {
        this.strictValue = props.strictValue;
        delete props.strictValue;
    }

    var hasValue = 'value' in props;
    var value = props.value;
    delete props.value;
    this.super(props);
    if (hasValue)
        this.value = value;
};


SelectTreeLeafMenu.property = {};

SelectTreeLeafMenu.property.items = {
    set: function (items) {
        items = copySelectionItemArray(items || [], { removeNoView: true });
        this.$selectBox.items = items;
        if (!this.mobile)
        this.addStyle('--select-list-estimate-width', this.$selectBox.estimateSize.width + 'px');
        var selectedItem = this.$selectBox.selectedItem;

        if (selectedItem) {
            this.$holderItem.data = selectedItem;
            if (this.mobile) {
                this.addStyle('--select-list-estimate-width', this.$selectBox._estimateItemWidth(selectedItem, 0) + 'px');
            }
        }
        else {
            this.$holderItem.data = { text: '' };
        }
    },
    get: function () {
        return this.$selectBox.items;
    }
};

SelectTreeLeafMenu.property.value = {
    set: function (value) {
        this.$selectBox.value = value;
        var selectedItem = this.$selectBox.selectedItem;
        if (selectedItem) {
            this.$holderItem.data = selectedItem;
            if (this.mobile) {
                this.addStyle('--select-list-estimate-width', this.$selectBox._estimateItemWidth(selectedItem, 0) + 'px');
            }
        }
        else {
            this.$holderItem.data = { text: '' };
        }
    },
    get: function () {
        return this.$selectBox.value;
    }
};

SelectTreeLeafMenu.property.strictValue = {
    set: function (value) {
        this.$selectBox.strictValue = !!value;
        if (value) this.addClass('as-strict-value');
        else this.removeClass('as-strict-value');
    },
    get: function () {
        return this.hasClass('as-strict-value');
    }
};

SelectTreeLeafMenu.property.disabled = SelectMenu.property.disabled;


SelectTreeLeafMenu.eventHandler = {};

SelectTreeLeafMenu.eventHandler.clickOut = function (event) {
    if (hitElement(this.$selectBox, event)) return;
    this.isFocus = false;
};


SelectTreeLeafMenu.eventHandler.click = function (event) {
    if (!this.disabled)
        this.isFocus = true;
};

SelectTreeLeafMenu.eventHandler.pressItem = function (event) {
    this.$selectBox.value = event.item.value;
    this.$holderItem.data = event.item;
    var prevValue = this._value;
    this._value = event.item.value;
    this.isFocus = false;
    if (prevValue !== this._value) {
        this.emit('change', {
            item: event,
            type: 'change',
            target: this,
            originalEvent: event.originalEvent || event.originalEvent || event
        }, this);
    }
};

SelectTreeLeafMenu.eventHandler.preUpdateListPosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$selectBox.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};


ACore.install(SelectTreeLeafMenu);
export default SelectTreeLeafMenu;

/**
 *
 * @param {SelectTreeLeafMenu} elt
 * @constructor
 */
function STLBoxController(elt) {
    this.elt = elt;
    this.ev_click = this.ev_click.bind(this);
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.elt.on('click', this.ev_click);
}

Object.defineProperty(STLBoxController.prototype, 'isFocus', {
    set: function (value) {
        value = !!value;
        if (this.elt.hasClass('as-focus') === value) return;
        if (value && (this.elt.disabled || this.elt.readOnly)) return;

        var bound;
        if (value) {
            this.elt.$selectBox.addTo(document.body);
            this.elt.addClass('as-focus');
            this.elt.$selectBox.addStyle('visible', 'hidden');
            this.elt.off('click', this.ev_click);
            if (this.elt.mobile) {

            }
            else {
                bound = this.elt.getBoundingClientRect();
                this.elt.$selectBox.addStyle('min-width', bound.width + 'px');
                this.elt.$selectBox.followTarget = this.elt;
                this.elt.$selectBox.updatePosition();
            }

            setTimeout(function () {
                document.addEventListener('click', this.ev_clickOut);
                this.elt.$selectBox.removeStyle('visibility');
                this.elt.$selectBox.focus();
            }.bind(this), 5);
            this.elt.$selectBox.viewToSelected();
        }
        else {
            this.elt.removeClass('as-focus');
            this.elt.$selectBox.remove();
            document.removeEventListener('click', this.ev_clickOut);
            if (this.elt.mobile) {

            }
            else {
                this.elt.$selectBox.followTarget = null;
            }
            setTimeout(() => {
                this.elt.on('click', this.ev_click);
            }, 100);
            this.elt.$selectBox.resetSearchState();

        }
    },
    get: function () {
        return this.elt.hasClass('as-focus');
    }
});

STLBoxController.prototype.ev_click = function (event) {
    if (!this.elt.disabled && !this.elt.readOnly)
        this.isFocus = true;
};

STLBoxController.prototype.ev_clickOut = function (event) {
    if (!hitElement(this.elt.$selectBox, event)
        || (event.target.attr && event.target.attr('class') && event.target.attr('class').indexOf('modal') >= 0)) {
        this.isFocus = false;
    }
};