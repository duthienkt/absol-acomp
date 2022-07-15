import ACore, { _ } from "../../ACore";
import SelectListBoxPropHandlers from "./SelectListBoxPropHandlers";
import SLBItemListController from "./SLBItemListController";

/***
 * @extends AElement
 * @constructor
 */
function SelectListBox() {
    this.itemListCtrl = new SLBItemListController(this);
}

SelectListBox.tag = 'selectlistbox_v2'.toLowerCase();

SelectListBox.render = function () {
    return _({
        tag: 'follower',
        attr: {
            tabindex: 0
        },
        class: 'as-select-list-box',
        extendEvent: ['pressitem'],
        child: [
            {
                class: 'as-select-list-box-search-ctn',
                child: 'searchtextinput'
            },
            {
                class: ['as-bscroller', 'as-select-list-box-scroller'],
                child: [
                    {
                        class: ['as-select-list-box-content'],
                        child: Array(SelectListBox.prototype.preLoadN).fill('.as-select-list-box-page')
                    }
                ]
            },
            'attachhook.as-dom-signal'
        ],
        props: {
            anchor: [1, 6, 2, 5]
        }
    });
}

SelectListBox.property = SelectListBoxPropHandlers;

ACore.install('selectlistbox_v2', SelectListBox);

export default SelectListBox;
