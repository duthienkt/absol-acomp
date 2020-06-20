/***
 *
 * @param {Array<SelectionItem>} items
 * @returns {Array<SelectionItem>}
 */
export default function treeListToList(items) {
    var arr = [];
    function visit(level, node) {
        node.level = level;
        arr.push(node);
        if (node.items && node.items.length > 0) node.items.forEach(visit.bind(null, level + 1));
    }
    items.forEach(visit.bind(null, 0));
    return arr;
}