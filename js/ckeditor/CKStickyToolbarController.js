import { $ } from "../../ACore";
import { traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";

function CKStickyToolbarController(holderElt) {
    this.editor = holderElt.editor;
    this.$elt = this.editor.container.$;
    this.activated = false;
    this['onScroll'] = this.onScroll.bind(this);
    this.trackedScroller = [];
}

CKStickyToolbarController.prototype.start = function () {
    if (this.activated) return;
    var c = this.$elt.parentElement;
    while (c) {
        c.addEventListener('scroll', this.onScroll);
        c = c.parentElement;
    }
};


CKStickyToolbarController.prototype.stop = function () {
    if (!this.activated) return;
    while (this.trackedScroller.length > 0) {
        this.trackedScroller.pop().removeEventListener('scroll', this.onScroll);
    }
};

CKStickyToolbarController.prototype.onScroll = function (event) {
    if (!AElement.prototype.isDescendantOf.call(this.$elt, document.body)) {
        this.stop();
        return;
    }
    this.$toolbar = this.$toolbar || $('.cke_top', this.$elt);
    if (!this.$toolbar) return;

    var oBound = traceOutBoundingClientRect(this.$elt.parentElement);
    var bound = this.$elt.getBoundingClientRect();
    var tBound = this.$toolbar.getBoundingClientRect();
    if (bound.top < oBound.top && oBound.top + tBound.height + 30 < bound.bottom) {
        this.$toolbar.addStyle('transform', 'translate(0, ' + ((oBound.top - bound.top)) + 'px)');
    }
    else {
        this.$toolbar.removeStyle('transform');
    }
};

export default CKStickyToolbarController;


