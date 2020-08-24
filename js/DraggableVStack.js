import ACore from "../ACore";
import '../css/draggablestack.css';
import Dom from "absol/src/HTML5/Dom";
import Hanger from "./Hanger";
import {absCeil} from "./utils";
import {randomIdent} from "absol/src/String/stringGenerate";
import Vec2 from "absol/src/Math/Vec2";
import PositionTracker from "./PositionTracker";
import Rectangle from "absol/src/Math/Rectangle";

var _ = ACore._;
var $ = ACore.$;


/***
 * @augments Hanger
 * @augments PositionTracker
 * @constructor
 */
function DraggableVStack() {
    _({ tag: 'PositionTracker'.toLowerCase(), elt: this });
    this.$cloneContainer = _('.absol-draggable-stack-clone-container');
    this.on('predrag', this.eventHandler.predrag)
        .on('dragstart', this.eventHandler.dragstart)
        .on('drag', this.eventHandler.drag)
        .on('dragend', this.eventHandler.dragend);
    this._state = 0;
    this.friends = [];
    this.$friends = [];
    this._privateDraggableVStackIdent = randomIdent(35);
    this._dragData = null;
    this.on('positionchange', this.eventHandler.scroll);
}


DraggableVStack.tag = 'DraggableVStack'.toLowerCase();

DraggableVStack.render = function () {
    return _({
        tag: 'hanger',
        extendEvent: ['change', 'orderchange', 'itemleave', 'itementer'],
        class: ['absol-draggable-stack', 'absol-draggable-vstack']
    });
};

DraggableVStack.prototype._updateFriends = function () {
    var dict = {};
    dict[this._privateDraggableVStackIdent] = this;
    this.$friends = this.friends.reduce(function (ac, cr) {
        if (Dom.isDomNode(cr)) {
            if (cr._privateDraggableVStackIdent) {
                ac.result.push(cr);
                ac.dict[cr._privateDraggableVStackIdent] = cr;
            }
        }
        else if (typeof cr === 'string') {
            $(cr, false, function (elt) {
                if (elt._privateDraggableVStackIdent) {
                    if (!ac.dict[elt._privateDraggableVStackIdent]) {
                        ac.result.push(elt);
                        ac.dict[elt._privateDraggableVStackIdent] = elt;
                    }
                }
            })
        }
        return ac;
    }, { dict: dict, result: [] }).result;
};

DraggableVStack.prototype._findIndex = function (clientY) {
    var childBounds = Array.prototype.map.call(this.childNodes, function (elt) {
        return elt.getBoundingClientRect()
    });
    var childTops = childBounds.map(function (b) {
        return b.top;
    });
    childTops.push((childBounds[childBounds.length - 1] || this.getBoundingClientRect()).bottom);
    var nearestIdx = 0;
    var nearestVal = 10000000;
    var val;
    for (var i = 0; i < childTops.length; ++i) {
        val = Math.abs(clientY - childTops[i]);
        if (val < nearestVal) {
            nearestVal = val;
            nearestIdx = i;
        }
    }
    return nearestIdx;
};

/***
 *
 * @type {DraggableVStack|{}}
 */
DraggableVStack.eventHandler = {};
DraggableVStack.eventHandler.predrag = function (event) {
    var dragzone = this._findDragzone(event.target);
    if (!dragzone) {
        event.cancel();
    }
};

DraggableVStack.eventHandler.dragstart = function (event) {
    this.startTrackPosition();
    event.preventDefault();
    this._updateFriends();
    this._state = 1;
    this.addClass('as-state-drag');

    this._dragData = {
        mouseStartPos: new Vec2(event.clientX, event.clientY),
        elt: this._findDirectChild(event.target),
        rootBound: this.getBoundingClientRect(),
        dest: this
    };
    this._dragData.mouseCurrentPos = this._dragData.mouseStartPos;
    this._updateDestChildrenBound();
    this._dragData.idx = Array.prototype.indexOf.call(this.childNodes, this._dragData.elt);

    this._dragData.eltBound = this._dragData.destChildBounds[this._dragData.idx];
    this._dragData.offsetPos = this._dragData.mouseStartPos.sub(new Vec2(this._dragData.eltBound.left, this._dragData.eltBound.top));
    this._dragData.eltRelative = new Vec2(this._dragData.eltBound.left, this._dragData.eltBound.top).sub(new Vec2(this._dragData.rootBound.left, this._dragData.rootBound.top));

    this.$cloneContainer.addTo(document.body);
    this.$cloneContainer.clearChild().addChild($(this._dragData.elt.cloneNode(true)).addStyle({
        boxSizing: 'border-box',
        width: this._dragData.eltBound.width + 'px',
        height: this._dragData.eltBound.height + 'px'
    }));
    this.$cloneContainer.addStyle({
        left: this._dragData.eltBound.left + 'px',
        top: this._dragData.eltBound.top + 'px',
    });
    this._dragData.elt.addClass('dragging');
};


DraggableVStack.eventHandler.drag = function (event) {
    event.preventDefault();
    this._dragData.mouseCurrentPos = new Vec2(event.clientX, event.clientY);
    this._updateHoverDest();
    this._updateDraggingPosition();
};

DraggableVStack.prototype.getClientY = function () {
    var top = 1000000;
    var bottom = -10000000;
    var child;
    var childBound;
    for (var i = 0; i < this.childNodes.length; ++i) {
        child = this.childNodes[i];
        if (child === this.$cloneContainer) continue;
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
        var overflowStyle = window.getComputedStyle(scroller)['overflow'];
        if ((overflowStyle === 'auto' || overflowStyle === 'scroll' || scroller.tagName === 'HTML') && (scroller.clientHeight < scroller.scrollHeight)) break;
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
    this.stopTrackPosition();
    event.preventDefault();
    this._dragData.dest.removeClass('as-state-drag');
    this.$cloneContainer.remove();
    this._dragData.elt.removeClass('dragging');
    this.removeClass('as-state-no-change');
    this._state = 0;
    var beforeElt;
    if (this._dragData.dest === this) {
        if (this._dragData.idx === this._dragData.destIdx || (this._dragData.idx + 1 === this._dragData.destIdx)) {
            //todo
        }
        else {
            if (this._dragData.destIdx === this.childNodes.length) {
                this._dragData.elt.remove();
                this.addChild(this._dragData.elt);
                this.emit('change', {
                    type: 'change',
                    fromStack: this,
                    toStack: this,
                    elt: this._dragData.elt,
                    sourceIndex: this._dragData.idx,
                    destIndex: this.childNodes.length,
                    oldIdx: this._dragData.idx,
                    newIdx: this.childNodes.length - 1,
                    desc: "Move element to end of stack."
                }, this);
                this.emit('orderchange', {
                    type: 'orderchange',
                    fromStack: this,
                    toStack: this,
                    elt: this._dragData.elt,
                    oldIdx: this._dragData.idx,
                    newIdx: this.childNodes.length - 1,
                    desc: "Move element to end of stack."
                }, this);
            }
            else {
                beforeElt = this.childNodes[this._dragData.destIdx];
                this._dragData.elt.remove();
                this.addChildBefore(this._dragData.elt, beforeElt);
                this.emit('change', {
                    type: 'change',
                    fromStack: this,
                    toStack: this,
                    elt: this._dragData.elt,
                    sourceIndex: this._dragData.idx,
                    destIndex: this._dragData.destIdx,
                    oldIdx: this._dragData.idx,
                    newIdx: this._dragData.destIdx > this._dragData.idx ? this._dragData.destIdx - 1 : this._dragData.destIdx,
                    desc: "Move element to before  this.childNodes[" + this._dragData.destIdx + "]"
                }, this);
                this.emit('orderchange', {
                    type: 'orderchange',
                    fromStack: this,
                    toStack: this,
                    elt: this._dragData.elt,
                    oldIdx: this._dragData.idx,
                    newIdx: this._dragData.destIdx > this._dragData.idx ? this._dragData.destIdx - 1 : this._dragData.destIdx,
                    desc: "Move element to before  this.childNodes[" + this._dragData.destIdx + "]"
                }, this);
            }
        }
    }
    else {
        if (this._dragData.destIdx === this._dragData.dest.childNodes.length) {
            this.emit('orderchange', {
                type: 'itemleave',
                fromStack: this,
                toStack: this._dragData.dest,
                oldIdx: this._dragData.idx,
                newIdx: this.childNodes.length - 1,
                desc: "Move element to end of friend stack."
            }, this);
            this._dragData.elt.remove();
            this._dragData.dest.addChild(this._dragData.elt);
            this._dragData.dest.emit('orderchange', {
                type: 'itementer',
                fromStack: this,
                toStack: this._dragData.dest,
                oldIdx: this._dragData.idx,
                newIdx: this.childNodes.length - 1,
                desc: "Move element to end of friend stack."
            }, this._dragData.dest);
            this.emit('change', {
                type: 'change',
                fromStack: this,
                toStack: this._dragData.dest,
                elt: this._dragData.elt,
                sourceIndex: this._dragData.idx,
                destIndex: this.childNodes.length,
                oldIdx: this._dragData.idx,
                newIdx: this.childNodes.length - 1,
                desc: "Move element to end of friend stack."
            });
        }
        else {
            beforeElt = this._dragData.dest.childNodes[this._dragData.destIdx];
            this._dragData.elt.remove();
            this.emit('itemleave', {
                type: 'itemleave',
                fromStack: this,
                toStack: this._dragData.dest,
                elt: this._dragData.elt,
                oldIdx: this._dragData.idx,
                newIdx: this._dragData.destIdx,
                desc: "Move element to before friend.childNodes[" + this._dragData.destIdx + "]"
            }, this);
            this._dragData.dest.addChildBefore(this._dragData.elt, beforeElt);
            this._dragData.dest.emit('itementer', {
                type: 'itementer',
                fromStack: this,
                toStack: this._dragData.dest,
                elt: this._dragData.elt,
                oldIdx: this._dragData.idx,
                newIdx: this._dragData.destIdx,
                desc: "Move element to before friend.childNodes[" + this._dragData.destIdx + "]"
            }, this._dragData.dest);
            this.emit('change', {
                type: 'change',
                fromStack: this,
                toStack: this._dragData.dest,
                elt: this._dragData.elt,
                sourceIndex: this._dragData.idx,
                destIndex: this._dragData.destIdx,
                oldIdx: this._dragData.idx,
                newIdx: this._dragData.destIdx,
                desc: "Move element to before friend.childNodes[" + this._dragData.destIdx + "]"
            }, this);
        }
    }
};


DraggableVStack.prototype._updateDestChildrenBound = function () {

    var top0 = this._dragData.dest.getBoundingClientRect().top;
    this._dragData.destChildBounds = Array.prototype.map.call(this._dragData.dest.childNodes, function (elt) {
        return elt.getBoundingClientRect()
    });
    this._dragData.destChildTops = this._dragData.destChildBounds.map(function (bound) {
        return bound.top - top0;
    }).concat([(this._dragData.destChildBounds[this._dragData.destChildBounds.length - 1] || this.getBoundingClientRect()).bottom - top0]);
}


DraggableVStack.eventHandler.friendDragStart = function (event) {

};

DraggableVStack.eventHandler.friendDragEnd = function () {

};

DraggableVStack.prototype._updateHoverDest = function () {
    var bound;
    var newDest;
    var friendElt;
    var friendList = this.$friends.concat([this]);
    var top0;
    for (var i = 0; i < friendList.length; ++i) {
        friendElt = friendList[i];
        bound = Rectangle.fromClientRect(friendElt.getBoundingClientRect());
        if (bound.containsPoint(this._dragData.mouseCurrentPos)) {
            top0 = bound.y;
            newDest = friendElt;
            break;
        }
    }

    if (newDest && this._dragData.dest !== newDest) {
        this._dragData.dest.removeClass('as-state-drag');
        this._dragData.dest = newDest;
        this._dragData.dest.addClass('as-state-drag');
        this._dragData.dest.addStyle('--dest-y', 'unset');
        this._updateDestChildrenBound();
    }
};

DraggableVStack.prototype._updateDraggingPosition = function () {
    var bound = this.getBoundingClientRect();
    var clonePos = this._dragData.mouseCurrentPos.sub(this._dragData.offsetPos);

    this.$cloneContainer.addStyle({
        top: clonePos.y + 'px',
        left: bound.left + 'px'
    });

    this._dragData.destIdx = this._dragData.dest._findIndex(clonePos.y + this._dragData.eltBound.height / 2);
    this._dragData.dest.addStyle('--dest-y', this._dragData.destChildTops[this._dragData.destIdx] + 'px');
    if (this._dragData.dest === this) {
        if (this._dragData.idx === this._dragData.destIdx || (this._dragData.idx + 1 === this._dragData.destIdx)) {
            this.addClass('as-state-no-change');
        }
        else {
            this.removeClass('as-state-no-change');
        }
    }
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

DraggableVStack.property = {};

DraggableVStack.property.friends = {
    set: function (value) {
        if (!(value instanceof Array)) value = [value];
        this._friends = value;
    },
    get: function () {
        return this._friends;
    }
};

ACore.install(DraggableVStack);

export default DraggableVStack;