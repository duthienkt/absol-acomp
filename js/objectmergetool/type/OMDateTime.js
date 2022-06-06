import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import {_} from "../../../ACore";
import CheckboxInput from "../../CheckBoxInput";
import DateTimeInput from "../../DateTimeInput";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTDateTime() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTDateTime, OMTBaseType);

OMTBaseType.classes.datetime = OMTDateTime;
OMTDateTime.prototype.type = 'datetime';

OMTDateTime.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: DateTimeInput.tag,
        class: 'as-border-none',
        props: {
            readOnly: true
        }
    });

    this.$body.addChild(this.$value);
};

OMTDateTime.prototype.assign = function (o) {
    this.value = o;
    this.$value.value = o;
};

OMTDateTime.prototype.getRaw = function () {
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

export default OMTDateTime;