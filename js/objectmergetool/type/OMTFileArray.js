import OMTBaseType from "./OMTBaseType";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../../ACore";
import FileListInput from "../../FileListInput";
import OMTArray from "./OMTArray";
import  { fileInfoOf, calcDTQueryHash } from "../../utils";

/***
 * @extends OMTBaseType
 * @constructor
 */
function OMTFileArray() {
    OMTBaseType.apply(this, arguments);
}


OOP.mixClass(OMTFileArray, OMTBaseType);

OMTBaseType.classes['file[]'] = OMTFileArray;
OMTFileArray.prototype.type = 'file[]';

OMTFileArray.prototype.commands = OMTArray.prototype.commands.slice();

OMTFileArray.prototype.render = function () {
    OMTBaseType.prototype.render.call(this);
    this.$value = _({
        tag: FileListInput.tag,
        class: ['as-omt-field-value', 'as-border-none'],
        props: {
            readOnly: true
        }
    });
    this.$body.addChild(this.$value);
};

OMTFileArray.prototype.assign = function (o) {
    this.value = o;
    if (o instanceof Array) {
        this.$value.files = o;
        this.$value.removeStyle('display');
    }
    else {
        this.$value.addStyle('display', 'none');
    }
};

OMTFileArray.prototype.getHash = function () {
    return calcDTQueryHash(this.value);
};


OMTFileArray.prototype.getRaw = function () {
    var infoArr = (this.value || []).map(it => fileInfoOf(it));
    return {
        child: [
            {
                tag: 'span',
                class: 'as-omt-field-name',
                child: { text: (this.descriptor.displayName || this.descriptor.name || "ROOT") + ': ' }
            },
            {
                style: { paddingLeft: '25px' },
                child: infoArr.map(info => ({
                    tag: 'a',
                    props: info.url ? { href: info.url, target: '_blank' } : {},
                    child: { text: info.name }
                }))
            }
        ]
    };
};

export default OMTFileArray;