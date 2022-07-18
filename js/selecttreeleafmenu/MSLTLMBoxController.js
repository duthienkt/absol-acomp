function MSLTLMBoxController(elt) {
    this.elt = elt;
    this.$box = this.elt.$box;
    for (var key in this) {
        if (key.startsWith('ev_')) this[key] = this[key].bind(this);
    }
    this.elt.on('click', this.ev_click);
    this.$box.on('close', this.ev_boxClose);
}


MSLTLMBoxController.prototype.onFocus = function () {
    this.elt.off('click', this.ev_click);
    this.$box.addTo(document.body);
};


MSLTLMBoxController.prototype.onBlur = function () {
    this.$box.remove();
    setTimeout(() => {
        this.elt.on('click', this.ev_click);
    }, 10);
};

MSLTLMBoxController.prototype.ev_click = function () {
    if (this.elt.disabled || this.elt.readOnly) return;
    this.elt.isFocus = true;
};


MSLTLMBoxController.prototype.ev_boxClose = function () {
    this.elt.isFocus = false;
};


export default MSLTLMBoxController;