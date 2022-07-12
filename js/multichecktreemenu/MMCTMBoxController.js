/***
 *
 * @param elt
 * @constructor
 */
function MMCTMBoxController(elt) {
    this.elt = elt;
    this.$box = elt.$box;
    for (var key in this) {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    }
    this.elt.on('click', this.ev_click);
    this.$box.on('close', this.ev_close);
    this.$box.on('cancel', this.ev_cancel);
    this.$box.on('change', this.ev_boxValuesChange);
}


MMCTMBoxController.prototype.onFocus = function () {
    this.$box.addTo(document.body);
    this.elt.off('click', this.ev_click);
};


MMCTMBoxController.prototype.onBlur = function () {
    this.$box.remove();
    setTimeout(() => {
        this.elt.on('click', this.ev_click);
    }, 50)
};


MMCTMBoxController.prototype.ev_click = function (event) {
    if (!this.elt.disabled && !this.elt.readOnly && (event.target === this.elt || event.target === this.elt.$itemCtn)) {
        this.elt.isFocus = true;
    }
};


MMCTMBoxController.prototype.ev_close = function (event) {
    this.elt.isFocus = false;
};


MMCTMBoxController.prototype.ev_cancel = function (event) {
    this.$box.values = this.elt.savedValues;
    this.elt.isFocus = false;
};


MMCTMBoxController.prototype.ev_boxValuesChange = function () {
    this.elt.tokenCtrl.updateFromViewValues();
};

export default MMCTMBoxController;
