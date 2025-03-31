import ACore, { _, $ } from "../ACore";
import { keyStringOf } from "./utils";
import '../css/pickinglist.css';


/**
 * @extends AElement
 * @constructor
 */
function PickingList() {
    this._items = [];
    this._values = [];

    /**
     * @type {PLItem[]}
     */
    this.$items = [];

    /**
     * @type {any[]}
     * @name values
     * @memberOf PickingList#
     */

    /**
     * @type {{text:string, value}[]}
     * @name items
     * @memberOf PickingList#
     */
}

PickingList.tag = 'PickingList'.toLowerCase();

PickingList.render = function () {
    return _({
        class: 'as-picking-list',
        extendEvent: 'change',
        child: []
    })
};


PickingList.property = {};


PickingList.property.items = {
    set: function (items) {
        items = items || [];
        this._items = items;
        this.$items.forEach(function (item) {
            item.remove();
        });

        var valuedDict = this._values.reduce((ac, cr) => {
            ac[keyStringOf(cr)] = true;
            return ac;
        }, {})

        this.$items = items.map(it => {
            var elt = _({
                tag: PLItem,
                props: {
                    text: it.text + '',
                    value: it.value,
                    checked: valuedDict[keyStringOf(it.value)]
                },
                on: {
                    click: () => {
                        elt.checked = !elt.checked;
                        this.emit('change', { target: this, type: 'change' }, this);
                    }
                }
            });

            return elt;
        });
        this.addChild(this.$items);
    },
    get: function () {
        return this._items;
    }
};

PickingList.property.values = {
    set: function (values) {
        this._values = values || [];
        var valuedDict = this._values.reduce((ac, cr) => {
            ac[keyStringOf(cr)] = true;
            return ac;
        }, {});
        this.$items.forEach(function (item) {
            item.checked = !!valuedDict[keyStringOf(item.value)];
        })
    },
    get: function () {
        return this.$items.reduce(function (ac, itemElt) {
            if (itemElt.checked) {
                ac.push(itemElt.value);
            }
            return ac;
        }, []);
    }
};

PickingList.property.selectedItems = {
    get: function () {
        var valuedDict = this._values.reduce((ac, cr) => {
            ac[keyStringOf(cr)] = true;
            return ac;
        }, {});

        return (this._items || []).filter(it => valuedDict[keyStringOf(it.value)]);
    }
};

export default PickingList;

ACore.install(PickingList);

/**
 * @extends AElement
 * @constructor
 */
function PLItem() {
    this.$text = $('.as-picking-list-item-text', this);

}

PLItem.tag = 'PLItem'.toLowerCase();

PLItem.render = function () {
    return _({
        class: 'as-picking-list-item',
        child: [
            {
                class: 'as-picking-list-item-text',
                child: { text: '' }
            },
            {
                class: 'as-picking-list-item-checked',
                child: 'span.mdi.mdi-check'
            }
        ]
    });
};

PLItem.property = {};

PLItem.property.text = {
    set: function (value) {
        this.$text.firstChild.data = value + '';
    },
    get: function () {
        return this.$text.firstChild.data;
    }
};

PLItem.property.value = {
    set: function (value) {
        this._value = value;
        this.attr('data-value', keyStringOf(value));
    },
    get: function () {
        return this._value;
    }
};


PLItem.property.checked = {
    set: function (value) {
        if (value) {
            this.addClass('as-checked');
        }
        else {
            this.removeClass('as-checked');
        }
    },
    get: function () {
        return this.hasClass('as-checked');
    }
}
