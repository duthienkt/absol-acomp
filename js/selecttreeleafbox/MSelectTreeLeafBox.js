import ACore, { $, _ } from "../../ACore";
import SearchTextInput from "../Searcher";
import '../../css/selecttreeeleafbox.css';
import MSTLBItemListController from "./MSTLBItemListController";
import { STLBModeNormal } from "./STLBModes";
import STLBPropsHandlers from "./STLBPropsHandlers";
import MCheckTreeBox from "../checktreebox/MCheckTreeBox";
import { hitElement } from "absol/src/HTML5/EventEmitter";

/****
 * @extends AElement
 * @constructor
 */
function MSelectTreeLeafBox() {
    this.$box = $('.am-dropdown-box', this);
    this.$list = $('.am-select-tree-leaf-box-list', this);
    this.itemListCtrl = new MSTLBItemListController(this);
    this.$searchInput = $(SearchTextInput.tag, this).on('stoptyping', this.eventHandler.searchTextInputModify);
    this.$boxCloseBtn = $('.am-dropdown-box-close-btn', this);
    this.on('click', function (event) {
        if (event.target === this || hitElement(this.$boxCloseBtn, event)) {
            this.emit('close', { type: 'close', target: this }, this);
        }
    }.bind(this));
    this.modes = {
        normal: new STLBModeNormal(this, []),
        search: null
    }
    this.mode = this.modes.normal;
}

MSelectTreeLeafBox.tag = 'MSelectTreeLeafBox'.toString();

MSelectTreeLeafBox.render = function () {
    return _({
        extendEvent: ['pressitem', 'close'],
        class: ['am-modal', 'am-dropdown-box-modal'],
        child: {
            class: ['am-select-tree-leaf-box', 'am-dropdown-box', 'as-dropdown-box-common-style'],
            child: [
                {
                    class: 'am-dropdown-box-header',
                    child: [
                        {
                            tag: SearchTextInput.tag
                        },
                        {
                            tag: 'button',
                            class: 'am-dropdown-box-close-btn',
                            child: 'span.mdi.mdi-close'
                        }
                    ]
                },
                {
                    class: ['am-dropdown-box-body', 'am-select-tree-leaf-box-body'],
                    child: {
                        class: 'am-select-tree-leaf-box-list'
                    }
                }
            ]
        }
    });
};


MSelectTreeLeafBox.prototype.viewToSelected = function () {
    this.modes.normal.viewToSelected();
};

MSelectTreeLeafBox.prototype.notifyPressItem = function () {
    delete this.pendingValue;
    this.emit('pressitem', { type: 'pressitem', target: this }, this);
};

MSelectTreeLeafBox.prototype.getItemByValue = function (value) {
    return this.modes.normal.getItemByValue(value);
};

MSelectTreeLeafBox.prototype.resetSearchState = MCheckTreeBox.prototype.resetSearchState;

MSelectTreeLeafBox.property = STLBPropsHandlers;

MSelectTreeLeafBox.eventHandler = {};

MSelectTreeLeafBox.eventHandler.searchTextInputModify = MCheckTreeBox.eventHandler.searchTextInputModify;


ACore.install(MSelectTreeLeafBox);

export default MSelectTreeLeafBox;