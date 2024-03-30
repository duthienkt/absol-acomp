import { $, _ } from "../../ACore";
import CTLIPropHandlers from "./CTLIPropHandlers";
import OOP from "absol/src/HTML5/OOP";
import { MCheckTreeItem } from "../checktreebox/MCheckTreeBox";

/***
 * @extends AElement
 * @constructor
 */
function CheckTreeLeafItem() {
    this._data = null;
    this._status = 'none';
    this.$text = $('.am-check-tree-item-text', this).firstChild;
    this.$desc = $('.am-check-tree-item-desc', this).firstChild;
    this.$iconCtn = $('.am-check-tree-item-icon-ctn', this);
    this.$checkbox = $('checkboxinput', this)
        .on('change', this.eventHandler.checkboxChange);
    this.addEventListener('click', this.eventHandler.click);

}

OOP.mixClass(CheckTreeLeafItem, MCheckTreeItem);

CheckTreeLeafItem.tag = 'CheckTreeLeafItem'.toLowerCase();

CheckTreeLeafItem.render = function () {
    return _({
        extendEvent: ['checkedchange', 'click', 'statuschange'],
        class: ['am-check-tree-leaf-item', 'am-check-tree-item', 'am-dropdown-box-item'],
        child: [
            {
                class: 'am-check-tree-item-toggle-ctn',
                child: 'toggler-ico'
            },
            {
                class: 'am-check-tree-item-icon-ctn'
            },
            {
                class: 'am-check-tree-item-checkbox-ctn',
                child: 'checkboxinput'
            },
            {
                class: 'am-check-tree-item-text',
                child: { text: '' }
            },
            {
                class: 'am-check-tree-item-desc',
                child: { text: '' }
            }
        ]
    });
};


CheckTreeLeafItem.eventHandler = Object.assign({}, MCheckTreeItem.eventHandler);

CheckTreeLeafItem.property = CTLIPropHandlers;

/***
 * @name data
 * @memberOf CheckTreeLeafItem#
 */

/***.
 * @name text
 * @type {string}
 * @memberOf CheckTreeLeafItem#
 */

/***
 * @name desc
 * @type {string}
 * @memberOf CheckTreeLeafItem#
 */

/***
 * @name value
 * @memberOf CheckTreeLeafItem#
 */



export default CheckTreeLeafItem;
