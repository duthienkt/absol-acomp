import { _ } from "../../ACore";

/***
 *
 * @param {DTHeadRow} row
 * @param data
 * @constructor
 */
function DTHeadCell(row, data){
    this.row = row;
    this.elt = _({tag: 'th', class:'as-dt-header-cell' });
    this.data = data;
    this.render();
}

DTHeadCell.prototype.render = function (){
    this.row.head.table.adapter.renderHeadCell(this.elt, this.data, this);
};





export default DTHeadCell;