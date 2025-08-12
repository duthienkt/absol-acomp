import ACore from "../ACore";
import LinearColorBar from "./LinearColorBar";


/**
 * @extends AElement
 * @constructor
 */
function LinearBackground() {
    this.addClass('as-linear-background');
    /**
     * @type {string}
     * @name colorMapping
     * @memberOf LinearBackground#
     */
    this.colorMapping = 'performance';

    /**
     * @type {number}
     * @name value
     * @memberOf LinearBackground#
     */
}


LinearBackground.tag = 'linearbackground';

LinearBackground.render = function() {
    return _({tag: 'div'});
};

LinearBackground.prototype.BUILDIN_COLORS_RANGE = LinearColorBar.prototype.BUILDIN_COLORS_RANGE;


LinearBackground.prototype._updateColor = function () {
    var value = this.value;
    var colorMapping = this.colorMapping;
    var i = 0;
    while (i < colorMapping.length) {
        if (i + 1 === colorMapping.length || colorMapping[i + 1].value > value) break;
        ++i;
    }
    this.addStyle('--background-color', colorMapping[i].color + '');
};

LinearBackground.property = {};

LinearBackground.property.value = {
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


LinearBackground.property.colorMapping = {
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

ACore.install(LinearBackground);

export default LinearBackground;