import ACore, { _ } from "../../ACore";
import MCTLMPropHandler from "./MCTLMPropHandler";
import MultiCheckTreeMenu from "../multichecktreemenu/MultiCheckTreeMenu";
import OOP from "absol/src/HTML5/OOP";
import MCheckTreeLeafBox from "../checktreeleafbox/MCheckTreeLeafBox";

function MultiCheckTreeLeafMenu() {
    MultiCheckTreeMenu.apply(this, arguments)
}

OOP.mixClass(MultiCheckTreeLeafMenu, MultiCheckTreeMenu);

MultiCheckTreeLeafMenu.tag = 'MultiCheckTreeLeafMenu'.toLowerCase();

MultiCheckTreeLeafMenu.prototype.classes = {
    Box: MCheckTreeLeafBox
}

MultiCheckTreeLeafMenu.render = function () {
    return MultiCheckTreeMenu.render().addClass('as-multi-check-tree-leaf-menu');
};


MultiCheckTreeLeafMenu.property = MCTLMPropHandler;

ACore.install(MultiCheckTreeLeafMenu);

export default MultiCheckTreeLeafMenu;