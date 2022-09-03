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
    this.dragData.rowOffset = rowBound.A().sub(bodyBound.A());

};

TSLMoveTool.prototype.ev_drag = function (event) {
    if (!this.dragData) return;
    var bodyBound = Rectangle.fromClientRect(this.elt.$contentBody.getBoundingClientRect());
    var rowA = bodyBound.A().add(this.dragData.rowOffset);
    var rowTransformed = event.currentPoint.sub(this.dragData.mouseOffset);
    var transform = rowTransformed.sub(rowA);
    this.dragData.original.addStyle('transform', `translate(0, ${transform.y}px )`);
    this.dragData.copy.addStyle('transform', `translate(0, ${transform.y}px )`);
    this.dragData.hiddenCells = Array.prototype.filter.call(this.dragData.original.childNodes, e => e.tagName === 'TD')
        .slice(0, this.elt.fixedCol);
    this.dragData.hiddenCells.forEach(e => $(e).addClass('as-transparent-fix'));
};

TSLMoveTool.prototype.ev_dragEnd = function (event) {
    this.dragData.original.removeStyle('transform');
    this.dragData.copy.removeStyle('transform');
    this.dragData.copy.removeClass('as-dragging');
    this.dragData.original.removeClass('as-dragging');
    this.dragData.hiddenCells.forEach(e => e.removeClass('as-transparent-fix'));
    // this.elt.removeClass('as-dragging');
};

/***
 *
 * @param {Vec2} p
 */
TSLMoveTool.prototype.findBefore = function (p) {
//1h44p
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