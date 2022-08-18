import { _ } from "../../ACore";
import OOP from "absol/src/HTML5/OOP";
import ListDictionary from "../list/ListDictionary";
import { copySelectionItemArray } from "../utils";
import { SLBModeNormal } from "./SLBModes";
import { prepareSearchForList } from "../list/search";


/***
 * @extends ListDictionary
 * @param {SelectListBox} elt
 * @constructor
 */
function SLBItemListController(elt) {
    this.elt = elt;
    this.items = [];
    this.elt.$scroller.on('scroll', this.updateListView.bind(this));
}

OOP.mixClass(SLBItemListController, ListDictionary)


SLBItemListController.itemHeight = 20;
SLBItemListController.preLoadN = 3;
SLBItemListController.prototype.toLoadNextY = 200;

SLBItemListController.prototype.getItems = function () {
    return copySelectionItemArray(this.items);

};

SLBItemListController.prototype.setItems = function (items) {
   this.items = copySelectionItemArray(items ||[]);
   var mode = new SLBModeNormal(this.elt, this.items);
   this.elt.modes.normal = mode;
   this.elt.mode = mode;
   mode.onStart();
};

SLBItemListController.prototype.updateListView = function (){
    this.elt.mode.updateListView();
}


export default SLBItemListController;