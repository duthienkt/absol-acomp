import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import {_} from "../../../ACore";
import CheckboxInput from "../../CheckBoxInput";
import DateTimeInput from "../../DateTimeInput";
import DateInput2 from "../../DateInput2";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTDate() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTDate, OMTBaseType);

OMTBaseType.classes.date = OMTDate;
OMTDate.prototype.type = 'date';

OMTDate.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: DateInput2.tag,
        class: 'as-border-none',
        props: {
            readOnly: true
        }
    });
    if (this.descriptor.format) this.$value.format = this.descriptor.format;
    this.$body.addChild(this.$value);
};

OMTDate.prototype.assign = function (o) {
    this.value = o;
    this.$value.value = o;
};

OMTDate.prototype.getRaw = function () {
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: {text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': '}
            },
            {
                tag: 'span',
                child: {
                    text: this.$value.text
                }
            }
        ]
    }
};

export default OMTDate;