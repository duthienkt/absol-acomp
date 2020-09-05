import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";


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
};

SelectBoxItem.tag = 'SelectBoxItem'.toLowerCase();
SelectBoxItem.render = function () {
    return _({
        class: ['absol-selectbox-item'],
        extendEvent: 'close',
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

SelectBoxItem.property = {};

SelectBoxItem.property.data = {
    set: function (value) {
        this._data = value;
        this.$text.clearChild();
        this.$text.addChild(_('<span>' + this.text + '</span>'));
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


ACore.install(SelectBoxItem);

export default SelectBoxItem;