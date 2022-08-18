import { copySelectionItemArray, keyStringOf } from "../utils";

var STLMPropHandlers = {};


STLMPropHandlers.isFocus = {
    set: function (value) {
        value = !!value;
        if (this.hasClass('as-focus') === value) return;
        if (value) {
            this.addClass('as-focus');
            this.savedValue = this.$box.value;
            this.boxCtrl.onFocus();
            this.$box.viewToSelected();
        }
        else {
            this.removeClass('as-focus');
            this.boxCtrl.onBlur();
            this.$box.resetSearchState();
            if (keyStringOf(this.savedValue) !== keyStringOf(this.$box.value)) {
                this._updateText();
                this.notifyChange();
            }
        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};

STLMPropHandlers.items = {
    set: function (items) {
        this.$box.items = copySelectionItemArray(items, {removeNoView: true});
        this._updateText();
    },
    get: function () {
        return this.$box.items;
    }
};

STLMPropHandlers.value = {
    set: function (value) {
        this.$box.value = value;
        this._updateText();
    },
    get: function () {
        return this.$box.value;
    }
};

STLMPropHandlers.strictValue = {
    set: function (value) {
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
        this.$box.strictValue = value;
        this._updateText();
    },
    get: function () {
        return this.$box.strictValue;
    }
};

STLMPropHandlers.disabled = {
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


export default STLMPropHandlers;