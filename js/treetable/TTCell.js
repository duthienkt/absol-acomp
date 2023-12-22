import { _ } from "../../ACore";
import DTBodyCell from "../dynamictable/DTBodyCell";

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
                class: 'as-tree-table-cell',
                props: {
                    ttCell: this
                },
                on: {
                    click: (event) => {
                        if (this.data && this.data.on && this.data.on.click) {
                            this.data.on.click.call(this._elt, event, this);
                        }
                    }
                }
            });
            if (typeof this.data.class === "string") {
                this.data.class.trim().split(/\s+/).forEach(clzz => {
                    this._elt.addClass(clzz);
                });
            }
            this.row.body.table.elt.mAdapter.renderBodyCell(this.elt, this.data, this);
        }
        return this._elt;
    }
});


Object.defineProperty(TTCell.prototype, 'innerText', Object.getOwnPropertyDescriptor(DTBodyCell.prototype, 'innerText'));


export default TTCell;