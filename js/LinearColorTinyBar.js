import LinearColorBar from "./LinearColorBar";
import ACore, { _, $ } from "../ACore";
import { ShareSerializer } from "absol/src/Print/printer";
import Rectangle from "absol/src/Math/Rectangle";

/***
 * @extends {AElement}
 * @constructor
 */
function LinearColorTinyBar() {
    this._value = 0;
    this._colorMapping = 0;
    this._colorMapping = this.BUILDIN_COLORS_RANGE.rainbow;
    this.$textCtn = $('.as-linear-color-tiny-text', this);
    /***
     *
     * @type {Text}
     */
    this.$text = this.$textCtn.firstChild;
    /***
     * @type {string} valueText
     * @memberOf LinearColorTinyBar#
     * @name valueText
     */

    /***
     * @type {number}  from 0..1..Inf
     * @memberOf LinearColorTinyBar#
     * @name value
     */

    /***
     * @type {Array} - from 0..1..Inf
     * @memberOf LinearColorTinyBar#
     * @name colorMapping#
     */
}

LinearColorTinyBar.tag = 'LinearColorTinyBar'.toLowerCase();

LinearColorTinyBar.render = function () {
    return _({
        class: 'as-linear-color-tiny-bar',
        child: [
            {
                tag: 'span',
                class: 'as-linear-color-tiny-text',
                style: { display: 'none' },
                child: { text: '' }
            },
            '.as-linear-color-tiny-bar-rect',
        ]
    });
}


LinearColorTinyBar.prototype.BUILDIN_COLORS_RANGE = LinearColorBar.prototype.BUILDIN_COLORS_RANGE;

LinearColorTinyBar.prototype._updateColor = function () {
    var value = this._value;
    var colorMapping = this.colorMapping;
    var i = 0;
    while (i < colorMapping.length) {
        if (i + 1 == colorMapping.length || colorMapping[i + 1].value > value) break;
        ++i;
    }
    this.addStyle('--color', colorMapping[i].color + '');
};

LinearColorTinyBar.property = {};

LinearColorTinyBar.property.value = {
    set: function (value) {
        if (typeof value === "string") value = parseFloat(value);
        if (typeof value !== "number") value = 0;
        if (isNaN(value)) value = 0;
        this._value = Math.max(value, 0);
        this.addStyle('--value', this._value + '');
        this._updateColor();
    },
    get: function () {
        return this._value;
    }
};


LinearColorTinyBar.property.valueText = {
    set: function (value) {
        if (typeof value === "string" || typeof value ===  'number') {
            this.$text.data = value;
            this.$textCtn.removeStyle('display', 'none');
        }
        else {
            this.$text.data = '';
            this.$textCtn.addStyle('display', 'none');
        }
    },
    get: function () {
        return this.$text.data;
    }
};

LinearColorTinyBar.property.colorMapping = {
    set: function (value) {
        var ok = true;
        if (typeof value === 'string') {
            if (!(value in this.BUILDIN_COLORS_RANGE)) {
                value = 'rainbow'
            }
            value = this.BUILDIN_COLORS_RANGE[value];
        }
        else if (value instanceof Array) {
            ok = value.length > 1;
            if (!ok) {
                console.warn("colorMapping.length must > 1", value);
            }
        }
        else {
            console.warn("Invalid colorMapping", value);
        }
        if (!ok) value = this.BUILDIN_COLORS_RANGE.rainbow;
        this._colorMapping = value;
        this._updateColor();
    },
    get: function () {
        return this._colorMapping;
    }
};

ACore.install(LinearColorTinyBar);

export default LinearColorTinyBar;


ShareSerializer.addHandlerBefore({
    match: (elt, scope, stack) => {
        return elt.hasClass && elt.hasClass('as-linear-color-tiny-bar-rect');
    },
    exec: (printer, elt, scope, stack, accept) => {
        var bound = Rectangle.fromClientRect(elt.getBoundingClientRect());
        bound.x -= printer.O.x;
        bound.y -= printer.O.y;
        printer.rect(bound, {
            fill: elt.getComputedStyleValue('background-color')
        });
    }
}, '*')