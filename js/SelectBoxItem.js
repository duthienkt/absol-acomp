import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";
import EventEmitter from "absol/src/HTML5/EventEmitter";


var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function SelectBoxItem() {
    this._themeClassName = null;
    this.$text = $('.absol-selectbox-item-text', this);
    this.$close = $('.absol-selectbox-item-close', this);
    this.$close.on('click', this.eventHandler.clickClose);
    this.on('click', this.eventHandler.click);
};

SelectBoxItem.tag = 'SelectBoxItem'.toLowerCase();
SelectBoxItem.render = function () {
    return _({
        class: ['absol-selectbox-item'],
        extendEvent: ['close', 'press'],
        child: [
            '.absol-selectbox-item-text',
            {
                class: 'absol-selectbox-item-close',
                child: '<span class="mdi mdi-close"></span>'
            }
        ]
    });
};


SelectBoxItem.eventHandler = {};
SelectBoxItem.eventHandler.clickClose = function (event) {
    this.emit('close', event);
};

SelectBoxItem.eventHandler.click = function (event) {
    if (!EventEmitter.hitElement(this.$close, event)) {
        this.emit('press', event, this);
    }
};

SelectBoxItem.property = {};

SelectBoxItem.property.data = {
    set: function (value) {
        this._data = value;
        this.$text.clearChild();
        this.$text.addChild(_('<span>' + this.text + '</span>'));
        if (value && value.desc) {
            this.attr('title', value.desc);
        } else {
            this.attr('title', undefined);
        }
        if (this._themeClassName) this.removeClass(this._themeClassName);
        this._themeClassName = null;
        if (this.theme) {
            this._themeClassName = 'as-theme-' + this.theme;
            this.addClass(this._themeClassName);
        }
    },
    get: function () {
        return this._data;
    }
};

SelectBoxItem.property.text = {
    get: function () {
        if (typeof this._data == 'string')
            return this._data;
        else return this._data.text;
    }
};

SelectBoxItem.property.value = {
    get: function () {
        if (typeof this._data == 'string')
            return this._data;
        else return this._data.value;
    }
};

SelectBoxItem.property.theme = {
    get: function () {
        return this._data.theme || null;
    }
};

SelectBoxItem.property.active = {
    set: function (value) {
        if (value) {
            this.addClass('as-active');
        } else {
            this.removeClass('as-active');
        }
    },
    get: function () {
        return this.hasClass('as-active');
    }
};


ACore.install(SelectBoxItem);

export default SelectBoxItem;