import SelectListBox from "./SelectListBox";
import treeListToList from "./list/treeListToList";
import ACore from "../ACore";
import {searchTreeListByText} from "./list/search";
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



//todo
SelectTreeBox.prototype.searchItemByText = function (text) {
    text = text.trim();
    if (text.length == 0) return this._items;
    if (this._searchCache[text]) return this._searchCache[text];
    this._searchCache[text] = searchTreeListByText(text, this._items);
    return this._searchCache[text];
};

ACore.install(SelectTreeBox);

export default SelectTreeBox;
