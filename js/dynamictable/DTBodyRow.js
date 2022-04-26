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
    this.elt = _({ tag: 'tr', class: 'as-dt-body-row' });
    this.elt.dtBodyRow = this;
    if ('id' in data) {
        this.id = data.id;
        this.elt.attr('data-id', data.id + '')
    }
    else {
        this.id = randomIdent(8);
    }
    this.renderCells();
    this.draggable = !!$('.as-drag-zone', this.elt);
}


DTBodyRow.prototype.renderCells = function () {
    /***
     * @type {DTBodyCell[]}
     */
    this.cells = this.data.cells.map(function (cellData) {
        return new DTBodyCell(this, cellData);
    }.bind(this));
    this.elt.addChild(this.cells.map(function (cell) {
        return cell.elt;
    }));
};

DTBodyRow.prototype.remove = function () {
    this.body.removeRow(this);
};

DTBodyRow.prototype.viewInto = function () {
    return this.body.viewIntoRow(this);
};

Object.defineProperty(DTBodyRow.prototype, 'innerText', {
    get: function () {
        return this.cells.map(function (cell) {
            return cell.innerText;
        }).join(' ');
    }
});


export default DTBodyRow;