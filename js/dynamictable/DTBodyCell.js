import { _ } from "../../ACore";

/***
 *
 * @param {DTBodyRow} row
 * @param data
 * @constructor
 */
function DTBodyCell(row, data) {
    this.row = row;
    this.elt = _({ tag: 'td', class: 'as-dt-body-cell' });
    this.data = data;
    this.render();
}

DTBodyCell.prototype.render = function () {
    this.row.head.table.adapter.renderBodyCell(this.elt, this.data, this);
};


export default DTBodyCell;