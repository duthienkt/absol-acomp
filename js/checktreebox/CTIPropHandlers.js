import { isNaturalNumber } from "../utils";

var CTIPropHandlers = {};

CTIPropHandlers.data = {
    /***
     * @this MCheckTreeItem|CheckTreeItem
     * @param data
     */
    set: function (data) {
        this._data = data;
        this._updateData();
    },
    get: function () {
        return this._data;
    }
};

CTIPropHandlers.text = {
    get: function () {
        if (!this._data) return '';
        if (this._data.charAt) return this._data;
        var text = this._data.text;
        if (text === undefined || text === null) return '';
        return this._data.text + '';
    }
};

CTIPropHandlers.value = {
    get: function () {
        if (!this._data) return null;
        if (this._data.charAt) return this._data;
        return this._data.value;
    }
};

CTIPropHandlers.desc = {
    get: function () {
        if (!this._data) return '';
        var desc = this._data.desc;
        if (desc === undefined || desc === null) return '';
        return desc + '';
    }
};

CTIPropHandlers.level = {
    set: function (value) {
        if (!isNaturalNumber(value)) value = 0;
        this._level = value;
        this.addStyle('--level', value + '');
    },
    get: function () {
        return this._level;
    }
};

CTIPropHandlers.status = {
    set: function (value) {
        value = value === 'open' || value === 'close' ? value : 'none';
        this._status = value;
        this.removeClass('as-status-open')
            .removeClass('as-status-close');
        if (value !== "none") {
            this.addClass('as-status-' + value);
        }
    },
    get: function () {
        return this._status || 'none';
    }
};

CTIPropHandlers.selected = {
    set: function (value) {
        if (value === 'all') {
            this.$checkbox.checked = true;
            this.$checkbox.removeClass('as-has-minus');
        }
        else if (value === 'child') {
            this.$checkbox.checked = false;
            this.$checkbox.addClass('as-has-minus');
        }
        else {
            this.$checkbox.checked = false;
            this.$checkbox.removeClass('as-has-minus');
        }
    },
    get: function () {
        if (this.$checkbox.checked) {
            return 'all';
        }
        else {
            if (this.$checkbox.hasClass('as-has-minus')) {
                return 'child';
            }
            else {
                return 'none';
            }
        }
    }
};

CTIPropHandlers.hasLeaf = {
    set: function (value) {
        if (value) {
            this.addClass('as-has-leaf');
        }
        else {
            this.removeClass('as-has-leaf');
        }
    },
    get: function () {
        return this.hasClass('as-has-leaf');
    }
};

CTIPropHandlers.noSelect = {
    set: function (value) {
        if (value) {
            this.addClass('as-no-select');
        }
        else {
            this.removeClass('as-no-select');
        }
        this.$checkbox.disabled = !!value;
    },
    get: function () {
        return this.hasClass('as-no-select');
    }
};

export default CTIPropHandlers;
