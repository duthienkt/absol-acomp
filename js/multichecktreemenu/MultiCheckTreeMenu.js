import ACore, { $, _ } from "../../ACore";
import MCTMPropHandlers from "./MCTMPropHandlers";
import MMCTMBoxController from "./MMCTMBoxController";
import MCheckTreeBox from "../checktreebox/MCheckTreeBox";
import MCTMTokenController from "./MCTMTokenController";

/***
 * @extends AElement
 * @constructor
 */
function MultiCheckTreeMenu() {
    this.$box = _({
        tag: MCheckTreeBox
    });
    this.$itemCtn = $('.as-multi-select-menu-item-ctn', this);
    this.boxCtrl = new MMCTMBoxController(this);
    this.tokenCtrl = new MCTMTokenController(this);
}

MultiCheckTreeMenu.tag = 'MultiCheckTreeMenu'.toLowerCase();

MultiCheckTreeMenu.render = function () {
    return _({
        class: ['as-multi-select-menu', 'as-multi-check-tree-menu'],
        extendEvent: ['change'],
        attr: {
            tabindex: '1'
        },
        child: [
            {
                class: ['as-multi-select-menu-item-ctn', 'as-bscroller']
            },
            {
                tag: 'button',
                class: 'as-multi-select-menu-toggle-btn',
                child: 'dropdown-ico'
            },
            'attachhook'
        ]

    });
};

MultiCheckTreeMenu.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this }, this);
};

MultiCheckTreeMenu.property = MCTMPropHandlers;

ACore.install(MultiCheckTreeMenu);

export default MultiCheckTreeMenu;