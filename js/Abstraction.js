import Attributes from "absol/src/AppPattern/Attributes";
import AElement from "absol/src/HTML5/AElement";
import { kebabCaseToCamelCase } from "absol/src/String/stringFormat";

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
        if (value === 'default') value = 'regular';
        if (['v0', 'small', 'regular', 'large'].indexOf(value) < 0) {
            value = 'regular';
        }
        this.attr('data-size', value);
        return value;
    }
};

AbstractStyleExtended.prototype.addStyle = function (name, value) {
    var kbName;
    if (typeof name === 'string') {
        kbName = kebabCaseToCamelCase(name);
        if (this.styleHandlers[name])
            name = kbName;
    }
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