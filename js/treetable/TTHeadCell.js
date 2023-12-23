import { _ } from "../../ACore";

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
    if (data.attr) this.elt.attr(data.attr);
    if (data.style) this.elt.addStyle(data.style);
    this.row.head.table.elt.mAdapter.renderHeadCell(this.elt, this.data, this);
}


TTHeadCell.prototype.render = function (){

};

export default TTHeadCell;

