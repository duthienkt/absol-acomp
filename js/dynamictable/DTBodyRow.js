import { $, _ } from "../../ACore";
import DTBodyCell from "./DTBodyCell";
import { randomIdent } from "absol/src/String/stringGenerate";
import { addElementClassName } from "../utils";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";

/***
 *
 * @param {DTBody} body
 * @param data
 * @constructor
 */
function DTBodyRow(body, data) {
    this.body = body;
    this.data = data;
    this.data.cells = this.data.cells || [];
    this._elt = null;
    this._fixedXElt = null;
    this.filterKeys = Object.assign({}, this.data.keys);
    this.data.cells.reduce((ac, cr, i) => {
        if (typeof cr.keySort === "string") {
            ac['[' + i + ']'] = nonAccentVietnamese(cr.keySort).toLowerCase();
        }
        else if (typeof cr.keySort === "number") {
            ac['[' + i + ']'] = cr.keySort;
        }
        else if (typeof cr.innerText === "string") {
            ac['[' + i + ']'] = nonAccentVietnamese(cr.innerText).toLowerCase();
        }
        return ac;
    }, this.filterKeys);

    if ('id' in data) {
        this.id = data.id;
    }
    else {
        this.id = randomIdent(8);
    }
    this._idx = null;
    /***
     * @type {DTBodyCell[]}
     */
    this.cells = this.data.cells.map((cellData) => new DTBodyCell(this, cellData));
    this.cells.reduce((ac, cell) => {
        cell.idx = ac;
        return ac + cell.colspan;
    }, 0);
}

DTBodyRow.prototype.revoke = function () {
    while (this.cells.length) {
        this.cells.pop().revoke();
    }
    this.cells = null;
    this.data = null;
    this.body = null;
    if (this._elt) this._elt.dtBodyRow = null;
    this._elt = null;
    this.$id = null;
    this.draggable = null;
};

DTBodyRow.prototype.revokeResource = function () {
};


DTBodyRow.prototype.remove = function () {
    this.body.removeRow(this);
};

DTBodyRow.prototype.viewInto = function () {
    return this.body.viewIntoRow(this);
};

DTBodyRow.prototype.updateCopyEltSize = function () {
    if (!this._fixedXElt) return;
    if (!this._elt.parentElement) return;
    if (this._fixedXElt.childNodes.length === 0) return;//has no fixed column
    var bound = this._elt.getBoundingClientRect();
    this._fixedXElt.addStyle('height', bound.height + 'px');
};

DTBodyRow.prototype.updateData = function (data) {
    var rowIdx = this.body.rowIndexOf(this.data);
    this.body.data.rows[rowIdx] = data;
    this.data = data;
    if ('id' in data) {
        this.id = data.id;
    }
    else {
        this.id = randomIdent(8);
    }
    this.cells = this.data.cells.map((cellData) => new DTBodyCell(this, cellData));
    this.cells.reduce((ac, cell) => {
        cell.idx = ac;
        return ac + cell.colspan;
    }, 0);

    if (this._elt) {
        this._elt.attr('data-id', this.id + '');
        this._elt.clearChild().addChild(this.cells.map(function (cell) {
            return cell.elt;
        }));
        this.$idx = $('.as-dt-row-index', this._elt);
        this.draggable = !!$('.as-drag-zone', this._elt);
        if (this.$idx)
            this.$idx.attr('data-idx', this._idx + 1 + '');
    }
    this.body.onRowSplice(rowIdx);
};


Object.defineProperty(DTBodyRow.prototype, 'elt', {
    get: function () {
        if (this._elt) return this._elt;
        var fixedCol = this.adapter.fixedCol || 0;
        var child = this.cells.filter(c => c.idx < fixedCol).map(c => c.copyElt);
        var child1 = this.cells.filter(c => c.idx >= fixedCol).map(c => c.elt);

        this._elt = _({
            tag: 'tr', class: 'as-dt-body-row', props: {
                dtBodyRow: this
            },
            child: child.concat(child1)
        });
        this._elt.attr('data-id', this.id + '');
        if (this.data.class) {
            addElementClassName(this._elt, this.data.class);
        }
        if (this.data.attr) {
            this._elt.attr(this.data.attr);
        }
        if (this.data.style) {
            this._elt.addStyle(this.data.style);
        }
        if (this.data.on) {
            Object.keys(this.data.on).forEach(key => {
                var cb = this.data.on[key];
                if (typeof cb !== "function") return;
                this._elt.on(key, event => {
                    cb.call(this._elt, event, this);
                });
            });
        }


        this.$idx = this.cells.reduce((ac, c) => {
            return ac || $('.as-dt-row-index', c.elt);
        }, null);
        this.draggable = !!$('.as-drag-zone', this._elt);
        if (this.$idx)
            this.$idx.attr('data-idx', this._idx + 1 + '');

        var originAddStyle = this._elt.addStyle;
        var originRemoveStyle = this._elt.removeStyle;
        var originAddClass = this._elt.addClass;
        var originRemoveClass = this._elt.removeClass;

        var isOverrideStyle = x=> ['background-color', 'backgroundColor', 'color'].includes(x);
        var thisCTL = this;
        this._elt.addStyle = function (key, value) {
            originAddStyle.apply(this, arguments);
            if (thisCTL._fixedXElt && isOverrideStyle(key)) {
                thisCTL._fixedXElt.addStyle(key, value);
            }
            return this;
        };

        this._elt.removeStyle = function (key) {
            originRemoveStyle.apply(this, arguments);
            if (thisCTL._fixedXElt && isOverrideStyle(key)) {
                thisCTL._fixedXElt.removeStyle(key);
            }
            return this;
        };

        this._elt.addClass = function () {
            originAddClass.apply(this, arguments);
            if (thisCTL._fixedXElt) {
                thisCTL._fixedXElt.addClass.call(thisCTL._fixedXElt, arguments);
            }
            return this;
        };

        this._elt.removeClass = function () {
            originRemoveClass.apply(this, arguments);
            if (thisCTL._fixedXElt) {
                thisCTL._fixedXElt.removeClass.call(thisCTL._fixedXElt, arguments);
            }
            return this;
        };


        return this._elt;
    }
});


Object.defineProperty(DTBodyRow.prototype, 'fixedXElt', {
    get: function () {
        if (this._fixedXElt) return this._fixedXElt;
        var fixedCol = this.adapter.fixedCol || 0;
        this._fixedXElt = _({
            elt: this.elt.cloneNode(false),
            class: 'as-dt-fixed-x',
            child: this.cells.slice(0, fixedCol).map(cell => cell.elt)
        });

        return this._fixedXElt;
    }
});


Object.defineProperty(DTBodyRow.prototype, 'innerText', {
    get: function () {
        if (this.data.innerText) return this.data.innerText;
        if (this.data.getInnerText) return this.data.getInnerText();
        if ('innerText' in this.data) return this.data.innerText || '';
        return this.cells.map(function (cell) {
            return cell.innerText.trim();
        }).filter(text => !!text).join(' / ');
    }
});

Object.defineProperty(DTBodyRow.prototype, 'idx', {
    set: function (value) {
        if (this.$idx)
            this.$idx.attr('data-idx', value + 1 + '');
        this._idx = value;
    },
    get: function () {
        return this._idx;
    }
});


Object.defineProperty(DTBodyRow.prototype, 'adapter', {
    get: function () {
        return this.body.adapter;
    }
});


export default DTBodyRow;