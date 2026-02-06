function MDSMBoxController(elt) {
    this.elt = elt;
    this.$box = elt.$box;
    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }

    this.elt.on('click', this.ev_click);
    this.$box.on('close', this.ev_close);
}

MDSMBoxController.prototype.ev_click = function () {
    this.elt.isFocus = true;
};

MDSMBoxController.prototype.ev_close = function () {
    this.elt.isFocus = false;
};


MDSMBoxController.prototype.onFocus = function (){
    this.$box.addTo(document.body);
    this.$box.viewToSelected();
    this.$box.focus();
    this.elt.off('click', this.ev_click);
};



MDSMBoxController.prototype.onBlur = function (){
    this.$box.remove();
    this.$box.resetSearchState();
    setTimeout(()=>{
        this.elt.on('click', this.ev_click);
    }, 50);
};

export default MDSMBoxController;