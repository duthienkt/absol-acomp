import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";


var _ = ACore._;
var $ = ACore.$;

function SelectBoxItem() {
    var res = _({
        tag: 'board',
        class: ['absol-selectbox-item', 'as-board-drag-zone'],
        extendEvent: 'close',
        child: [
            '.absol-selectbox-item-text',
            {
                class: 'absol-selectbox-item-close',
                child: '<span class="mdi mdi-close"></span>'
            }
        ]
    });
    res.eventHandler = OOP.bindFunctions(res, SelectBoxItem.eventHandler);
    res.$text = $('.absol-selectbox-item-text', res);
    res.$close = $('.absol-selectbox-item-close', res);
    res.$close.on('click', res.eventHandler.clickClose);
    return res;
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

ACore.install('SelectBoxItem'.toLowerCase(), SelectBoxItem);

export default SelectBoxItem;