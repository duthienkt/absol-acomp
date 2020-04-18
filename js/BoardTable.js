import ACore from "../ACore";

import './Board';
import Vec2 from "absol/src/Math/Vec2";
import Element from "absol/src/HTML5/Element";
import Rectangle from "absol/src/Math/Rectangle";
import BrowserDetector from "absol/src/Detector/BrowserDetector";

var _ = ACore._;
var $ = ACore.$;

var isTouch = BrowserDetector.hasTouch && !BrowserDetector.os.type.match(/windows|X11|Ubuntu|Linux/);


function BoardTable() {
    var events = {};
    events[isTouch ? 'touchstart' : 'mousedown'] = this.eventHandler.mousedown;
    this.on(events);
    this._childHolders = [];
    this._dragEventData = null;
    this._friends = [];
}

BoardTable.render = function () {
    return _({
        class: 'as-board-table',
        extendEvent: ['sizechange', 'orderchange', 'itemleave', 'itementer', 'dragitemstart', 'dragitemend']
    });
};


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
        this.super.removeChild(elt);
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
        if (ez.classList.contains('as-board-table-effect-zone')) {
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
        if (!res && elt.classList.contains('as-board-drag-zone')) {
            res = elt;
        }
        if (!res && elt.classList.contains('as-board-free-zone')) return null;// do not drag
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
    var mousePos;
    if (event.type == 'touchstart') {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }

    var dragzone = this._findDragZone(event.target);
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
            mouseBoardOffset: mouseBoardOffset,
            holderIndex: holderIndex,
            boardBound: cBound,
        };
        this.eventHandler.readyDrag(event);
    }
};


BoardTable.eventHandler.readyDrag = function (event) {
    this._dragEventData.state = "PRE_DRAG";
    var bodyEvents = {};
    if (isTouch) {
        bodyEvents.touchmove = this.eventHandler.mousemove;
        bodyEvents.touchcancel = this.eventHandler.mousefinish;
        bodyEvents.touchend = this.eventHandler.mousefinish;
    }
    else {
        bodyEvents.mousemove = this.eventHandler.mousemove;
        bodyEvents.mouseup = this.eventHandler.mousefinish;
        bodyEvents.mouseleave = this.eventHandler.mousefinish;
    }
    $(document.body).on(bodyEvents);
    if (isTouch)
        $(document.body).addClass('as-has-board-table-drag');
};

BoardTable.eventHandler.mousemovePredrag = function (event) {
    var mousePos;
    if (isTouch) {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }

    var dragEventData = this._dragEventData;
    var thisBT = this;
    event.preventDefault();
    var cBound = dragEventData.boardElt.getBoundingClientRect();

    if (mousePos.sub(dragEventData.mouseStartPos).abs() > 8) {
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
            if (!isTouch) {
                var enterEvent = thisBT.eventHandler.enterFriendEffectZone.bind(thisBT, elt);
                effectZone.on(isTouch ? 'touchmove' : 'mouseenter', enterEvent);
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
        this.emit('dragitemstart', { type: 'dragitemstart', target: this, boardElt: this._dragEventData.boardElt }, this);
    }
};


BoardTable.eventHandler.mousemoveDragInSelf = function (event) {
    var dragEventData = this._dragEventData;
    var mousePos;
    if (event.type == 'touchmove') {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }

    if (this._childHolders.length < 2) {
        if (dragEventData.boardIn != this) {
            this.insertBefore(dragEventData.placeHolderElt, this._childHolders[0].elt);
            this.boardIn = this;
            dragEventData.boardAt = 0;
        }
    }
    else {
        // bản thân chỉ có 1, hoặc nhiều hơn
        var i = this._findHoverBoardIndex(mousePos.x, mousePos.y, [dragEventData.boardElt]);
        if (i >= 0) {
            if (dragEventData.boardIn != this) {
                this.boardIn = this;
                //todo something
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
    var mousePos;
    if (event.type == 'touchmove') {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }
    var dragEventData = this._dragEventData;
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
    var mousePos;
    if (event.type == 'touchmove') {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);

    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }
    var dragEventData = this._dragEventData;
    var bound = this.getBoundingClientRect();
    var mouseOffSet = mousePos.sub(new Vec2(bound.left, bound.top));
    var boardPos = mouseOffSet.sub(dragEventData.mouseBoardOffset);
    dragEventData.boardElt.addStyle({
        left: boardPos.x + 'px',
        top: boardPos.y + 'px'
    });
};


BoardTable.eventHandler.dragOnEffectZone = function (evennt) {
    var mousePos;
    var dragEventData = this._dragEventData;
    var friendHolders = dragEventData.friendHolders;
    if (isTouch) {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
        mousePos = new Vec2(event.touches[0].clientX, event.touches[0].clientY);
    }
    else {
        mousePos = new Vec2(event.clientX, event.clientY);
    }
    var bound;
    for (var i = 0; i < friendHolders.length; ++i) {
        bound = Rectangle.fromClientRect(friendHolders[i].effectZone.getBoundingClientRect());
        if (bound.containsPoint(mousePos)) {
            dragEventData.inEffectZoneOf = friendHolders[i].elt;
            break;
        }
    }
};

BoardTable.eventHandler.mousemove = function (event) {
    if (event.type == 'touchmove') {
        if (event.changedTouches[0].identifier > 0) return;// only once touch a
    }
    event.preventDefault();
    var dragEventData = this._dragEventData;
    if (isTouch && dragEventData.state == 'DRAG') {
        this.eventHandler.dragOnEffectZone(event);//because touch not have mouseenter event
    }
    if (dragEventData.state == 'PRE_DRAG') {
        this.eventHandler.mousemovePredrag(event);
    }

    if (dragEventData.state == 'DRAG') {
        this.eventHandler.mousemoveDrag(event);
        this.eventHandler.boarDrag(event);
    }
};



BoardTable.eventHandler.mousefinish = function (event) {
    var dragEventData = this._dragEventData;
    var changed = false;
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
        if (!isTouch)
            dragEventData.friendHolders.forEach(function (holder) {
                holder.effectZone.off('mouseenter', holder.enterEvent);
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
                this.emit('orderchange', { name: 'orderchange', boardElt: holder.elt, action: 'move', from: dragEventData.holderIndex, to: dragEventData.boardAt, target: this, }, this);
            }
        }
        else {
            var holder = this._childHolders.splice(dragEventData.holderIndex, 1)[0];
            holder.elt.remove();
            ///remove all event
            changed = 'itemleave';
            this.emit('itemleave', { name: 'itemleave', item: holder.elt, target: this }, this);
            var other = dragEventData.boardIn;
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
            other.emit('itementer', { name: 'itementer', item: holder.elt, target: other }, other);
        }
        this.emit('dragitemend', { type: 'dragitemend', target: this, changed: changed, boardElt: this._dragEventData.boardElt }, this);
    }

    var bodyEvents = {};
    if (isTouch) {
        bodyEvents.touchmove = this.eventHandler.mousemove;
        bodyEvents.touchcancel = this.eventHandler.mousefinish;
        bodyEvents.touchend = this.eventHandler.mousefinish;
    }
    else {
        bodyEvents.mousemove = this.eventHandler.mousemove;
        bodyEvents.mouseup = this.eventHandler.mousefinish;
        bodyEvents.mouseleave = this.eventHandler.mousefinish;
    }
    $(document.body).off(bodyEvents);

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


ACore.install('boardtable', BoardTable);
export default BoardTable;