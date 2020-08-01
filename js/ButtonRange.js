import '../css/buttonrange.css';
import ACore from "../ACore";
import ButtonArray from "./ButtonArray";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;


var ChevronLeft = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 410.258 410.258" style="enable-background:new 0 0 410.258 410.258;" xml:space="preserve">\n' +
    '<polygon points="298.052,24 266.052,0 112.206,205.129 266.052,410.258 298.052,386.258 162.206,205.129 "/>\n' +
    '</svg>';

var ChevronRight = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n' +
    '\t viewBox="0 0 410.258 410.258" style="enable-background:new 0 0 410.258 410.258;" xml:space="preserve">\n' +
    '<polygon points="144.206,0 112.206,24 248.052,205.129 112.206,386.258 144.206,410.258 298.052,205.129 "/>\n' +
    '</svg>'

function ButtonRange() {
    this._dict = {};
    this._pool = [];
    this._items = [];
    this.$lastActiveBtn = null;
    this._value = undefined;
    this._lastValue = this._value;
    this.$scroller = $('.as-button-range-scroller', this)
    this.$prevBtn = $('.as-button-range-left-btn', this)
        .on('click', this.prevValue.bind(this));
    this.$nextBtn = $('.as-button-range-right-btn', this)
        .on('click', this.nextValue.bind(this));
    this._scrollTimeout = -1;
    this._scrollToSelected = this._scrollToSelected.bind(this);
    this.$attachhook = $('attachhook', this).on('error', this.eventHandler.attached);
    this.autoWidth = false;
}

ButtonRange.tag = 'buttonrange';
ButtonRange.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-button-range',
        child: [
            {
                class: 'as-button-range-scroller',
            },
            {
                class: 'as-button-range-left-ctn',
                child: {
                    tag: 'button',
                    class: 'as-button-range-left-btn',
                    child: ChevronLeft
                }
            },
            {
                class: 'as-button-range-right-ctn',
                child: {
                    tag: 'button',
                    class: 'as-button-range-right-btn',
                    child: ChevronRight
                }
            },
            'attachhook'
        ]
    });
};


ButtonRange.prototype.updateSize = function () {
    if (this.autoWidth) {
        if (this.$scroller.childNodes.length > 0) {
            var left = this.$scroller.firstChild.getBoundingClientRect().left;
            var right = this.$scroller.lastChild.getBoundingClientRect().right;
            if (left < right) {
                var fontSize = this.getFontSize() || 14;
                this.addStyle('width', (right - left + 2)/fontSize + 2 +'em')
            }
        }
    }
    this._scrollToSelected();
};

ButtonRange.prototype._newButton = function () {
    var button = _({
        tag: 'button',
        class: 'as-button-range-item',
        child: { text: 'null' }
    });
    button.on('click', this.eventHandler.clickItem.bind(this, button));
    return button;
};

ButtonRange.prototype._requestButton = function (items) {
    var button;
    if (this._pool.length > 0) {
        button = this._pool.pop();
    }
    else {
        button = this._newButton();
    }
    return button;
};

ButtonRange.prototype._assignButton = function (button, data) {
    button._data = data;
    button.childNodes[0].data = data.text;
};

ButtonRange.prototype._releaseButton = function (button) {
    this._pool.push(button);
};

ButtonRange.prototype._requireButton = function (n) {
    var child;
    while (this.$scroller.childNodes.length > n) {
        child = this.$scroller.lastChild;
        this._releaseButton(child);
        this.$scroller.removeChild(child);
    }

    while (this.$scroller.childNodes.length < n) {
        this.$scroller.addChild(this._requestButton());
    }
};

ButtonRange.prototype._assignButtonList = function (items) {
    var item;
    for (var i = 0; i < items.length; ++i) {
        item = this._getFullFormat(items[i]);
        this._assignButton(this.$scroller.childNodes[i], item);
        this._dict[item.ident] = {
            elt: this.$scroller.childNodes[i],
            data: item
        }
    }
};

ButtonRange.prototype._scrollToSelected = function () {
    if (this._scrollTimeout >= 0) return;
    if (!this.$lastActiveBtn) return;
    var scrollerBound = this.$scroller.getBoundingClientRect();
    if (scrollerBound.width === 0) return;
    var activeBound = this.$lastActiveBtn.getBoundingClientRect();
    var dx, speed;
    if (activeBound.left < scrollerBound.left - 1) {
        dx = activeBound.left - scrollerBound.left;
        if (dx < -500) dx = -500;
        speed = Math.sqrt(-dx * 2 + 4);
        this.$scroller.scrollLeft -= speed;
    }
    else if (activeBound.right - 1 > scrollerBound.right) {
        dx = activeBound.right - scrollerBound.right;
        if (dx > 500) dx = 500;
        speed = Math.sqrt(dx * 2 + 4);
        this.$scroller.scrollLeft += speed;
    }
    else {
        return;
    }
    var thisBR = this;
    this._scrollTimeout = setTimeout(function () {
        thisBR._scrollTimeout = -1;
        thisBR._scrollToSelected();
    }, 20);
};

ButtonRange.prototype.nextValue = function (userAction) {
    var currentIndex = this._findActiveIndex();
    var nextIndex;
    var nextValue;
    if (currentIndex < 0) {
        nextIndex = 0;
    }
    else {
        nextIndex = Math.min(this._items.length - 1, currentIndex + 1);
    }
    if (nextIndex >= 0) {
        nextValue = this._getFullFormat(this._items[nextIndex]).value;
        this.value = nextValue;
        if (userAction) this.notifyChange();
    }
};


ButtonRange.prototype.prevValue = function (userAction) {
    var currentIndex = this._findActiveIndex();
    var prevIndex;
    var prevValue;
    if (currentIndex < 0) {
        prevIndex = 0;
    }
    else {
        prevIndex = Math.max(0, currentIndex - 1);
    }
    if (prevIndex >= 0 && prevIndex < this._items.length && prevIndex != currentIndex) {
        prevValue = this._getFullFormat(this._items[prevIndex]).value;
        this.value = prevValue;
        if (userAction) this.notifyChange();
    }
};

ButtonRange.prototype._findActiveIndex = function () {
    var item;
    var value = this._value;
    for (var i = 0; i < this._items.length; ++i) {
        item = this._items[i];
        if (item === value || (item && item.value === value))
            return i;
    }
    return -1;
}


ButtonRange.prototype._getFullFormat = function (item) {
    var res = {};
    if ((typeof item == 'string') || (typeof item == 'number') || (typeof item == 'boolean') || (item === null) || (item === undefined)) {
        res.ident = item + '';
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

ButtonRange.prototype.notifyChange = function () {
    this.emit('change', { target: this, value: this.value, type: 'change' }, this);
}


ButtonRange.property = {};

/**
 * @type {ButtonRange}
 */
ButtonRange.property.items = {
    set: function (items) {
        items = items || [];
        this._items = items;
        this._requireButton(items.length);
        this._assignButtonList(items);
        if (items.length > 0) {
            if (!this._dict[this._value + '']) {
                this._value = this._getFullFormat(items[0]).value;
            }
        }
        this.value = this._value;
        this.updateSize();
    },
    get: function () {
        return this._items;
    }
};

ButtonRange.property.value = {
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
        var activeIndex = this._findActiveIndex();
        this.$prevBtn.disabled = activeIndex === 0;
        this.$nextBtn.disabled = activeIndex === this._items.length - 1;
        this._scrollToSelected();
    },
    get: function () {
        return this._value;
    }
};


ButtonRange.eventHandler = {};

ButtonRange.eventHandler.clickItem = function (item, event) {
    if (this._lastValue != item._data.value) {
        this.value = item._data.value;
        this.notifyChange();
    }
};

ButtonRange.eventHandler.attached = function () {
    if (this.style.width === 'auto') this.autoWidth = true;
    Dom.addToResizeSystem(this.$attachHook);
    this.updateSize();
}


ACore.install(ButtonRange);

export default ButtonRange;