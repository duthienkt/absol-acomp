import { _ } from "../../ACore";
import { addElementClassName } from "../utils";

/***
 *
 * @param {TTHeadRow} row
 * @param {TTDHeadCell} data
 * @constructor
 */
function TTHeadCell(row, data){
    this.row = row;
    this.data = data;
    this.elt = _({
        tag:'th',
        class: 'as-tree-table-head-cell'
    });

    this.elt.defineEvent('click');
    this.elt.addEventListener('click', function (event) {
       this.emit('click', event, this);
    });

    if (data.on) {
        this.elt.on(data.on);
    }
    if (data.attr) this.elt.attr(data.attr);
    if (data.style) this.elt.addStyle(data.style);
    if (this.data.class) {
        addElementClassName(this.elt, this.data.class);
    }
    this.row.head.table.elt.mAdapter.renderHeadCell(this.elt, this.data, this);
}


TTHeadCell.prototype.render = function (){

};

export default TTHeadCell;

