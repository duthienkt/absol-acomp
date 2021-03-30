import ACore, {_, $} from '../ACore';
import SelectBoxItem from "./SelectBoxItem";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import '../css/tokenfield.css';
import {getCaretPosition, measureText} from "./utils";
import Vec2 from "absol/src/Math/Vec2";
import {setCaretPosition} from "absol/src/HTML5/Text";

/***
 * @extends AElement
 * @constructor
 */
function TokenField() {
    this.on('click', this.eventHandler.click);
    this.$input = $('input', this)
        .on('keydown', this.eventHandler.inputKeyDown);
    this.$attachhook = $('attachhook', this)
        .on('attached', function () {
            ResizeSystem.add(this);
            this.requestUpdateSize();
        });
    this.$attachhook.requestUpdateSize = this.updateSize.bind(this);
    this.separator = ' ';
    this.placeHolder = '';
}

TokenField.tag = 'TokenField'.toLowerCase();

TokenField.render = function () {
    return _({
        class: 'as-token-field',
        extendEvent: ['change'],
        child: [
            {
                tag: 'input',
                class: 'as-token-field-input-text',
                attr: { type: 'text', tabindex: '1' }
            },
            'attachhook'
        ]
    });
};

TokenField.prototype._makeItem = function (text) {
    var itemElt = _({
        tag: SelectBoxItem.tag,
        class: 'as-token-field-item',
        attr: { tabindex: 1 },
        props: {
            data: {
                text: text,
                value: text
            }
        }
    });

    itemElt.on({
        keydown: this.eventHandler.itemKeyDown.bind(this, itemElt),
        close: this.eventHandler.itemClose.bind(this, itemElt)
    });

    return itemElt;
};

TokenField.prototype._appendItem = function (itemElt) {
    this.addChildBefore(itemElt, this.$input);
};


TokenField.prototype._updateInputWidth = function () {
    var lastItem = this.findChildBefore(this.$input);
    if (lastItem) {
        var lastItemBound = lastItem.getBoundingClientRect();
        var bound = this.getBoundingClientRect();
        var aRight = bound.right - 4 - lastItemBound.right;
        if (aRight > 60) {
            this.$input.addStyle('width', aRight + 'px');
        }
        else {
            this.$input.addStyle('width', '100%');
        }
    }
    else {
        this.$input.addStyle('width', '100%');
    }
};

TokenField.prototype._isSeparatorKey = function (key) {
    if (this.separator === ' ') return key === ' ';
    if (this.separator === '\n') return key === 'Enter';
    if (this.separator === '\t') return key === 'Tab';
    return key === this.separator;
};

TokenField.prototype.updateSize = function () {
    this._updateInputWidth();
};

TokenField.prototype._notifyChange = function (data) {
    this.emit('change', Object.assign({ type: 'change', target: this }, data), this);
};

TokenField.eventHandler = {};
TokenField.property = {};


TokenField.property.separator = {
    set: function (value) {
        if (typeof value !== "string") value = ' ';
        this._separator = value;
    },
    get: function () {
        return this._separator;
    }
};

TokenField.property.placeHolder = {
    set: function (value) {
        this.$input.attr('placeholder', value || '');
    },
    get: function () {
        return this.$input.attr('placeholder');
    }
};

TokenField.property.items = {
    set: function (items) {
        items = items || [];
        while (this.firstChild && this.firstChild && this.firstChild.containsClass('as-token-field-item')) {
            this.firstChild.remove();
        }
        for (var i = 0; i < items.length; ++i) {
            this._appendItem(this._makeItem(items[i]));
        }
    },
    get: function () {
        return Array.prototype.slice.call(this.childNodes).filter(function (elt) {
            return elt.containsClass && elt.containsClass('as-token-field-item');
        }).map(function (elt) {
            return elt.data.value;
        });
    }
}


TokenField.eventHandler.inputKeyDown = function (event) {
    if (this._isSeparatorKey(event.key)) {
        var text = this.$input.value;
        if (text.length > 0) {
            this.$input.value = '';
            var newItem = this._makeItem(text);
            this._appendItem(newItem);
            this.updateSize();
            this._notifyChange({ action: 'add', item: text, itemElt: newItem });
        }
        event.preventDefault();
    }
    else if (event.key.startsWith('Arrow') || event.key === 'Backspace') {
        if (this.$input.selectionStart === 0 && this.$input.selectionEnd === 0) {
            console.log(event.key)
            if (event.key === 'ArrowLeft' || event.key === 'Backspace') {
                event.preventDefault();
                var prevChild = this.findChildBefore(this.$input);
                if (prevChild) prevChild.focus();
            }
            else if (event.key === 'ArrowUp') {
                var item, itemBound;
                var inputBound = this.$input.getBoundingClientRect();
                var anchorPos = new Vec2(inputBound.left + 5, inputBound.top + inputBound.height / 2);
                var minDis = Infinity;
                var dis;
                var aboveItem;
                for (var i = 0; i < this.childNodes.length; ++i) {
                    item = this.childNodes[i];
                    if (item.containsClass && item.containsClass('as-token-field-item')) {
                        itemBound = item.getBoundingClientRect();
                        if (itemBound.bottom < inputBound.top) {
                            dis = new Vec2(itemBound.left + itemBound.width / 2, itemBound.top + itemBound.height / 2)
                                .sub(anchorPos)
                                .abs();
                            if (dis < minDis) {
                                minDis = dis
                                aboveItem = item;
                            }
                        }
                    }
                }
                if (aboveItem) {
                    aboveItem.focus();
                    event.preventDefault();
                }
            }
        }
    }
};

TokenField.eventHandler.itemKeyDown = function (itemElt, event) {
    var nextElt;
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (event.key === 'Delete') {
            nextElt = this.findChildAfter(itemElt);
        }
        else {
            nextElt = this.findChildBefore(itemElt) || this.$input;
        }

        itemElt.remove();
        this._notifyChange({ item: itemElt.data.value, action: 'remove', itemElt: itemElt });
        if (nextElt === this.$input) {
            this.$input.focus();
            setCaretPosition(this.$input, 0);
        }
        else {
            nextElt.focus();
        }
    }
    else if (event.key === 'ArrowLeft') {
        nextElt = this.findChildBefore(itemElt);
        if (nextElt) nextElt.focus();
    }
    else if (event.key === 'ArrowRight') {
        nextElt = this.findChildAfter(itemElt);
        if (nextElt === this.$input) {
            this.$input.focus();
            setCaretPosition(this.$input, 0);
        }
        else {
            nextElt.focus();
        }
    }
    else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        var currentItemBound = itemElt.getBoundingClientRect();
        var center = new Vec2(currentItemBound.left + currentItemBound.width / 2, currentItemBound.top + currentItemBound.height / 2);
        var childElt, itemBound, dis;
        var minDis = Infinity;
        var i;
        if (event.key === 'ArrowUp') {
            for (i = 0; i < this.childNodes.length; ++i) {
                childElt = this.childNodes[i];
                if (childElt.containsClass && childElt.containsClass('as-token-field-item') || childElt === this.$input) {
                    itemBound = childElt.getBoundingClientRect();
                    if (itemBound.bottom < currentItemBound.top) {
                        dis = new Vec2(itemBound.left + itemBound.width / 2, itemBound.top + itemBound.height / 2)
                            .sub(center)
                            .abs();
                        if (dis < minDis) {
                            minDis = dis
                            nextElt = childElt;
                        }
                    }
                }
            }
        }
        else {
            for (i = 0; i < this.childNodes.length; ++i) {
                childElt = this.childNodes[i];
                if (childElt.containsClass && childElt.containsClass('as-token-field-item') || childElt === this.$input) {
                    itemBound = childElt.getBoundingClientRect();
                    if (itemBound.top > currentItemBound.bottom) {
                        dis = new Vec2(itemBound.left + itemBound.width / 2, itemBound.top + itemBound.height / 2)
                            .sub(center)
                            .abs();
                        if (dis < minDis) {
                            minDis = dis
                            nextElt = childElt;
                        }
                    }
                }
            }
        }
        if (nextElt) {
            nextElt.focus();
        }
    }
};

TokenField.eventHandler.itemFocus = function (itemElt) {
    itemElt.addClass('as-focus');
};

TokenField.eventHandler.itemBlur = function (itemElt) {
    itemElt.removeClass('as-focus');
};

TokenField.eventHandler.itemClose = function (itemElt) {
    itemElt.remove();
    this._notifyChange({ action: 'remove', item: itemElt.data.value, itemElt: itemElt });
    this.$input.focus();
};

TokenField.eventHandler.click = function (event) {
    if (event.target === this)
        this.$input.focus();
};

ACore.install(TokenField);

export default TokenField;