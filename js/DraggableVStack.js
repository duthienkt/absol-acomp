import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";

var _ = Acore._;
var $ = Acore.$;

function DraggableVStack() {
    var res = _({
        class: 'absol-draggable-vstack'
    });

    res.eventHandler = OOP.bindFunctions(res, DraggableVStack.eventHandler);

    res.on('mousedown', res.eventHandler.mouseDown);

    return res;
}




DraggableVStack.eventHandler = {};
DraggableVStack.eventHandler.mouseDown = function (event) {
    var dragzone = this._findDragzone(event.target);
    if (dragzone) {
        var container = this._findDirectChild(event.target);
        this.$moving = container;
        $(document.body).on('mousemove', this.eventHandler.mouseMove);
        $(document.body).on('mouseleave', this.eventHandler.mouseFinish);
        $(document.body).on('mouseup', this.eventHandler.mouseFinish);

        this.$scrollTrackElements = [];
        var trackElt = this.parentElement;
        while (trackElt) {
            if (trackElt.addEventListener)
                trackElt.addEventListener('scroll', this.eventHandler.scroll, false);
            else
                trackElt.attachEvent('onscroll', this.eventHandler.scroll, false);

            this.$scrollTrackElements.push(trackElt);
            trackElt = trackElt.parentElement;
        }
        if (document.addEventListener) {
            document.addEventListener('scroll', this.eventHandler.scroll, false);
        }
        else {
            document.attachEvent('onscroll', this.eventHandler.scroll, false);
        }
        this.$scrollTrackElements.push(document);
    }
};


DraggableVStack.eventHandler.mouseMove = function (event) {
    console.log(event);

};


DraggableVStack.eventHandler.mouseFinish = function (event) {
    var self = this;
    $(document.body).off('mouseleave', this.eventHandler.mouseFinish);
    $(document.body).off('mouseup', this.eventHandler.mouseFinish);
    $(document.body).off('mousemove', this.eventHandler.mouseMove);
    this.$scrollTrackElements.forEach(function (e) {
        if (e.removeEventListener)
            e.removeEventListener('scroll', self.eventHandler.scroll, false);
        else
            e.dettachEvent('onscroll', self.eventHandler.scroll, false);
    });
};

DraggableVStack.eventHandler.scroll = function (event) {
    console.log(event);

};

DraggableVStack.prototype.addChild = function (child) {
    var childContainer = _('.absol-draggable-vstack-child-container').addChild(child);
    this.super(childContainer);
    return this;
};

DraggableVStack.prototype.removeChild = function (child) {
    var childContainer = child.parentNode;
    if (childContainer && childContainer.classList.conatains('absol-draggable-vstack-child-container')) {
        this.super(childContainer);
    }
    return this;
};


DraggableVStack.prototype.findChildBefore = function (elt) {
    var childContainer = child.parentNode;
    if (childContainer && childContainer.classList.conatains('absol-draggable-vstack-child-container')) {
        return this.super(childContainer);
    }
};

DraggableVStack.prototype.findChildAfter = function (elt) {
    var childContainer = child.parentNode;
    if (childContainer && childContainer.classList.conatains('absol-draggable-vstack-child-container')) {
        return this.super(childContainer);
    }
};

DraggableVStack.prototype._findDragzone = function (elt) {
    while (elt && elt != this) {
        if (elt.classList && elt.classList.contains('drag-zone')) return elt;
        elt = elt.parentNode;
    }
    return undefined;
};

DraggableVStack.prototype._findDirectChild = function (elt) {
    while (elt && elt != this) {
        if (elt.parentNode == this) return elt;
        elt = elt.parentNode;
    }
    return undefined;
};

DraggableVStack.prototype._findChild = function (elt) {
    while (elt && elt != this) {
        if (elt.parentNode == this) return elt;
        elt = elt.parentNode;
    }
    return undefined;
};


Acore.install('DraggableVStack'.toLowerCase(), DraggableVStack);

export default DraggableVStack;

