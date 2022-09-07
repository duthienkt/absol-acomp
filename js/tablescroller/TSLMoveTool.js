/***
 *
 * @param {TableScroller} elt
 * @constructor
 */
import Hanger from "../Hanger";
import { _, $ } from "../../ACore";
import Rectangle from "absol/src/Math/Rectangle";

function TSLMoveTool(elt) {
    this.elt = elt;
    this.$table = null;
    Object.keys(TSLMoveTool.prototype).forEach((key) => {
        if (key.startsWith('ev_')) {
            this[key] = this[key].bind(this);
        }
    });


    this.init();
}

TSLMoveTool.prototype.init = function () {
    this.elt = _({
        tag: Hanger,
        elt: this.elt,
        on: {
            predrag: this.ev_preDrag,
            dragstart: this.ev_dragStart,
            drag: this.ev_drag,
            dragend: this.ev_dragEnd
        }
    });

};

TSLMoveTool.prototype.onAttachTable = function () {
};


TSLMoveTool.prototype.ev_preDrag = function (event) {
    var e = event.target;
    var isOK = false;
    while (e && e.tagName !== 'TABLE') {
        if (e.classList && e.classList.contains('as-drag-zone')) {
            isOK = true;
            break;
        }
        e = e.parentElement;
    }
    if (isOK) {
        event.preventDefault();
    }
    else {
        event.cancel();
    }
};


TSLMoveTool.prototype._findRowIdx = function (y) {
    var newY = Rectangle.fromClientRect(this.elt.$contentBody.getBoundingClientRect()).y;
    var oldY = this.dragData.bodyBound.y;
    var dy = newY - oldY;
    var yArr = this.dragData.rowBounds.map((rect) => rect.y + dy + rect.height / 2);

    if (this.dragData.rowBounds.length === 0)
        yArr.push(0);

    var low = 0;
    var high = yArr.length - 1;
    var mid0, mid1;
    while (low < high) {
        mid0 = (low + high) >> 1;
        mid1 = mid0 + 1;
        if (Math.abs(y - yArr[mid0]) < Math.abs(y - yArr[mid1])) {
            high = mid0;
        }
        else {
            low = mid1;
        }
    }

    return low;
};


TSLMoveTool.prototype.ev_dragStart = function (event) {
    var t = this.findRow(event.target);
    if (!t) return;
    this.elt.addClass('as-dragging');
    this.dragData = Object.assign({}, t);
    this.dragData.copy.addClass('as-dragging');
    this.dragData.original.addClass('as-dragging');
    var rowBound = Rectangle.fromClientRect(this.dragData.original.getBoundingClientRect());
    var bodyBound = Rectangle.fromClientRect(this.elt.$contentBody.getBoundingClientRect());
    this.dragData.mouseOffset = event.currentPoint
        .sub(rowBound.A());
    this.dragData.rowIdx = Array.prototype.indexOf.call(this.elt.$contentBody.childNodes, this.dragData.original);
    this.dragData.newRowIdx = this.dragData.rowIdx;
    this.dragData.rowBound = rowBound;
    this.dragData.bodyBound = bodyBound;
    this.dragData.rowOffset = rowBound.A().sub(bodyBound.A());
    this.dragData.rowBounds = Array.prototype.map.call(this.elt.$contentBody.childNodes, elt => Rectangle.fromClientRect(elt.getBoundingClientRect()));


};

TSLMoveTool.prototype.ev_drag = function (event) {
    if (!this.dragData) return;
    var bodyBound = Rectangle.fromClientRect(this.elt.$contentBody.getBoundingClientRect());
    var rowA = bodyBound.A().add(this.dragData.rowOffset);
    var rowTransformed = event.currentPoint.sub(this.dragData.mouseOffset);
    var transform = rowTransformed.sub(rowA);
    var originalRow = this.dragData.original;
    originalRow.addStyle('transform', `translate(0, ${transform.y}px )`);
    this.dragData.copy.addStyle('transform', `translate(0, ${transform.y}px )`);
    this.dragData.hiddenCells = Array.prototype.filter.call(this.dragData.original.childNodes, e => e.tagName === 'TD')
        .slice(0, this.elt.fixedCol);
    this.dragData.hiddenCells.forEach(e => $(e).addClass('as-transparent-fix'));

    var newIdx = this._findRowIdx(rowTransformed.y + this.dragData.rowBound.height / 2);
    this.dragData.newRowIdx = newIdx;
    var rows = this.elt.$contentBody.childNodes;
    var curIdx = this.dragData.rowIdx;
    // var copyRows = this.elt.$f
    var rowBound = this.dragData.rowBound;
    rows.forEach((elt, i) => {
        if (elt === originalRow) return;
        var copyElt = this.elt.leftCopyRows[elt.getAttribute('data-id')];
        var dy = 0;
        if (i >= Math.min(newIdx, curIdx) && i <= Math.max(newIdx, curIdx)) {
            if (i > curIdx && i <= newIdx) {
                dy = -rowBound.height;
            }
            else if (i >= newIdx && i < curIdx) {
                dy = rowBound.height;
            }
        }


        elt.addStyle('transform', `translate(0, ${dy}px)`);
        copyElt.addStyle('transform', `translate(0, ${dy}px)`);
    });


};

TSLMoveTool.prototype.ev_dragEnd = function (event) {
    this.dragData.original.removeStyle('transform');
    this.dragData.copy.removeStyle('transform');
    this.dragData.copy.removeClass('as-dragging');
    this.dragData.original.removeClass('as-dragging');
    this.elt.removeClass('as-dragging');
    this.elt.removeClass('as-has-new-pos');
    this.dragData.hiddenCells.forEach(e => e.removeClass('as-transparent-fix'));
    var rows = this.elt.$contentBody.childNodes;
    rows.forEach(elt => {
        var copyElt = this.elt.leftCopyRows[elt.getAttribute('data-id')];
        elt.addStyle('transform', 'translate(0, 0)');
        copyElt.addStyle('transform', 'translate(0, 0)');
    });
    var at, copyAt;
    if (this.dragData.newRowIdx !== this.dragData.rowIdx) {
        at = rows[this.dragData.newRowIdx];
        copyAt = this.elt.leftCopyRows[at.attr('data-id')];
        if (this.dragData.rowIdx < this.dragData.newRowIdx) {
            $(at.parentElement).addChildAfter(this.dragData.original, at);
            $(copyAt.parentElement).addChildAfter(this.dragData.copy, copyAt);
        }
        else {
            $(at.parentElement).addChildBefore(this.dragData.original, at);
            $(copyAt.parentElement).addChildBefore(this.dragData.copy, copyAt);
        }
        this.elt.reindexRows();
        this.elt.emit('orderchange', {
            target: this.elt,
            from: this.dragData.rowIdx,
            to: this.dragData.newRowIdx
        }, this.elt);

    }
};


TSLMoveTool.prototype.findRow = function (fromElt) {
    var e = fromElt;
    var rowElt;
    while (e) {
        if (e.tagName === 'TR') {
            rowElt = e;
            break;
        }
        e = e.parentElement;
    }

    if (!rowElt) return null;
    var id = rowElt.getAttribute('data-id');
    return {
        original: $(this.elt.originalRows[id]),
        copy: $(this.elt.leftCopyRows[id])
    }
};

export default TSLMoveTool;