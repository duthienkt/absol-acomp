import Attributes from "absol/src/AppPattern/Attributes";
import AElement from "absol/src/HTML5/AElement";
import { kebabCaseToCamelCase } from "absol/src/String/stringFormat";
import { mixClass } from "absol/src/HTML5/OOP";

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
        if (this.styleHandlers[kbName])
            name = kbName;
    }
    if (this.styleHandlers[name]) {
        this.extendStyle[name] = value;
    }
    else AElement.prototype.addStyle.apply(this, arguments);
    return this;
};

AbstractStyleExtended.prototype.removeStyle = function (name) {
    var kbName;
    if (typeof name === 'string') {
        kbName = kebabCaseToCamelCase(name);
        if (this.styleHandlers[kbName])
            name = kbName;
    }
    if (this.styleHandlers[name]) {
        this.extendStyle[name] = null;
    }
    else AElement.prototype.removeStyle.apply(this, arguments);
    return this;
};

/**
 * @augments AbstractStyleExtended
 * @constructor
 */
export function AbstractInput() {
    AbstractStyleExtended.call(this);
    /**
     * true: default; borderless: no border, no padding, false: normal
     * @type {"borderless"|boolean}
     * @name outputMode
     * @memberOf AbstractInput#
     */
}

AbstractInput.property = {};

AbstractInput.property.outputMode = {
    set: function (value) {
        if (value === 'borderless') {
            this.addClass('as-border-none');
            this.removeClass('as-background-none');

        }
        else if (value === "true" || value === true) {
            this.removeClass('as-border-none');
            this.addClass('as-background-none');
        }
        else if (value === 'default') {
            this.removeClass('as-background-none');
            this.removeClass('as-border-none');
        }
        else {
            value = false;
        }
        this.readOnly = !!value;
        this._outputMode = value;
    },
    get: function () {
        if (this.readOnly) {
            return this._outputMode || 'default';
        }
        else {
            return false;
        }
    }
};


mixClass(AbstractInput, AbstractStyleExtended);