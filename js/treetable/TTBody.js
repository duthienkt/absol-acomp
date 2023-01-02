import TTRow from "./TTRow";

/***
 *
 * @param {TTTable}table
 * @param {TTDBody} data
 * @constructor
 */
function TTBody(table, data){
    this.table = table;
    this.data = data;
    this.elt = this.table.elt.$body;
    /***
     *
     * @type {TTRow[]}
     */
    this.rows = (this.data.rows ||[]).map(rowData => new TTRow(this, rowData, null));
    this.elt.clearChild().addChild(this.rows.reduce((ac, row)=>{
        row.getRowElements(ac);
        return ac;
    }, []));
}


export default TTBody;