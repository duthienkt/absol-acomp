import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function ButtonRange() {
    this.on('click', this.eventHandler.click, true);
    this._activeIndex = -1;
}

ButtonRange.tag = 'buttonrange';

ButtonRange.render = function () {
    return _({
        extendEvent: 'change',
        class: 'absol-button-range'
    });
};


ButtonRange.property = {};

ButtonRange.property.activeIndex = {
    set: function (value) {
        this._activeIndex = value;
        for (var i = 0; i < this.children.length; ++i) {
            var e = this.children[i];
            if (i == value) {
                e.addClass('active');
            }
            else {
                e.removeClass('active');
            }
        }
    },
    get: function () {
        return this._activeIndex;
    }
};

ButtonRange.property.activeElement = {
    get: function () {
        return this.children[this.activeIndex];
    }
};


ButtonRange.prototype.activeChild = function (child) {
    var res = -1;
    for (var i = 0; i < this.children.length; ++i) {
        var e = this.children[i];
        if (e == child) {
            res = i;
            e.addClass('active');
        }
        else {
            e.removeClass('active');
        }
    }
    this._activeIndex = res;
    return res;
};


ButtonRange.prototype.addChild = function (child) {
    var beforeAddChild = this.children.length;
    this.super(child);
    var afterAddChild = this.children.length;
    if (beforeAddChild <= this._activeIndex && afterAddChild > this._activeIndex) {
        this.children[this._activeIndex].addClass('active');
    }
    return this;
};


ButtonRange.prototype.init = function (props) {
    this.super(props);
};

ButtonRange.eventHandler = {};
ButtonRange.eventHandler.click = function (event) {
    var current = event.target;
    while (current && current != this && current.parentElement != this) {
        current = current.parentElement;
    }
    if (current && current.parentElement == this) {
        var last = this._activeIndex;
        var index = this.activeChild(current);
        event.activeIndex = index;
        if (this._activeIndex != last)
            this.emit('change', event);
    }
};

export default ButtonRange;