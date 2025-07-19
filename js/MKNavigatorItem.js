import ACore, { $, $$, _ } from "../ACore";
import '../css/mknavigator.css';
import BoardTable from "./BoardTable";
import Switch from "./Switch";
import Board from "./Board";
import { hitElement } from "absol/src/HTML5/EventEmitter";

/***
 * @extends AElement
 * @constructor
 */
function MKNavigatorItem() {
    this._data = [];
    this.$text = $('.mk-nav-item-text', this);
    this.$switchCtn = $('.mk-nav-item-switch-ctn', this);
    this.$switch = $('switch', this)
        .on('change', this.eventHandler.switchChange);
    this.$dragzone = $('.mk-nav-item-drag-zone', this);
    this.on('click', this.eventHandler.click);
}

MKNavigatorItem.tag = 'MKNavigatorItem'.toLowerCase();

MKNavigatorItem.render = function () {
    return _({
        tag: Board.tag,
        class: 'mk-nav-item',
        extendEvent: ['checkedchange', 'press'],
        child: [
            {
                class: ['mk-nav-item-drag-zone', BoardTable.DRAG_ZONE_CLASS_NAME],
                child: '<i class="material-icons">drag_indicator</i>'
            },
            {
                class: 'mk-nav-item-icon-ctn',
                child:'span.mdi.mdi-chevron-down-circle'
            },
            {
                class: 'mk-nav-item-text-ctn',
                child: {
                    tag: 'span',
                    class: 'mk-nav-item-text',
                    child: { text: '' }
                }
            },
            {
                class: 'mk-nav-item-switch-ctn',
                child: {
                    tag: Switch.tag
                }
            }
        ]
    });
};

MKNavigatorItem.prototype.updateText = function () {
    this.$text.firstChild.data = this._data.text;
};

MKNavigatorItem.prototype.updateChecked = function () {
    if (typeof this._data.checked === "boolean") {
        this.$switchCtn.removeStyle('display');
        this.$switch.checked = this._data.checked;
    }
    else {
        this.$switchCtn.addStyle('display', 'none');
    }
};

MKNavigatorItem.prototype.updateDraggable = function () {
    if (this._data.draggable) {
        this.$dragzone.removeStyle('display');
    }
    else {
        this.$dragzone.addStyle('display', 'none');
    }
};


MKNavigatorItem.property = {};

MKNavigatorItem.property.level = {
    set: function (value) {
        if (!value) value = 0;
        if (value < 0) value = 0;
        if (value) {
            this.addStyle('--level', value);
            this.addClass('as-children');
        }
        else {
            this.removeStyle('--level', value);
            this.removeClass('as-children')
        }

        this._level = value;
    },
    get: function (){
        return this._level || 0;
    }
}

MKNavigatorItem.property.data = {
    /**
     * @this MKNavigatorItem
     * @param data
     */
    set: function (data) {
        data = data || {};
        this._data = data;
        this.updateText();
        this.updateChecked();
        this.updateDraggable();
    },
    get: function () {
        return this._data;
    }
};

/***
 * @memberOf MKNavigatorItem#
 * @type {{}}
 */
MKNavigatorItem.eventHandler = {};

MKNavigatorItem.eventHandler.switchChange = function (event) {
    this._data.checked = this.$switch.checked;
    this.emit('checkedchange', { type: 'checkedchange' }, this);
};

MKNavigatorItem.eventHandler.click = function (event) {
    if (hitElement(this.$switch, event) || hitElement(this.$dragzone, event)) return;
    this.emit('press', { type: 'press', target: this, originalEvent: event }, this);
}

ACore.install(MKNavigatorItem);


export default MKNavigatorItem;