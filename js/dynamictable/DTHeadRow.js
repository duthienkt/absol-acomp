import { _, $ } from "../../ACore";
import DTHeadCell from "./DTHeadCell";


/****
 * table layer: copyElt
 * fixY layer : copyElt1 -  elt
 * fixXY layer: elt
 *
 */

/***
 *
 * @param {DTHead} head
 * @param data
 * @constructor
 */
function DTHeadRow(head, data) {
    this.head = head;
    this.data = data;
    this.cells = this.data.cells.map((cellData) => new DTHeadCell(this, cellData));
    this._elt = null;
    this._copyElt = null;
    this._fixedXYElt = null;
    this._fixedXElt = null;

}

DTHeadRow.prototype.updateCopyEltSize = function () {
    if (!this._fixedXElt) return;
    var bound = this._copyElt.getBoundingClientRect();
    if (this._fixedXElt)
        this._fixedXElt.addStyle('height', bound.height + 'px');
    if (this._fixedXYElt)
        this._fixedXYElt.addStyle('height', bound.height + 'px');
    this._elt.addStyle('height', bound.height + 'px');
    this.cells.forEach(c => c.updateCopyEltSize());
};


Object.defineProperty(DTHeadRow.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        var fixedCol = this.adapter.fixedCol || 0;
        var child = this.cells.filter(c=> c.idx < fixedCol).map(c => c.copyElt1);
        var child1 = this.cells.filter(c=> c.idx >= fixedCol).map(c => c.elt);
        this._elt = _({
            tag: 'tr',
            class: 'as-dt-head-row',
            child: child.concat(child1)
        });
        if (this.data.attr) {
            this.elt.attr(this.data.attr);
        }
        if (this.data.style) {
            this.elt.addStyle(this.data.style);
        }

        return this._elt;
    }
});

Object.defineProperty(DTHeadRow.prototype, 'fixedXYElt', {
    get: function () {
        if (this._fixedXYElt) return this._fixedXYElt;
        var fixedCol = this.adapter.fixedCol || 0;
        this._fixedXYElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-xy',
            child: this.cells.filter(c=> c.idx < fixedCol).map(c => c.elt)
        });
        return this._fixedXYElt;
    }
});

Object.defineProperty(DTHeadRow.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        var fixedCol = this.adapter.fixedCol || 0;
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-x',
            child:this.cells.filter(c=> c.idx < fixedCol).map(c => c.copyElt2)
        });
        return this._fixedXElt;
    }
});


Object.defineProperty(DTHeadRow.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this.copyElt;
        var adapter = this.adapter;
        this._copyElt = _({
            elt: this.elt.cloneNode(false),
            child: this.cells.map(c => c.copyElt)
        });

        return this._copyElt;
    }
});

Object.defineProperty(DTHeadRow.prototype, 'adapter', {
    get: function () {
        return this.head.adapter;
    }
})


export default DTHeadRow;