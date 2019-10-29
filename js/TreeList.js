import Acore from "../ACore";
var _ = Acore._;
var $ = Acore.$;

function TreeList() {
    var res = _({
        class: 'absol-tree-list',
        extendEvent: 'press'
    });

    return res;
}


TreeList.prototype.realignDescription = function (extMarginLeft) {
    extMarginLeft = extMarginLeft || 0;
    var maxWidth = 0;
    var ctns = [];
    $('.absol-tree-list-item-desc-container', this, function (elt) {
        ctns.push(elt);
        var bound = elt.getBoundingClientRect();
        maxWidth = Math.max(maxWidth, bound.width);
    });
    var fontSize = this.getFontSize();
    var cntWidth = maxWidth / fontSize + 'em';
    var extMarginRight = maxWidth / fontSize + extMarginLeft + 'em';
    ctns.forEach(function (e) {
        e.addStyle('width', cntWidth);
    });
    $('span.absol-tree-list-item-text', this, function (elt) {
        elt.addStyle('margin-right', extMarginRight);
    });
    return this;
};


TreeList.prototype.clearItems = function () {
    this._items = [];
    this.clearChild();
};

TreeList.prototype.getAllItem = function () {
    return this._items || [];
};

TreeList.prototype.getAllItemElement = function () {
    return Array.apply(null, this.childNodes);
}

TreeList.prototype.addItem = function (item) {
    var self = this;
    var props = { level: this.level, data: item };
    
    if (typeof item == 'string') {
        props.text = item;
    }
    else {
        props.text = item.text;
        if (item.items) {
            props.items = item.items;
        }
        if (item.desc){
            props.desc = item.desc;
        }
        if (item.extendClasses){
            props.extendClasses = item.extendClasses;
        }
        if (item.extendStyle){
            props.extendStyle = item.extendStyle;
        }
    }

    var elt = _({
        tag: 'treelistitem',
        props: props,
        on: {
            press: function (event) {
                self.emit('press', event, this);
            }
        }
    });
    this.addChild(elt);

    this._items.push(item);
    return this;
};



TreeList.property = {};
TreeList.property.items = {
    set: function (value) {
        this.clearItems();
        
        (value || []).forEach(this.addItem.bind(this));
    },
    get: function () {
        return this.getAllItem();
    }
};



TreeList.property.level = {
    set: function (value) {
        value = value || 0;
        if (this.level == value) return;
        this._level = value;
        this.getAllItemElement().forEach(function (e) {
            e.level = value;
        });
    },
    get: function () {
        return this._level || 0;
    }
};

Acore.creator.treelist = TreeList;

export default TreeList;
