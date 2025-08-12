import '../css/selecttreemenu.css';
import ACore from "../ACore";
import OOP, { mixClass } from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu2";
import SelectTreeBox from "./SelectTreeBox";
import { AbstractInput } from "./Abstraction";

var _ = ACore._;
var $ = ACore.$;


/***
 * @augments AbstractStyleExtended
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
    if (!this.$selectlistBox.cancelWaiting) {
        this.$selectlistBox.cancelWaiting();
    }
    this.$selectlistBox.on('pressitem', this.eventHandler.selectListBoxPressItem);
    this.$selectlistBox.followTarget = this;
    this.$selectlistBox.sponsorElement = this;
    this.$selectlistBox.unfollow();
    OOP.drillProperty(this, this.$selectlistBox, 'enableSearch');

    this._lastValue = "NOTHING_VALUE";
    this._isFocus = false;
    this.isFocus = false;

    this.on('mousedown', this.eventHandler.click, true);
    AbstractInput.call(this);
}

mixClass(SelectTreeMenu, AbstractInput);

SelectTreeMenu.tag = 'SelectTreeMenu'.toLowerCase();

SelectTreeMenu.prototype.styleHandlers = Object.assign({},SelectMenu.property.styleHandlers);
SelectTreeMenu.prototype.extendStyle = Object.assign({}, SelectMenu.property.extendStyle);

SelectTreeMenu.render = function () {
    return SelectMenu.render().addClass('as-select-tree-menu');
};

SelectTreeMenu.eventHandler = Object.assign({}, SelectMenu.eventHandler);
SelectTreeMenu.property = Object.assign(SelectTreeMenu.property || {}, SelectMenu.property);


Object.assign(SelectTreeMenu.prototype, SelectMenu.prototype);
// console.log(SelectTreeMenu.property.isFocus);


ACore.install(SelectTreeMenu);

export default SelectTreeMenu;
