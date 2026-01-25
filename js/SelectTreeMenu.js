import '../css/selecttreemenu.css';
import ACore from "../ACore";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import SelectMenu, { SMDropdownController, SMLifecycleController, SMMobileDropdownController } from "./SelectMenu2";
import SelectTreeBox from "./SelectTreeBox";
import { AbstractInput } from "./Abstraction";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import { MTreeModal } from "./selecttreemenu/MSelectTreeMenu";

var _ = ACore._;
var $ = ACore.$;


/***
 * @augments AbstractStyleExtended
 * @extends SelectMenu
 * @constructor
 */
function SelectTreeMenu() {
    this.isMobile = BrowserDetector.isMobile;
    this._items = [];
    this._value = null;
    this._lastValue = null;
    this.$holderItem = $('.absol-selectmenu-holder-item', this);
    this.$viewItem = $('.absol-selectmenu-holder-item selectlistitem', this);
    if (this.isMobile) {
        /***
         * @type {MTreeModal}
         */
        this.$selectlistBox = _({ tag: MTreeModal });
    }
    else {
        /***
         *
         * @type {SelectTreeBox}
         */
        this.$selectlistBox = _({
            tag: 'selecttreebox',
            props: {
                anchor: [1, 6, 2, 5]
            },
            on: {
            }
        });
    }

    this.dropdownCtrl = this.isMobile? new SMMobileDropdownController(this): new SMDropdownController(this);
    this.lifecycleCtrl = new SMLifecycleController(this);

    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);

    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');

    this._lastValue = "NOTHING_VALUE";

    AbstractInput.call(this);
}

mixClass(SelectTreeMenu, AbstractInput, SelectMenu);

SelectTreeMenu.tag = 'SelectTreeMenu'.toLowerCase();


SelectTreeMenu.render = function () {
    return SelectMenu.render().addClass('as-select-tree-menu');
};


ACore.install(SelectTreeMenu);

export default SelectTreeMenu;
