import { _ } from "../../ACore";
import DTHeadCell from "./DTHeadCell";
import DTBodyCell from "./DTBodyCell";

/***
 *
 * @param {DTBody} head
 * @param data
 * @constructor
 */
function DTBodyRow(head, data) {
    this.head = head;
    this.data = data;
    this.elt = _({ tag: 'tr', class: 'as-dt-body-row' });
    this.renderCells();
}


DTBodyRow.prototype.renderCells = function () {
    this.cells = this.data.cells.map(function (cellData) {
        return new DTBodyCell(this, cellData);
    }.bind(this));
    this.elt.addChild(this.cells.map(function (cell) {
        return cell.elt;
    }));
};

export default DTBodyRow;