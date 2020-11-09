import ACore from "../ACore";
import '../css/draggablestack.css';
import DraggableVStack from "./DraggableVStack";
import Vec2 from "absol/src/Math/Vec2";
import Rectangle from "absol/src/Math/Rectangle";
import PositionTracker from "./PositionTracker";

var _ = ACore._;
var $ = ACore.$;

/***
 * @augments DraggableVStack
 * @augments PositionTracker
 * @constructor
 */
function DraggableHStack() {
    this._dragData = null;
    this.$cloneContainer = _('.absol-draggable-stack-clone-container');
    this.on('predrag', this.eventHandler.predrag)
        .on('dragstart', this.eventHandler.dragstart)
        .on('drag', this.eventHandler.drag)
        .on('dragend', this.eventHandler.dragend);
    _({ elt: this, tag: PositionTracker })
        .on('positionchange', this._updateDraggingPosition.bind(this));
}


DraggableHStack.tag = "DraggableHStack".toLowerCase();
DraggableHStack.render = function () {
    return _({
        tag: 'hanger',
        extendEvent: 'change',
        class: ['absol-draggable-stack', 'absol-draggable-hstack']
    });
};

/***
 *
 * @param {Rectangle} rect
 * @returns {number}
 * @private
 */
DraggableHStack.prototype._findDropIdx = function (rect) {
    if (!this._dragData) return -1;
    var centerX = rect.x + rect.width / 2;
    var currentBound = Rectangle.fromClientRect(this.getBoundingClientRect());
    var nearestDistance = Math.abs(centerX - currentBound.width);//end of stack
    var cDist;
    var nearestIndex = this._dragData.childBounds.length;
    var childX;
    for (var i = 0; i < this._dragData.childBounds.length; ++i) {
        childX = this._dragData.childBounds[i].x + currentBound.x - this._dragData.bound.x;
        cDist = Math.abs(centerX - childX);
        if (cDist < nearestDistance) {
            nearestDistance = cDist;
            nearestIndex = i;
        }
    }
    return nearestIndex;
};

/***
 *
 * @type {DraggableHStack|{}}
 */
DraggableHStack.eventHandler = {};

DraggableHStack.eventHandler.predrag = DraggableVStack.eventHandler.predrag;

DraggableHStack.eventHandler.dragstart = function (event) {
    this.addClass('as-has-dragging');
    this.startTrackPosition();
    var mousePos = new Vec2(event.clientX, event.clientY);
    var elt = this._findDirectChild(event.target);
    var childBounds = Array.prototype.map.call(this.childNodes, function (e) {
        return Rectangle.fromClientRect(e.getBoundingClientRect());
    });
    var eltIdx = Array.prototype.indexOf.call(this.childNodes, elt);
    var eltBound = childBounds[eltIdx];
    var eltMouseOffset = mousePos.sub(new Vec2(eltBound.x, eltBound.y));


    this._dragData = {
        mouseStartPos: mousePos,
        mousePos: mousePos,
        bound: Rectangle.fromClientRect(this.getBoundingClientRect()),
        childBounds: childBounds,
        elt: elt,
        eltIdx: eltIdx,
        eltBound: eltBound,
        eltMouseOffset: eltMouseOffset
    };

    this.$cloneContainer.addStyle({
        left: eltBound.x + 'px',
        top: eltBound.y + 'px',
        width: eltBound.width + 'px',
        height: eltBound.height + 'px',
    }).clearChild()
        .addChild($(elt.cloneNode(true)))
        .addTo(document.body);
    elt.addClass('as-dragging');
    this._updateDraggingPosition();
};


DraggableHStack.eventHandler.drag = function (event) {
    event.preventDefault();
    this._dragData.mousePos = new Vec2(event.clientX, event.clientY);
    this._updateDraggingPosition();
};


DraggableHStack.eventHandler.dragend = function (event) {
    var thisS = this;
    this.stopTrackPosition();
    this.removeClass('as-has-dragging');
    this._dragData.elt.removeClass('as-dragging');
    if (this._dragData.destIdx == this._dragData.eltIdx || this._dragData.destIdx == this._dragData.eltIdx + 1) {
        this.$cloneContainer.addClass('as-home-going');
        this._updateDraggingPosition();
        setTimeout(function () {
            thisS.$cloneContainer.selfRemove()
                .removeClass('as-home-going');
        }, 100);
    }
    else {
        if (this._dragData.destIdx === this._dragData.childBounds.length) {
            this._dragData.elt.remove();
            this.addChild(this._dragData.elt);
            this.emit('change', {
                type: 'change',
                elt: this._dragData.elt,
                sourceIndex: this._dragData.eltIdx,
                destIndex: this._dragData.childBounds.length,
                oldIdx: this._dragData.eltIdx,
                newIdx: this._dragData.childBounds.length - 1,
                desc: "Move element to end of stack."
            }, this);
        }
        else {
            var beforeElt = this.childNodes[this._dragData.destIdx];
            this._dragData.elt.remove();
            this.addChildBefore(this._dragData.elt, beforeElt);
            this.emit('change', {
                type: 'change',
                elt: this._dragData.elt,
                sourceIndex: this._dragData.eltIdx,
                destIndex: this._dragData.destIdx,
                oldIdx: this._dragData.eltIdx,
                newIdx: this._dragData.destIdx > this._dragData.eltIdx ? this._dragData.destIdx - 1 : this._dragData.destIdx,
                desc: "Move element to before  this.childNodes[" + this._dragData.destIdx + "]"
            }, this);
        }
        this.$cloneContainer.selfRemove()
            .removeClass('as-home-going');
    }

    this.removeClass('as-no-change');
};


DraggableHStack.prototype._findDragzone = DraggableVStack.prototype._findDragzone;
DraggableHStack.prototype._findDirectChild = DraggableVStack.prototype._findDirectChild;


DraggableHStack.prototype._updateDraggingPosition = function () {
    var bound = this.getBoundingClientRect();
    var x, y;
    if (this.$cloneContainer.containsClass('as-home-going')) {
        x = this._dragData.eltBound.x - this._dragData.bound.x + bound.left;
        y = this._dragData.eltBound.y - this._dragData.bound.y + bound.top;
    }
    else {
        y = bound.top + (this._dragData.eltBound.y - this._dragData.bound.y);
        var newPos = this._dragData.mousePos.sub(this._dragData.eltMouseOffset);
        x = newPos.x;
    }
    this.$cloneContainer.addStyle({
        left: x + 'px',
        top: y + 'px'
    });
    var cBound = this._dragData.eltBound.clone();
    cBound.x = x;
    cBound.y = y;
    var destIdx = this._findDropIdx(cBound);
    this._dragData.destIdx = destIdx;
    var destX;
    if (destIdx >= this._dragData.childBounds.length) {
        var lastRect = this._dragData.childBounds[this._dragData.childBounds.length - 1];
        destX = lastRect.x + lastRect.width - this._dragData.bound.x;
    }
    else {
        destX = this._dragData.childBounds[destIdx].x - this._dragData.bound.x;
    }
    this.addStyle('--dest-x', destX + 'px');
    if (destIdx == this._dragData.eltIdx || destIdx == this._dragData.eltIdx + 1) {
        this.addClass('as-no-change');
    }
    else {
        this.removeClass('as-no-change');
    }
};


ACore.install(DraggableHStack);
export default DraggableHStack;