import Color from "absol/src/Color/Color";

/**
 *
 * @param {AElement|HTMLElement} elt
 * @constructor
 */
function ExtendComputedStyle(elt) {
    this.elt = elt;
    this.cpStyle = null;
}

ExtendComputedStyle.prototype.load = function () {
    this.cpStyle = getComputedStyle(document.body);
};

ExtendComputedStyle.prototype.getRaw = function (key) {
    if (!this.cpStyle) this.load();
    return this.cpStyle.getPropertyValue(key);
};

/**
 *
 * @param {string} key
 * @param {Color=} fallbackValue
 * @returns {Color}
 */
ExtendComputedStyle.prototype.getColor = function (key, fallbackValue) {
    var value = this.getRaw(key);
    try {
        return Color.parse(value)
    } catch (e) {
        return fallbackValue;
    }
};

/**
 *
 * @param {number=} fallbackValue
 * @returns {number}
 */
ExtendComputedStyle.prototype.getFontSize = function (fallbackValue) {
    var value = this.getRaw('font-size');
    if ((typeof value === "string") && value.endsWith('px')) {
        return parseFloat(value.replace('px', ''));
    }
    else return fallbackValue;
};

/**
 *
 * @param {string} key
 * @param {number=} fallbackValue
 * @returns {number}
 */
ExtendComputedStyle.prototype.getPx = function (key, fallbackValue) {
    var value = this.getRaw(key);
    if ((typeof value === "string")) {
        if (value.endsWith('px')) {
            return parseFloat(value.replace('px', ''));
        }
        else if (value.endsWith('em')) {
            return parseFloat(value.replace('em', '')) * this.getFontSize(14);
        }
    }
    else {
        return fallbackValue;
    }
};


/**
 *
 * @param {string} key
 * @param {number=} fallbackValue
 * @returns {number}
 */
ExtendComputedStyle.prototype.getEm = function (key, fallbackValue) {
    var value = this.getRaw(key);
    if ((typeof value === "string")) {
        if (value.endsWith('px')) {
            return parseFloat(value.replace('px', '')) / this.getFontSize(14);
        }
        else if (value.endsWith('em')) {
            return parseFloat(value.replace('em', ''));
        }
    }
    else {
        return fallbackValue;
    }
};


export default ExtendComputedStyle;

var bodyECpStyle = null;
export function getBodyComputedStyleRawValue(key) {
    if (!bodyECpStyle) bodyECpStyle = new ExtendComputedStyle(document.body);
    return bodyECpStyle.getRaw(key);
}

export function getBodyComputedStyleColorValue(key, fallbackValue) {
    if (!bodyECpStyle) bodyECpStyle = new ExtendComputedStyle(document.body);
    return bodyECpStyle.getColor(key, fallbackValue);
}


export function getBodyComputedStylePxValue(key, fallbackValue) {
    if (!bodyECpStyle) bodyECpStyle = new ExtendComputedStyle(document.body);
    return bodyECpStyle.getPx(key, fallbackValue);
}


export function getBodyComputedStyleEmValue(key, fallbackValue) {
    if (!bodyECpStyle) bodyECpStyle = new ExtendComputedStyle(document.body);
    return bodyECpStyle.getEm(key, fallbackValue);
}
