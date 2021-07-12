import '../css/messageinput.css';
import ACore from "../ACore";
import EventEmitter from 'absol/src/HTML5/EventEmitter';
import {fileSize2Text, openFileDialog} from "./utils";
import XHR from "absol/src/Network/XHR";
import EmojiAnims from "./EmojiAnims";
import EmojiPicker from "./EmojiPicker";
import AElement from "absol/src/HTML5/AElement";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import {randomIdent, randomParagraph} from "absol/src/String/stringGenerate";
import CMDRunner from "absol/src/AppPattern/CMDRunner";
import {keyboardEventToKeyBindingIdent, normalizeKeyBindingIdent} from "absol/src/Input/keyboard";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;


/***
 *
 * @typedef {{text:string, desc: string, img?:string, file?:string}|string} MessageInputQuote
 */

var iconCatalogCaches = {};

export var MODE_NEW = 0;
export var MODE_EDIT = 1;

var isMobile = BrowserDetector.isMobile;

/***
 * @extends AElement
 * @constructor
 */
function MessageInput() {
    this._cmdRunner = new CMDRunner(this);
    this._keyMaps = {};
    this._plugins = [];
    this._mode = MODE_NEW;//edit
    this._editingText = "";
    prepareIcon();
    /**
     * @type {import('./PreInput').default}
     */
    this.$preInput = $('preinput', this);


    this.$preInput.on('change', this.eventHandler.preInputChange)
        .on('keyup', this.eventHandler.preInputKeyUp)
        .on('keydown', this.eventHandler.preInputKeyDown)
        .on('pasteimg', this.eventHandler.preInputPasteImg)
        .on('focus', this.eventHandler.preInputFocus)
        .on('blur', this.eventHandler.preInputBlur);
    // //every can make size change
    this._imageFiles = [];
    this._files = [];


    this._latBound = {};

    this.$quote = $('messagequote.as-message-input-quote', this)
        .on('pressremove', this.eventHandler.clickQuoteRemoveBtn);

    this.$right = $('.as-message-input-right', this);

    this.$attachmentCtn = $('.as-message-input-attachment-ctn', this);
    this.$emojiBtn = $('.as-message-input-plugin-emoji', this)
        .on('click', this.eventHandler.clickEmojiBtn);
    this.$fileBtn = $('.as-message-input-plugin-file', this)
        .on('click', this.openFileDialog.bind(this));
    this.$attachmentAddBtn = $('.as-message-input-attachment-add-btn', this)
        .on('click', this.openFileDialog.bind(this));
    this.$sendBtn = $('.as-message-input-plugin-send', this)
        .on('click', this.notifySend.bind(this));

    this.$cancelBtn = $('.as-message-input-plugin-cancel', this)
        .on('click', this.notifyCancel.bind(this));

    this.$emojiPickerCtn = _('.as-message-input-external-tools-popup');
    this.$emojiPicker = _('emojipicker').addTo(this.$emojiPickerCtn)
        .on('pick', this.eventHandler.pickEmoji);


    this.$attachhook = _('attachhook').addTo(this).on('error', this.notifySizeChange.bind(this));


    this.on('drop', this.eventHandler.drop)
        .on('dragover', this.eventHandler.dragover);

    this.autoSend = false;
    /***
     *
     * @type {MessageInputQuote|null}
     */
    this.quote = null;
}

MessageInput.MODE_EDIT = MODE_EDIT;
MessageInput.MODE_NEW = MODE_NEW;

MessageInput.iconAssetRoot = (function () {
    if (location.hostname.match(/^.+\.absol.cf$/))
        return 'https://absol.cf/exticons/vivid';
    return '/vivid_exticons';
})();

MessageInput.tag = 'MessageInput'.toLowerCase();

MessageInput.render = function (data) {
    data = data || {};
    data.iconAssetRoot = data.iconAssetRoot || MessageInput.iconAssetRoot;
    return _({
        attr: {
            'data-icon-asset-root': MessageInput.iconAssetRoot
        },
        class: 'as-message-input',
        extendEvent: ['sendtext', 'sendimage', 'sendfile', 'sendquote', 'cancel', 'change', 'sizechange', 'send', 'useraddfile'],
        child: [
            {
                class: 'as-message-input-right',
                child: [
                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-file'],
                        child: 'span.mdi.mdi-attachment.mdi-rotate-90'
                    },
                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-send'],
                        child: 'span.mdi.mdi-send'
                    },
                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-cancel'],
                        child: 'span.mdi.mdi-close'
                    }
                ]
            },
            {
                class: 'as-message-input-pre-ctn',
                child: [
                    'messagequote.as-message-input-quote.as-removable.as-shorten-text',
                    {
                        class: 'as-message-input-emoji-btn-ctn',
                        child: {
                            tag: 'button',
                            class: ['as-message-input-plugin-btn', 'as-message-input-plugin-emoji'],
                            child: 'span.mdi.mdi-emoticon-happy-outline'
                        }
                    },
                    {
                        class: ['as-message-input-attachment-ctn', 'as-bscroller'],
                        child: [{
                            tag: 'button',
                            class: 'as-message-input-attachment-add-btn',
                            child: [
                                'span.mdi.mdi-arrow-down-bold.as-message-input-attachment-add-btn-drop',
                                {
                                    tag: 'span',
                                    class: 'as-message-input-attachment-add-btn-plus',
                                    child: {
                                        text: "+"
                                    }
                                }

                            ]
                        }]
                    },
                    'preinput.as-message-input-pre.absol-bscroller'
                ]
            }
        ]
    });
};


MessageInput.prototype.toggleEmoji = function () {
    if (this.containsClass('as-message-input-show-emoji'))
        this.closeEmoji();
    else
        this.showEmoji();
};


MessageInput.prototype.showEmoji = function () {
    if (this.containsClass('as-message-input-show-emoji')) return;
    var value = this.$preInput.value;
    this._lastInputSelectPosion = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
    this.addClass('as-message-input-show-emoji');
    this.addChild(this.$emojiPickerCtn);
    var thisMi = this;
    setTimeout(function () {
        $(document.body).on('mousedown', thisMi.eventHandler.mousedownOutEmoji);
    }, 100);
    this.$preInput.focus();
};


MessageInput.prototype.notifyChange = function () {
    this.emit('change', { name: 'change', target: this }, this);
    if (this.autoSend) {
        if (this.files.length > 0 || this.images.length > 0)
            this.notifySend();
    }
};

MessageInput.prototype.notifySend = function () {
    var eventData = {
        imageRemovePrevented: false,
        fileRemovePrevented: false,
        textRemovePrevented: false,
        quoteRemovePrevented: false,
        target: this,
        files: this.files,
        images: this.images,
        text: this.text
    };
    if (eventData.files.length > 0) {
        this.emit('sendfile', Object.assign(eventData, {
            type: 'sendfile', preventDefault: function () {
                this.fileRemovePrevented = true;
            }
        }), this);
    }

    if (eventData.images.length > 0) {
        this.emit('sendimage', Object.assign(eventData, {
            type: 'sendimage', preventDefault: function () {
                this.imageRemovePrevented = true;
            }
        }), this);
    }

    if ((typeof this.quote === "string") || this.quote) {
        this.emit('sendquote', Object.assign(eventData, {
            type: 'sendquote', preventDefault: function () {
                this.quoteRemovePrevented = true;
            }
        }), this);
    }

    if (this.files.length > 0 || eventData.images.length > 0 || eventData.text || ((typeof this.quote === "string") || this.quote)) {
        if (eventData.text) this.$preInput.focus();
        this.emit('send', Object.assign(eventData, {
            type: 'send', preventDefault: function () {
                this.imageRemovePrevented = true;
                this.fileRemovePrevented = true;
                this.imageRemovePrevented = true;
                this.quoteRemovePrevented = true;

            }
        }), this);
    }
    if (!eventData.fileRemovePrevented) this.files = [];
    if (!eventData.imageRemovePrevented) this.images = [];
    if (!eventData.textRemovePrevented) this.text = '';
    if (!eventData.quoteRemovePrevented) this.quote = null;

};

MessageInput.prototype.notifyCancel = function () {
    this.emit('cancel', {
        type: 'cancel',
        name: 'send', target: this, clearAllContent: this.clearAllContent.bind(this)
    }, this);
};

MessageInput.prototype.clearAllContent = function () {
    this.text = '';
    this.quote = null;
    this.files = [];
    this.images = [];
};

MessageInput.prototype.focus = function () {
    var value = this.$preInput.value;
    var range = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
    this.$preInput.focus();
    this.$preInput.applyData(value, range);
};

MessageInput.prototype.blur = function () {
    this.$preInput.blur();
};


MessageInput.prototype._updateAttachmentClass = function () {
    if (this._imageFiles.length + this._files.length) {
        this.addClass("as-has-attachment");
    }
    else {
        this.removeClass("as-has-attachment");
    }
};

MessageInput.prototype.addImageFiles = function (imageFiles, urls) {
    var thisMi = this;
    Array.prototype.forEach.call(imageFiles, function (file, index) {
        thisMi._imageFiles.push(file);
        var src;
        if (urls) {
            src = urls[index];
        }
        if (!src) {
            src = URL.createObjectURL(file);
        }
        var itemElt = _({
            class: ['as-message-input-attach-preview', 'as-image'],
            attr: {
                title: file.name
            },
            child: [
                {
                    class: 'as-message-input-attach-preview-image',
                    style: {
                        backgroundImage: 'url(' + src + ')'
                    }
                },
                {
                    tag: 'button',
                    class: 'as-message-input-attach-preview-close-btn',
                    child: 'span.mdi.mdi-close',
                    attr: {
                        title: 'remove'
                    },
                    on: {
                        click: function () {
                            thisMi._imageFiles = thisMi._imageFiles.filter(function (it) {
                                return it !== file;
                            });
                            itemElt.remove();
                            thisMi._updateAttachmentClass();
                            thisMi.notifySizeChange();
                            thisMi.notifyChange();
                        }
                    }
                }, {
                    class: 'as-message-input-attach-preview-info',
                    child: [
                        {
                            class: 'as-message-input-attach-preview-name',
                            child: { text: file.name }
                        },
                        {
                            class: 'as-message-input-attach-preview-size',
                            child: { text: fileSize2Text(file.size) }
                        }
                    ]
                }
            ]
        }).addTo(thisMi.$attachmentCtn);
        thisMi.$attachmentCtn.addChildBefore(itemElt, thisMi.$attachmentAddBtn);

    });
    this._updateAttachmentClass();
    this.notifySizeChange();
};

MessageInput.prototype.addFiles = function (files) {
    var thisMi = this;
    Array.prototype.forEach.call(files, function (file, index) {
        thisMi._files.push(file);
        MessageInput.iconSupportAsync.then(function (ExtensionIcons) {
            var src;
            var ext = file.name.split('.').pop().toLowerCase();
            if (ExtensionIcons.indexOf(ext) > 0) {
                src = MessageInput.iconAssetRoot + '/' + ext + '.svg'
            }
            else {
                src = MessageInput.iconAssetRoot + '/' + 'default' + '.svg'

            }
            var itemElt = _({
                class: ['as-message-input-attach-preview', 'as-file'],
                attr: {
                    title: file.name
                },
                child: [
                    {
                        tag: 'img',
                        class: 'as-message-input-attach-preview-file',
                        props: {
                            src: src
                        }
                    },
                    {
                        tag: 'button',
                        class: 'as-message-input-attach-preview-close-btn',
                        child: 'span.mdi.mdi-close',
                        attr: {
                            title: 'remove'
                        },
                        on: {
                            click: function () {
                                thisMi._files = thisMi._files.filter(function (it) {
                                    return it !== file;
                                });
                                itemElt.remove();
                                thisMi._updateAttachmentClass();
                                thisMi.notifySizeChange();
                                thisMi.notifyChange();
                            }
                        }
                    },
                    {
                        class: 'as-message-input-attach-preview-info',
                        child: [
                            {
                                class: 'as-message-input-attach-preview-name',
                                child: { text: file.name }
                            },
                            {
                                class: 'as-message-input-attach-preview-size',
                                child: { text: fileSize2Text(file.size) }
                            }
                        ]
                    }
                ]
            });
            thisMi.$attachmentCtn.addChildBefore(itemElt, thisMi.$attachmentAddBtn);
        });
    });
    this._updateAttachmentClass();
    thisMi.notifySizeChange();
};


MessageInput.prototype.closeEmoji = function () {
    if (!this.containsClass('as-message-input-show-emoji')) return;
    this.removeClass('as-message-input-show-emoji');
    this.removeChild(this.$emojiPickerCtn);
    $(document.body).off('mousedown', this.eventHandler.mousedownOutEmoji);
};


MessageInput.prototype.openFileDialog = function () {
    var thisMi = this;
    openFileDialog({ multiple: true }).then(function (file) {
        if (!thisMi.autoSend) thisMi.$preInput.focus();
        var event = {
            resolvedAsync: Promise.resolve(file),
            files: file,
            resolve: function (result){
                if (!result) {
                    this.resolvedAsync = Promise.resolve(undefined);
                }
                else if(result.then){
                    this.resolvedAsync = result;
                }
                else {
                    this.resolvedAsync = Promise.resolve(result);
                }
            }
        };
        thisMi.emit('useraddfile', event);
        event.resolvedAsync.then(function (files) {
            if (files && files.length > 0)
                thisMi.handleAddingFileByType(file);
        });
    });
};

MessageInput.prototype.handleAddingFileByType = function (files) {
    if (files.length > 0) {
        var imageFiles = [];
        var otherFiles = [];
        var file;
        for (var i = 0; i < files.length; ++i) {
            file = files[i];
            if (!!file.type && file.type.match && file.type.match(/^image\//)) {
                imageFiles.push(file);
            }
            else {
                otherFiles.push(file);
            }
        }
        this.addImageFiles(imageFiles);
        this.addFiles(otherFiles);
        this.notifyChange();
    }
};


MessageInput.prototype.notifySizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._latBound.width != bound.width || this._latBound.height != bound.height) {
        this._latBound.width = bound.width;
        this._latBound.height = bound.height;
        this.emit('sizechange', { name: 'sizechange', bound: bound, target: this }, this);
    }
};

MessageInput.prototype.addPlugin = function (option) {
    var plugin = new this.PluginConstructor(this, option);
    this._plugins.push(plugin);
    this.addStyle('--plugin-buttons-width', this._plugins.length * 45 + 'px');
    return plugin;
};

/***
 *
 * @param {{name?:string, exec:function(_this:MessageInput):void, keyBiding?:string}} option
 */
MessageInput.prototype.addCommand = function (option) {
    option.name = option.name || randomIdent(20);
    this._cmdRunner.add(option.name, option.exec);
    if (option.keyBiding && option.keyBiding.trim) {
        var keyBindingIdent = normalizeKeyBindingIdent(option.keyBiding);
        this._keyMaps[keyBindingIdent] = option.name;
    }
};

MessageInput.prototype.exeCmd = function (name) {
    var args = Array.prototype.slice.call(arguments);
    args[0] = this;
    args.unshift(name);
    this._cmdRunner.invoke.apply(this._cmdRunner, args);
};


MessageInput.prototype._updateQuote = function () {
    this.$quote.data = this._quote;
    if (this._quote)
        this.addClass('as-has-quote');
    else
        this.removeClass('as-has-quote');
    this.notifySizeChange();
};

/**
 * @type {MessageInput}
 */
MessageInput.eventHandler = {};

MessageInput.eventHandler.preInputChange = function (event) {
    var text = this.$preInput.value;
    if (text.length > 0) {
        this.addClass('as-has-text');
    }
    else {
        this.removeClass('as-has-text');
    }

    if (text === this._editingText) {
        this.removeClass('as-text-changed');
    }
    else {
        this.addClass('as-text-changed');

    }
    this.notifySizeChange();
    this.notifyChange();
};

MessageInput.eventHandler.preInputKeyDown = function (event) {
    if (!(event.shiftKey || event.ctrlKey || event.altKey) && event.key === 'Enter') {
        this.notifySend();
        event.preventDefault();
    }
    else if ((event.shiftKey || event.ctrlKey || event.altKey) && event.key === 'Enter') {
        event.preventDefault();
        var text = this.$preInput.value;
        var selectedPos = this.$preInput.getSelectPosition();
        var newText = text.substr(0, selectedPos.start)
            + '\n' + text.substr(selectedPos.end);
        this.$preInput.applyData(newText, selectedPos.start + 1);
        this.notifySizeChange();
        this.$preInput.commitChange(newText, selectedPos.start + 1);
    }
    else if (event.key === "Escape" && this._mode === MODE_EDIT) {
        this.notifyCancel();
        event.preventDefault();
    }
    var keyBindingIdent = keyboardEventToKeyBindingIdent(event);
    if (this._keyMaps[keyBindingIdent]) {
        event.preventDefault();
        this.exeCmd(this._keyMaps[keyBindingIdent]);
    }
    setTimeout(this.notifySizeChange.bind(this), 1);
};

MessageInput.eventHandler.preInputKeyUp = function (event) {
    var value = this.$preInput.value;
    this._lastInputSelectPosion = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
    this.notifySizeChange();
};

MessageInput.eventHandler.preInputPasteImg = function (event) {
    if (this._mode == 'edit') return;
    this.addImageFiles(event.imageFiles, event.urls);
    this.notifyChange();
};


MessageInput.eventHandler.preInputFocus = function () {
    this.addClass('as-focus');
};

MessageInput.eventHandler.preInputBlur = function () {
    this.removeClass('as-focus');
};


MessageInput.eventHandler.clickEmojiBtn = function () {
    this.toggleEmoji();
};

MessageInput.eventHandler.mousedownOutEmoji = function (event) {
    if (EventEmitter.hitElement(this.$emojiPicker, event) || EventEmitter.hitElement(this.$emojiBtn, event)) return;
    this.closeEmoji();
};

MessageInput.eventHandler.pickEmoji = function (event) {
    var text = this.$preInput.value;
    var newText = text.substr(0, this._lastInputSelectPosion.start) + event.key + text.substr(this._lastInputSelectPosion.end);
    var selected = this._lastInputSelectPosion;
    var newOffset = selected.start + event.key.length;
    this._lastInputSelectPosion = { start: newOffset, end: newOffset };
    this.$preInput.focus();
    this.$preInput.applyData(newText, newOffset);
    this.$preInput.commitChange(newText, newOffset);
    this.notifySizeChange();
    this.$preInput.focus();//older firefox version will be lost focus
    // this.notifyChange();//not need
};


MessageInput.eventHandler.dragover = function (event) {
    event.preventDefault();
    this.addClass('as-drag-hover');
    this.notifySizeChange();
    if (this._hoverTimeout > 0)
        clearTimeout(this._hoverTimeout);
    var thisMi = this;
    this._hoverTimeout = setTimeout(function () {
        thisMi._hoverTimeout = -1;
        thisMi.removeClass('as-drag-hover');
        thisMi.notifySizeChange();
    }, 200);
    //todo:
};

MessageInput.eventHandler.drop = function (event) {
    event.preventDefault();
    var imageFiles = [];
    var otherFiles = [];
    if (event.dataTransfer.items) {
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                var file = event.dataTransfer.items[i].getAsFile();
                if (!file.type && file.size % 4096 == 0) {
                    //todo: folder
                }
                else {
                    if (!!file.type && file.type.match && file.type.match(/^image\//)) {
                        imageFiles.push(file);
                    }
                    else {
                        otherFiles.push(file);
                    }
                }

            }
        }
    }
    else {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            var file = event.dataTransfer.files[i];
            if (!file.type && file.size % 4096 == 0) {

            }
            else {
                if (!!file.type && file.type.match && file.type.match(/^image\//)) {
                    imageFiles.push(file);
                }
                else {
                    otherFiles.push(file);
                }
            }
        }
    }

    this.addImageFiles(imageFiles);
    this.addFiles(otherFiles);
    this.notifyChange();
};

MessageInput.eventHandler.clickQuoteRemoveBtn = function () {
    this.quote = null;
    this.notifyChange();
}

MessageInput.property = {};

MessageInput.property.files = {
    set: function (value) {
        $$('.as-file', this.$attachmentCtn).forEach(function (elt) {
            elt.remove();
        });
        value = value || [];
        this._files = [];
        this.addFiles(value);
    },
    get: function () {
        return this._files;
    }
};

MessageInput.property.images = {
    set: function (value) {
        $$('.as-image', this.$attachmentCtn).forEach(function (elt) {
            elt.remove();
        });
        value = value || [];
        this._imageFiles = [];
        this.addImageFiles(value);
    },
    get: function () {
        return this._imageFiles;
    }
};

MessageInput.property.text = {
    set: function (text) {
        this.$preInput.value = '' + text;
        if (text.length > 0) {
            this.addClass('as-has-text');
        }
        else {
            this.removeClass('as-has-text');
        }
        if (this._mode === MODE_EDIT) {
            this._editingText = text;
        }
        this.removeClass('as-text-changed');
    },
    get: function () {
        return this.$preInput.value;
    }
};


/**
 * @type {MessageInput}
 */
MessageInput.property.mode = {
    set: function (value) {
        value = value || MODE_NEW;
        if (value === MODE_EDIT || (value.toLowerCase && value.toLowerCase() === 'edit')) {
            this.addClass('as-mode-edit');
            value = MODE_EDIT;
            this._editingText = this.$preInput.value;
        }
        else {
            value = MODE_NEW;
            this._editingText = '';
            this.removeClass('as-mode-edit');
        }
        this.removeClass('as-text-changed');
        this._mode = value;
    },
    get: function () {
        return this._mode === MODE_EDIT ? 'edit' : 'new';
    }
};

MessageInput.property.autoSend = {
    set: function (value) {
        if (value) {
            this.addClass('as-auto-send');
        }
        else {
            this.removeClass('as-auto-send');
        }
    },
    get: function () {
        return this.containsClass('as-auto-send');
    }
};

MessageInput.property.quote = {
    set: function (quote) {
        this._quote = quote;
        this._updateQuote();
    },
    get: function () {
        return this._quote;
    }
}


ACore.install(MessageInput);

export default MessageInput;


var urlRex = /^(firefox|opera|chrome|https|http|wss|ws):\/\/[^\s]+$/;

export function parseMessage(text, data) {
    data = data || {};
    data.emojiAssetRoot = data.emojiAssetRoot || EmojiPicker.assetRoot;
    data.staticSize = data.staticSize || 20;
    data.animSize = data.animSize || 60;
    var textLines = text.split(/\r?\n/);
    var lines = textLines.map(function (textLine) {
        var longTokenTexts = textLine.split(/\s/);
        var tokenGroups = longTokenTexts.map(function (longTokenText, longTokenIndex) {
            var tokens = [];
            if (longTokenIndex > 0) tokens.push({
                type: 'text',
                value: ' '
            });

            var emojiKey, emojiKeyTemp;
            var subIndex, subIndexTemp;
            var leftToken;
            var found;
            var emoji;
            while (longTokenText.length > 0) {
                found = false;
                subIndex = 10000000;
                for (var i = 0; i < EmojiAnims.length; ++i) {
                    emojiKeyTemp = EmojiAnims[i][0];
                    subIndexTemp = longTokenText.indexOf(emojiKeyTemp);
                    if (subIndexTemp >= 0 && subIndexTemp < subIndex) {
                        subIndex = subIndexTemp;
                        emojiKey = emojiKeyTemp;
                        emoji = EmojiAnims[i];
                        found = true;
                    }
                }

                if (found) {
                    if (subIndex >= 0) {
                        leftToken = longTokenText.substr(0, subIndex);
                        longTokenText = longTokenText.substr(subIndex + emojiKey.length);
                        if (leftToken.length > 0) {
                            tokens.push({
                                type: 'text',
                                value: leftToken
                            });
                        }
                        tokens.push({
                            type: 'emoji',
                            value: emoji
                        });
                        found = true;
                    }
                }
                else {
                    tokens.push({
                        type: 'text',
                        value: longTokenText
                    });
                    longTokenText = '';
                }
            }

            tokens.forEach(function (token) {
                if (token.type == 'text') {
                    var urlMatched = token.value.match(urlRex);
                    if (urlMatched) {
                        token.type = 'url';
                        token.protocal = urlMatched[1]
                    }
                }
            })
            return tokens;
        });
        var tokens = [];

        for (var i = 0; i < tokenGroups.length; ++i) {
            tokens.push.apply(tokens, tokenGroups[i]);
        }

        return tokens.reduce(function (ac, token) {
                if (token.type == 'text' && ac.last.type == 'text') {
                    ac.last.value += token.value;
                }
                else {
                    ac.last = token;
                    ac.result.push(token);
                }
                return ac;
            },
            { result: [], last: { type: 'null' } })
            .result;
    });
    var res = lines.reduce(function (ac, line, lineIndex, lines) {
        line.reduce(function (ac, token) {
            if (token.type == 'text') {
                ac.push({
                    tag: 'span',
                    child: { text: token.value }
                })
            }
            else if (token.type == 'url') {
                ac.push({
                    tag: 'a',
                    class: 'as-protocal-' + token.protocal,
                    child: { text: token.value },
                    props: {
                        href: token.value
                    }
                })
            }
            else if (token.type == 'emoji') {
                ac.push({
                    tag: 'span',
                    class: 'as-emoji-text',
                    child: { text: token.value[0] }
                });
                ac.push({
                    tag: 'img',
                    class: 'as-emoji',
                    props: {
                        src: data.emojiAssetRoot + '/static/x' + data.staticSize + '/' + token.value[1]
                    }
                })
            }
            return ac;
        }, ac);
        if (lineIndex < lines.length - 1 || line.length == 0)
            ac.push('br');
        return ac;
    }, []);
    if (res.length == 2 && res[1].class == 'as-emoji') {
        res[1].tag = 'iconsprite',
            res[1].props.fps = 30;
        res[1].props.src = res[1].props.src.replace('/static/x' + data.staticSize, '/anim/x' + data.animSize);
    }
    return res;
}

MessageInput.parseMessage = parseMessage;

export function prepareIcon() {
    if (!MessageInput.iconSupportAsync) {
        var catalogiUrl = MessageInput.iconAssetRoot + '/catalog.json';
        MessageInput.iconSupportAsync = MessageInput.iconSupportAsync || iconCatalogCaches[catalogiUrl] ? Promise.resolve(iconCatalogCaches[catalogiUrl]) : XHR.getRequest(catalogiUrl).then(function (result) {
            iconCatalogCaches[catalogiUrl] = JSON.parse(result);
            return iconCatalogCaches[catalogiUrl];
        });
    }
    return MessageInput.iconSupportAsync;
}


/***
 * @typedef MessageInputPluginOption
 * @property {string} [id]
 * @property {string|Object|AElement} icon
 * @property {function(_thisAdapter: MessageInputPlugin, _:Dom._, Dom.$):AElement} createContent
 * @property {function(_thisAdapter:MessageInputPlugin):void} onPressTrigger
 */


export function MessageQuote() {
    prepareIcon();
    /***
     *
     * @type {null|MessageInputQuote}
     * @private
     */
    this._data = null;
    this.$img = $('.as-message-quote-img', this);
    this.$text = $('.as-message-quote-text', this);
    this.$desc = $('.as-message-quote-desc', this);
    this.$removeBtn = $('.as-message-quote-remove-btn', this)
        .on('click', this.eventHandler.clickRemoveBtn);
    Object.defineProperty(this, '$text', {
        set: function () {
            console.trace();
        },
        get: function () {
            return $('.as-message-quote-text', this);
        }
    })

}

MessageQuote.tag = 'MessageQuote'.toLowerCase();

MessageQuote.render = function () {
    return _({
        extendEvent: 'pressremove',
        class: 'as-message-quote-box',
        child: [
            {
                class: 'as-message-quote-img'
            },
            {
                class: 'as-message-quote-sym',
                child: 'span.mdi.mdi-format-quote-open-outline'
            },
            {
                class: 'as-message-quote-content',
                child: [
                    {
                        class: 'as-message-quote-text',
                        child: {
                            text: ''
                        }
                    },
                    {
                        class: 'as-message-quote-desc',
                        child: { text: '' }
                    }
                ]
            },
            {
                tag: 'button',
                class: 'as-message-quote-remove-btn',
                child: 'span.mdi.mdi-close'
            }
        ]
    });
};

MessageQuote.property = {};
MessageQuote.eventHandler = {};

MessageQuote.property.removable = {
    set: function (val) {
        if (val) {
            this.addClass('as-removable');
        }
        else {
            this.removeClass('as-removable');
        }
    },
    get: function () {
        return this.containsClass('as-removable');
    }
};

MessageQuote.property.shortenText = {
    set: function (val) {
        if (val) {
            this.addClass('as-shorten-text');
        }
        else {
            this.removeClass('as-shorten-text');
        }
    },
    get: function () {
        return this.containsClass('as-shorten-text');
    }
};

MessageQuote.property.data = {
    set: function (quote) {
        this._data = quote;
        var text, desc;
        var file, img;
        if (typeof quote === "string") {
            text = quote;
            desc = ''
        }
        else if (quote && (typeof quote === "object")) {
            text = quote.text;
            desc = quote.desc;
            file = quote.file;
            img = quote.img;
        }


        if (text === undefined) {
            this.$text.clearChild();
            this.$desc.firstChild.data = '';
            this.removeClass('as-has-file');
            this.removeClass('as-has-img');
        }
        else {
            if (file) {
                file = file.toLowerCase().split('.').pop();
                MessageInput.iconSupportAsync.then(function (iconSupport) {
                    if (iconSupport.indexOf(file) < 0) file = 'default';
                    this.$img.addStyle('background-image', 'url(' + MessageInput.iconAssetRoot + '/' + file + '.svg)');
                }.bind(this));
                this.addClass('as-has-file');
            }
            else
                this.removeClass('as-has-file');

            if (img) {
                this.$img.addStyle('background-image', 'url(' + img + ')');
                this.addClass('as-has-img');
            }
            else this.removeClass('as-has-img');
            if (this.shortenText) text = text.split(/\r?\n/).shift();
            var parsedText = parseMessage(text);
            var textEltChain = parsedText.map(function (c) {
                return _(c);
            });
            this.$text.clearChild().addChild(textEltChain);
            this.$desc.firstChild.data = desc;
        }
    },
    get: function () {
        return this.data;
    }
};

MessageQuote.eventHandler.clickRemoveBtn = function () {
    this.emit('pressremove', { target: this, type: 'pressclose' }, this);
};

ACore.install(MessageQuote);


/***
 *
 * @param {MessageInput} inputElt
 * @param {MessageInputPluginOption} option
 * @constructor
 */
export function MessageInputPlugin(inputElt, option) {
    this.inputElt = inputElt;
    this.icon = option.icon;
    this.id = option.id || randomIdent(16);
    this.$icon = null;
    this.$triggerBtn = null;
    this.$content = null;
    this.$popup = null;
    if (option.createContent) this.createContent = option.createContent;
    if (option.onPressTrigger) this.onPressTrigger = option.onPressTrigger;
    this.ev_pressTrigger = this.ev_pressTrigger.bind(this);
    this.ev_pressOut = this.ev_pressOut.bind(this);
    this.attach();
}


MessageInputPlugin.prototype.attach = function () {
    this.inputElt.$right.addChildBefore(this.getTriggerButton(), this.inputElt.$right.firstChild);
};

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
    }
    return this.$triggerBtn;
};

MessageInputPlugin.prototype.createContent = function (_thisAdapter, _, $) {
    throw  new Error("Not implement!");
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
            class: 'as-message-input-external-tools-popup',
            child: this.getContent()
        });
    }
    return this.$popup;
};

MessageInputPlugin.prototype.openPopup = function () {
    if (this.isPopupOpened()) return;
    this.inputElt.appendChild(this.getPopup());
    document.body.addEventListener('click', this.ev_pressOut);
};


MessageInputPlugin.prototype.closePopup = function () {
    if (!this.isPopupOpened()) return;
    this.getPopup().remove();
    document.body.removeEventListener('click', this.ev_pressOut);

};

MessageInputPlugin.prototype.isPopupOpened = function () {
    return !!this.getPopup().parentElement;
};


MessageInput.prototype.PluginConstructor = MessageInputPlugin;
