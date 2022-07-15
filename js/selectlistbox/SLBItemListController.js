import { _ } from "../../ACore";
import OOP from "absol/src/HTML5/OOP";
import ListDictionary from "../list/ListDictionary";


/***
 * @extends ListDictionary
 * @param {SelectListBox} elt
 * @constructor
 */
function SLBItemListController(elt) {
    ListDictionary.call(this, []);
    this.elt = elt;
}

OOP.mixClass(SLBItemListController, ListDictionary)


SLBItemListController.itemHeight = 20;
SLBItemListController.preLoadN = 3;
SLBItemListController.prototype.toLoadNextY = 200;

SLBItemListController.prototype.getItems = function () {
    return this.arr.map(cItem => this.cloneItem(cItem));

};

SLBItemListController.prototype.cloneItem = function (item) {
    var res = Object.assign({}, item);
    if (item.items && item.items.map) {
        res.items = item.items.map(cItem => this.cloneItem(cItem));
    }
    return res;
};

SLBItemListController.prototype.setItems = function (items) {
    items = items || [];
    if (!items.map || !items.forEach) {
        items = [];
    }

    this.arr = items.map(cItem => this.cloneItem(cItem));
    this.update();
};

SLBItemListController.prototype.viewAt = function (offset){

};




export default SLBItemListController;