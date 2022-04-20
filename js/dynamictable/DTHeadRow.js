import { _ } from "../../ACore";
import DTHeadCell from "./DTHeadCell";

/***
 *
 * @param {DTHead} head
 * @param data
 * @constructor
 */
function DTHeadRow(head, data) {
    this.head = head;
    this.data = data;
    this.elt = _({
        tag: 'tr',
        class: 'as-dt-head-row'
    });
    this.renderCells();
}


DTHeadRow.prototype.renderCells = function (event) {
    this.cells = this.data.cells.map(function (cellData) {
        return new DTHeadCell(this, cellData);
    }.bind(this));
    this.elt.addChild(this.cells.map(function (cell) {
        return cell.elt;
    }));
};

export default DTHeadRow;