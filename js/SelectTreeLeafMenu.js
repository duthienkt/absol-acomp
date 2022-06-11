import ACore, {_, $} from '../ACore';
import SelectTreeLeafBox from "./SelectTreeLeafBox";
import OOP from "absol/src/HTML5/OOP";
import {hitElement} from "absol/src/HTML5/EventEmitter";
import {getScreenSize, traceOutBoundingClientRect} from "absol/src/HTML5/Dom";
import SelectMenu from "./SelectMenu2";


/***
 * @extends AElement
 * @constructor
 */
function SelectTreeLeafMenu() {
    this.$selectBox = _({
        tag: SelectTreeLeafBox.tag,
        on: {
            pressitem: this.eventHandler.pressItem,
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    OOP.drillProperty(this, this.$selectBox, 'enableSearch');
    this.$holderItem = $('selectlistitem', this);
    this.on('click', this.eventHandler.click.bind(this));
}

SelectTreeLeafMenu.tag = 'SelectTreeLeafMenu'.toLowerCase();

SelectTreeLeafMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'as-select-menu', 'as-select-tree-leaf-menu'],
        extendEvent: ['change'],
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
        items = items || [];
        this.$selectBox.items = items;
        this.addStyle('--select-list-estimate-width', this.$selectBox.estimateSize.width + 'px');
        if (this.$selectBox.$selectedItem) {
            this.$holderItem.data = this.$selectBox.$selectedItem.itemData;
        } else {
            this.$holderItem.data = {text:''};
        }
    },
    get: function () {
        return this.$selectBox.items;
    }
};

SelectTreeLeafMenu.property.value = {
    set: function (value) {
        this.$selectBox.value = value;
        if (this.$selectBox.$selectedItem) {
            this.$holderItem.data = this.$selectBox.$selectedItem.itemData;
        } else {
            this.$holderItem.data = {text:''};
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


SelectTreeLeafMenu.property.isFocus = {
    /**
     * @this SelectTreeLeafMenu
     * @param value
     */
    set: function (value) {
        value = !!value;
        var isFocus = this.hasClass('as-focus');
        if (value === isFocus) return;
        var bound;
        if (value) {
            this.addClass('as-focus');
            bound = this.getBoundingClientRect();
            this.$selectBox.addStyle('min-width', bound.width + 'px');
            document.body.appendChild(this.$selectBox);
            this.$selectBox.addStyle('visibility', 'hidden');
            this.$selectBox.followTarget = this;
            this.$selectBox.updatePosition();
            this.off('click', this.eventHandler.click);
            setTimeout(function () {
                document.addEventListener('click', this.eventHandler.clickOut);
                this.$selectBox.removeStyle('visibility');
                this.$selectBox.focus();
            }.bind(this), 5);

            this.$selectBox.viewToSelected();
        } else {
            this.removeClass('as-focus');
            document.removeEventListener('click', this.eventHandler.clickOut);
            this.$selectBox.remove();
            setTimeout(function () {
                this.on('click', this.eventHandler.click);
            }.bind(this), 100);
            this.$selectBox.resetSearchState();
        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};

SelectTreeLeafMenu.property.disabled = SelectMenu.property.disabled;


SelectTreeLeafMenu.eventHandler = {};

SelectTreeLeafMenu.eventHandler.clickOut = function (event) {
    if (hitElement(this.$selectBox, event)) return;
    this.isFocus = false;
};


SelectTreeLeafMenu.eventHandler.click = function (event) {
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