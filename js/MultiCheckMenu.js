import MultiSelectMenu from "./MultiSelectMenu";
import ACore, {_, $} from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import CheckListBox from "./CheckListBox";
import EventEmitter, {hitElement} from "absol/src/HTML5/EventEmitter";
import {getValueOfListItem} from "./SelectListItem";


/***
 * @extends MultiSelectMenu
 * @constructor
 */
function MultiCheckMenu() {
    this.addClass('as-multi-check-menu');

    this.on('click', this.eventHandler.click);
    /***
     * @type {CheckListBox}
     */
    this.$selectlistBox = _({
        tag: CheckListBox.tag,
        props: {
            anchor: [1, 6, 2, 5]
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition,
            change: this.eventHandler.selectListBoxChange,
            cancel: this.eventHandler.selectListBoxCancel
        }
    });


    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$attachhook = $('attachhook', this)
        .on('attached', this.eventHandler.attached);

    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');
    this._isFocus = false;
    this.$items = [];
    this._tempValues = [];
    this._values = [];
    this.items = [];
    this.values = [];
    this.$selectlistBox.followTarget = this;
    this.disableClickToFocus = false;
    this.orderly = true;
    this.itemFocusable = false;
    this._activeValue = undefined;
}


MultiCheckMenu.tag = 'MultiCheckMenu'.toLowerCase();

MultiCheckMenu.render = MultiSelectMenu.render;

Object.assign(MultiCheckMenu.prototype, MultiSelectMenu.prototype);
MultiCheckMenu.property = Object.assign({}, MultiSelectMenu.property);
MultiCheckMenu.eventHandler = Object.assign({}, MultiSelectMenu.eventHandler);


MultiCheckMenu.eventHandler.click = function (event) {
    if ((event.target === this || event.target === this.$itemCtn) && !this.isFocus) {
        this.isFocus = true;
    }
};


MultiCheckMenu.eventHandler.bodyClick = function (event) {
    if (this.isFocus
        && !EventEmitter.hitElement(this.$selectlistBox, event)
        && (event.target.isDescendantOf && event.target.isDescendantOf(document.body))
        && (!hitElement(this.$itemCtn, event) || event.target === this.$itemCtn)
    ) {
        this.eventHandler.selectListBoxPressItem(event);
        this.isFocus = false;
    }
};


MultiCheckMenu.eventHandler.selectListBoxChange = function (event) {
    var idx;
    switch (event.action) {
        case 'check':
            idx = this._tempValues.indexOf(event.value);
            if (idx < 0) {
                this._tempValues.push(event.value);
            }
            break;
        case 'uncheck':
            idx = this._tempValues.indexOf(event.value);
            if (idx >= 0) {
                this._tempValues.splice(idx, 1);
            }
            break;
        case 'check_all':
            this._tempValues = this.items.map(function (item) {
                return getValueOfListItem(item);
            })
            break;
        case 'uncheck_all':
            this._tempValues = [];
            break;
    }

    setTimeout(function () {
        this.viewItemsByValues(this._tempValues);
        var bound = this.getBoundingClientRect();
        this.$selectlistBox.addStyle('min-width', bound.width + 'px');
        this.$selectlistBox.refollow();
        this.$selectlistBox.updatePosition();
    }.bind(this), 1);
};

MultiCheckMenu.eventHandler.selectListBoxCancel = function (event) {
    this.viewItemsByValues(this._values);
    this.isFocus = false;
    this.$selectlistBox.values = this._values;
};

MultiCheckMenu.property.isFocus = {
    set: function (value) {
        if (!this._isFocus && value) {
            this._tempValues = this._values.slice();
            this.$selectlistBox.values = this._values;
            this.activeValue = null;
        }
        return MultiSelectMenu.property.isFocus.set.apply(this, arguments);
    },
    get: MultiSelectMenu.property.isFocus.get
};

/***
 * call after close checklistbox
 * @param event
 */
MultiCheckMenu.eventHandler.selectListBoxPressItem = function (event) {
    var prevValues = this._values;
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
    this._values = curValues.slice();
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


MultiCheckMenu.eventHandler.pressCloseItem = function (item, event) {
    var value = item.value;
    var data = item.data;
    var currentValues;
    var index;
    if (this.isFocus) {
        currentValues = this.$selectlistBox.values;
        index = currentValues.indexOf(value);
        if (index >= 0) {
            currentValues.splice(index, 1);
        }
        this.$selectlistBox.values = currentValues;
        this.$selectlistBox.updatePosition();
        this.viewItemsByValues(this.$selectlistBox.values);
    } else {
        index = this._values.indexOf(value);
        if (index >= 0) {
            this._values.splice(index, 1);
            this._updateItems();

            this.emit('remove', Object.assign({}, event, {
                type: 'change',
                target: this,
                data: data,
                value: value,
                itemData: data
            }), this);
            this.emit('change', Object.assign({}, event, {
                type: 'change',
                action: 'remove',
                target: this,
                data: data,
                value: value,
                itemData: data
            }), this);
        }
    }
};


MultiCheckMenu.eventHandler.pressItem = function (item, event) {
    var value = item.value;
    if (this.itemFocusable && !this.isFocus) {
        var prevActiveValue = this.activeValue;
        if (value !== prevActiveValue) {
            this.activeValue = value;
            this.emit('activevaluechange', {
                target: this,
                originEvent: event,
                prevActiveValue: prevActiveValue,
                activeValue: value
            }, this);
        }
    } else if (this.isFocus) {
        this.$selectlistBox.viewListAtValue(value);
    }
};
ACore.install(MultiCheckMenu);

export default MultiCheckMenu;
