import RibbonButton from "./RibbonButton";
import { keyStringOf } from "./utils";

var addSelectedClass = item => {
    if (!item) return;
    if (Array.isArray(item.extendClasses)) {
        item.extendClasses.push('as-ribbon-selected');
    }
    else {
        item.extendClasses = [item.extendClasses, 'as-ribbon-selected'].filter(x => !!x);
    }
}


var removeSelectedClass = item => {
    if (!item) return;
    if (Array.isArray(item.extendClasses)) {
        item.extendClasses = item.extendClasses.filter(it => it !== 'as-ribbon-selected');
    }
}

/**
 * @extends {RibbonButton}
 * @constructor
 */
function SelectRibbonMenu() {
    RibbonButton.apply(this, arguments);
    this.addClass('as-select-ribbon-menu');
    this._itemDict = {};
    this._value = null;
    this.defineEvent('change');
    this.on('select', (ev) => {
        var value = ev.item.value;
        if (this.value !== value) {
            this.value = value;
            this.emit('change', { target: this, type: 'change' }, this);
        }
    });
}


SelectRibbonMenu.tag = 'SelectRibbonMenu'.toLowerCase();

SelectRibbonMenu.render = RibbonButton.render;

SelectRibbonMenu.property = Object.assign({}, RibbonButton.property);

SelectRibbonMenu.property.items = {
    set: function (items) {
        removeSelectedClass(this.selectedItem);
        items = items || [];
        RibbonButton.property.items.set.call(this, items);

        this._itemDict = {};
        var visit = (it) => {
            var key = keyStringOf(it.value);
            this._itemDict[key] = it;
        }

        items.forEach(it => visit(it));

        var selectedItem = this.selectedItem;
        addSelectedClass(selectedItem);
        selectedItem = Object.assign({ text: '', icon: null }, selectedItem);
        this.text = selectedItem.text;
        this.icon = selectedItem.icon;

    },
    get: RibbonButton.property.items.get
}

SelectRibbonMenu.property.value = {
    set: function (value) {
        var selectedItem = this.selectedItem;
        console.log('clear', selectedItem)
        removeSelectedClass(selectedItem);

        this._value = value;
        selectedItem = this.selectedItem;
        addSelectedClass(selectedItem);
        selectedItem = Object.assign({ text: '', icon: null }, selectedItem);
        this.text = selectedItem.text;
        this.icon = selectedItem.icon;
    },
    get: function () {
        if (!this._items || !this._items.length || this._itemDict[keyStringOf(this._value)]) return this._value;
        return this._items[0].value;
    }
};

SelectRibbonMenu.property.selectedItem = {
    get: function () {
        if (this._itemDict[keyStringOf(this._value)]) return this._itemDict[keyStringOf(this._value)];
        if (this._items && this._items.length) return this._items[0];
        return null;
    }
};

export default SelectRibbonMenu;