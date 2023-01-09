import TTHeadRow from "./TTHeadRow";

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
}




export default TTHead;