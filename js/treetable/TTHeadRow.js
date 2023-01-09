import { _ } from "../../ACore";
import TTHeadCell from "./TTHeadCell";

/**
 *
 * @param {TTHead} head
 * @param {TTDHeadRow} data
 * @constructor
 */
function TTHeadRow(head, data) {
    this.head = head;
    this.data = data;
    this.cells = this.data.cells.map(cellData => new TTHeadCell(this, cellData));
    this.elt = _({
        tag:'tr',
        class:'as-tree-table-head-row'
    });
    this.elt.addChild(this.cells.map((cell, i)=> cell.elt.attr('data-col-idx', ''+i)));
}


export default TTHeadRow;