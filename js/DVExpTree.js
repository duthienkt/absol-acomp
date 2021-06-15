import ExpTree from "./ExpTree";
import ACore, {_} from "../ACore";
import '../css/dvexptree.css';

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
        extendEvent: ['radiochange', 'indexchange'],
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
    this.$node.insertBefore(this.$radio, this.$node.$removeIcon);
    this.$index = _({
        tag: 'input',
        attr: { type: 'text' },
        on: {
            change: this.eventHandler.indexChange
        }
    });
    this.$node.insertBefore(this.$index, this.$node.$desc)
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
        return this.containsClass('as-has-index-input');
    }
};

DVExpTree.property.indexValue = {
    enumerable: true,
    set: function (value) {
        this.$index.value = value;
    },
    get: function () {
        return this.$index.value;
    }
};

DVExpTree.eventHandler = {};

DVExpTree.eventHandler.radioChange = function (event) {
    this.emit('radiochange', Object.assign({}, event, { target: this, radioElt: this.$radio }), this);
};

DVExpTree.eventHandler.indexChange = function (event) {
    this.emit('indexchange', Object.assign({}, event, { target: this, indexInput: this.$index }), this);
};


ACore.install(DVExpTree);


export default DVExpTree;