import '../css/checklistitem.css';
import ACore, { _, $ } from "../ACore";
import CheckboxButton from "./CheckboxButton";
import Attributes from "absol/src/AppPattern/Attributes";
import SelectListItem from "./SelectListItem";
import OOP from "absol/src/HTML5/OOP";
import { estimateWidth14, measureText } from "./utils";
import { measureListHeight, measureMaxDescriptionWidth } from "./SelectList";
import { hitElement } from "absol/src/HTML5/EventEmitter";

export function measureMaxCheckboxTextWidth(items) {
    var maxTextWidth = 0;
    var maxText = 0;
    var maxEst = 0;
    var maxLv = 0;
    var est;
    var text;
    var item;
    for (var i = 0; i < items.length; ++i) {
        item = items[i];
        if (item.text) {
            text = item.text;
            est = estimateWidth14(text) + 14 * 1.25 * (item.level || 0);
            if (est > maxEst) {
                maxEst = est;
                maxText = text;
                maxLv = item.level || 0;
            }
        }
    }
    if (maxText)
        maxTextWidth = 18 + 14 * (1.25 + 0.35) * maxLv + measureText(maxText, '14px Arial, Helvetica, sans-serif').width + 14;//padding left, right 7px, checkbox 18px
    return maxTextWidth;
}

export function measureCheckListHeight(items) {
    var border = 0;
    var n = items.length - 1;
    return items.length * 25 + border;
}


export function measureCheckListSize(items) {
    var descWidth = measureMaxDescriptionWidth(items);
    var textWidth = measureMaxCheckboxTextWidth(items);
    var width = textWidth;
    if (descWidth > 0) {
        width += descWidth + 14;
    }
    var height = measureCheckListHeight(items);
    return {
        width: width,
        height: height,
        descWidth: descWidth,
        textWidth: textWidth
    };
}


/***
 * @extends SelectListItem
 * @constructor
 */
function CheckListItem() {
    this.$text = $('span.absol-selectlist-item-text', this);
    this.$textValue = this.$text.childNodes[0];
    this.$descCtn = $('.absol-selectlist-item-desc-container', this);
    this.$desc = $('span.absol-selectlist-item-desc', this.$descCtn);
    this.$descValue = this.$desc.childNodes[0];
    this.$checkbox = $(CheckboxButton.tag, this)
        .on('change', this.eventHandler.checkboxChange);
    this.$icon = null;
    this._icon = null;
    this._viewData = new Attributes(this);
    this._viewData.loadAttributeHandlers(this.viewHandlers);
    OOP.drillProperty(this, this._viewData, 'extendClasses');
    OOP.drillProperty(this, this._viewData, 'extendStyle');
    this.level = 0;
    this.selected = false;
    this.on('click', this.eventHandler.clickText);
}

CheckListItem.tag = 'CheckListItem'.toLowerCase();

CheckListItem.render = function () {
    return _({
        extendEvent: ['select'],
        class: ['as-check-list-item', "absol-selectlist-item"],
        child: [
            {
                tag: CheckboxButton.tag,
                class: 'as-check-list-item-checkbox'
            },
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
};


CheckListItem.property = {
    text: SelectListItem.property.text,
    value: SelectListItem.property.value,
    icon: SelectListItem.property.icon,
    lastInGroup: SelectListItem.property.lastInGroup,
};

CheckListItem.property.data = {
    set: function (value) {
        this._data = value;
        var viewData = {
            text: '',
            desc: '',
            noSelect: false,
            extendStyle: null,
            extendClasses: null,
            icon: null,
            lastInGroup: false
        };
        if (typeof value === 'string') {
            viewData.text = value
        }
        else {
            Object.assign(viewData, value);
        }
        Object.assign(this._viewData, viewData);
    },
    get: function () {
        return this._data;
    }
};

CheckListItem.property.selected = {
    set: function (value) {
        this.$checkbox.checked = !!value;
    },
    get: function () {
        return this.$checkbox.checked;
    }
};

CheckListItem.property.level = {
    set: function (value) {
        value = value || 0;
        this._level = value;
        this.$checkbox.addStyle('margin-left', value * 1.75 + 'em');
    },
    get: function () {
        return this._level;
    }
};

CheckListItem.property.readOnly = {
    set: function (value) {
        this.$checkbox.readOnly = !!value;
        if (value) {
            this.$checkbox.addClass('as-border-none');
        }
        else {
            this.$checkbox.removeClass('as-border-none');
        }
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.$checkbox.readOnly;
    }
};


CheckListItem.prototype.viewHandlers = {};
CheckListItem.prototype.viewHandlers.text = {
    set: function (value) {
        this.$textValue.data = value;
    },
    get: function () {
        return this.$textValue.data;
    }
};

CheckListItem.prototype.viewHandlers.desc = {
    set: function (value) {
        this.$descValue.data = value;
    },
    get: function () {
        return this.$descValue.data;
    }
};

CheckListItem.prototype.viewHandlers.extendClasses = {
    set: function (value, ref) {
        var prevVal = ref.get() || [];
        var i;
        for (i = 0; i < prevVal.length; ++i) {
            this.removeClass(prevVal[i]);
        }

        var newVal = [];
        if (typeof value == 'string') value = value.trim().split(/\s+/);
        value = value || [];
        for (i = 0; i < value.length; ++i) {
            newVal.push(value[i]);
            this.addClass(value[i]);
        }
        return newVal;
    }
};

CheckListItem.prototype.viewHandlers.extendStyle = {
    /***
     *
     * @param value
     * @param {Ref} ref
     */
    set: function (value, ref) {
        this.removeStyle(ref.get() || {});
        this._extendStyle = Object.assign({}, value || {});
        this.addStyle(this._extendStyle);
    },
    get: function () {
        return this._extendClasses;
    }
};

CheckListItem.prototype.viewHandlers.noSelect = {
    set: function (value) {
        if (value) this.addClass('as-no-select');
        else this.removeClass('as-no-select');
        return value;
    }
};


CheckListItem.prototype.viewHandlers.icon = {
    set: function (icon) {
        this.icon = icon;
    },
    get: function () {
        return this.icon;
    }
};

CheckListItem.prototype.viewHandlers.lastInGroup = {
    set: function (value) {
        this.lastInGroup = value;
    },
    get: function () {
        return this.lastInGroup;
    }
}

CheckListItem.eventHandler = {};

CheckListItem.eventHandler.clickText = function (event) {
    if (hitElement(this.$checkbox, event)) return;
    if (this.readOnly) return;
    this.$checkbox.checked = !this.$checkbox.checked;
    this.emit('select', {
        target: this,
        type: 'select',
        originalEvent: event.originalEvent || event.originEvent || event,
        selected: this.selected
    });
};

CheckListItem.eventHandler.checkboxChange = function (event) {
    this.emit('select', {
        target: this,
        type: 'select',
        originalEvent: event.originalEvent || event.originEvent || event,
        selected: this.selected
    });
};

ACore.install(CheckListItem);

export default CheckListItem;