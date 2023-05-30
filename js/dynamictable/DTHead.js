import DTHeadRow from "./DTHeadRow";
import { $$, _, $ } from "../../ACore";

/***
 *
 * @param {DTTable} table
 * @param {} data
 * @constructor
 */
function DTHead(table, data) {
    this.table = table;
    this._elt = null;
    this._copyElt = null;
    this._fixedXYElt = null;
    this._fixedXElt = null;
    this.data = data;
    this.rows = this.data.rows.map((rowData) => new DTHeadRow(this, rowData));
}

DTHead.prototype.lockWidth = function () {
    this.rows.forEach(r => r.lockWidth());
};

DTHead.prototype.updateCopyEltSize = function () {
    if (!this._copyElt) return;
    this.rows.forEach(r => r.updateCopyEltSize());
};

Object.defineProperty(DTHead.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        this._elt = _({
            tag: 'thead',
            class: 'as-dt-header',
            child: this.rows.map(r => r.elt)
        });
        return this._elt;
    }
});


Object.defineProperty(DTHead.prototype, 'copyElt', {
    get: function () {
        if (this._copyElt) return this._copyElt;
        this._copyElt = _({
            elt: this.elt.cloneNode(false),
            child: this.rows.map(r => r.copyElt)
        });

        return this._copyElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXYElt', {
    get: function () {
        if (this._fixedXYElt) return this._fixedXYElt;

        this._fixedXYElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-xy',
            child: this.rows.map(r => r.fixedXYElt)
        });

        return this._fixedXYElt;
    }
});


Object.defineProperty(DTHead.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        console.log(this.rows)
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-x',
            child: this.rows.map(r => r.fixedXElt)
        });

        return this._fixedXElt;
    }
});


Object.defineProperty(DTHead.prototype, 'adapter', {
    get: function () {
        return this.table.wrapper.adapter;
    }
});

export default DTHead;