import { keyStringOf } from "../utils";
import TextMeasure from "../TextMeasure";

var DSMPropsHandlers = {};


DSMPropsHandlers.isFocus = {
    set: function (value) {
        if (this.disabled || this.readOnly) value = false;
        value = !!value;
        if (value === this.hasClass('as-focus')) return;
        if (value) {
            this.savedValue = this.$box.value;
            this.addClass('as-focus');
            this.boxCtrl.onFocus();
        }
        else {

            this.removeClass('as-focus');
            this.boxCtrl.onBlur();
            this.updateText();
            if (keyStringOf(this.savedValue) !== keyStringOf(this.$box.value)) {
                delete this.savedValue;
                this.notifyChange();
            }
        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};

DSMPropsHandlers.items = {
    set: function (items) {
        items = items ||[];
        var textWidth =  TextMeasure.measureWidth('____', TextMeasure.FONT_ROBOTO, 14);
        var visit = (item, pWidth, d)=>{
            if (d === 2) return;
            var text = item.text + '';
            var tWidth = TextMeasure.measureWidth(text, TextMeasure.FONT_ROBOTO, 14)+ pWidth;
            if (tWidth > textWidth) textWidth = tWidth;
            if (item.items && item.items.length) {
                item.items.forEach(it=> visit(it, pWidth, d+1))
            }
        }
        items.forEach(it=> visit(it, 0,0));
        this.addStyle('--estimate-text-width', (textWidth/ 14) + 'em');

        this.$box.items = items;
        if ('pendingValue' in this) {
            this.$box.value = this.pendingValue;
        }
        this.updateText();

    },
    get: function () {
        return this.$box.items;
    }
};

DSMPropsHandlers.value = {
    set: function (value) {
        this.pendingValue = value;
        this.$box.value = value;
        this.updateText();
    },
    get: function () {
        if (!this.strictValue && ('pendingValue' in this)) {
            return this.pendingValue;
        }
        var value = this.$box.value;
        var selectedItem = this.$box.selectedItem;
        if (!selectedItem || !selectedItem[0] || !selectedItem[1]) return null;
        return value;
    }
};

DSMPropsHandlers.selectedItems = {
    /**
     * @this DualSelectMenu
     * @return {*}
     */
    get: function () {
        var selectedItem = this.$box.selectedItem;
        if (!selectedItem || !selectedItem[0] || !selectedItem[1]) return null;
        return selectedItem;
    }
};



DSMPropsHandlers.selectedItem = {
    /**
     * @this DualSelectMenu
     * @return {*}
     */
    get: function () {
       return this.seletedItems;
    }
};


DSMPropsHandlers.format = {
    set: function (value) {
        value = value || '$0, $1';
        var text = value.replace('$0', '').replace('$1', '');
        this.addStyle('--estimate-format-width', (TextMeasure.measureWidth(text, TextMeasure.FONT_ROBOTO, 14) /14) + 'em');
        this.attr('data-format', value);
        this.updateText();
    },
    get: function () {
        return this.attr('data-format') || '$0, $1';
    }
};

DSMPropsHandlers.strictValue = {
    set: function (value) {
        this.$box.strictValue = value;
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
    },
    get: function () {
        return this.$box.strictValue;
    }
};


DSMPropsHandlers.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};


DSMPropsHandlers.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};


export default DSMPropsHandlers;