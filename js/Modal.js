import '../css/modal.css';
import ACore from "../ACore";

var $ = ACore.$;
var _ = ACore._;

function Modal() {
    this._contentAlign = [];
    this.contentAlign = 'middle center';
    this.$content = $('.as-modal-content', this);
}


Modal.tag = 'modal';
Modal.render = function () {
    return _({ class: 'as-modal', child: '.as-modal-content' });
};

['findChildBefore', 'findChildAfter', 'removeChild', 'clearChild', 'addChild'].forEach(function (key) {
    Modal.prototype[key] = function () {
        this.$content[key].apply(this.$content, arguments);
    }
});

Modal.prototype.getChildren = function (){
  return this.$content.children;
};


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