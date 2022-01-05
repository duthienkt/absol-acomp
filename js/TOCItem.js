import ACore, { $, _ } from "../ACore";
import '../css/toclist.css';
import CheckBoxInput from "./CheckBoxInput";
import Dom from "absol/src/HTML5/Dom";
import { measureText } from "./utils";
import { hitElement } from "absol/src/HTML5/EventEmitter";


/***
 * @extends AElement
 * @constructor
 */
function TOCItem() {
    this.$iconP = null;
    this.$iconCtn = $('.as-toc-item-ext-icon-ctn', this);
    this._status = 'none';
    this.$name = $('.as-toc-item-name', this);
    this.$nameInput = $('.as-toc-item-name-input', this)
        .on('keydown', this.eventHandler.keyDownNameInput)
        .on('paste', this.eventHandler.keyDownNameInput);
    this.$toggleCtn = $('.as-toc-item-toggle-ico-ctn', this)
        .on('click', this.eventHandler.clickToggleCtn);
    this._level = 0;
    this.$checkbox = $(CheckBoxInput.tag, this)
        .on('change', this.eventHandler.checkedChange);
    this.$checkbox.disabled = true;
    this.$checkbox.addStyle('display', 'none');
    this.$checkIco = $('.as-toc-item-check-ctn .mdi-check', this)
        .addStyle('display', 'none')
        .addStyle('font-size', '18px');

    this.$quickMenuBtn = $('.as-toc-item-quick-menu-ctn button', this)
        .on('click', this.eventHandler.clickQuickMenuBtn);
    this.on('click', this.eventHandler.click);
    /***
     * @name name
     * @type {string}
     * @memberOf TOCItem#
     */

    /***
     * @name status
     * @type {"none"|"open"|"close"}
     * @memberOf TOCItem#
     */

    /***
     * @name level
     * @type {number}
     * @memberOf TOCItem#
     */
    /***
     * @name checked
     * @type {boolean}
     * @memberOf TOCItem#
     */
    /***
     * @name nodeData
     * @type {{}}
     * @memberOf TOCItem#
     */
}

TOCItem.tag = 'TOCItem'.toLowerCase();

TOCItem.render = function () {
    return _({
        class: 'as-toc-item',
        extendEvent: ['presstoggle', 'checkedchange', 'pressquickmenu', 'press'],
        child: [
            {
                class: 'as-toc-item-toggle-ico-ctn',
                child: 'toggler-ico'
            },
            '.as-toc-item-ext-icon-ctn',
            {
                class: 'as-toc-item-name-ctn',
                child: [
                    {
                        tag: 'span',
                        class: 'as-toc-item-name',
                        child: { text: 'đây là cái tên' }
                    },
                    {
                        tag: 'input',
                        class: 'as-toc-item-name-input',
                        attr: { type: 'text' }
                    }
                ]
            },
            {
                class: 'as-toc-item-check-ctn',
                child: [{
                    tag: CheckBoxInput.tag
                }, 'span.mdi.mdi-check']
            },
            {
                class: 'as-toc-item-quick-menu-ctn',
                child: {
                    tag: 'button',

                    child: 'span.mdi.mdi-dots-vertical'
                }
            }
        ]
    });
};

TOCItem.property = {};


TOCItem.property.icon = {
    set: function (value) {
        if (this.$iconP) {
            this.$iconP.remove();
            this.$iconP = undefined;
        }
        if (value) {
            var newE;
            if (!Dom.isDomNode(value)) {
                newE = _(value);
            }
            this.$iconP = newE;
            this.$iconCtn.addChild(newE);
            this._icon = value;
        }
        else {
            this._icon = undefined;
        }
    },
    get: function () {
        return this._icon;
    }
};


TOCItem.property.status = {
    set: function (value) {
        this.removeClass('as-status-' + this._status);
        this._status = value;
        this.addClass('as-status-' + value);
    },
    get: function () {
        return this._status;
    }
};


TOCItem.property.name = {
    set: function (value) {
        this.$name.firstChild.data = value || '';
    },
    get: function () {
        return this.$name.firstChild.data;
    }
};

TOCItem.property.level = {
    set: function (value) {
        this._level = value;
        this.addStyle('--level', value + '');
    },
    get: function () {
        return this._level;
    }
};


TOCItem.property.checked = {
    set: function (value) {
        this.$checkbox.checked = value;
        if (value) {
            this.$checkIco.removeStyle('display');
        }
        else {
            this.$checkIco.addStyle('display', 'none');

        }
    },
    get: function () {
        return this.$checkbox.checked;
    }
};


TOCItem.prototype.rename = function () {
    this.addClass('as-renaming');
    var name = this.name;
    var textWidth = measureText(name, '14px Arial, Helvetica, sans-serif').width;
    this.$nameInput.addStyle('width', textWidth + 2 + 'px');
    this.$nameInput.value = name;
    this.$nameInput.focus();
    this.$nameInput.select();
    this.$nameInput.once('blur', function () {
        if (this.$nameInput.value !== name) {
            //todo
            this.name = this.$nameInput.value;
        }
        this.removeClass('as-renaming');
    }.bind(this));
};


/***
 * @memberOf TOCItem#
 * @type {{}}
 */
TOCItem.eventHandler = {};

TOCItem.eventHandler.keyDownNameInput = function (event) {
    var extendText = '';
    if (event.type === 'paste') {
        extendText = (event.clipboardData || window.clipboardData).getData('text') || '';
    }
    else if (event.key.length === 1 && !(event.ctrl && event.key === 'C')) {
        extendText = event.key;
    }
    else if (event.key === 'Enter') {
        this.$nameInput.blur();
    }

    if (extendText.length > 0) {
        this.$nameInput.addStyle('width', measureText(this.$nameInput.value + extendText, '14px Arial, Helvetica, sans-serif').width + 2 + 'px');
    }


    setTimeout(function () {
        var name = this.$nameInput.value;
        this.$nameInput.addStyle('width', measureText(name, '14px Arial, Helvetica, sans-serif').width + 2 + 'px');
    }.bind(this), 0);
};

TOCItem.eventHandler.clickToggleCtn = function (event) {
    if (this.status === 'close' || this.status === 'open')
        this.emit('presstoggle', { originalEvent: event, type: 'presstoggle' }, this);
};


TOCItem.eventHandler.checkedChange = function (event) {
    this.emit('checkedchange', { type: 'checkedchange', target: this, originalEvent: event }, this);
};

TOCItem.eventHandler.clickQuickMenuBtn = function (event) {
    this.emit('pressquickmenu', { type: 'pressquickmenu', originalEvent: event }, this);
};

TOCItem.eventHandler.click = function (event) {
    if (!hitElement(this.$checkbox, event) && !hitElement(this.$quickMenuBtn, event)) {
        if (!hitElement(this.$toggleCtn, event) || !(this.status === "close" || this.status === 'open')) {
            this.emit('press', { type: 'press', originalEvent: event }, this)
        }
    }
};


ACore.install(TOCItem);


export default TOCItem;