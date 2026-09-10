import ExpTree from "./ExpTree";
import ACore, {_} from "../ACore";
import '../css/dvexptree.css';
import {hitElement} from "absol/src/HTML5/EventEmitter";

/***
 * @extends ExpTree
 * @constructor
 */
function CXExpTree() {
    this.injectInput();

}

CXExpTree.tag = 'CXExpTree'.toLowerCase();

CXExpTree.render = function () {
    return _({
        tag: ExpTree.tag,
        extendEvent: ['checkboxchange'],
        class: 'as-cx-exp-tree'
    }, true);
};

CXExpTree.prototype.injectInput = function () {
    this.$checkbox = _({
        tag: 'checkboxbutton',
        on: {
            change: this.eventHandler.checkboxChange
        }
    });
    this.$node.insertBefore(this.$checkbox, this.$node.$extIcon);
    this.on('press', this.eventHandler.press);
};


CXExpTree.property = {};


CXExpTree.property.checked = {
    enumerable: true,
    set: function (value) {
        this.$checkbox.checked = value;
    },
    get: function () {
        return this.$checkbox.checked;
    }
};



CXExpTree.eventHandler = {};

CXExpTree.eventHandler.checkboxChange = function (event) {
    this.emit('checkboxchange', Object.assign({}, event, { target: this, checkboxElt: this.$checkbox }), this);
};


CXExpTree.eventHandler.press = function (event) {
    if (hitElement(this.$checkbox, event.originalEvent)) return;//double-click event on checkbox
    this.$checkbox.click();
};

ACore.install(CXExpTree);


export default CXExpTree;