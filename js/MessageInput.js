import ACore from "../ACore";
import EventEmitter from 'absol/src/HTML5/EventEmitter';
import { openFileDialog } from "./utils";
import XHR from "absol/src/Network/XHR";
var _ = ACore._;
var $ = ACore.$;


var iconCatalogCaches = {};

function MessageInput() {
    this._iconAssetRoot = this.attr('data-icon-asset-root');
    var catalogiUrl = this._iconAssetRoot + '/catalog.json';
    this._iconSupportAsync = iconCatalogCaches[catalogiUrl] ? Promise.resolve(iconCatalogCaches[catalogiUrl]) : XHR.getRequest(catalogiUrl).then(function (result) {
        iconCatalogCaches[catalogiUrl] = JSON.parse(result);
        return iconCatalogCaches[catalogiUrl];
    });
    this.$preInput = $('preinput', this);
    this.$preInput.on('change', this.eventHandler.preInputChange)
        .on('keyup', this.eventHandler.preInputKeyUp)
        .on('keydown', this.eventHandler.preInputKeyDown)
        .on('pasteimg', this.eventHandler.preInputPasteImg);
    //every can make size change
    this._imageFiles = [];
    this._files = [];
    this._latBound = {};

    this.$fileList = $('.as-message-input-file-list', this);
    this.$emojiBtn = $('.as-message-input-plugin-btn.as-message-input-plugin-emoji', this)
        .on('click', this.eventHandler.clickEmojiBtn);
    this.$fileBtn = $('.as-message-input-plugin-btn.as-message-input-plugin-file', this)
        .on('click', this.openFileDialog.bind(this));
    this.$imageBtn = $('.as-message-input-plugin-btn.as-message-input-plugin-image', this)
        .on('click', this.openImageFileDialog.bind(this));

    this.$sendBtn = $('.as-message-input-send-btn', this)
        .on('click', this.notifySend.bind(this));

    this.$extenalTool = $('.as-message-input-extenal-tools', this);
    this.$emojiPickerCtn = _('.as-message-input-extenal-tools-popup');
    this.$emojiPicker = _('emojipicker').addTo(this.$emojiPickerCtn)
        .on('pick', this.eventHandler.pickEmoji);
    this.$attachhook = _('attachhook').addTo(this).on('error', this.notifySizeChange.bind(this));
    this.on('drop', this.eventHandler.drop)
        .on('dragover', this.eventHandler.dragover);
};


MessageInput.iconAssetRoot = 'https://absol.cf/exticons/vivid';

MessageInput.render = function (data) {
    data = data || {};
    data.iconAssetRoot = data.iconAssetRoot || MessageInput.iconAssetRoot;
    return _({
        class: 'as-message-input',
        attr: {
            'data-icon-asset-root': data.iconAssetRoot,
            tabindex: '1' //tabindex to prevent open new tab after drop 
        },
        extendEvent: ['sizechange', 'change', 'send'],
        child: [
            {
                class: 'as-message-input-extenal-tools',
                child: [

                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-emoji'],
                        child: 'span.mdi.mdi-sticker-emoji'
                    },
                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-image'],
                        child: 'span.mdi.mdi-image'
                    },

                    {
                        tag: 'button',
                        class: ['as-message-input-plugin-btn', 'as-message-input-plugin-file'],

                        child: 'span.mdi.mdi-paperclip'
                    }

                ]
            },
            {
                class: 'as-message-input-body',
                child: [
                    'preinput.as-message-input-text-input.absol-bscroller',
                    {
                        tag: 'button',
                        class: 'as-message-input-send-btn',
                        child: 'span.mdi.mdi-send'
                    }
                ]
            },
            {
                class: 'as-message-input-file-list'
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
    this.$extenalTool.addChild(this.$emojiPickerCtn);
    var thisMi = this;
    setTimeout(function () {
        $(document.body).on('mousedown', thisMi.eventHandler.mousedownOutEmoji);
    }, 100);
    this.$preInput.focus();
};


MessageInput.prototype.notifyChange = function () {
    this.emit('change', { name: 'change', target: this }, this);
};

MessageInput.prototype.notifySend = function () {
    this.emit('send', {
        name: 'send', target: this, clearAllContent: this.clearAllContent.bind(this)
    }, this);
};

MessageInput.prototype.clearAllContent = function () {
    this.text = '';
    this.files = [];
    this.images = [];
};

MessageInput.prototype.focus = function () {
    this.$preInput.focus();
};

MessageInput.prototype.blur = function () {
    this.$preInput.blur();
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
            class: ['as-message-input-attach-preview', 'as-message-input-attach-image'],
            attr: {
                title: file.name
            },
            child: [
                {
                    tag: 'img',
                    class: 'as-message-input-attach-preview-image',
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
                            thisMi._imageFiles = thisMi._imageFiles.filter(function (it) {
                                return it != file;
                            });
                            itemElt.remove();
                            thisMi.notifyChange();
                        }
                    }
                }
            ]
        }).addTo(thisMi.$fileList);
    });
    this.notifySizeChange();
    this.$preInput.focus();
};

MessageInput.prototype.addFiles = function (files) {
    var thisMi = this;
    Array.prototype.forEach.call(files, function (file, index) {
        thisMi._files.push(file);
        thisMi._iconSupportAsync.then(function (ExtensionIcons) {
            var src;
            var ext = file.name.split('.').pop().toLowerCase();
            if (ExtensionIcons.indexOf(ext) > 0) {
                src = thisMi._iconAssetRoot + '/' + ext + '.svg'
            }
            else {
                src = thisMi._iconAssetRoot + '/' + 'default' + '.svg'

            }
            var itemElt = _({
                class: ['as-message-input-attach-preview', 'as-message-input-attach-file'],
                attr: {
                    title: file.name
                },
                child: [
                    {
                        tag: 'img',
                        class: 'as-message-input-attach-preview-image',
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
                                    return it != file;
                                });
                                itemElt.remove();
                                thisMi.notifyChange();
                            }
                        }
                    }
                ]
            }).addTo(thisMi.$fileList);
        });
        thisMi.notifySizeChange();
    });
    thisMi.$preInput.focus();
};


MessageInput.prototype.closeEmoji = function () {
    if (!this.containsClass('as-message-input-show-emoji')) return;
    this.removeClass('as-message-input-show-emoji');
    this.$extenalTool.removeChild(this.$emojiPickerCtn);
    $(document.body).off('mousedown', this.eventHandler.mousedownOutEmoji);
};

MessageInput.prototype.openFileDialog = function () {
    var thisMi = this;
    openFileDialog({ multiple: true }).then(function (files) {
        if (files.length > 0) {
            var imageFiles= [];
            var otherFiles = [];
            var file;
            for (var i = 0; i < files.length; ++i){
                file = files[i];
                if (!!file.type && file.type.match && file.type.match(/^image\//)){
                    imageFiles.push(file);
                }
                else{
                    otherFiles.push(file);
                }
            }
            thisMi.addImageFiles(imageFiles);
            thisMi.addFiles(otherFiles);
            thisMi.notifyChange();
        }
    });
};


MessageInput.prototype.openImageFileDialog = function () {
    var thisMi = this;
    openFileDialog({ multiple: true, accept: "image/*" }).then(function (files) {
        if (files.length > 0) {
            thisMi.addImageFiles(files);
            thisMi.notifyChange();
        }
    });
};


MessageInput.prototype.notifySizeChange = function () {
    var bound = this.getBoundingClientRect();
    if (this._latBound.width != bound.width || this._latBound.height != bound.height) {
        this._latBound.width = bound.width;
        this._latBound.height = bound.height;
        this.emit('sizechange', { name: 'sizechange', bound: bound, target: this }, this);
    }
};



MessageInput.eventHandler = {};

MessageInput.eventHandler.preInputChange = function (event) {
    this.notifySizeChange();
    this.notifyChange();
};

MessageInput.eventHandler.preInputKeyDown = function (event) {
    if (!event.shiftKey && event.key == 'Enter') {
        this.notifySend();
        event.preventDefault();
    }
    setTimeout(this.notifySizeChange.bind(this), 1);
};

MessageInput.eventHandler.preInputKeyUp = function (event) {
    var value = this.$preInput.value;
    this._lastInputSelectPosion = this.$preInput.getSelectPosition() || { start: value.length, end: value.length };
};

MessageInput.eventHandler.preInputPasteImg = function (event) {
    this.addImageFiles(event.imageFiles, event.urls);
    this.notifyChange();
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
    this.$preInput.applyData(newText, newOffset);
    this.$preInput.commitChange(newText, newOffset);
    this.notifySizeChange();
    this.$preInput.focus();//older firefox version will be lost focus
    this.notifyChange();
};


MessageInput.eventHandler.dragover = function (event) {
    event.preventDefault();
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


MessageInput.property = {};

MessageInput.property.files = {
    set: function (value) {
        $('.as-message-input-attach-file', this.$fileList, function (elt) {
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
        $('.as-message-input-attach-image', this.$fileList, function (elt) {
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
    set: function (value) {
        this.$preInput.value = '' + value;
    },
    get: function () {
        return this.$preInput.value;
    }
}


ACore.install('messageinput', MessageInput);

export default MessageInput;