import { $, _ } from "../../ACore";
import DTHeadCell from "./DTHeadCell";
import DTBodyCell from "./DTBodyCell";
import { randomIdent } from "absol/src/String/stringGenerate";

/***
 *
 * @param {DTBody} body
 * @param data
 * @constructor
 */
function DTBodyRow(body, data) {
    this.body = body;
    this.data = data;
    this._elt = null;

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
    this.cells = this.data.cells.map(function (cellData) {
        return new DTBodyCell(this, cellData);
    }.bind(this));
}


DTBodyRow.prototype.remove = function () {
    this.body.removeRow(this);
};

DTBodyRow.prototype.viewInto = function () {
    return this.body.viewIntoRow(this);
};

Object.defineProperty(DTBodyRow.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({ tag: 'tr', class: 'as-dt-body-row' });
            this._elt.dtBodyRow = this;
            this._elt.attr('data-id', this.id + '');
            this._elt.addChild(this.cells.map(function (cell) {
                return cell.elt;
            }));
            this.$idx = $('.as-dt-row-index', this._elt);
            this.draggable = !!$('.as-drag-zone', this._elt);
            if (this.$idx)
                this.$idx.attr('data-idx', this._idx + 1 + '');
        }

        return this._elt;
    }
});

Object.defineProperty(DTBodyRow.prototype, 'innerText', {
    get: function () {
        if (this.data.innerText) return this.data.innerText;
        if (this.data.getInnerText) return  this.data.getInnerText();
        return this.cells.map(function (cell) {
            return cell.innerText;
        }).join(' ');
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


export default DTBodyRow;