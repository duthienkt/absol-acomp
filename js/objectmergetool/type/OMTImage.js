import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import OMTFile from "./OMTFile";
import { fileInfoOf } from "../../utils";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTImage() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTImage, OMTBaseType);

OMTBaseType.classes.image = OMTImage;
OMTBaseType.prototype.type = 'image';

OMTImage.prototype.assign = function (o) {
    this.value = o;
    var title = '';
    this.$body.clearChild();
    var handle = (val) => {
        if (!val) return;
        if (val && val.then) {
            val.then(handle);
            return;
        }
        if (val && val.url) {
            handle(val.url);
            return;
        }
        if ((val instanceof File) || (val instanceof Blob)) {
            val.url = val.url || URL.createObjectURL(val);
            if (!title && val.filename) title = val.filename;
            handle(val);
            return;
        }

        if (!title) title = val.split('/').pop().split('?').shift();


        this.$value = _({
            tag: 'img',
            class: 'as-omt-field-value',
            props: {
                src: val,
                title: title
            }
        });
        this.$body.addChild(this.$value);
    }
    handle(o);
};


OMTImage.prototype.getRaw = OMTFile.prototype.getRaw;

export default OMTImage;