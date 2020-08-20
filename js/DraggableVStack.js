import ACore from "../ACore";
import '../css/draggablestack.css';
import Dom from "absol/src/HTML5/Dom";
import Hanger from "./Hanger";
import {absCeil} from "./utils";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends Hanger
 * @constructor
 */
function DraggableVStack() {
    this.$cloneContainer = _('.absol-draggable-stack-clone-container');
    this.$destLine = _('.absol-draggable-stack-dest-line');
    this.on('predrag', this.eventHandler.predrag)
        .on('dragstart', this.eventHandler.dragstart)
        .on('drag', this.eventHandler.drag)
        .on('dragend', this.eventHandler.dragend);
    this._state = 0;
}

DraggableVStack.tag = 'DraggableVStack'.toLowerCase();

DraggableVStack.render = function () {
    return _({
        tag: 'hanger',
        extendEvent: 'change',
        class: ['absol-draggable-stack', 'absol-draggable-vstack']
    });
};

DraggableVStack.eventHandler = {};
DraggableVStack.eventHandler.predrag = function (event) {
    var dragzone = this._findDragzone(event.target);
    if (!dragzone) {
        event.cancel();
    }
};

DraggableVStack.eventHandler.dragstart = function (event) {
    event.preventDefault();
    this._state = 1;
    var self = this;
    //save mouse position, use it for other event
    this._mouseClientX = event.clientX;
    this._mouseClientY = event.clientY;

    var bound = this.getBoundingClientRect();
    var element = this._findDirectChild(event.target);
    element.classList.add('dragging');
    this.$draggingElt = element;

    this._draggingEltIndex = 0;
    this._childrentInfo = Array.prototype.map.call(this.childNodes, function (child, index) {
        var childBound = child.getBoundingClientRect();
        if (child == element) self._draggingEltIndex = index;
        return {
            index: index,
            elt: child,
            bound: childBound,
            top: childBound.top - bound.top
        }
    });


    this.$cloneContainer.addTo(this);
    this.$destLine.addTo(this);

    var containerBound = element.getBoundingClientRect();
    this._initBound = bound;
    this._currentBound = bound;

    this._initTop = containerBound.top - bound.top;
    this._crTop = this._initTop;
    this._initHeight = containerBound.height;
    this._pressX = event.clientX - containerBound.left;
    this._pressY = event.clientY - containerBound.top;
    this.$cloneContainer.addStyle({
        top: this._initTop + 'px',
        height: this._initHeight + 'px'
    }).addChild(element.cloneNode(true));

    this.$destLine.addStyle('top', this._initTop + 'px');

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
    this._updateDraggingPosition();
};


DraggableVStack.eventHandler.drag = function (event) {
    event.preventDefault();
    //save mouse position 
    this._mouseClientX = event.clientX;
    this._mouseClientY = event.clientY;
    this._updateDraggingPosition();
    this.eventHandler.dragOverflow(event);
};

DraggableVStack.prototype.getClientY = function () {
    var top = 1000000;
    var bottom = -10000000;
    var child;
    var childBound;
    for (var i = 0; i < this.childNodes.length; ++i) {
        child = this.childNodes[i];
        if (child === this.$cloneContainer || child === this.$destLine) continue;
        if (child.getBoundingClientRect) {
            childBound = child.getBoundingClientRect();
            top = Math.min(top, childBound.top);
            bottom = Math.max(bottom, childBound.bottom);
        }
    }
    return { top: top, bottom: bottom };
};

DraggableVStack.eventHandler.dragOverflow = function (event) {
    var scroller = this;
    while (scroller) {
        var overlowStyle = window.getComputedStyle(scroller)['overflow'];
        if ((overlowStyle === 'auto' || overlowStyle === 'scroll' || scroller.tagName === 'HTML') && (scroller.clientHeight < scroller.scrollHeight)) break;
        scroller = scroller.parentElement;
    }
    if (!scroller) return;
    var outBound = scroller.getBoundingClientRect();
    var bBound = this.$cloneContainer.getBoundingClientRect();
    var clientY = this.getClientY();
    bBound = {
        top: Math.max(clientY.top, bBound.top),
        bottom: Math.min(clientY.bottom, bBound.bottom)
    }
    var screenSize = Dom.getScreenSize();
    if (scroller.tagName !== "HTML") {
        outBound = {
            top: Math.max(outBound.top, 0),
            bottom: Math.min(outBound.bottom, screenSize.height)
        }
    }
    else {
        outBound = {
            top: 0,
            bottom: screenSize.height
        }
    }
    var vy = 0;
    if (bBound.top < outBound.top) {
        vy = bBound.top - outBound.top;
    }
    else if (bBound.bottom > outBound.bottom) {
        vy = bBound.bottom - outBound.bottom;
    }

    var dt = 1 / 30;
    if (vy !== 0) {
        var copyEvent = {
            type: event.type,
            preventDefault: function () {/* noop */
            },
            target: event.target
        };

        copyEvent.clientX = event.clientX;
        copyEvent.clientY = event.clientY

        var thisBT = this;

        setTimeout(function () {
            if (scroller.scrollHeight > scroller.clientHeight) {
                scroller.scrollTop += absCeil(vy * dt);
            }

            if (thisBT._state === 1) {
                thisBT.eventHandler.dragOverflow(copyEvent);
            }
        }, dt * 1000);
    }
};


DraggableVStack.eventHandler.scroll = function (event) {
    this._updateDraggingPosition();
};

DraggableVStack.eventHandler.dragend = function (event) {
    event.preventDefault();
    var self = this;
    this.$scrollTrackElements.forEach(function (e) {
        if (e.removeEventListener)
            e.removeEventListener('scroll', self.eventHandler.scroll, false);
        else
            e.dettachEvent('onscroll', self.eventHandler.scroll, false);
    });

    if ((this._draggingEltIndex == this._childrentInfo.length - 1 && !this._destRecord)
        || (this._destRecord && (this._destRecord.index == this._draggingEltIndex || this._destRecord.index == this._draggingEltIndex + 1))) {
        //nothing to change, view animation
        this.$cloneContainer.addClass('home-going');
        setTimeout(function () {
            self.$cloneContainer.addStyle({
                top: self._initTop + 'px'
            });
        }, 0);
        setTimeout(function () {
            self.$cloneContainer.clearChild().removeClass('home-going').remove();
            self.$destLine.removeStyle({ top: '' }).remove();
            self.$draggingElt.classList.remove('dragging');
            self.$draggingElt = undefined;
        }, 200);
    }
    else {
        this.$draggingElt.remove();
        this.$destLine.removeStyle({ top: '' }).remove();
        this.$cloneContainer.clearChild().remove();
        this.$draggingElt.classList.remove('dragging');
        if (this._destRecord) {
            this.addChildBefore(this.$draggingElt, this._destRecord.elt);
            this.emit('change', {
                type: 'change', target: this, action: "BEFORE", at: this._destRecord.elt,
                sourceIndex: this._draggingEltIndex, destIndex: this._destIndex, elt: this.$draggingElt
            }, this);
        }
        else {
            this.addChild(this.$draggingElt);
            this.emit('change', {
                type: 'change',
                target: this,
                action: "END",
                elt: this.$draggingElt,
                sourceIndex: this._draggingEltIndex
            }, this);
        }
    }
    this._state = 0;
};


DraggableVStack.prototype._updateDraggingPosition = function () {
    //update cloneContainer
    var bound = this.getBoundingClientRect();
    //style top of cloneContainer
    this._crTop = this._mouseClientY - bound.top - this._pressY;
    this.$cloneContainer.addStyle({
        top: this._crTop + 'px'
    });

    //update destLine
    var centerY = this._crTop + this._initHeight / 2;
    var nearestRecord;
    var nearestDistance = Math.abs(centerY - bound.height);//end of stack
    var cDist;
    var nearestIndex = this._childrentInfo.length;
    for (var i = 0; i < this._childrentInfo.length; ++i) {
        cDist = Math.abs(centerY - this._childrentInfo[i].top);
        if (cDist < nearestDistance) {
            nearestRecord = this._childrentInfo[i];
            nearestDistance = cDist;
            nearestIndex = i;
        }
    }
    if (nearestRecord) {
        this.$destLine.addStyle('top', nearestRecord.top + 'px');
    }
    else {
        this.$destLine.addStyle('top', bound.height + 'px');
    }
    if (nearestIndex == this._draggingEltIndex || nearestIndex == this._draggingEltIndex + 1) {
        this.$destLine.addStyle('visibility', 'hidden');
    }
    else {
        this.$destLine.removeStyle('visibility', 'hidden');

    }
    this._destRecord = nearestRecord;
    this._destIndex = nearestIndex;
    // setTimeout(this._autoScrollParentIfNeed.bind(this, 10), 33);
};


DraggableVStack.prototype._autoScrollParentIfNeed = function (delta) {
    //todo: choose which element should be scroll
    if (!(delta > 0)) delta = 10000;
    var bound = this.getBoundingClientRect();
    var cloneBound = this.$cloneContainer.getBoundingClientRect();
    var outBound = Dom.traceOutBoundingClientRect(this.$cloneContainer);
    if (outBound.bottom >= cloneBound.bottom && outBound.top <= cloneBound.top) return;
    var scrollables = [];
    var current = this;

    while (current) {
        var oy = window.getComputedStyle(current);
        oy = oy['overflow-y'] || oy['overflowY'];

        if (oy == 'auto' || oy == 'scroll') {
            scrollables.push(current);
        }
        current = current.parentElement;
    }
    scrollables.push(document.body.parentElement);

};

DraggableVStack.prototype._findDragzone = function (elt) {
    var result = null;
    while (elt && elt != this) {
        if (elt.classList && elt.classList.contains('drag-zone')) {
            result = elt;
            break;
        }
        elt = elt.parentNode;
    }

    if (result) {
        elt = result;
        while (elt && elt != this) {
            if (elt.classList && (elt.classList.contains('absol-draggable-stack'))) {
                result = null;
                break;
            }
            elt = elt.parentNode;
        }
    }

    return result;
};

DraggableVStack.prototype._findDirectChild = function (elt) {
    while (elt && elt != this) {
        if (elt.parentNode == this) return elt;
        elt = elt.parentNode;
    }
    return undefined;
};


ACore.install(DraggableVStack);

export default DraggableVStack;