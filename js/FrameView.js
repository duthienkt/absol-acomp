import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

function FrameView() {
    var res = _({
        class: 'absol-frame-view',
        extendEvent: ['activeframe', 'deactiveframe']

    });

    res.$containers = [];
    return res;

}

FrameView.prototype.addChild = function (elt) {
    if (elt.containsClass && elt.containsClass('absol-frame')) {
        elt.selfRemove();
        var containerElt = _({
            class: 'absol-frame-view-frame-container',
            child: elt,
            props: {
                __elt__: elt
            }
        });
        this.$containers.push(containerElt);
        this.appendChild(containerElt);
        elt.notifyAttached(this);
    }
    else {
        throw new Error('Children must be a frame');
    }
};


FrameView.prototype.addChildBefore = function (elt, at) {
    if (elt.containsClass && elt.containsClass('absol-frame')) {
        elt.selfRemove();
        var index = this.childIndexOf(at);
        if (index < 0) {
            throw new Error('Second param is not a child');
        }
        var index = this.childIndexOf(at);
        var atCtnElt = this.$containers[index];
        var containerElt = _({
            class: 'absol-frame-view-frame-container',
            child: elt,
            props: {
                __elt__: elt
            }
        });
        this.$containers.splice(index, 0, containerElt);
        this.super(containerElt, atCtnElt);
        elt.notifyAttached(this);
    }
    else {
        throw new Error('Children must be a frame');
    }
};


FrameView.prototype.addChildAfter = function (elt, at) {
    if (elt.containsClass && elt.containsClass('absol-frame')) {
        elt.selfRemove();
        var index = this.childIndexOf(at);
        if (index < 0) {
            throw new Error('Second param is not a child');
        }
        var index = this.childIndexOf(at);
        var atCtnElt = this.$containers[index];
        var containerElt = _({
            class: 'absol-frame-view-frame-container',
            child: elt,
            props: {
                __elt__: elt
            }
        });
        this.$containers.splice(index + 1, 0, containerElt);
        this.super(containerElt, atCtnElt);
        elt.notifyAttached(this);
    }
    else {
        throw new Error('Children must be a frame');
    }
};

FrameView.prototype.removeChild = function (elt) {
    var ctnEltIndex = this.childIndexOf(elt)
    if (ctnEltIndex >= 0) {
        var ctnElt = this.$containers[ctnEltIndex];
        this.$containers.splice(ctnEltIndex, 1);
        this.super(ctnElt);
    }
    else {
        throw new Error('Removed element is not a child!');
    }
};


FrameView.prototype.childIndexOf = function (elt) {
    for (var i = 0; i < this.$containers.length; ++i) {
        if (this.$containers[i].__elt__ == elt) return i;
    }
    return -1;
};


FrameView.prototype.findChildBefore = function (elt) {
    var eltIndex = this.childIndexOf(elt);
    if (eltIndex < 0) return -1;
    return this.$containers[eltIndex - 1];
};


FrameView.prototype.findChildAfter = function (elt) {
    var eltIndex = this.childIndexOf(elt);
    if (eltIndex < 0) return -1;
    return this.$containers[eltIndex + 1];
};



FrameView.prototype.clearChild = function () {
    while (this.$containers.length > 0) {
        this.removeChild(this.$containers[0].__elt__);
    }
    return this;
};


FrameView.prototype.findChildById = function (id) {
    var elt;
    for (var i = 0; i < this.$containers.length; ++i) {
        elt = this.$containers[i].__elt__;
        if (elt.getAttribute('id') == id) return elt;
    }
    return undefined;
};

FrameView.prototype.getAllChild = function () {
    return this.$containers.map(function (ctnElt) {
        return ctnElt.__elt__;
    });
};

FrameView.prototype.activeFrame = function (frameElt) {
    var ctnElt, elt;
    for (var i = 0; i < this.$containers.length; ++i) {
        ctnElt = this.$containers[i];
        elt = ctnElt.__elt__;
        if (frameElt == elt) {
            if (!ctnElt.containsClass('absol-active')) {
                ctnElt.addClass('absol-active');
                this.notifyActiveFrame(elt);
            }
            // else do nothing
        }
        else {
            if (ctnElt.containsClass('absol-active')) {
                ctnElt.removeClass('absol-active');
                this.notifyDeactiveFrame(elt);
            }
            // else do nonthing
        }
    }
    return this;
};


FrameView.prototype.notifyActiveFrame = function (frameElt, originEvent) {
    frameElt.emit('active', {target:frameElt, type:'active', originEvent: originEvent});
    this.emit('activeframe', { type: 'activeframe', target: this, frameElt: frameElt, originEvent: originEvent }, this);
};

FrameView.prototype.notifyDeactiveFrame = function (frameElt, originEvent) {
    this.emit('deactiveframe', { type: 'deactiveframe', target: this, frameElt: frameElt, originEvent: originEvent }, this);
};

FrameView.prototype.activeFrameById = function (id) {
    var frameElt = this.findChildById(id);
    if (frameElt)
        this.activeFrame(frameElt);
    return this;
};


Acore.install('frameview', FrameView);

export default FrameView;