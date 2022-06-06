import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import {_} from "../../../ACore";
import OMTFile from "./OMTFile";
import Color from "absol/src/Color/Color";
import CheckboxInput from "../../CheckBoxInput";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTBool() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTBool, OMTBaseType);

OMTBaseType.classes.bool = OMTBool;
OMTBool.prototype.type = 'bool';

OMTBool.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: CheckboxInput,
        props: {
            readOnly: true
        }
    });

    this.$body.addChild(this.$value);
};

OMTBool.prototype.assign = function (o) {
    this.value = o;
    this.$value.checked = !!o;

};


export default OMTBool;