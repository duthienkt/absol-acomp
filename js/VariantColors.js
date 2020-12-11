import '../css/variantcolors.css';
import Dom from "absol/src/HTML5/Dom";

function VariantColor() {
    this.keys = ['primary', 'secondary',
        'success', 'info',
        'warning', 'error', 'danger',
        'light', 'dark',
        'link'];
    this.base = {
        primary: " #007bff",
        secondary: " #6c757d",
        success: " #28a745",
        info: " #17a2b8",
        warning: " #ffc107",
        error: " #ff4052",
        danger: " #dc3545",
        light: " #f8f9fa",
        dark: " #343a40",
        link: " #007bff"
    };
    Dom.documentReady.then(this.loadFromCss.bind(this));
}

VariantColor.prototype.has = function (name) {
    return this.keys.indexOf(name) >= 0;
};

VariantColor.prototype.loadFromCss = function () {
    this.base = this.keys.reduce(function (ac, name) {
        var style = window.getComputedStyle(document.body);
        ac[name] = style.getPropertyValue('--variant-color-' + name);
        return ac;
    }, {});
};

export default new VariantColor();