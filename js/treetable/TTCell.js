import { _ } from "../../ACore";

/***
 *
 * @param {TTRow} row
 * @param {TTDCell} data
 * @constructor
 */
function TTCell(row, data) {
    this.row = row;
    this.data = data;

}

Object.defineProperty(TTCell.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: 'td',
                class: 'as-tree-table-cell'
            });
            this.row.body.table.elt.mAdapter.renderBodyCell(this.elt, this.data, this);
        }
        return this._elt;
    }
});

export default TTCell;