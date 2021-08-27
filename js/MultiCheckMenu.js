import MultiSelectMenu from "./MultiSelectMenu";
import ACore, {_, $} from "../ACore";
import {VALUE_HIDDEN} from "./SelectListBox";
import OOP from "absol/src/HTML5/OOP";


/***
 * @extends MultiSelectMenu
 * @constructor
 */
function MultiCheckMenu() {
    this.addClass('as-multi-check-menu');

    this.on('click', this.eventHandler.click);
    this.$selectlistBox = _({
        tag: 'checklistbox',
        props: {
            anchor: [1, 6, 2, 5],
            displayValue: VALUE_HIDDEN
        },
        on: {
            preupdateposition: this.eventHandler.preUpdateListPosition,
            submit: this.eventHandler.selectListBoxPressItem
        }
    });


    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.$attachhook = $('attachhook', this)
        .on('attached', this.eventHandler.attached);

    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');
    this.$items = [];
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

MultiCheckMenu.property.isFocus = {
    set: function (value) {
        if (this._isFocus && !value) {
            this.$selectlistBox.values = this._values;//cancel
        }
        return MultiSelectMenu.property.isFocus.set.apply(this, arguments);
    },
    get: MultiSelectMenu.property.get
};

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
    this._values = curValues;
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
