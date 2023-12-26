import { _ } from "../../ACore";
import DTBodyCell from "../dynamictable/DTBodyCell";
import { addElementClassName } from "../utils";

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
                addElementClassName(this._elt, this.data.class);
            }
            if (this.data.attr) this._elt.attr(this.data.attr);
            if (this.data.class) this._elt.addClass(this.data.class);
            if (this.data.style) this._elt.addStyle(this.data.style);

            this.row.body.table.elt.mAdapter.renderBodyCell(this.elt, this.data, this);
        }
        return this._elt;
    }
});


Object.defineProperty(TTCell.prototype, 'innerText', Object.getOwnPropertyDescriptor(DTBodyCell.prototype, 'innerText'));


export default TTCell;