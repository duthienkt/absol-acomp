import '../css/fileinputbox.css';
import ACore, { _, $ } from "../ACore";
import DropZone from "./DropZone";
import { autoNormalizeFileName, fileAccept, fileInfoOf, fileSize2Text, isRealNumber, isURLAddress } from "./utils";
import ExtIcons from '../assets/exticons/catalog.json';
import { saveAs } from "absol/src/Network/FileSaver";
import MessageInput from "./messageinput/MessageInput";

/***
 * @extends AElement
 * @constructor
 */
function FileInputBox() {
    this.$fileSize = $('.as-file-input-box-file-size', this);
    this.$fileName = $('.as-file-input-box-file-name', this);
    this.$bg = $('.as-file-input-box-background', this);
    this.$input = $('input', this)
        .on('change', this.eventHandler.input_fileChange);
    this.$trigger = _({
        elt: $('.as-file-input-box-trigger', this),
        tag: DropZone.tag,
        on: {
            fileenter: this.eventHandler.input_fileEnter,
            fileleave: this.eventHandler.input_fileLeave,
            filedrop: this.eventHandler.input_fileDrop,

        }
    });
    this.$downloadBtn = $('.as-file-input-box-download-btn', this)
        .on('click', this.download.bind(this));
    this.$removeBtn = $('.as-file-input-box-remove-btn', this)
        .on('click', this.clearValue.bind(this, true));

    this._value = null;
    this._fileSize = null;
    this._fileName = null;
    this._fileType = null;
    this._valueInfo = null;
    this._thumbnail = null;


    /***
     * default true
     * @name allowUpload
     * @type {boolean}
     * @memberOf FileInputBox#
     */
    this.allowUpload = true;


    /***
     * @name value
     * @type {null|any}
     * @memberOf FileInputBox#
     */
    /***
     * @name thumbnail
     * @type {null|any}
     * @memberOf FileInputBox#
     */
    /***
     * @name fileSize
     * @type {null|number}
     * @memberOf FileInputBox#
     */

    /***
     * @name fileType
     * @type {null|string}
     * @memberOf FileInputBox#
     */
    /***
     * @name fileName
     * @type {null|string}
     * @memberOf FileInputBox#
     */

    /***
     * default: false
     * @name downloadable
     * @type {boolean}
     * @memberOf FileInputBox#
     */
}


FileInputBox.tag = 'FileInputBox'.toLowerCase();

FileInputBox.render = function () {
    return _({
        extendEvent: ['change'],
        class: 'as-file-input-box',
        child: [
            '.as-file-input-box-background',
            {
                tag: 'label',
                class: 'as-file-input-box-trigger',
                child: {
                    tag: 'input',
                    attr: {
                        type: 'file',
                        accept: '*',
                        title: null
                    }
                }
            },

            {
                class: 'as-file-input-box-upload-overlay',
                child: 'span.mdi.mdi-upload'
            },
            {
                class: 'as-file-input-box-info',
                child: [
                    { tag: 'span', class: 'as-file-input-box-file-name', child: { text: '' } },
                    'br',
                    { tag: 'span', class: 'as-file-input-box-file-size', child: { text: '' } },
                ]
            },
            {
                class: 'as-file-input-box-action-left',
                child: {
                    tag: 'button',
                    class: 'as-file-input-box-remove-btn',
                    child: 'span.mdi.mdi-close'
                }
            },
            {
                class: 'as-file-input-box-action-right',
                child: {
                    tag: 'button',
                    class: 'as-file-input-box-download-btn',
                    child: 'span.mdi.mdi-download'
                }
            },

            {
                class: 'as-file-input-box-checked',
                child: 'span.mdi.mdi-check-bold'
            },

        ]
    });
};


FileInputBox.prototype.download = function () {
    var value = this.value;
    if (value) {
        if (value && value.name && value.url) {
            saveAs(value.url, value.name);
        }
        else {
            saveAs(value, this.fileName);
        }
    }
};

FileInputBox.prototype.clearValue = function (userAction, event) {
    if (this.value) {
        this.value = null;
        if (userAction) {
            this.emit('change', {
                type: 'change',
                originalEvent: event,
                action: 'clear',
                target: this
            }, this);
        }
    }
};

FileInputBox.prototype._updateThumbnail = function () {
    var previewUrl;
    var thumbnail = this.thumbnail;
    var fileType = this.fileType;
    if (thumbnail) {
        if (typeof thumbnail === "string") {
            previewUrl = thumbnail;
        }
        else if (thumbnail instanceof Blob || thumbnail instanceof File) {
            thumbnail.url = thumbnail.url || URL.createObjectURL(thumbnail);
            previewUrl = thumbnail.url;
        }
    }
    if (!previewUrl) {
        if (ExtIcons.indexOf(fileType) >= 0) {
            previewUrl = MessageInput.iconAssetRoot + '/' + fileType + '.svg';
        }
        else {
            previewUrl = MessageInput.iconAssetRoot + '/' + 'blank' + '.svg';

        }
    }

    if (previewUrl) {
        this.$bg.addStyle('backgroundImage', 'url("' + encodeURI(previewUrl) + '")');
    }
    else {
        this.$bg.removeStyle('backgroundImage')
    }
};


FileInputBox.prototype._updateFileName = function () {
    var fileName = this.fileName;
    if (fileName) {
        this.$fileName.firstChild.data = fileName;
        this.addClass('as-has-file-name');
    }
    else {
        this.$fileName.firstChild.data = '';
        this.removeClass('as-has-file-name');
    }
};

FileInputBox.prototype._updateFileSize = function () {
    var fileSize = this.fileName;
    if (fileSize === null) {
        this.$fileSize.firstChild.data = '';
        this.removeClass('as-has-file-size');
    }
    else {
        this.$fileSize.firstChild.data = fileSize2Text(fileSize);
        this.addClass('as-has-file-size');
    }
};

FileInputBox.property = {};

FileInputBox.property.value = {
    set: function (value) {
        value = value || null;
        autoNormalizeFileName(value);
        this._value = value;
        this._valueInfo = fileInfoOf(value);
        this._updateThumbnail();
        this._updateFileName();
        this._updateFileSize();
        if (value) {
            this.addClass('as-has-value');
        }
        else {
            this.removeClass('as-has-value');
        }
    },
    get: function () {
        var value = this._value;
        autoNormalizeFileName(value);
        return value;
    }
};


FileInputBox.property.fileType = {
    set: function (value) {
        this._fileType = value;
        this._updateThumbnail();
    },
    /***
     * @this FileInputBox
     * @return {*}
     */
    get: function () {
        return this._fileType || (this._valueInfo && this._valueInfo.type) || null;
    }
};

FileInputBox.property.fileName = {
    set: function (value) {
        value = typeof value === 'string' ? value : null;
        this._fileName = value;
        this._updateFileName();
    },
    get: function () {
        return this._fileName || (this._valueInfo && this._valueInfo.name) || null;
    }
};

FileInputBox.property.fileSize = {
    set: function (value) {
        if (isRealNumber(value)) value = Math.max(0, value);
        else value = null;
        this._fileSize = value;
        this._updateFileSize();
    },
    get: function () {
        if (typeof this._fileSize === "number") return this._fileSize;
        if (this._valueInfo && typeof this._valueInfo.size === "number") return this._valueInfo.size;
        return null;
    }
};

FileInputBox.property.thumbnail = {
    set: function (value) {
        this._thumbnail = value || null;
        this._updateThumbnail();
    },
    get: function () {
        return this._thumbnail;
    }
};

FileInputBox.property.allowUpload = {
    set: function (value) {
        if (value) {
            this.addClass('as-allow-upload');
        }
        else {
            this.removeClass('as-allow-upload');
        }
    },
    get: function () {
        return this.hasClass('as-allow-upload');
    }
};

FileInputBox.property.downloadable = {
    set: function (value) {
        if (value) {
            this.addClass('as-downloadable');
        }
        else {
            this.removeClass('as-downloadable');
        }
    },
    get: function () {
        return this.hasClass('as-downloadable');
    }
};


FileInputBox.property.removable = {
    set: function (value) {
        if (value) {
            this.addClass('as-removable');
        }
        else {
            this.removeClass('as-removable');
        }
    },
    get: function () {
        return this.hasClass('as-removable');
    }
};


FileInputBox.property.accept = {
    set: function (value) {
        if (!value) value = null;
        this.$input.attr('accept', value + '');
    },
    get: function () {
        return this.$input.attr('accept') || null;
    }
};

FileInputBox.property.checked = {
    set: function (value) {
        if (value) {
            this.addClass('as-checked');
        }
        else {
            this.removeClass('as-checked');

        }
    },
    get: function () {
        return this.hasClass('as-checked');
    }
};


FileInputBox.eventHandler = {};

FileInputBox.eventHandler.input_fileChange = function (event) {
    var files = Array.prototype.slice.call(this.$input.files);
    if (files.length > 0) {
        this.value = files[0];
        this.emit('change', {
            type: 'change',
            originalEvent: event,
            file: files[0],
            action: 'file_dialog',
            target: this
        }, this);
    }
};

FileInputBox.eventHandler.input_fileEnter = function (event) {
};

FileInputBox.eventHandler.input_fileLeave = function (event) {
};

FileInputBox.eventHandler.input_fileDrop = function (event) {
    var files = Array.prototype.slice.call(event.files);
    var accept = this.accept;
    var file;
    if (files.length > 0) {
        file = files[0];
        if (!fileAccept(accept, file.type) && !fileAccept(accept, file.name)) file = null;
    }
    if (file) {
        this.value = file;
        this.emit('change', { type: 'change', originalEvent: event, file: file, action: 'drop', target: this }, this);
    }

};


ACore.install(FileInputBox);

export default FileInputBox;
