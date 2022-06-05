import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import FileListItem from "../../FileListItem";
import { fileInfoOf } from "../../utils";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTFile() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTFile, OMTBaseType);

OMTBaseType.classes.file = OMTFile;
OMTBaseType.prototype.type = 'file';

OMTFile.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: FileListItem.tag,
        class: 'as-omt-field-value'
    });
    this.$body.addChild(this.$value);
};

OMTFile.prototype.assign = function (o) {
    this.value = o;
    if (o) {
        this.$value.value = o;
        this.$value.removeStyle('display');

    }
    else {
        this.$value.addStyle('display', 'none');
    }
};

OMTFile.prototype.getRaw = function () {
    var info = fileInfoOf(this.value);
    var href = info.url;
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                tag: 'a',
                props: { href: href, target:'_blank' },
                child: { text: info.name }
            }
        ]
    };
};

export default OMTFile;