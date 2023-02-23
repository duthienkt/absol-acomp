import SelectListBox from "./SelectListBox";
import treeListToList from "./list/treeListToList";
import ACore from "../ACore";
var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;

/***
 * @extends SelectListBox
 * @constructor
 */
function SelectTreeBox() {
    SelectListBox.call(this);
}

SelectTreeBox.tag = 'SelectTreeBox'.toLowerCase();

SelectTreeBox.render = function () {
    return SelectListBox.render().addClass('as-select-tree-box');
};


Object.assign(SelectTreeBox.prototype, SelectListBox.prototype);
SelectTreeBox.property = Object.assign({}, SelectListBox.property);
SelectTreeBox.eventHandler = Object.assign({}, SelectListBox.eventHandler);

SelectTreeBox.prototype._itemsToNodeList = function (items) {
    return treeListToList(items);
};



ACore.install(SelectTreeBox);

export default SelectTreeBox;
