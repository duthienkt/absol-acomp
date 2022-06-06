import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import {_} from "../../../ACore";
import OMTFile from "./OMTFile";
import Color from "absol/src/Color/Color";
import {stringHashCode} from "absol/src/String/stringUtils";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTColor() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTColor, OMTBaseType);

OMTBaseType.classes.color = OMTColor;
OMTColor.prototype.type = 'color';

OMTColor.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        class: "as-omt-field-color-value-bg",
        child: '.as-omt-field-color-value'
    });

    this.$body.addChild(this.$value);
};

OMTColor.prototype.assign = function (o) {
    this.value = o;
    var color = 'transparent';
    try {
        if (o instanceof Color) {
            color = o.toString("hex8");
        } else if (typeof o === "string") {
            color = Color.parse(o).toString("hex8");
        }
    } catch (err) {

    }
    this.color = color;
    this.$value.addStyle('--omt-color-value', color);
};


OMTColor.prototype.getHash = function () {
    return stringHashCode(this.color+'');
};


OMTColor.prototype.getRaw = function () {
    var color = Color.parse(this.color);
    return  {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                tag: 'span',
                style: {color: color.toString('hex6')},
                child: {
                    text: this.color
                }
            }
        ]
    }
};

export default OMTColor;