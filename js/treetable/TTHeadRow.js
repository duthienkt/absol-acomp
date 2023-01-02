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
    this.elt.addChild(this.cells.map(cell=> cell.elt));
}


export default TTHeadRow;