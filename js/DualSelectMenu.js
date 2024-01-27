import ACore, { $, _ } from "../ACore";
import DualSelectBox from "./DualSelectBox";
import { getScreenSize, traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import OOP from "absol/src/HTML5/OOP";


/***
 * @extends AElement
 * @constructor
 */
function DualSelectMenu() {
    this._format = '$0, $1';
    /***
     * @type {DualSelectBox}
     */
    this.$box = _({
        tag: DualSelectBox.tag,
        props: {
            anchor: [1, 6, 2, 5]
        },
        on: {
            preupdateposition: this.eventHandler.preUpdatePosition,
            change: this.eventHandler.boxChange,
            close: this.eventHandler.boxClose
        }
    });
    this.$item = $('.absol-selectlist-item', this);
    this.on('click', this.eventHandler.click);
    OOP.drillProperty(this, this.$box, 'enableSearch');
    /***
     * @name strictValue
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */

    /***
     * @name readOnly
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
    /***
     * @name disabled
     * @type {boolean}
     * @memberOf DualSelectMenu#
     */
}


DualSelectMenu.tag = 'DualSelectMenu'.toLowerCase();

DualSelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'as-dual-select-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: '.absol-selectlist-item'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });
};


DualSelectMenu.prototype._updateViewValue = function () {
    var format = this._format;
    var value = this.$box.value || [null, null];
    var strictValue = this.strictValue;
    var hbv = this.$box.holderByValue;
    var firstToken = '__';
    var secToken = '__';

    var firstHolder = hbv[value[0]];
    var sectHolder;
    if (firstHolder) {
        firstToken = firstHolder.item.text;
        sectHolder = firstHolder.child[value[1]];
        if (sectHolder)
            secToken = sectHolder.item.text

    }
    var text = format.replace('$0', firstToken)
        .replace('$1', secToken);
    this.$item.clearChild().addChild(_({
        tag: 'span',
        class:['as-selectlist-item-text', 'absol-selectlist-item-text'],
        child: { text: text }
    }));
};

DualSelectMenu.property = {};

DualSelectMenu.property.selectedItems = {
    get: function () {
        var value = this.$box.value || [null, null];
        var hbv = this.$box.holderByValue;
        var firstHolder = hbv[value[0]];
        var sectHolder;
        var res = [null, null];
        if (firstHolder) {
            res[0] = firstHolder.item;
            sectHolder = firstHolder.child[value[1]];
            if (sectHolder)
                res[1] = sectHolder.item;
        }

        return res;
    }
};

DualSelectMenu.property.isFocus = {
    /***
     * @this DualSelectMenu
     * @param value
     */
    set: function (value) {
        var self = this;
        value = !!value;
        if (value && (this.disabled || this.readOnly)) return;
        if (this.hasClass('as-focus') === value) return;
        if (value) {
            this._prevValue = (this.$box.value || [null, null]).join('//');
            this.addClass('as-focus');
            this.off('click', this.eventHandler.click);
            this.$box.followTarget = this;
            this.$box.sponsorElement = this;
            this.$box.addTo(document.body);
            this.$box.updatePosition();
            this.$box.scrollIntoSelected();
            setTimeout(function () {
                self.$box.focus();
                document.addEventListener('click', self.eventHandler.clickOut);
            }, 10);
        }
        else {
            this.removeClass('as-focus');
            this.$box.remove();
            this.$box.resetSearchState();
            document.removeEventListener('click', self.eventHandler.clickOut);
            setTimeout(function () {
                self.on('click', self.eventHandler.click);
            }, 10);
            if ((this.$box.value || [null, null]).join('//') !== this._prevValue) {
                this._updateViewValue();
                this.emit('change', { type: 'change', target: this }, this);
            }
        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
}

/****
 * @memberOf DualSelectMenu#
 * @type {{}}
 */
DualSelectMenu.eventHandler = {};

DualSelectMenu.property.items = {
    /***
     * @this DualSelectMenu
     * @param items
     */
    set: function (items) {
        this.$box.items = items;
        this.addStyle('--dual-list-estimate-text-width', this.$box.estimateSize.textWidth + 'px');
        this._updateViewValue();
    },
    get: function () {
        return this.$box.items;
    }
};

DualSelectMenu.property.value = {
    set: function (value) {
        this.$box.value = value;
        this._updateViewValue();
    },
    get: function () {
        return this.$box.value;
    }
};

DualSelectMenu.property.strictValue = {
    set: function (value) {
        this.$box.strictValue = value;
        this._updateViewValue();
    },
    get: function () {
        return this.$box.strictValue;
    }
};


DualSelectMenu.property.format = {
    set: function (value) {
        this._format = value || '$0, $1';
        this._updateViewValue();
    },
    get: function () {
        return this._format;
    }
};

DualSelectMenu.property.readOnly = {
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
};

DualSelectMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');

        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
}


/**
 * @this DualSelectMenu
 */
DualSelectMenu.eventHandler.click = function () {
    if (this.readOnly) return;
    this.isFocus = true;
};

/**
 * @this DualSelectMenu
 */
DualSelectMenu.eventHandler.clickOut = function (event) {
    if (hitElement(this.$box, event)) return;
    this.isFocus = false;
};

/***
 * @this DualSelectMenu
 */
DualSelectMenu.eventHandler.preUpdatePosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    var availableTop = bound.top - 5;
    var availableBot = screenSize.height - 5 - bound.bottom;
    this.$box.addStyle('--max-height', Math.max(availableBot, availableTop) + 'px');
    var outBound = traceOutBoundingClientRect(this);
    if (bound.bottom < outBound.top || bound.top > outBound.bottom || bound.right < outBound.left || bound.left > outBound.right) {
        this.isFocus = false;
    }
};


DualSelectMenu.eventHandler.boxChange = function () {
    this._updateViewValue();
};

DualSelectMenu.eventHandler.boxClose = function () {
    this.isFocus = false;
};

ACore.install(DualSelectMenu);

export default DualSelectMenu;