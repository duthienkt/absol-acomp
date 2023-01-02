import TTHead from "./TTHead";
import TTBody from "./TTBody";

/***
 *
 * @param {TreeTable} elt
 * @param data
 * @constructor
 */
function TTTable(elt, data) {
    this.data = data;
    this.elt = elt;
    this.head = new TTHead(this, this.data.head);
    this.body = new TTBody(this, this.data.body);
}

export default TTTable;