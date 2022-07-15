import ACore, { _ } from "../../ACore";
import MCheckTreeBox from "../checktreebox/MCheckTreeBox";
import CTLBPropHandlers from "./CTLBPropHandlers";
import OOP from "absol/src/HTML5/OOP";
import CheckTreeLeafItem from "./CheckTreeLeafItem";

/***
 * @extends MCheckTreeBox
 * @constructor
 */
function MCheckTreeLeafBox() {
    MCheckTreeBox.apply(this, arguments);
    this.$box.addClass('as-check-tree-leaf-box');

}

OOP.mixClass(MCheckTreeLeafBox, MCheckTreeBox);

MCheckTreeLeafBox.tag = 'MCheckTreeLeafBox'.toLowerCase();

MCheckTreeLeafBox.prototype.classes = Object.assign({}, MCheckTreeBox.prototype.classes, {
    ItemElement: CheckTreeLeafItem
});

MCheckTreeLeafBox.render = function () {
    return MCheckTreeBox.render();
};

MCheckTreeLeafBox.property = CTLBPropHandlers;


MCheckTreeLeafBox.eventHandler = Object.assign({}, MCheckTreeBox.eventHandler);

ACore.install(MCheckTreeLeafBox);


export default MCheckTreeLeafBox;