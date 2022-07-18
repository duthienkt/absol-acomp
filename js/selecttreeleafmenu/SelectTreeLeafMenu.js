import { $, _ } from "../../ACore";
import STLMPropHandlers from "./STLMPropHandlers";
import MSelectTreeLeafBox from "../selecttreeleafbox/MSelectTreeLeafBox";
import MSLTLMBoxController from "./MSLTLMBoxController";
import OOP from "absol/src/HTML5/OOP";

function SelectTreeLeafMenu() {
    this.$box = _({
        tag: MSelectTreeLeafBox,
        on: {
            pressitem: this.eventHandler.boxPressItem
        }
    });
    OOP.drillProperty(this, this.$box, 'enableSearch');
    this.$holderItem = $('selectlistitem', this);
    this.boxCtrl = new MSLTLMBoxController(this);
    this.strictValue = true;//default
}


SelectTreeLeafMenu.tag = 'SelectTreeLeafMenu'.toLowerCase();

SelectTreeLeafMenu.render = function () {
    return _({
        class: ['am-select-tree-menu', 'absol-selectmenu', 'as-select-menu', 'as-select-tree-leaf-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: 'selectlistitem'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            }
        ]
    });
};

SelectTreeLeafMenu.prototype._updateText = function () {
    var value = this.value;
    var item = this.$box.getItemByValue(value);
    this.$holderItem.data = item || { text: '', value: 0 };

};

SelectTreeLeafMenu.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this }, this);
};

SelectTreeLeafMenu.eventHandler = {};

SelectTreeLeafMenu.eventHandler.boxPressItem = function () {
    setTimeout(() => {
        this.isFocus = false;
    }, 100);
};


SelectTreeLeafMenu.property = STLMPropHandlers;

export default SelectTreeLeafMenu;