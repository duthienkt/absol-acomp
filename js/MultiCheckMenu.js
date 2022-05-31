import MultiSelectMenu from "./MultiSelectMenu";
import ACore, { _, $ } from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import CheckListBox from "./CheckListBox";
import EventEmitter, { hitElement } from "absol/src/HTML5/EventEmitter";
import { getValueOfListItem } from "./SelectListItem";
import AElement from "absol/src/HTML5/AElement";


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
            cancel: this.eventHandler.selectListBoxCancel,
            close: this.eventHandler.selectListBoxClose
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

MultiCheckMenu.prototype.findItemsByValue = function (value){
    return this.$selectlistBox.findItemsByValue(value);
};


MultiCheckMenu.eventHandler.click = function (event) {
    if ((event.target === this || event.target === this.$itemCtn) && !this.isFocus && !this.readOnly) {
        this.isFocus = true;
    }
};


MultiCheckMenu.eventHandler.bodyClick = function (event) {
    var isRemovedItem = !AElement.prototype.isDescendantOf.call(event.target, document.body)
        && (event.target.classList.contains('absol-selectbox-item-close')
            || (event.target.parentElement && event.target.parentElement.classList.contains('absol-selectbox-item-close')));
    if (this.isFocus
        && !EventEmitter.hitElement(this.$selectlistBox, event)
        && (!isRemovedItem)
        && (!hitElement(this.$itemCtn, event) || event.target === this.$itemCtn)
    ) {
        this.eventHandler.selectListBoxPressItem(event);//to notify something remove, add
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

MultiCheckMenu.eventHandler.selectListBoxClose = function (event) {
    this.eventHandler.selectListBoxPressItem(event);//to notify something remove, add
    this.isFocus = false;
};


MultiCheckMenu.property.isFocus = {
    set: function (value) {
        if (!this._isFocus && value) {
            this._tempValues = this._values.slice();
            this.$selectlistBox.values = this._values;
            this.activeValue = null;
        }
        var thisSM = this;
        if (!this.items || this.items.length === 0) value = false;//prevent focus
        if (this._isFocus === value) return;
        this._isFocus = !!value;
        if (this._isFocus) {
            thisSM.off('click', this.eventHandler.click);
            document.body.appendChild(this.$selectlistBox);
            this.$selectlistBox.domSignal.$attachhook.emit('attached');
            var bound = this.getBoundingClientRect();
            this.$selectlistBox.addStyle('min-width', bound.width + 'px');
            this.$selectlistBox.refollow();
            this.$selectlistBox.updatePosition();
            setTimeout(function () {
                if (thisSM.enableSearch) {
                    thisSM.$selectlistBox.$searchInput.focus();
                }
                else {
                    thisSM.$selectlistBox.focus();
                }
                document.addEventListener('mousedown', thisSM.eventHandler.bodyClick);
            }, 100);
            this.$selectlistBox.viewListAtFirstSelected();
        }
        else {
            document.removeEventListener('mousedown', thisSM.eventHandler.bodyClick);

            document.addEventListener('mouseup', function mup() {
                setTimeout(function () {
                    thisSM.on('click', thisSM.eventHandler.click);
                    document.removeEventListener('mouseup', mup);
                }, 5);
            });
            this.$selectlistBox.selfRemove();
            this.$selectlistBox.unfollow();
            this.$selectlistBox.resetSearchState();
        }
    },
    get: MultiSelectMenu.property.isFocus.get
};

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
    }
    else {
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
    }
    else if (this.isFocus) {
        this.$selectlistBox.viewListAtValue(value);
    }
};
ACore.install(MultiCheckMenu);

export default MultiCheckMenu;
