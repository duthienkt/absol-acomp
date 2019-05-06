import Acore from "../ACore";

function Modal() {
    var $ = Acore;
    var _ = Acore._;

    var res = _({
        class: 'absol-modal',
        child: {
            class: 'absol-modal-hcenter',
            child: {
                class: 'absol-modal-vcenter',
                child: '.absol-modal-container'

            }
        }
    });

    res.$container = $('.absol-modal-container', res);

    return res;
};


Modal.prototype.addChild = function (child) {
    this.$container.addChild.apply(this.$container, arguments);
    return this;
};


Modal.property = {};
Modal.property.show = {
    set: function (value) {
        if (value)
            this.removeClass('absol-modal-hidden');
        else
            this.addClass('absol-modal-hidden');
    },
    get: function () {
        return !this.containsClass('absol-modal-hidden');
    }
};


export default Modal;