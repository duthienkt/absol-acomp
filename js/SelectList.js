import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

/*global absol*/
function SelectList() {
    var res = _('.absol-selectlist');
    res.defineEvent('change');
    res.$attachhook = _('attachhook').addTo(res);
    res.sync = new Promise(function (rs) {
        res.$attachhook.once('error', rs);
    });
    res.$items = [];
    return res;
};

SelectList.prototype.creatItem = function (item, index) {
    var text;
    var extendStyle = {};
    var extendClasses = [];
    if (typeof item == 'string') {
        text = item;
    }
    else {
        text = item.text;
        extendStyle = item.extendStyle || {};
        if (typeof item.extendClasses == 'string') {
            extendClasses = item.extendClasses.split(/\s+/);
        }
        else if (item.extendClasses && (extendClasses instanceof Array)) {
            extendClasses = item.extendClasses
        }
    }

    var res = _({
        class: ['absol-selectlist-item'].concat(extendClasses),
        style: extendStyle,
        child: [
            {
                tag: 'span',
                class: 'absol-selectlist-item-text',
                props: {
                    innerHTML: text
                },
            },
            {
                class: 'absol-selectlist-item-desc-container',
                child: {
                    tag: 'span',
                    class: 'absol-selectlist-item-desc',
                    child: item.desc ? { text: item.desc } : []
                }
            }
        ]
    });

    res.$descCtn = $('.absol-selectlist-item-desc-container', res);
    res.$text = $('.absol-selectlist-item-text', res);
    return res;
};

SelectList.prototype.realignDescription = function (extMarginLeft) {
    if (this.$items.length == 0) return;
    extMarginLeft = extMarginLeft || 0;
    var maxWidth = 0;
    this.$items.forEach(function (elt) {
        elt.$descCtn.removeStyle('width');
        var bound = elt.$descCtn.getBoundingClientRect();

        maxWidth = Math.max(maxWidth, bound.width);
    });
    var fontSize = this.$items[0].getFontSize();
    var cntWidth = maxWidth / fontSize + 'em';
    var extMarginRight = maxWidth / fontSize + extMarginLeft + 'em';
    this.$items.forEach(function (elt) {
        elt.$descCtn.addStyle('width', cntWidth);
        elt.$text.addStyle('margin-right', extMarginRight);
    });

    this._extMarginRight = extMarginRight;
    this._cntWidth = cntWidth;
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
            $item.on('mousedown', function (event) {
                this.value = typeof item == 'string' ? item : item.value;
                event.selectlistValue = this.value;
                this.emit('change', event);
            }.bind(this));
            return $item;

        }.bind(this));
        this.updateSelectItem();
        this.sync = this.sync.then(this.realignDescription.bind(this, 0));
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