import '../css/variantcolors.css';
import Dom from "absol/src/HTML5/Dom";

function VariantColor() {
    this.keys = ['primary', 'secondary',
        'success', 'info',
        'warning', 'error', 'danger',
        'light', 'dark',
        'link',
        'note'];
    this.base = {
        primary: "#007bff",
        secondary: "#6c757d",
        success: "#28a745",
         info: "#17a2b8",
        warning: "#ffc107",
        error: "#ff4052",
        danger: "#dc3545",
        light: "#f8f9fa",
        dark: "#343a40",
        link: "#007bff",
        note: '#ffff88'
    };
    this.mediumContract = {
        primary: '#e2edd5',
        secondary: '#fca75b',
        success: '#fce8e8',
        info: '#fcf5e8',
        warning: '#5e5a75',
        error: '#e0dfce',
        danger: "#e5e8d5",
        light: '#7a5b3c',
        dark: "#bf7d3b",
        link: "#dde8c9",
        note: '#1e1ec8'
    }
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
    this.mediumContract = this.keys.reduce(function (ac, name) {
        var style = window.getComputedStyle(document.body);
        ac[name] = style.getPropertyValue('--variant-medium-contract-color-' + name);
        return ac;
    }, {});
};

export default new VariantColor();