import '../css/selectlist.css';
import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;


function SelectListItem() {
    var res = _({
        class: 'absol-selectlist-item',
        child: [
            {
                tag: 'span',
                class: 'absol-selectlist-item-text',
                child: { text: '' }
            },
            {
                class: 'absol-selectlist-item-desc-container',
                child: {
                    tag: 'span',
                    class: 'absol-selectlist-item-desc',
                    child: { text: '' }
                }
            }
        ]
    });
    res.$text = $('span.absol-selectlist-item-text', res);
    res.$textValue = res.$text.childNodes[0];
    res.$descCtn = $('.absol-selectlist-item-desc-container', res);
    res.$desc = $('span.absol-selectlist-item-desc', res.$descCtn);
    res.$descValue = res.$desc.childNodes[0];
    res._extendClasses = [];
    res._extendStyle = {};
    res._data = "";
    res._level = 0;
    return res;
}

//bold 14pt arial


SelectListItem.property = {};


SelectListItem.property.extendClasses = {
    set: function (value) {
        var i;
        for (i = 0; i < this._extendClasses.length; ++i) {
            this.removeClass(this._extendClasses[i]);
        }
        this._extendClasses = [];
        if (typeof value == 'string') value = value.trim().split(/\s+/);
        value = value || [];
        for (i = 0; i < value.length; ++i) {
            this._extendClasses.push(value[i]);
            this.addClass(value[i]);
        }
    },
    get: function () {
        return this._extendClasses;
    }
};

SelectListItem.property.extendStyle = {
    set: function (value) {
        this.removeStyle(this._extendStyle);
        this._extendStyle = Object.assign({}, value || {});
        this.addStyle(this._extendStyle);
    },
    get: function () {
        return this._extendClasses;
    }
};


SelectListItem.property.data = {
    set: function (value) {
        this._data = value;
        if (typeof value == 'string') {
            this.$textValue.data = value;
            this.$descValue.data = '';
            this.level = 0;
            this.extendClasses = '';
            this.extendStyle = {};
            this.lastInGroup = false;
            this.isLeaf = false;
            this.selected = false;
        }
        else {
            this.$textValue.data = value.text || '';
            this.$descValue.data = value.desc || '';
            this.level = value.level || 0;

            this.extendClasses = value.extendClasses;
            this.extendStyle = value.extendStyle;
            this.lastInGroup = !!(value.lastInGroup);
            this.isLeaf = !!(value.isLeaf);
            this.selected = !!(value.selected);
        }
    },
    get: function () {
        return this._data;
    }
};

SelectListItem.property.value = {
    get: function () {
        return (typeof this._data == "string") ? this._data : this._data.value;
    }
};

SelectListItem.property.text = {
    get: function () {
        return (typeof this._data == "string") ? this._data : this._data.text;
    }
};

SelectListItem.property.desc = {
    get: function () {
        return (typeof this._data == "string") ? undefined : this._data.desc;
    }
};


SelectListItem.property.level = {
    set: function (value) {
        value = value || 0;
        this._level = value;
        this.$text.addStyle('margin-left', value * 0.9 + 'em');
    },
    get: function () {
        return this._level;
    }
};


SelectListItem.property.lastInGroup = {
    set: function (value) {
        if (value) {
            this.addClass('as-last-in-group');
        }
        else {
            this.removeClass('as-last-in-group');
        }
    },
    get: function () {
        return this.containsClass('as-last-in-group');
    }
};

SelectListItem.property.isLeaf = {
    set: function (value) {
        if (value) {
            this.addClass('as-is-leaf');
        }
        else {
            this.removeClass('as-is-leaf');
        }
    },
    get: function () {
        return this.containsClass('as-is-leaf');
    }
};

SelectListItem.property.selected = {
    set: function (value) {
        if (value) {
            this.addClass('as-selected');
        }
        else {
            this.removeClass('as-selected');
        }
    },
    get: function () {
        return this.containsClass('as-selected');
    }
};

ACore.install('SelectListItem'.toLowerCase(), SelectListItem);


export default SelectListItem;