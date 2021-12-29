import '../css/selecttreemenu.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu2";
import SelectTreeBox from "./SelectTreeBox";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends SelectMenu
 * @constructor
 */
function SelectTreeMenu() {
    this._items = [];
    this._value = null;
    this._lastValue = null;
    this.$holderItem = $('.absol-selectmenu-holder-item', this);
    this.$viewItem = $('.absol-selectmenu-holder-item selectlistitem', this);
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
            preupdateposition: this.eventHandler.preUpdateListPosition
        }
    });
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.followTarget = this;
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');

    this._lastValue = "NOTHING_VALUE";
    this._isFocus = false;
    this.isFocus = false;

    this.on('mousedown', this.eventHandler.click, true);
}

SelectTreeMenu.tag = 'SelectTreeMenu'.toLowerCase();

SelectTreeMenu.render = function () {
    return SelectMenu.render().addClass('as-select-tree-menu');
};

SelectTreeMenu.eventHandler = Object.assign({}, SelectMenu.eventHandler);
SelectTreeMenu.property = Object.assign({}, SelectMenu.property);


Object.assign(SelectTreeMenu.prototype, SelectMenu.prototype);


ACore.install(SelectTreeMenu);

export default SelectTreeMenu;
