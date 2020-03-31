import ACore from "../ACore";

import './Board';
import Vec2 from "absol/src/Math/Vec2";
import Element from "absol/src/HTML5/Element";


var _ = ACore._;
var $ = ACore.$;

function BoardTable() {
    this.on({
        mousedown: this.eventHandler.mousedown
    });
    this._childHolders = [];
    this._dragEventData = null;
}

BoardTable.render = function () {
    return _({
        class: 'as-board-table',
        extendEvent: ['sizechange', 'change']
    });
};


BoardTable.prototype.findDomChildBefore = function (elt) {
    var nodes = this.childNodes;
    for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i] == elt) return nodes[i - 1];
    }
    return -1;
};


BoardTable.prototype.findDomChildAfter = function (elt) {
    var nodes = this.childNodes;
    for (var i = 0; i < nodes.length; ++i) {
        if (nodes[i] == elt) return nodes[i + 1];
    }
    return -1;
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
            onsizechange: this.eventHandler.boardresize.bind(this, elt),
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
            elt: elt,
            onsizechange: this.eventHandler.boardresize.bind(this, elt),
        };
        elt.on('sizechange', holder.onsizechange);
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
            elt: elt,
            onsizechange: this.eventHandler.boardresize.bind(this, elt),
        };
        elt.on('sizechange', holder.onsizechange);
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




BoardTable.prototype._removeInChildList = function (elt) {
    var holderIndex = this.findChildHolderIndex();
    if (holderIndex >= 0) {
        var holder = this._childHolders[holderIndex];
        holder.elt.off('sizechange', holder.onsizechange);
        this._childHolders.splice(holderIndex, 1);
        //todo: update size from row
        // holder.row = 
    }
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


/**
 * @type {BoardTable}
 */
BoardTable.eventHandler = {};

BoardTable.eventHandler.boardresize = function (boardElt, event) {
    if (boardElt.getParent() == this) {
        //todo
    }
    else {
        this._removeInChildList(boardElt);
    }
    // this.updateSize();
};





BoardTable.eventHandler.mousedown = function (event) {
    var dragzone = this._findDragZone(event.target);
    if (dragzone) {
        var boardElt = this._findBoard(dragzone);
        var holderIndex = this.findChildHolderIndex(boardElt);
        if (holderIndex < 0) return;// can not move
        var mousePos = new Vec2(event.clientX, event.clientY);
        var cBound = boardElt.getBoundingClientRect();
        var mouseBoardOffset = mousePos.sub(new Vec2(cBound.left, cBound.top));
        this._dragEventData = {
            boardElt: boardElt,
            state: 'PRE_DRAG',
            mouseStartPos: mousePos,
            mouseBoardOffset: mouseBoardOffset,
            holderIndex: holderIndex
        };
        $(document.body).on({
            mousemove: this.eventHandler.mousemove,
            mouseup: this.eventHandler.mousefinish,
            mouseleave: this.eventHandler.mousefinish
        })
    }
};

BoardTable.eventHandler.mousemove = function (event) {
    event.preventDefault();
    var cBound = this._dragEventData.boardElt.getBoundingClientRect();
    var mousePos = new Vec2(event.clientX, event.clientY);
    if (this._dragEventData.state == 'PRE_DRAG') {
        if (mousePos.sub(this._dragEventData.mouseStartPos).abs() > 8) {
            this._dragEventData.placeHolderElt = $(this._dragEventData.boardElt.cloneNode(false))
                .addClass('as-board-place-holder')
                .addStyle({
                    width: cBound.width + 'px',
                    height: cBound.height + 'px'
                });
            this.insertBefore(this._dragEventData.placeHolderElt, this._dragEventData.boardElt);
            this._dragEventData.state = "DRAG";
            this._dragEventData.boardElt.addClass('as-board-moving');
            this._dragEventData.cartAt = this._dragEventData.holderIndex;
        }
    }


    if (this._dragEventData.state == 'DRAG') {
        var fbound;
        for (var i = 0; i < this._childHolders.length; ++i) {
            if (i == this._dragEventData.holderIndex) continue;
            var viewIndex;
            if ((i < this._dragEventData.holderIndex && i < this._dragEventData.cartAt)
                || (i > this._dragEventData.holderIndex && i > this._dragEventData.cartAt)
                || this._dragEventData.holderIndex == this._dragEventData.cartAt) {
                viewIndex = i;
            }
            else {
                if (this._dragEventData.holderIndex > this._dragEventData.cartAt) {
                    viewIndex = i + 1;
                }
                else {
                    viewIndex = i - 1;
                }
            }
            if (viewIndex == this._dragEventData.cartAt) continue;
            fbound = this._childHolders[i].elt.getBoundingClientRect();

            if (mousePos.x > fbound.left && mousePos.x < fbound.right
                && mousePos.y > fbound.top && mousePos.y < fbound.bottom) {
                this._dragEventData.cartAt = viewIndex;
                if (this._dragEventData.holderIndex >= viewIndex) {
                    this.insertBefore(this._dragEventData.placeHolderElt, this._childHolders[viewIndex].elt);
                }
                else {
                    var bf = Element.prototype.findChildAfter.call(this, this._childHolders[viewIndex].elt);
                    if (bf)
                        this.insertBefore(this._dragEventData.placeHolderElt, bf);
                    else {
                        this.appendChild(this._dragEventData.placeHolderElt);
                    }
                }
                break;
            }
        }

        var bound = this.getBoundingClientRect();
        var mouseOffSet = mousePos.sub(new Vec2(bound.left, bound.top));
        var boardPos = mouseOffSet.sub(this._dragEventData.mouseBoardOffset);
        this._dragEventData.boardElt.addStyle({
            left: boardPos.x + 'px',
            top: boardPos.y + 'px'
        });
    }
};



BoardTable.eventHandler.mousefinish = function (event) {
    if (this._dragEventData.state == 'DRAG') {
        this._dragEventData.boardElt.removeClass('as-board-moving')
            .removeStyle('left')
            .removeStyle('top');
        this._dragEventData.placeHolderElt.remove();
        this._dragEventData.state = "FINISH";
        if (this._dragEventData.holderIndex != this._dragEventData.cartAt) {
            if (this._dragEventData.holderIndex > this._dragEventData.cartAt) {
                this.insertBefore(this._dragEventData.boardElt, this._childHolders[this._dragEventData.cartAt].elt);
            }
            else if (this._dragEventData.holderIndex < this._dragEventData.cartAt) {
                var bf = Element.prototype.findChildAfter.call(this, this._childHolders[this._dragEventData.cartAt].elt);
                if (bf)
                    this.insertBefore(this._dragEventData.boardElt, bf);
                else {
                    this.appendChild(this._dragEventData.boardElt);
                }
            }
            var holder = this._childHolders.splice(this._dragEventData.holderIndex, 1)[0];
            this._childHolders.splice(this._dragEventData.cartAt, 0, holder);
            this.emit('change', { name: 'change', boardElt: holder.elt, action: 'move', from: this._dragEventData.holderIndex, to: this._dragEventData.cartAt, target: this, }, this);
        }
    }
    $(document.body).off({
        mousemove: this.eventHandler.mousemove,
        mouseup: this.eventHandler.mousefinish,
        mouseleave: this.eventHandler.mousefinish
    })
};

BoardTable.prototype.getAllBoards = function () {
    return this._childHolders.map(function (holder) {
        return holder.elt;
    });
};


ACore.install('boardtable', BoardTable);
export default BoardTable;