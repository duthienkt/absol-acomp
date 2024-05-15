import SelectMenu from '../SelectMenu';
import MListModal from "../selectlistbox/MListModal";
import ACore, { _, $ } from "../../ACore";
import '../../css/selectmenu.css';
import MSelectListItem from "../selectlistbox/MSelectListItem";

/***
 * @extends AElement
 * @constructor
 */
function MSelectMenu() {
    this._value = undefined;
    this._isFocus = false;
    this._itemsByValue = {};
    this.$holderItem = $('.am-selectmenu-holder-item', this);

    /***
     * @type {MListModal}
     */
    this.$selectlist = _({
        tag: MListModal
    });

    var checkView = () => {
        if (this.isDescendantOf(document.body)) {
            setTimeout(checkView, 10000);
        }
        else {
            if (this.$selectlist.searchMaster)
                this.$selectlist.searchMaster.destroy();
        }
    }
    setTimeout(checkView, 30000);

    this.$selectlist.on('pressitem', this.eventHandler.pressItem, true)
        .on('pressout', this.eventHandler.pressOut)
        .on('pressclose', this.eventHandler.pressOut);
    this.on('click', this.eventHandler.click, true);

    this.$attachhook = $('attachhook', this).on('error', this.eventHandler.attached);
    /**
     * @name value
     * @memberof MSelectMenu#
     */
    /**
     * @name items
     * @memberof MSelectMenu#
     */
}

MSelectMenu.tag = 'mselectmenu';
MSelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu', 'am-selectmenu', 'as-strict-value'],
        extendEvent: ['change', 'minwidthchange'],
        attr: {
            tabindex: '1'
        },
        child: [
            '.am-selectmenu-holder-item',
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });
};


MSelectMenu.prototype.findItemsByValue = function (value) {
    return this.$selectlist.findItemsByValue(value);
};

MSelectMenu.prototype.updateItem = function () {
    this.$holderItem.clearChild();
    var selected = this.findItemsByValue(this.value);
    if (selected) {
        var elt = _({
            tag: MSelectListItem,
            props: {
                data: selected[0]
            }
        }).addTo(this.$holderItem);
    }
};

MSelectMenu.prototype.notifyChange = function (data) {
        this.emit('change', Object.assign({}, data, { type: 'change', target: this }), this);
};

MSelectMenu.prototype._dictByValue = SelectMenu.prototype._dictByValue;

MSelectMenu.prototype.getRecommendWith = function () {
    var res = 12 + this.$selectlist.estimateSize.textWidth + 30;
    if (this.$selectlist.estimateSize.descWidth) res += this.$selectlist.estimateSize.descWidth + 20;
    return res;
};

MSelectMenu.prototype.init = SelectMenu.prototype.init;

MSelectMenu.property = {};


MSelectMenu.property.items = {
    set: function (value) {
        this._itemIdxByValue = null;
        /**
         * verity data
         */
        if (value) {
            value.forEach(function (it) {
                if (it && it.text) {
                    it.text = it.text + '';
                }
            });
        }

        this._items = value;
        this._itemsByValue = this._dictByValue(value);
        this.$selectlist.items = value;
        if (!this._itemsByValue[this.value] && value.length > 0 && false) {//todo
            this.value = value[0].value;
        }
        else
            this.updateItem();
        if (this.style.width === 'auto' || !this.style.width) {
            this.addStyle('--recommend-width', this.getRecommendWith() / 14 + 'em');
        }
    },
    get: function () {
        return this._items || [];
    }
};

MSelectMenu.property.value = {
    set: function (value) {
        this._value = value;

        this.$selectlist.values = [value];
        this.updateItem();
    },
    get: function () {
        if (!this.strictValue) return this._value;
        var selected = this.findItemsByValue(this._value);
        if (selected) {
            return selected[0].value;
        }
        else {
            if (this._items && this._items.length > 0) {
                return this._items[0].value;
            }
        }
        return this._value;
    }
};

MSelectMenu.property.strictValue = {
    set: function (value) {
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
    },
    get: function () {
        return this.hasClass('as-strict-value');
    }
};


MSelectMenu.property.enableSearch = {
    set: function (value) {
        this.$selectlist.enableSearch = !!value;
    },
    get: function () {
        return this.$selectlist.enableSearch;
    }
};


MSelectMenu.property.isFocus = {
    set: function (value) {
        var thisSM = this;
        value = !!value;
        if (value === this._isFocus) return;
        if (this.readOnly || this.disabled) return;
        this._isFocus = value;
        if (value) {
            thisSM.$selectlist.viewListAt(0);
            thisSM.$selectlist.viewListAtFirstSelected();
            this.$selectlist.addTo(document.body);
        }
        else {
            this.$selectlist.selfRemove();
            setTimeout(function () {
                thisSM.$selectlist.resetSearchState();
            }, 100);
        }
    },
    get: function () {
        return this._isFocus;
    }
};

MSelectMenu.property.selectedIndex = SelectMenu.property.selectedIndex;

MSelectMenu.property.disabled = SelectMenu.property.disabled;
MSelectMenu.property.hidden = SelectMenu.property.hidden;

/**
 * @type {MSelectMenu}
 */
MSelectMenu.eventHandler = {};

MSelectMenu.eventHandler.attached = function () {
    if (this.style.width === 'auto' || !this.style.width) {
        this.addStyle('--recommend-width', this.getRecommendWith() / 14 + 'em');
    }
};

MSelectMenu.eventHandler.click = function (event) {
    this.isFocus = !this.isFocus;
};


MSelectMenu.eventHandler.pressOut = function (event) {
    this.isFocus = false;
};


MSelectMenu.eventHandler.pressItem = function (event) {
    var newValue = event.value;
    if (newValue !== this._value) {
        var lastValue = this._value;
        this._value = newValue;
        this.$selectlist.values = [newValue];
        this.updateItem();
        var changeEvent = Object.assign({}, event, { lastValue: lastValue });
        setTimeout(function () {
            this.notifyChange(changeEvent);
        }.bind(this), 1);
    }
    setTimeout(function () {
        this.isFocus = false;
    }.bind(this), 100);
};


ACore.install(MSelectMenu);

export default MSelectMenu;