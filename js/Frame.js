import '../css/frame.css';
import ACore from "../ACore"
import {randomIdent} from "absol/src/String/stringGenerate";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function Frame() {
    this.$parent = null;// FrameView or TabView
}

Frame.tag = 'frame';

Frame.render = function () {
    return _({
        class: 'absol-frame',
        attr: {
            id: randomIdent(12),
        },
        extendEvent: ['attached', 'detached', 'deactive', 'active']// deactive and active event will be send by parent
    });
};


Frame.prototype.notifyAttached = function (parentElt) {
    this.$parent = parentElt;
    this.emit('attached', { type: 'attached', target: this, parentElt: parentElt }, this);
};

Frame.prototype.notifyDetached = function () {
    this.emit('detached', { type: 'detached', target: this, parentElt: this.$parent }, this);
    this.$parent = undefined;
};


Frame.prototype.selfRemove = function () {
    if (this.$parent)
        this.$parent.removeChild(this);
    else
        this.super();// normal remove
};

Frame.prototype.getParent = function () {
    return this.$parent;
};


Frame.prototype.requestActive = function () {
    if (this.$parent) {
        this.$parent.activeFrame(this);
    }
};

ACore.install(Frame);

export default Frame;