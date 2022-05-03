/***
 *
 * @param {DTBody} body
 * @constructor
 */
import { _ } from "../../ACore";
import Hanger from "../Hanger";
import Vec2 from "absol/src/Math/Vec2";

function DTRowDragController(body) {
    this.body = body;

    for (var key in this) {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    }
    _(
        {
            tag: Hanger.tag,
            elt: this.body.elt,
            on: {
                predrag: this.ev_preDrag,
                dragstart: this.ev_dragStart,
                drag: this.ev_drag,
                dragend: this.ev_dragEnd,
            }
        }
    );

}

DTRowDragController.prototype.ev_preDrag = function (event) {
    var dragZone = this._finDragZone(event.target);
    if (!dragZone) {
        event.cancel();
        return;
    }
    var row = this._findRow(event.target);
    if (!row) {
        event.cancel();
        return;
    }
    var range = this._findDraggableRange(row);
    if (range.length < 2) {
        event.cancel();
        return;
    }
    var rangeBounds = range.map(function (row) {
        return row.elt.getBoundingClientRect();
    });
    var rowBound = row.elt.getBoundingClientRect();
    var bodyBound = this.body.elt.getBoundingClientRect();
    event.preventDefault();
    var rowIdx = range.indexOf(row);
    var rangeDataOffset = this.body.data.rows.indexOf(range[0].data);
    this.dragData = {
        row: row,
        rowIdx: rowIdx,//index in range
        dragZone: dragZone,
        rowBound: rowBound,
        bodyBound: bodyBound,
        bodyPos: new Vec2(bodyBound.left, bodyBound.top),
        range: range,
        rangeDataOffset: rangeDataOffset,//first index in rows data
        rangeBounds: rangeBounds,
        started: false
    }
};

DTRowDragController.prototype.ev_dragStart = function (event) {
    var dragData = this.dragData;
    dragData.started = true;
    dragData.offset = event.currentPoint.sub(new Vec2(dragData.rowBound.left, dragData.rowBound.top));
    dragData.row.elt.addClass('as-dragging');
    dragData.range.forEach(function (row) {
        if (row !== dragData.row) {
            row.elt.addClass('as-drag-neighbor');
        }
    });
};

DTRowDragController.prototype.ev_drag = function (event) {
    var dragData = this.dragData;
    var currentBodyBound = this.body.elt.getBoundingClientRect();
    var dView = new Vec2(currentBodyBound.left, currentBodyBound.top).sub(dragData.bodyPos);
    var d = event.currentPoint.sub(event.startingPoint).add(dView);
    dragData.row.elt.addStyle('transform', 'translate(0, ' + d.y + 'px)');
    var y0 = event.currentPoint.sub(dragData.offset).y;
    var beforeIdx = this._findIBeforeIdx(y0);
    dragData.beforeIdx = beforeIdx;
    var rowIdx = dragData.rowIdx;
    var range = dragData.range;
    var rowHeight = dragData.rowBound.height;
    var i;

    for (i = 0; i < beforeIdx && i < rowIdx; ++i) {
        range[i].elt.addStyle('transform', 'translate(0,' + 0 + 'px)');
    }

    for (i = beforeIdx; i < rowIdx; ++i) {
        range[i].elt.addStyle('transform', 'translate(0,' + rowHeight + 'px)');
    }


    for (i = rowIdx + 1; i < beforeIdx; ++i) {
        range[i].elt.addStyle('transform', 'translate(0,' + (-rowHeight) + 'px)');
    }

    for (i = Math.max(rowIdx + 1, beforeIdx); i < range.length; ++i) {
        range[i].elt.addStyle('transform', 'translate(0,' + 0 + 'px)');
    }
};

DTRowDragController.prototype.ev_dragEnd = function (event) {
    var dragData = this.dragData;
    var fromIdx;
    var toIdx;
    if (dragData.beforeIdx === dragData.rowIdx || dragData.beforeIdx === dragData.rowIdx + 1) {
        dragData.row.elt.addClass('as-homing');
        dragData.range.forEach(function (row) {
            if (row !== dragData.row)
                row.elt.addStyle('transform', 'translate(0,' + 0 + 'px)');
        });
        setTimeout(function () {
            dragData.row.elt.addStyle('transform', 'translate(0, ' + 0 + 'px)');
            setTimeout(function () {
                dragData.range.forEach(function (row) {
                    if (row !== dragData.row)
                        row.elt.removeClass('as-drag-neighbor');
                });
                dragData.row.elt.removeStyle('transform')
                    .removeClass('as-homing')
                    .removeClass('as-dragging');
            }, 100);
        }, 1);
    }
    else {
        dragData.range.forEach(function (row) {
            if (row !== dragData.row)
                row.elt.removeClass('as-drag-neighbor')
                    .removeStyle('transform');
        });
        fromIdx = dragData.rangeDataOffset + dragData.rowIdx;
        if (dragData.beforeIdx < dragData.range.length) {
            this.body.elt.addChildBefore(dragData.row.elt, dragData.range[dragData.beforeIdx].elt);
            if (dragData.beforeIdx <= dragData.rowIdx) {
                toIdx = dragData.rangeDataOffset + dragData.beforeIdx;
                console.log(toIdx, dragData.beforeIdx);
            }
            else {
                toIdx = dragData.rangeDataOffset + dragData.beforeIdx - 1;
            }
        }
        else {//end of range
            this.body.elt.addChildAfter(dragData.row.elt, dragData.range[dragData.range.length - 1].elt);
            toIdx = dragData.rangeDataOffset + dragData.range.length - 1;
        }
        dragData.row.elt.removeClass('as-dragging').removeStyle('transform');
        this.body.rows.splice(fromIdx, 1);
        this.body.rows.splice(toIdx, 0, dragData.row);

        this.body.data.rows.splice(fromIdx, 1);
        this.body.data.rows.splice(toIdx, 0, dragData.row.data);
        this.body.reindexRows(Math.min(fromIdx, toIdx), Math.max(fromIdx, toIdx) + 1);

        var eventData = {
            type: 'otherchange',
            target: dragData.row,
            from: fromIdx,
            to: toIdx,
            originalEvent: event,
            row: dragData.row,
            data: dragData.row.data
        }
        if (dragData.row.data.on && dragData.row.data.on.orderchange) {
            dragData.row.data.on.orderchange.call(dragData.row, eventData, dragData.row)
        }
        this.body.table.elt.emit('orderchange', eventData, this.body.table.elt);
    }
};


DTRowDragController.prototype._finDragZone = function (elt) {
    var cur = elt;
    while (cur) {
        if (cur.classList.contains('as-drag-zone')) return cur;
        if (cur === this.body.elt) break;
        cur = cur.parentElement;
    }
    return null;
};

DTRowDragController.prototype._findRow = function (elt) {
    var cur = elt;
    while (cur) {
        if (cur.dtBodyRow) return cur.dtBodyRow;
        if (cur === this.body.elt) break;
        cur = cur.parentElement;
    }
    return null;
};

DTRowDragController.prototype._findDraggableRange = function (row) {
    var children = Array.prototype.slice.call(this.body.elt.childNodes);
    var idx = children.indexOf(row.elt);
    if (idx < 0) return [];
    var res = [];
    var i;
    for (i = idx - 1; i >= 0; --i) {
        if (!children[i].dtBodyRow.draggable) break;
        res.unshift(children[i].dtBodyRow);
    }
    for (i = idx; i < children.length; ++i) {
        if (!children[i].dtBodyRow.draggable) break;
        res.push(children[i].dtBodyRow);
    }

    return res;
};

DTRowDragController.prototype._findIBeforeIdx = function (y0) {
    var currentBodyBound = this.body.elt.getBoundingClientRect();
    var range = this.dragData.range;
    var rangeBounds = this.dragData.rangeBounds;
    var row = this.dragData.row;
    var y = currentBodyBound.top - this.dragData.bodyPos.y + this.dragData.rangeBounds[0].top;
    var dy = 0;
    var resIdx = range.length;
    for (var i = 0; i < range.length; ++i) {
        if (range[i] === row) continue;
        dy = rangeBounds[i].height;
        if (y0 <= y + dy / 2) {
            resIdx = i;
            break;
        }
        y += dy;
    }

    return resIdx;
};

export default DTRowDragController;