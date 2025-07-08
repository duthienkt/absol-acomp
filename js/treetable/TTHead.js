import TTHeadRow from "./TTHeadRow";
import { addElementClassName } from "../utils";

/***
 *
 * @param {TTTable} table
 * @param {TTDHead} data
 * @constructor
 */
function TTHead(table, data) {
    this.data = data;
    this.table = table;
    this.elt = this.table.elt.$head;
    this.rows = (this.data.rows || []).map(rowData => new TTHeadRow(this, rowData));
    this.elt.clearChild().addChild(this.rows.map(r=> r.elt));
    if (this.data.class) {
        addElementClassName(this.elt, this.data.class);
    }
}




export default TTHead;