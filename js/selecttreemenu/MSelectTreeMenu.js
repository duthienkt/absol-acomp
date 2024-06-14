import '../../css/selecttreemenu.css';

import ACore, { $, _ } from "../../ACore";
import MSelectMenu from "../selectmenu/MSelectMenu";

import treeListToList from "../list/treeListToList";
import MListModal from "../selectlistbox/MListModal";
import { calcWidthLimit } from "../SelectListBox";



/***
 * @extends MListModal
 * @constructor
 */
export function MTreeModal() {
    MListModal.call(this);
}


MTreeModal.tag = 'MTreeModal'.toLowerCase();

MTreeModal.render = function () {
    return MListModal.render().addClass('am-tree-modal');
};


Object.assign(MTreeModal.prototype, MListModal.prototype);

MTreeModal.prototype._listToDisplay = function (items) {
    return treeListToList(items);
};


MTreeModal.property = Object.assign({}, MListModal.property);


MTreeModal.eventHandler = Object.assign({}, MListModal.eventHandler);


/**
 * @extends {AElement}
 * @constructor
 */
function MSelectTreeMenu() {
    this._isFocus = false;
    this._itemsByValue = {};
    this.$holderItem = $('.am-selectmenu-holder-item', this);

    /***
     * @type {MTreeModal}
     */
    this.$selectlist = _({ tag: MTreeModal });
    this.$selectlist.cancelWaiting();

    this.$selectlist.on('pressitem', this.eventHandler.pressItem, true)
        .on('pressout', this.eventHandler.pressOut)
        .on('pressclose', this.eventHandler.pressOut);
    this.on('click', this.eventHandler.click, true);
    this.$attachhook = $('attachhook', this).on('error', this.eventHandler.attached);

    this.addStyle('--as-width-limit', calcWidthLimit() + 'px');
}

MSelectTreeMenu.tag = 'MSelectTreeMenu'.toLowerCase();

MSelectTreeMenu.render = function () {
    return MSelectMenu.render().addClass('am-select-tree-menu');
};

Object.assign(MSelectTreeMenu.prototype, MSelectMenu.prototype);
MSelectTreeMenu.property = Object.assign({}, MSelectMenu.property);
MSelectTreeMenu.eventHandler = Object.assign({}, MSelectMenu.eventHandler);

MSelectTreeMenu.prototype._dictByValue = function (items) {
    return items.reduce(function visitor(ac, cr) {
        if (cr.items && cr.items.reduce) {
            cr.items.reduce(visitor, ac);
        }
        var value = cr.value + '';
        ac[value] = cr;
        return ac;
    }, {})
};

ACore.install(MSelectTreeMenu);

export default MSelectTreeMenu;