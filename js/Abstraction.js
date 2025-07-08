import Attributes from "absol/src/AppPattern/Attributes";
import AElement from "absol/src/HTML5/AElement";

/**
 * @extends AElement
 * @constructor
 */
export function AbstractStyleExtended() {
    if (!this.extendStyle || !(this.extendStyle.loadAttributeHandlers)) {
        this.extendStyle = Object.assign(new Attributes(this), this.extendStyle || {});
        this.extendStyle.loadAttributeHandlers(this.styleHandlers || {});
    }
}

AbstractStyleExtended.prototype.extendStyle = {
    size: 'v0'
};

AbstractStyleExtended.prototype.styleHandlers = {};
AbstractStyleExtended.prototype.styleHandlers.size = {
    /**
     * @this {AbstractStyleExtended}
     * @param value
     */
    set: function (value) {
        if (['v0', 'small', 'regular', 'large'].indexOf(value) < 0) {
            value = 'regular';
        }
        this.attr('data-size', value);
        return value;
    }
};

AbstractStyleExtended.prototype.addStyle = function (name, value) {
    if (this.styleHandlers[name]) {
        this.extendStyle[name] = value;
    }
    else AElement.prototype.addStyle.apply(this, arguments);
    return this;
};

AbstractStyleExtended.prototype.removeStyle = function (name) {
    if (this.styleHandlers[name]) {
        this.extendStyle[name] = null;
    }
    else AElement.prototype.addStyle.apply(this, arguments);
    return this;
};