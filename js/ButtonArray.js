import '../css/buttonarray.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function ButtonArray() {
    this._dict = {};
    this._pool = [];
    this._items = [];
    this.$lastActiveBtn = null;
    this._value = undefined;
    this._lastValue = this._value;
}

ButtonArray.tag = 'buttonarray';
ButtonArray.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-button-array'
    });
};

ButtonArray.prototype._newButton = function () {
    var button = _({
        tag: 'button',
        class: 'as-button-array-item',
        child: { text: 'null' }
    });
    button.on('click', this.eventHandler.clickItem.bind(this, button));
    return button;
};

ButtonArray.prototype._requestButton = function (items) {
    var button;
    if (this._pool.length > 0) {
        button = this._pool.pop();
    }
    else {
        button = this._newButton();
    }
    return button;
};

ButtonArray.prototype._assignButton = function (button, data) {
    button._data = data;
    button.childNodes[0].data = data.text;
};

ButtonArray.prototype._releaseButton = function (button) {
    this._pool.push(button);
};

ButtonArray.prototype._getFullFormat = function (item) {
    var res = {};
    if ((typeof item == 'string') || (typeof item == 'number') || (typeof item == 'boolean') || (item === null) || (item === undefined)) {
        res.ident = item;
        res.value = item;
        res.text = item + '';
    }
    else if (item && (typeof item == 'object')) {
        res.value = item.value;
        res.ident = res.value + '';
        res.text = item.text;
    }
    return res;
};


ButtonArray.property = {};

/**
 * @type {ButtonArray}
 */
ButtonArray.property.items = {
    set: function (items) {
        items = items || [];
        this._items = items;
        var child;
        while (this.childNodes.length > items.length) {
            child = this.lastChild;
            this._releaseButton(child);
            this.removeChild(child);
        }

        while (this.childNodes.length < items.length) {
            this.addChild(this._requestButton());
        }
        var item;
        for (var i = 0; i < items.length; ++i) {
            item = this._getFullFormat(items[i]);
            this._assignButton(this.childNodes[i], item);
            this._dict[item.ident] = {
                elt: this.childNodes[i],
                data: item
            }
        }
        if (items.length > 0) {
            if (!this._dict[this._value + '']) {
                this._value = this._getFullFormat(items[0]).value;
            }
        }
        this.value = this._value;
    },
    get: function () {
        return this._items;
    }
};

ButtonArray.property.value = {
    set: function (value) {
        this._value = value;
        this._lastValue = this._value;
        if (this.$lastActiveBtn) {
            this.$lastActiveBtn.removeClass('as-active');
            this.$lastActiveBtn = null;
        }
        var hodler = this._dict[value + ''];
        if (hodler) {
            hodler.elt.addClass('as-active');
            this.$lastActiveBtn = hodler.elt;
        }
    },
    get: function () {
        return this._value;
    }
};


ButtonArray.eventHandler = {};

ButtonArray.eventHandler.clickItem = function (item, event) {
    if (this._lastValue != item._data.value) {
        this.value = item._data.value;
        this.emit('change', { target: this, value: this.value, type: 'change' }, this);
    }
};


ACore.install(ButtonArray);

export default ButtonArray;