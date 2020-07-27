import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";
import DraggableVStack from "./DraggableVStack";

var _ = ACore._;
var $ = ACore.$;

function DraggableHStack() {
    var res = _({
        extendEvent: 'change',
        class: ['absol-draggable-stack', 'absol-draggable-hstack']
    });

    res.eventHandler = OOP.bindFunctions(res, DraggableHStack.eventHandler);
    res.$cloneContainer = _('.absol-draggable-stack-clone-container');
    res.$destLine = _('.absol-draggable-stack-dest-line');
    res.on('predrag', res.eventHandler.predrag);

    return res;
}


DraggableHStack.tag = "DraggableHStack".toLowerCase();
DraggableHStack.render = function(){
    return _({
        tag:'hanger',
        extendEvent: 'change',
        class: ['absol-draggable-stack', 'absol-draggable-hstack']
    });
};


DraggableHStack.eventHandler = {};

DraggableHStack.eventHandler.mouseDown = function (event) {
    var self = this;
    var dragzone = this._findDragzone(event.target);
    if (dragzone) {
        this._mouseClientX = event.clientX;
        this._mouseClientY = event.clientY;

        var bound = this.getBoundingClientRect();
        var element = this._findDirectChild(event.target);
        element.classList.add('dragging');
        this.$draggingElt = element;

        this._dragginEltIndex = 0;
        this._childrentInfo = Array.prototype.map.call(this.childNodes, function (child, index) {
            var childBound = child.getBoundingClientRect();
            if (child == element) self._dragginEltIndex = index;
            return {
                index: index,
                elt: child,
                bound: childBound,
                left: childBound.left - bound.left,
            }
        });

        this.$cloneContainer.addTo(this);
        this.$destLine.addTo(this);

        var containerBound = element.getBoundingClientRect();
        this._initBound = bound;
        this._currentBound = bound;

        this._initTop = containerBound.top - bound.top;
        this._initLeft = containerBound.left - bound.left;
        this._crLeft = this._initLeft;
        this._initWidth = containerBound.width;
        this._pressX = event.clientX - containerBound.left;
        this._pressY = event.clientY - containerBound.top;
        this.$cloneContainer.addStyle({
            top: this._initTop + 'px',
            left: this._initLeft + 'px',
            width: this._initWidth + 'px'
        }).addChild($(element.cloneNode(true)).addStyle({'width': '100%', 'box-sizing':'border-box'}));

        this.$destLine.addStyle('left', this._initLeft + 'px');

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
        this._updateDragginPosition();
    }
};


DraggableHStack.eventHandler.mouseMove = function (event) {
    event.preventDefault();
    //save mouse position 
    this._mouseClientX = event.clientX;
    this._mouseClientY = event.clientY;
    this._updateDragginPosition();
};



DraggableHStack.eventHandler.mouseFinish = function (event) {
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


    if ((this._dragginEltIndex == this._childrentInfo.length - 1 && !this._destRecord)
        || (this._destRecord && (this._destRecord.index == this._dragginEltIndex || this._destRecord.index == this._dragginEltIndex + 1))) {
        //nothing to change, view animation
        this.$cloneContainer.addClass('home-going');
        setTimeout(function () {
            self.$cloneContainer.addStyle({
                left: self._initLeft + 'px'
            });
        }, 0);
        setTimeout(function () {
            self.$cloneContainer.clearChild().removeClass('home-going').remove();
            self.$destLine.removeStyle({ left: '' }).remove();
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
                sourceIndex: this._dragginEltIndex, destIndex: this._destIndex, elt: this.$draggingElt
            }, this);
        }
        else {
            this.addChild(this.$draggingElt);
            this.emit('change', { type: 'change', target: this, action: "END", elt: this.$draggingElt, sourceIndex: this._dragginEltIndex }, this);
        }
    }
};


DraggableHStack.prototype._findDragzone = DraggableVStack.prototype._findDragzone;
DraggableHStack.prototype._findDirectChild = DraggableVStack.prototype._findDirectChild;

DraggableHStack.eventHandler.scroll = function (event) {
    this._updateDragginPosition();
};

DraggableHStack.prototype._updateDragginPosition = function () {
    //update cloneContainer
    var bound = this.getBoundingClientRect();
    //style top of cloneContainer
    this._crLeft = this._mouseClientX - bound.left - this._pressX;
    this.$cloneContainer.addStyle({
        left: this._crLeft + 'px'
    });

    //update destLine
    var centerX = this._crLeft + this._initWidth / 2;
    var nearestRecord;
    var nearestDistance = Math.abs(centerX - bound.width);//end of stack
    var cDist;
    var nearestIndex = this._childrentInfo.length;
    for (var i = 0; i < this._childrentInfo.length; ++i) {
        cDist = Math.abs(centerX - this._childrentInfo[i].left);
        if (cDist < nearestDistance) {
            nearestRecord = this._childrentInfo[i];
            nearestDistance = cDist;
            nearestIndex = i;
        }
    }
    if (nearestRecord) {
        this.$destLine.addStyle('left', nearestRecord.left + 'px');
    }
    else {
        var lastRecord = this._childrentInfo[this._childrentInfo.length - 1];
        this.$destLine.addStyle('left', lastRecord.left + lastRecord.bound.width + 'px');
    }
    if (nearestIndex == this._dragginEltIndex || nearestIndex == this._dragginEltIndex + 1) {
        this.$destLine.addStyle('visibility', 'hidden');
    }
    else {
        this.$destLine.removeStyle('visibility', 'hidden');

    }
    this._destRecord = nearestRecord;
    this._destIndex = nearestIndex;
    // setTimeout(this._autoScrollParentIfNeed.bind(this, 10), 33);
};


ACore.install('DraggableHStack'.toLowerCase(), DraggableHStack);
export default DraggableHStack;