import ACore from "../ACore";
import '../css/boardtable.css';
import './Board';
import Vec2 from "absol/src/Math/Vec2";
import Element from "absol/src/HTML5/Element";
import Rectangle from "absol/src/Math/Rectangle";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter, {findChangedTouchByIdent} from "absol/src/HTML5/EventEmitter";
import {absCeil} from "./utils";
import Hanger from "./Hanger";
import AElement from "absol/src/HTML5/Element";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends AElement
 * @constructor
 */
function BoardTable() {
    var events = {
        touchstart: this.eventHandler.mousedown,
        mousedown: this.eventHandler.mousedown
    };
    Hanger.prototype.on2.call(this, events);
    this._childHolders = [];
    this._dragEventData = null;
    this._friends = [];
    this._longPressEventData = null;
}

BoardTable.tag = 'boardtable';
BoardTable.render = function () {
    return _({
        class: 'as-board-table',
        extendEvent: ['sizechange', 'orderchange', 'itemleave', 'itementer', 'dragitemstart', 'dragitemend']
    });
};

export var EFFECT_ZONE_CLASS_NAME = 'as-board-table-effect-zone';
export var DRAG_ZONE_CLASS_NAME = 'as-board-drag-zone';
export var FREE_ZONE_CLASS_NAME = 'as-board-free-zone';

BoardTable.EFFECT_ZONE_CLASS_NAME = EFFECT_ZONE_CLASS_NAME;
BoardTable.DRAG_ZONE_CLASS_NAME = DRAG_ZONE_CLASS_NAME;
BoardTable.FREE_ZONE_CLASS_NAME = FREE_ZONE_CLASS_NAME;

BoardTable.prototype.$preventContext = _({
    tag: 'textarea',
    class: 'as-board-table-prevent-context',
    props: { readOnly: true }
});

BoardTable.prototype.maxScrollSpeed = 300;


BoardTable.prototype.findDomChildBefore = function (elt) {
    var nodes = this.childNodes;
    for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i] == elt) return nodes[i - 1];
    }
    return null;
};


BoardTable.prototype.findDomChildAfter = function (elt) {
    var nodes = this.childNodes;
    for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i] == elt) return nodes[i + 1];
    }
    return null;
};


BoardTable.prototype.addChild = function (elt) {
    if (elt.classList.contains('as-board')) {
        elt.selfRemove();
        var atElt;
        if (this._childHolders.length > 0) {
            atElt = this.findDomChildAfter(this._childHolders[this._childHolders.length - 1].elt);
            if (atElt) {
                if (atElt != -1)
                    this.insertBefore(elt, atElt);
                else
                    throw new Error("Violation data!");
            }
            else {
                this.appendChild(elt);
            }
        }
        else {
            this.appendChild(elt);
        }
        var holder = {
            elt: elt,
        };
        elt.on('sizechange', holder.onsizechange);
        this._childHolders.push(holder);
    }
    else {
        this.appendChild(elt);
    }
    return this;
};


BoardTable.prototype.removeChild = function (elt) {
    var holderIndex = this.findChildHolderIndex(elt);
    if (holderIndex >= 0) {
        var holder = this._childHolders[holderIndex];
        holder.elt.off('sizechange', holder.onsizechange);
        this._childHolders.splice(holderIndex, 1);
        holder.elt.remove();
    }
    else {
        this.super(elt);
    }
};

BoardTable.prototype.findChildBefore = function (elt) {
    var holderIndex = this.findChildHolderIndex(elt);
    if (holderIndex < 0) return holderIndex;
    if (holderIndex < 1) return null;
    return this._childHolders[holderIndex - 1];
};


BoardTable.prototype.findChildAfter = function (elt) {
    var holderIndex = this.findChildHolderIndex(elt);
    if (holderIndex < 0) return holderIndex;
    if (holderIndex <= this._childHolders.length) return null;
    return this._childHolders[holderIndex + 1];
};

BoardTable.prototype.addChildBefore = function (elt, at) {
    elt.selfRemove();
    var atIndex = this.findChildHolderIndex(at);
    if (elt.classList.contains('as-board')) {
        if (atIndex < 0) {
            if (this._childHolders.length > 0) {
                if (this.findDomChildAfter(this._childHolders[this._childHolders.length - 1].elt) == at) {
                    atIndex = this._childHolders.length;
                }
                else {
                    throw new Error("Invalid position, you must insert board next to other board!");
                }
            }
        }

        this.insertBefore(elt, at);
        var holder = {
            elt: elt
        };
        this._childHolders.splice(atIndex, 0, holder);
    }
    else {
        if (atIndex > 0) {
            throw new Error("Invalid position, you can not insert othert type between two board!");
        }
        else {
            this.insertBefore(elt, at);
        }
    }
    return this;
};

BoardTable.prototype.addChildAfter = function (elt, at) {
    elt.selfRemove();
    var atIndex = this.findChildHolderIndex(at);
    var afterAt = this.findDomChildAfter(at);
    if (elt.classList.contains('as-board')) {
        if (atIndex < 0) {
            if (this._childHolders.length > 0) {
                if (this.findDomChildBefore(this._childHolders[0].elt) == at) {
                    atIndex = -1;
                }
                else
                    throw new Error("Invalid position,  you must insert board next to other board!");
            }
        }

        var holder = {
            elt: elt
        };
        if (!afterAt) {
            this.appendChild(elt);
        }
        else {
            this.insertBefore(elt, afterAt);
        }
        this._childHolders.splice(atIndex + 1, 0, holder);
    }
    else {
        if (this._childHolders.length > 1 && atIndex >= 0 && atIndex + 1 < this._childHolders.length) {
            throw new Error("Invalid position, you can not insert othert type between two board!");
        }
        else {
            if (!afterAt) {
                this.appendChild(elt);
            }
            else {
                this.insertBefore(elt, afterAt);
            }

        }
    }
    return this;
};

BoardTable.prototype.clearChild = function () {
    this._childHolders = [];
    return AElement.prototype.clearChild.call(this);
};


BoardTable.prototype.findChildHolder = function (elt) {
    return this._childHolders[this.findChildHolderIndex(elt)];
};


BoardTable.prototype.findChildHolderIndex = function (elt) {
    for (var i = 0; i < this._childHolders.length; ++i) {
        if (this._childHolders[i].elt == elt) return i;
    }
    return -1;
};


BoardTable.prototype.getEffectZone = function () {
    var ez = this;
    while (ez) {
        if (ez.classList.contains(EFFECT_ZONE_CLASS_NAME)) {
            return ez;
        }
        ez = ez.parentElement;
    }
    return this;
};

BoardTable.prototype._findDragZone = function (elt) {
    var res = null;
    while (elt != this && elt) {
        if (elt.classList.contains('as-board-table')) return null;//maybe in other
        if (!res && elt.classList.contains(DRAG_ZONE_CLASS_NAME)) {
            res = elt;
        }
        if (!res && elt.classList.contains(FREE_ZONE_CLASS_NAME)) return null;// do not drag
        elt = elt.parentElement;
    }
    return res;
};

BoardTable.prototype._findBoard = function (elt) {
    while (elt != this && elt) {
        if (elt.classList.contains('as-board')) return elt;
        elt = elt.parentElement;
    }
    return null;
};


BoardTable.prototype.getAllFriends = function () {
    var thisBT = this;
    var res = [];
    var friendQR;
    for (var i = 0; i < this._friends.length; ++i) {
        friendQR = this._friends[i];
        if (friendQR != this && friendQR && friendQR.classList && friendQR.classList.contains('as-board-table')) {
            res.push(friendQR);
        }
        else if (typeof friendQR == 'string') {// query
            $(friendQR, false, function (elt) {
                if (thisBT != elt && elt.classList && elt.classList.contains('as-board-table')) {
                    res.push(elt);
                }
                return false;
            });
        }
    }

    return res;
};


BoardTable.prototype._findHoverBoardIndex = function (clientX, clientY, excludes) {
    var cli = new Vec2(clientX, clientY);
    var bound;
    for (var i = 0; i < this._childHolders.length; ++i) {
        // holder =
        if (excludes && excludes.indexOf(this._childHolders[i].elt) >= 0) continue;
        bound = Rectangle.fromClientRect(this._childHolders[i].elt.getBoundingClientRect());
        if (bound.containsPoint(cli)) return i;
    }
    return -1;
};


/**
 * @type {BoardTable}
 */
BoardTable.eventHandler = {};


BoardTable.eventHandler.mousedown = function (event) {
    if (this._dragEventData) return;
    var mousePos;
    var pointerIdent = -1;
    var target;
    var isTouch = event.type === 'touchstart';
    if (isTouch) {
        var touch = event.changedTouches[0];
        target = touch.target;
        pointerIdent = touch.identifier;
        mousePos = new Vec2(touch.clientX, touch.clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
        target = event.target;
    }


    var dragzone = this._findDragZone(target);
    if (dragzone) {
        var boardElt = this._findBoard(dragzone);
        var holderIndex = this.findChildHolderIndex(boardElt);
        if (holderIndex < 0) return;// can not move
        var cBound = boardElt.getBoundingClientRect();
        var mouseBoardOffset = mousePos.sub(new Vec2(cBound.left, cBound.top));
        this._dragEventData = {
            boardElt: boardElt,
            state: 'WAIT',
            mouseStartPos: mousePos,
            mousePos: mousePos,
            mouseBoardOffset: mouseBoardOffset,
            holderIndex: holderIndex,
            boardBound: cBound,
            isTouch: isTouch,
            pointerIdent: pointerIdent
        };
        var cEvent = EventEmitter.copyEvent(event);

        if (isTouch) {
            Hanger.prototype.on2.call(document.body, {
                touchend: this.eventHandler.touchFinishBeforeReadyDrag,
                touchcancel: this.eventHandler.touchFinishBeforeReadyDrag,
                touchmove: this.eventHandler.touchMoveBeforeReadyDrag
            });
            this.$preventContext.off('contextmenu', this.eventHandler.contextMenu);//event maybe not remove because of double click
            this.$preventContext.on('contextmenu', this.eventHandler.contextMenu);
            var thisBT = this;

            this._dragEventData._longPressTimeout = setTimeout(function () {
                thisBT._longPressEventData = -1;
                thisBT.$preventContext.addStyle({
                    '--x': mousePos.x + 'px',
                    '--y': mousePos.y + 'px'
                }).addTo(document.body);
                thisBT.eventHandler.readyDrag(cEvent);
            }, 400);
        }
        else {
            this.eventHandler.readyDrag(event);
        }
    }
};

BoardTable.eventHandler.touchFinishBeforeReadyDrag = function (event) {
    var thisBT = this;
    var dragEventData = this._dragEventData;
    if (!dragEventData) return;
    Hanger.prototype.off2.call(document.body, {
        touchend: this.eventHandler.touchFinishBeforeReadyDrag,
        touchcancel: this.eventHandler.touchFinishBeforeReadyDrag,
        touchmove: this.eventHandler.touchMoveBeforeReadyDrag
    })
    if (this._dragEventData._longPressTimeout > 0) {
        clearTimeout(this._dragEventData._longPressTimeout);
    }
    if (dragEventData.state === 'WAIT') {
        this._dragEventData = null;// canceled
    }
    else {
        setTimeout(function () {
            thisBT.$preventContext.off('contextmenu', thisBT.eventHandler.contextMenu);
            thisBT.$preventContext.remove();
        }, 60);
    }


};

BoardTable.eventHandler.contextMenu = function (event) {
    event.preventDefault();
    this.$preventContext.off('contextmenu', this.eventHandler.contextMenu);
    this.$preventContext.remove();
    this.eventHandler.touchFinishBeforeReadyDrag(event);
}

BoardTable.eventHandler.touchMoveBeforeReadyDrag = function (event) {
    var dragEventData = this._dragEventData;
    var touch = findChangedTouchByIdent(event, dragEventData.pointerIdent);
    if (!touch) return;
    var mousePos = new Vec2(touch.clientX, touch.clientY);
    if (dragEventData.state === 'WAIT') {
        var dv = mousePos.sub(dragEventData.mouseStartPos);
        if (dv.abs() > 8) {
            this.eventHandler.touchFinishBeforeReadyDrag(event);
            this._dragEventData = null;// cancel
        }
    }
    else {
        this.$preventContext.addStyle({
            '--x': mousePos.x + 'px',
            '--y': mousePos.y + 'px'
        });
    }

};

BoardTable.eventHandler.readyDrag = function (event) {
    var dragEventData = this._dragEventData;
    dragEventData.state = "PRE_DRAG";
    var bodyEvents = {};
    if (dragEventData.isTouch) {
        bodyEvents.touchmove = this.eventHandler.mousemove;
        bodyEvents.touchcancel = this.eventHandler.mousefinish;
        bodyEvents.touchend = this.eventHandler.mousefinish;
    }
    else {
        bodyEvents.mousemove = this.eventHandler.mousemove;
        bodyEvents.mouseup = this.eventHandler.mousefinish;
        bodyEvents.mouseleave = this.eventHandler.mousefinish;
    }

    Hanger.prototype.on2.call(document.body, bodyEvents);
    if (dragEventData.isTouch) {
        this.eventHandler.mousemove(event);
    }
};

BoardTable.eventHandler.mousemovePredrag = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos = dragEventData.mousePos;
    var thisBT = this;
    event.preventDefault();
    var cBound = dragEventData.boardElt.getBoundingClientRect();
    if (mousePos.sub(dragEventData.mouseStartPos).abs() > 8 || dragEventData.isTouch) {
        dragEventData.placeHolderElt = $(dragEventData.boardElt.cloneNode(false))
            .addClass('as-board-place-holder')
            .addStyle({
                width: cBound.width + 'px',
                height: cBound.height + 'px'
            });
        dragEventData.friendHolders = this.getAllFriends().concat([this]).map(function (elt) {
            //include itself
            var effectZone = elt.getEffectZone();
            var res = {
                elt: elt,
                effectZone: effectZone
            }
            if (!dragEventData.isTouch) {
                var enterEvent = thisBT.eventHandler.enterFriendEffectZone.bind(thisBT, elt);
                Hanger.prototype.on2.call(effectZone, dragEventData.isTouch ? 'touchmove' : 'mouseenter', enterEvent);
                res.enterEvent = enterEvent;
            }
            else {
                // use move event to detect
            }

            return res;
        });
        dragEventData.inEffectZoneOf = this
        dragEventData.cardStyle = {
            width: dragEventData.boardElt.style.width,
            height: dragEventData.boardElt.style.height
        };

        dragEventData.boardElt.addStyle({
            width: cBound.width + 'px',
            height: cBound.height + 'px'
        });

        this.insertBefore(dragEventData.placeHolderElt, dragEventData.boardElt);
        dragEventData.state = "DRAG";
        $(document.body).addClass('as-has-board-table-drag');
        dragEventData.boardElt.addClass('as-board-moving');
        dragEventData.boardAt = dragEventData.holderIndex;
        dragEventData.boardIn = thisBT;
        this.emit('dragitemstart', {
            type: 'dragitemstart',
            target: this,
            boardElt: this._dragEventData.boardElt
        }, this);
    }
};


BoardTable.eventHandler.mousemoveDragInSelf = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos = dragEventData.mousePos;
    if (this._childHolders.length < 2) {
        if (dragEventData.boardIn != this) {
            this.insertBefore(dragEventData.placeHolderElt, this._childHolders[0].elt);
            dragEventData.boardIn = this;
            dragEventData.boardAt = 0;
        }
    }
    else {
        // bản thân chỉ có 1, hoặc nhiều hơn
        var i = this._findHoverBoardIndex(mousePos.x, mousePos.y, [dragEventData.boardElt]);
        if (i >= 0) {
            if (dragEventData.boardIn != this) {
                dragEventData.boardIn = this;
            }
            var viewIndex;
            if ((i < dragEventData.holderIndex && i < dragEventData.boardAt)
                || (i > dragEventData.holderIndex && i > dragEventData.boardAt)
                || dragEventData.holderIndex == dragEventData.boardAt) {
                viewIndex = i;
            }
            else {
                if (dragEventData.holderIndex > dragEventData.boardAt) {
                    viewIndex = i + 1;
                }
                else {
                    viewIndex = i - 1;
                }
            }

            var fbound = this._childHolders[i].elt.getBoundingClientRect();
            var displayStyple = this._childHolders[i].elt.getComputedStyleValue('display');

            if (mousePos.x > fbound.left && mousePos.x < fbound.right
                && mousePos.y > fbound.top && mousePos.y < fbound.bottom) {
                if (displayStyple.startsWith('inline')) {
                    if (dragEventData.boardBound.width < fbound.width) {
                        if (dragEventData.boardAt > viewIndex && mousePos.x > fbound.left + dragEventData.boardBound.width) {
                            viewIndex += 1;
                        }
                        else if (dragEventData.boardAt < viewIndex && mousePos.x < fbound.left + fbound.width - dragEventData.boardBound.width) {
                            viewIndex -= 1;
                        }
                    }
                }
                else {
                    if (dragEventData.boardBound.height < fbound.height) {
                        if (dragEventData.boardAt > viewIndex && mousePos.y >= fbound.top + dragEventData.boardBound.height) {
                            viewIndex += 1;
                        }
                        else if (dragEventData.boardAt < viewIndex && mousePos.y <= fbound.top + fbound.height - dragEventData.boardBound.height) {
                            viewIndex -= 1;
                        }
                    }
                }
                viewIndex = Math.max(0, Math.min(this._childHolders.length, viewIndex));
                if (viewIndex != dragEventData.boardAt) {
                    dragEventData.boardAt = viewIndex;
                    if (dragEventData.holderIndex >= viewIndex) {
                        this.insertBefore(dragEventData.placeHolderElt, this._childHolders[viewIndex].elt);
                    }
                    else {
                        var bf = Element.prototype.findChildAfter.call(this, this._childHolders[viewIndex].elt);
                        if (bf)
                            this.insertBefore(dragEventData.placeHolderElt, bf);
                        else {
                            this.appendChild(dragEventData.placeHolderElt);
                        }
                    }
                }
            }
        }
    }
};

BoardTable.eventHandler.mousemoveDragInOther = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos = dragEventData.mousePos;
    var other = dragEventData.inEffectZoneOf;
    if (other._childHolders.length == 0) {
        if (dragEventData.boardIn != other) {
            dragEventData.boardIn = other;
            dragEventData.boardAt = 0;
            other.appendChild(dragEventData.placeHolderElt);
        }
    }
    else {
        var i = other._findHoverBoardIndex(mousePos.x, mousePos.y);
        if (i >= 0) {
            if (dragEventData.boardIn != other) {
                dragEventData.boardIn = other;
            }
            var displayStyple = other._childHolders[i].elt.getComputedStyleValue('display');
            var di = 0;
            var bbound = other._childHolders[i].elt.getBoundingClientRect();

            if (displayStyple.startsWith('inline')) {
                if (mousePos.x > bbound.left + bbound.width / 2) di++;
            }
            else {
                if (mousePos.y > bbound.top + bbound.height / 2) di++;
            }
            i += di;
            if (i < other._childHolders.length) {
                other.insertBefore(dragEventData.placeHolderElt, other._childHolders[i].elt);
            }
            else {
                var bf = other.findChildAfter(other._childHolders[other._childHolders.length - 1].elt);
                if (bf) {
                    other.insertBefore(dragEventData.placeHolderElt, bf);
                }
                else {
                    other.appendChild(dragEventData.placeHolderElt)
                }
            }
            dragEventData.boardAt = i;
        }
    }
};


BoardTable.eventHandler.mousemoveDrag = function (event) {
    var dragEventData = this._dragEventData;
    if (dragEventData.inEffectZoneOf == this) {
        this.eventHandler.mousemoveDragInSelf(event);
    }
    else {
        this.eventHandler.mousemoveDragInOther(event);
    }
};

BoardTable.eventHandler.boarDrag = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos = dragEventData.mousePos;
    var boardPos = mousePos.sub(dragEventData.mouseBoardOffset);
    dragEventData.boardElt.addStyle({
        left: boardPos.x + 'px',
        top: boardPos.y + 'px'
    });
};


BoardTable.eventHandler.dragOnEffectZone = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos = dragEventData.mousePos;
    var friendHolders = dragEventData.friendHolders;
    var bound;
    for (var i = 0; i < friendHolders.length; ++i) {
        bound = Rectangle.fromClientRect(friendHolders[i].effectZone.getBoundingClientRect());
        if (bound.containsPoint(mousePos)) {
            dragEventData.inEffectZoneOf = friendHolders[i].elt;
            break;
        }
    }
};

BoardTable.eventHandler.mousemoveOverflow = function (event) {
    if (!this._dragEventData) return;
    var dragEventData = this._dragEventData;
    var scrollerX = this._dragEventData.boardIn;
    var overflowStyle;
    while (scrollerX) {
        overflowStyle = window.getComputedStyle(scrollerX)['overflow'];
        if ((overflowStyle === 'auto' || overflowStyle === 'auto hidden' || overflowStyle === 'scroll' || scrollerX.tagName === 'HTML') && (scrollerX.clientWidth < scrollerX.scrollWidth)) break;
        scrollerX = scrollerX.parentElement;
    }
    var scrollerY = this._dragEventData.boardIn;
    while (scrollerY) {
        overflowStyle = window.getComputedStyle(scrollerY)['overflow'];
        if ((overflowStyle === 'auto' || overflowStyle === 'hidden auto' || overflowStyle === 'scroll' || scrollerY.tagName === 'HTML') && (scrollerY.clientHeight < scrollerY.scrollHeight)) break;
        scrollerY = scrollerY.parentElement;
    }

    var outBound;
    var bBound;
    var screenSize = Dom.getScreenSize();
    var vx = 0;
    var vy = 0;
    bBound = this._dragEventData.boardElt.getBoundingClientRect();
    if (scrollerX) {
        if (dragEventData.$scrollerX !== scrollerX) {
            dragEventData.scrollerXValue = scrollerX.scrollLeft;
            dragEventData.$scrollerX = scrollerX;
        }
        outBound = scrollerX.getBoundingClientRect();
        outBound = {
            left: Math.max(outBound.left, 0),
            top: Math.max(outBound.top, 0),
            bottom: Math.min(outBound.bottom, screenSize.height),
            right: Math.min(outBound.right, screenSize.width)
        }
        if (bBound.left < outBound.left) {
            vx = bBound.left - outBound.left;
        }
        else if (bBound.right > outBound.right) {
            vx = bBound.right - outBound.right;
        }
    }
    else {
        dragEventData.$scrollerX = null;
    }

    if (scrollerY) {
        if (dragEventData.$scrollerY !== scrollerY) {
            dragEventData.scrollerYValue = scrollerY.scrollTop;
            dragEventData.$scrollerY = scrollerY;
        }
        outBound = scrollerY.getBoundingClientRect();
        outBound = {
            left: Math.max(outBound.left, 0),
            top: Math.max(outBound.top, 0),
            bottom: Math.min(outBound.bottom, screenSize.height),
            right: Math.min(outBound.right, screenSize.width)
        }
        if (bBound.top < outBound.top) {
            vy = bBound.top - outBound.top;
        }
        else if (bBound.bottom > outBound.bottom) {
            vy = bBound.bottom - outBound.bottom;
        }
    }
    else {
        dragEventData.$scrollerY = null;
    }


    vx = Math.max(-this.maxScrollSpeed, Math.min(this.maxScrollSpeed, vx * Math.sqrt(Math.abs(vx))));
    vy = Math.max(-this.maxScrollSpeed, Math.min(this.maxScrollSpeed, vy * Math.sqrt(Math.abs(vy))));
    if (vx !== 0 || vy !== 0) {
        var copyEvent = {
            type: event.type,
            preventDefault: function () {/* noop */
            },
            target: event.target
        };
        if (event.type === 'touchmove') {
            copyEvent.changedTouches = Array.prototype.map.call(event.changedTouches, function (it) {
                return { identifier: it.identifier, clientX: it.clientX, clientY: it.clientY, target: it.target }
            });
            copyEvent.touches = Array.prototype.map.call(event.touches, function (it) {
                return { identifier: it.identifier, clientX: it.clientX, clientY: it.clientY, target: it.target }
            });
        }
        else {
            copyEvent.clientX = event.clientX;
            copyEvent.clientY = event.clientY
        }
        var thisBT = this;
        var now = new Date().getTime();
        if (dragEventData.requestAnimationFrameId >= 0) {
            cancelAnimationFrame(dragEventData.requestAnimationFrameId);
        }
        dragEventData.requestAnimationFrameId = requestAnimationFrame(function () {
            dragEventData.requestAnimationFrameId = -1;
            var dt = (new Date().getTime() - now) / 1000;
            if (dragEventData.$scrollerY) {
                dragEventData.scrollerYValue += vy * dt;
                dragEventData.scrollerYValue = Math.max(0, Math.min(dragEventData.$scrollerY.scrollHeight - dragEventData.$scrollerY.clientHeight, dragEventData.scrollerYValue))
                dragEventData.$scrollerY.scrollTop = dragEventData.scrollerYValue;
            }

            if (dragEventData.$scrollerX) {
                dragEventData.scrollerXValue += vx * dt;
                dragEventData.scrollerXValue = Math.max(0, Math.min(dragEventData.$scrollerX.scrollWidth - dragEventData.$scrollerX.clientWidth, dragEventData.scrollerXValue))
                dragEventData.$scrollerX.scrollLeft = dragEventData.scrollerXValue;
            }

            if (thisBT._dragEventData && thisBT._dragEventData.state === "DRAG") {
                thisBT.eventHandler.mousemoveOverflow(copyEvent);
            }
        });
    }
};

BoardTable.eventHandler.mousemove = function (event) {
    var dragEventData = this._dragEventData;
    var isTouch = event.type === 'touchmove' || event.type === 'touchstart';// call from timeout
    if (dragEventData.isTouch !== isTouch) return;
    var mousePos;
    var pointerIdent;
    var touch = -2;
    if (isTouch) {
        touch = findChangedTouchByIdent(event, dragEventData.pointerIdent);
        if (touch) {
            pointerIdent = touch.identifier;
            mousePos = new Vec2(touch.clientX, touch.clientY);
        }
    }
    else {
        pointerIdent = -1;
        mousePos = new Vec2(event.clientX, event.clientY);
    }
    if (dragEventData.pointerIdent !== pointerIdent) return;
    dragEventData.mousePos = mousePos;
    event.preventDefault();
    if (dragEventData.isTouch && dragEventData.state === 'DRAG') {
        this.eventHandler.dragOnEffectZone(event);//because touch not have mouseenter event
    }
    if (dragEventData.state === 'PRE_DRAG') {
        this.eventHandler.mousemovePredrag(event);
    }
    if (dragEventData.state === 'DRAG') {
        this.eventHandler.mousemoveDrag(event);
        this.eventHandler.boarDrag(event);
        this.eventHandler.mousemoveOverflow(event);
    }
};


BoardTable.eventHandler.mousefinish = function (event) {
    var dragEventData = this._dragEventData;
    var isTouch = event.type === 'touchend';
    if (dragEventData.isTouch !== isTouch) return;
    var mousePos;
    var pointerIdent;
    var touch = -2;
    if (isTouch) {
        touch = findChangedTouchByIdent(event, dragEventData.pointerIdent);
        if (touch) {
            pointerIdent = touch.identifier;
            mousePos = new Vec2(touch.clientX, touch.clientY);
        }
    }
    else {
        pointerIdent = -1;
        mousePos = new Vec2(event.clientX, event.clientY);
    }
    if (dragEventData.pointerIdent !== pointerIdent) return;
    dragEventData.mousePos = mousePos;

    var changed;
    if (dragEventData.state == 'DRAG') {
        setTimeout(function () {
            $(document.body).removeClass('as-has-board-table-drag');
        }, 1)
        dragEventData.boardElt.removeClass('as-board-moving')
            .removeStyle('left')
            .removeStyle('top');
        dragEventData.boardElt.addStyle(dragEventData.cardStyle);
        dragEventData.placeHolderElt.remove();
        dragEventData.state = "FINISH";
        if (!dragEventData.isTouch)
            dragEventData.friendHolders.forEach(function (holder) {
                Hanger.prototype.off2.call(holder.effectZone, 'mouseenter', holder.enterEvent);
            });

        if (dragEventData.boardIn == this) {
            if (dragEventData.holderIndex != dragEventData.boardAt) {
                if (dragEventData.holderIndex > dragEventData.boardAt) {
                    this.insertBefore(dragEventData.boardElt, this._childHolders[dragEventData.boardAt].elt);
                }
                else if (dragEventData.holderIndex < dragEventData.boardAt) {
                    var bf = Element.prototype.findChildAfter.call(this, this._childHolders[dragEventData.boardAt].elt);
                    if (bf)
                        this.insertBefore(dragEventData.boardElt, bf);
                    else {
                        this.appendChild(dragEventData.boardElt);
                    }
                }
                var holder = this._childHolders.splice(dragEventData.holderIndex, 1)[0];
                this._childHolders.splice(dragEventData.boardAt, 0, holder);
                changed = 'orderchange';
                this.emit('orderchange', {
                    type: 'orderchange',
                    boardElt: holder.elt,
                    action: 'move',
                    from: dragEventData.holderIndex,
                    to: dragEventData.boardAt,
                    target: this,
                }, this);
            }
        }
        else {
            var holder = this._childHolders.splice(dragEventData.holderIndex, 1)[0];
            holder.elt.remove();
            ///remove all event
            var other = dragEventData.boardIn;
            changed = 'itemleave';
            this.emit('itemleave', {
                type: 'itemleave',
                item: holder.elt,
                from: { index: dragEventData.holderIndex, table: this },
                to: { index: dragEventData.boardAt, table: other },
                target: this
            }, this);
            if (other._childHolders.length == 0) {
                other.appendChild(holder.elt);
                other._childHolders.push(holder);
            }
            else {
                if (dragEventData.boardAt < other._childHolders.length) {
                    other.insertBefore(holder.elt, other._childHolders[dragEventData.boardAt].elt);
                    other._childHolders.splice(dragEventData.boardAt, 0, holder);
                }
                else {
                    var bf = other.findDomChildAfter(other._childHolders.elt);
                    if (bf) {
                        other.insertBefore(holder.elt, bf);
                    }
                    else {
                        other.appendChild(holder.elt);
                    }
                    other._childHolders.push(holder);
                }
            }
            other.emit('itementer', {
                type: 'itementer',
                item: holder.elt,
                target: other,
                from: { index: dragEventData.holderIndex, table: this },
                to: { index: dragEventData.boardAt, table: other }
            }, other);
        }
        this.emit('dragitemend', {
            type: 'dragitemend',
            target: this,
            changed: changed,
            boardElt: this._dragEventData.boardElt
        }, this);
    }

    var bodyEvents = {};
    if (dragEventData.isTouch) {
        bodyEvents.touchmove = this.eventHandler.mousemove;
        bodyEvents.touchcancel = this.eventHandler.mousefinish;
        bodyEvents.touchend = this.eventHandler.mousefinish;
    }
    else {
        bodyEvents.mousemove = this.eventHandler.mousemove;
        bodyEvents.mouseup = this.eventHandler.mousefinish;
        bodyEvents.mouseleave = this.eventHandler.mousefinish;
    }
    Hanger.prototype.off2.call(document.body, bodyEvents);
    this._dragEventData = null;
};

BoardTable.eventHandler.enterFriendEffectZone = function (friendElt, event) {
    this._dragEventData.inEffectZoneOf = friendElt;
};

BoardTable.prototype.getAllBoards = function () {
    return this._childHolders.map(function (holder) {
        return holder.elt;
    });
};


BoardTable.property = {};
BoardTable.property.friends = {
    set: function (value) {
        value = value || [];
        if (!(value instanceof Array))
            value = [value];
        this._friends = value;
    },
    get: function () {
        return this._friends;
    }
};

ACore.install(BoardTable);
export default BoardTable;