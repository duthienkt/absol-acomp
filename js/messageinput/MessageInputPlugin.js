import { randomIdent } from "absol/src/String/stringGenerate";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { $, _ } from "../../ACore";
import noop from "absol/src/Code/noop";

/***
 * @typedef MessageInputPluginOption
 * @property {string} [id]
 * @property {string|Object|AElement} icon
 * @property {function(_thisAdapter: MessageInputPlugin, _:Dom._, Dom.$):AElement} createContent
 * @property {function(_thisAdapter:MessageInputPlugin):void} onPressTrigger
 * @property {"left"|"right"} popupAlign
 * @property {boolean=} alwaysVisible
 */


/***
 *
 * @param {MessageInput} inputElt
 * @param {MessageInputPluginOption} opt
 * @constructor
 */
function MessageInputPlugin(inputElt, opt) {
    this.opt = opt || {};

    this.inputElt = inputElt;
    this.icon = opt.icon;
    this.id = opt.id || randomIdent(16);
    this.alwaysVisible = !!opt.alwaysVisible;
    this.$icon = null;
    this.$triggerBtn = null;
    this.$content = null;
    this.$popup = null;
    if (opt.createContent) this.createContent = opt.createContent;
    if (opt.onPressTrigger) this.onPressTrigger = opt.onPressTrigger;

    this.autoClose = true;
    if ('autoClose' in opt) {
        this.autoClose = !!opt.autoClose;
    }
    this.popupAlign = opt.popupAlign || 'left';
    this.ev_pressTrigger = this.ev_pressTrigger.bind(this);
    this.ev_pressOut = this.ev_pressOut.bind(this);
}

MessageInputPlugin.prototype.isMessagePlugin = true;


MessageInputPlugin.prototype.ev_pressTrigger = function (event) {
    var value = this.inputElt.$preInput.value;
    this._lastInputSelectPosion = this.inputElt.$preInput.getSelectPosition() || {
        start: value.length,
        end: value.length
    };
    if (this.onPressTrigger) {
        this.onPressTrigger(this);
    }
    else {
        if (this.isPopupOpened()) {
            this.closePopup();
        }
        else {
            this.openPopup();
        }
    }
};

MessageInputPlugin.prototype.insertText = function (itext) {
    if (!this._lastInputSelectPosion) {
        throw new Error('Invalid call');
    }

    var text = this.inputElt.$preInput.value;
    var newText = text.substr(0, this._lastInputSelectPosion.start) + itext + text.substr(this._lastInputSelectPosion.end);
    var selected = this._lastInputSelectPosion;
    var newOffset = selected.start + itext.length;
    this.inputElt.$preInput.focus();
    this.inputElt.$preInput.applyData(newText, newOffset);
    this.inputElt.$preInput.commitChange(newText, newOffset);
    this.inputElt.notifySizeChange();
    this.inputElt.$preInput.focus();
};


MessageInputPlugin.prototype.appendText = function (itext) {
    if (!this._lastInputSelectPosion) {
        throw new Error('Invalid call');
    }
    var text = this.inputElt.$preInput.value;
    var newText = text + itext;
    var newOffset = newText.length;
    this.inputElt.$preInput.focus();
    this.inputElt.$preInput.applyData(newText, newOffset);
    this.inputElt.$preInput.commitChange(newText, newOffset);
    this.inputElt.notifySizeChange();
    this.inputElt.$preInput.focus();
}

MessageInputPlugin.prototype.replaceText = function (itext) {
    if (!this._lastInputSelectPosion) {
        throw new Error('Invalid call');
    }
    var newText = itext;
    var newOffset = newText.length;
    this.inputElt.$preInput.focus();
    this.inputElt.$preInput.applyData(newText, newOffset);
    this.inputElt.$preInput.commitChange(newText, newOffset);
    this.inputElt.notifySizeChange();
    this.inputElt.$preInput.focus();
}


MessageInputPlugin.prototype.ev_pressOut = function (event) {
    if (EventEmitter.hitElement(this.getTriggerButton(), event)) return;
    if (EventEmitter.hitElement(this.getPopup(), event)) return;
    if (!this.autoClose) return;
    this.closePopup();
};


MessageInputPlugin.prototype.getIconElt = function () {
    if (!this.$icon)
        this.$icon = _(this.icon);
    return this.$icon;
};


MessageInputPlugin.prototype.getTriggerButton = function () {
    if (!this.$triggerBtn) {
        this.$triggerBtn = _({
            tag: 'button',
            class: ['as-message-input-plugin-btn', 'as-message-input-plugin-' + this.id],
            child: this.getIconElt(),
            on: {
                click: this.ev_pressTrigger
            }
        });
        if (this.alwaysVisible) {
            this.$triggerBtn.addClass('as-always-visible');
        }
    }
    return this.$triggerBtn;
};

MessageInputPlugin.prototype.createContent = function (_thisAdapter, _, $) {
    return _({
        tag: 'div'
    });
};

/***
 *
 * @type {null|function(_thisAdapter:MessageInputPlugin):void}
 */
MessageInputPlugin.prototype.onPressTrigger = null;


MessageInputPlugin.prototype.getContent = function () {
    if (!this.$content)
        this.$content = this.createContent(this.inputElt, _, $);
    return this.$content;
};


MessageInputPlugin.prototype.getPopup = function () {
    if (!this.$popup) {
        this.$popup = _({
            class: ['as-message-input-external-tools-popup', 'as-align-' + this.popupAlign],
            child: this.getContent()
        });
    }
    return this.$popup;
};

MessageInputPlugin.prototype.openPopup = function () {
    if (this.isPopupOpened()) return;
    this.inputElt.appendChild(this.getPopup());
    document.body.addEventListener('click', this.ev_pressOut);
    this.onOpen();
    if (this.opt.onOpen) {
        this.opt.onOpen.call(this, this.inputElt, _, $);
    }
};


MessageInputPlugin.prototype.closePopup = function () {
    if (!this.isPopupOpened()) return;
    if (this.opt.onClose) {
        this.opt.onClose.call(this, this.inputElt, _, $);
    }
    this.onClose();
    this.getPopup().remove();
    document.body.removeEventListener('click', this.ev_pressOut);

};

MessageInputPlugin.prototype.isPopupOpened = function () {
    return !!this.getPopup().parentElement;
};

MessageInputPlugin.prototype.onOpen = noop;
MessageInputPlugin.prototype.onClose = noop;

Object.defineProperty(MessageInputPlugin.prototype, 'contentElt', {
    get: function () {
        return this.getContent();
    }
});

export default MessageInputPlugin;