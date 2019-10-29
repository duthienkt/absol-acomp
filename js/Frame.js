import Acore from "../ACore"
import { randomIdent } from "absol/src/String/stringGenerate";

var _ = Acore._;
var $ = Acore.$;

function Frame() {
    var res = _({
        class: 'absol-frame',
        attr:{
            id:randomIdent(12),
        },
        extendEvent: ['attached', 'detached']
    });
    res.$parent = null;// FrameView or TabView
    return res;
}


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


Acore.install('frame', Frame);