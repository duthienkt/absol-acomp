import '../css/modal.css';
import ACore from "../ACore";

var $ = ACore.$;
var _ = ACore._;

function Modal() {
    this._contentAlign = [];
    this.contentAlign = 'middle center';
}


Modal.tag = 'modal';
Modal.render = function () {
    return _('.as-modal');
}


Modal.property = {};
Modal.property.show = {
    set: function (value) {
        if (value)
            this.removeClass('as-hidden');
        else
            this.addClass('as-hidden');
    },
    get: function () {
        return !this.containsClass('as-hidden');
    }
};

Modal.property.contentAlign = {
    set: function (value) {
        var thisM = this;
        this._contentAlign.forEach(function (name) {
            thisM.removeClass('as-' + name);
        })
        value = value || '';
        if (typeof value === 'string') {
            this._contentAlign = value.split(/\s+/);
        }
        else if (value instanceof Array) {
            this._contentAlign = value;
        }
        else {
            throw new Error("Invalid contentAlign!");
        }
        var thisM = this;
        console.log(this._contentAlign)
        this._contentAlign.forEach(function (name) {
            thisM.addClass('as-' + name);
        })
    },
    get: function () {
        return this._contentAlign.join(' ');
    }
}


ACore.install(Modal);

export default Modal;