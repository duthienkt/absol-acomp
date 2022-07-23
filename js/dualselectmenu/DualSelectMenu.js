import { $, _ } from "../../ACore";
import MDualSelectBox from "../dualselectbox/MDualSelectBox";
import MDSMBoxController from "./MDSMBoxController";
import DSMPropsHandlers from "./DSMPropsHandlers";
import OOP from "absol/src/HTML5/OOP";
import { charWidth } from "../utils";

function DualSelectMenu() {
    this.$box = _({
        tag: MDualSelectBox,
    });
    this.$item = $('.absol-selectlist-item', this);
    OOP.drillProperty(this, this.$box, 'enableSearch');
    this.boxCtrl = new MDSMBoxController(this);
}


DualSelectMenu.tag = 'DualSelectMenu'.toLowerCase();

DualSelectMenu.render = function () {
    return _({
        class: ['am-dual-select-menu', 'absol-selectmenu', 'as-dual-select-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: 'absol-selectmenu-holder-item',
                child: '.absol-selectlist-item'
            },
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            'attachhook',
        ]
    });
};

DualSelectMenu.prototype.notifyChange = function () {
    console.log('change')
    delete this['pendingValue'];
    this.emit('change', { type: 'change', target: this }, this);
};

DualSelectMenu.prototype.updateText = function () {
    var selectedItem = this.$box.selectedItem;
    var format = this.format;

    var firstToken = '__';
    var secToken = '__';
    if (selectedItem[0]) {
        firstToken = selectedItem[0].text + ''
    }

    if (selectedItem[1]) {
        secToken = selectedItem[1].text + ''
    }

    var text = format.replace('$0', firstToken)
        .replace('$1', secToken);
    this.$item.clearChild().addChild(_({
        tag: 'span',
        child: { text: text }
    }));
};


DualSelectMenu.property = DSMPropsHandlers;

DualSelectMenu.eventHandler = {};



export default DualSelectMenu;