import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

/*global absol*/
function SelectList() {
    var res = _('.absol-selectlist');
    res.defineEvent('change');
    res.$items = [];
    return res;
};

SelectList.prototype.creatItem = function (item, index) {
    var text;
    if (typeof item == 'string') text = item;
    else text = item.text;
    return _({
        class: 'absol-selectlist-item',
        child: {
            tag: 'span',
            props: {
                innerHTML: text
            }
        }
    });
};


SelectList.prototype.updateSelectItem = function () {
    var value = this.value;
    this.$items.forEach(function ($item) {
        var item = $item._item;
        if (value !== undefined && (item == value || item.value == value)) {
            $item.addClass('selected');
        }
        else {
            $item.removeClass('selected');
        }
    });
};

SelectList.property = {};
SelectList.property.items = {
    set: function (value) {
        value = value || [];
        this._items = value;
        this.clearChild();
        this.$items = value.map(function (item, index) {
            var $item = this.creatItem(item, index).addTo(this);
            $item._item = item; //hold a data
            $item.on('click', function (event) {
                this.value = typeof item == 'string' ? item : item.value;
                event.selectlistValue = this.value;
                this.emit('change', event);
            }.bind(this));
            return $item;

        }.bind(this));
        this.updateSelectItem();
    },
    get: function () {
        return this._items || [];
    }
};

SelectList.property.value = {
    set: function (value) {
        this._selectValue = value;
        this.updateSelectItem();
    },

    get: function () {
        return this._selectValue;
    }
};

SelectList.property.item = {
    get: function () {
        if (!this._items || this._items.length == 0) {
            return undefined;
        }
        var res = this._items[0];
        var value = this.value;
        var matchItems = this._items.filter(function (item) {
            return item == value || item.value == value;
        });
        if (matchItems.length > 0) res = matchItems[0];
        return res;
    }
};



SelectList.prototype.init = function (props) {
    props = props || {};
    if (props.adapter && (typeof props.adapter == 'object')) {
        Object.assign(this, props.adapter);
        props = Object.assign({}, props);
        delete props['adapter'];
    }
    var value = props.value;
    delete props.value;
    this.super(props);
    if (value !== undefined)
        this.value = value;
};

Acore.creator.selectlist = SelectList;

export default SelectList;