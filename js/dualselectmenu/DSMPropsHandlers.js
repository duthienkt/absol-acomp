import { keyStringOf } from "../utils";
import varScope from "absol/src/AppPattern/VarScope";

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


DSMPropsHandlers.format = {
    set: function (value) {
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