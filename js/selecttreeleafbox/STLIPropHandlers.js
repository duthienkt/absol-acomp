import CTIPropHandlers from "../checktreebox/CTIPropHandlers";

var STLIPropHandlers = {};


STLIPropHandlers.data = {
    set: function (data) {
        this._data = data;
        this._updateData();
    },
    get: function () {
        return this._data;
    }
};

STLIPropHandlers.text = {
    get: function () {
        var data = this._data;
        if (data === undefined || data === null) return '';
        if (typeof data === 'string') return data;
        if (data && data.text) return data.text + '';
        return data + '';
    }
};


STLIPropHandlers.value = {
    get: function () {
        var data = this._data;
        if (data === undefined || data === null) return data;
        if (data && ('value' in data)) return data.value;
        return data;
    }
};

STLIPropHandlers.level = CTIPropHandlers.level;
STLIPropHandlers.status = CTIPropHandlers.status;

STLIPropHandlers.selected = {
    set: function (value) {
        if (value) {
            this.addClass('as-selected');
        }
        else {
            this.removeClass('as-selected');
        }
    },
    get: function () {
        return this.hasClass('as-selected');
    }
};



STLIPropHandlers.noSelect = {
    set: function (value) {
        if (value) {
            this.addClass('as-no-select');
        }
        else {
            this.removeClass('as-no-select');
        }
    },
    get: function () {
        return this.hasClass('as-no-select');
    }
};

/****
 * @name text
 * @type {string}
 * @memberOf SelectTreeLeafItem#
 */

/****
 * @name value
 * @type {string|number}
 * @memberOf SelectTreeLeafItem#
 */


/****
 * @name data
 * @type {*}
 * @memberOf SelectTreeLeafItem#
 */

/****
 * @name selected
 * @type {boolean}
 * @memberOf SelectTreeLeafItem#
 */





export default STLIPropHandlers;