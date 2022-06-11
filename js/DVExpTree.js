import ExpTree from "./ExpTree";
import ACore, {_} from "../ACore";
import '../css/dvexptree.css';
import {hitElement} from "absol/src/HTML5/EventEmitter";

/***
 * @extends ExpTree
 * @constructor
 */
function DVExpTree() {
    this.injectInput();

}

DVExpTree.tag = 'DVExpTree'.toLowerCase();

DVExpTree.render = function () {
    return _({
        tag: ExpTree.tag,
        extendEvent: ['radiochange', 'indexclick'],
        class: 'as-dv-exp-tree'
    }, true);
};

DVExpTree.prototype.injectInput = function () {
    this.$radio = _({
        tag: 'radiobutton',
        on: {
            change: this.eventHandler.radioChange
        }
    });
    this.$node.insertBefore(this.$radio, this.$node.$extIcon);
    this.$index = _({
        tag: 'span',
        class: 'as-dv-exp-tree-index',
        on: {
            click: this.eventHandler.indexClick
        }
    });
    this.$node.insertBefore(this.$index, this.$node.$desc);
    this.$node.on('click', this.eventHandler.clickInNode);
};


DVExpTree.property = {};

DVExpTree.property.radioName = {
    enumerable: true,
    set: function (value) {
        if (!value) {
            this.removeClass('as-has-radio');
            this.$radio.name = undefined;
        }
        else {
            this.addClass('as-has-radio');
            this.$radio.name = value + '';
        }
    },
    get: function () {
        return this.$radio.name;
    }
};

DVExpTree.property.radioValue = {
    enumerable: true,
    set: function (value) {
        this.$radio.value = value;
    },
    get: function () {
        return this.$radio.value;
    }
};

DVExpTree.property.radioChecked = {
    enumerable: true,
    set: function (value) {
        this.$radio.checked = value;
    },
    get: function () {
        return this.$radio.checked;
    }
};


DVExpTree.property.hasIndex = {
    enumerable: true,
    set: function (value) {
        if (value)
            this.addClass('as-has-index-input');
        else
            this.removeClass('as-has-index-input');
    },
    get: function () {
        return this.hasClass('as-has-index-input');
    }
};

DVExpTree.property.indexValue = {
    enumerable: true,
    set: function (value) {
        this.$index.innerHTML = value;
    },
    get: function () {
        return this.$index.innerHTML;
    }
};

DVExpTree.eventHandler = {};

DVExpTree.eventHandler.radioChange = function (event) {
    this.emit('radiochange', Object.assign({}, event, { target: this, radioElt: this.$radio }), this);
};

DVExpTree.eventHandler.indexClick = function (event) {
    this.emit('indexclick', Object.assign({}, event, { target: this, indexInput: this.$index }), this);
};


DVExpTree.eventHandler.clickInNode = function (event) {
    if (hitElement(this.$index, event) || hitElement(this.$radio, event) || hitElement(this.$node.$toggleIcon, event)) return;
    if (hitElement(this.$node, event) && this.radioName)
        this.$radio.click();
};

ACore.install(DVExpTree);


export default DVExpTree;