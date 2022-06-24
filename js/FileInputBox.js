import '../css/fileinputbox.css';
import ACore, {_, $} from "../ACore";
import DropZone from "./DropZone";
import {fileAccept, fileSize2Text, isRealNumber, isURLAddress} from "./utils";
import ExtIcons from '../assets/exticons/catalog.json';
import {saveAs} from "absol/src/Network/FileSaver";
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

    this.allowUpload = true;
    this._value = null;
    this.value = this._value;
    this._fileSize = null;
    this.fileSize = null;
    this._fileName = null;
    this.fileName = null;
    this._fileType = null;
    this.fileType = null;
    this.downloadable = false;
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
                    {tag: 'span', class: 'as-file-input-box-file-name', child: {text: ''}},
                    'br',
                    {tag: 'span', class: 'as-file-input-box-file-size', child: {text: ''}},
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

        ]
    });
};


FileInputBox.prototype.download = function () {
    var value = this.value;
    if (value) {
        if (value && value.name && value.url){
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
        if (userAction){
            this.emit('change', {
                type: 'change',
                originalEvent: event,
                action: 'clear',
                target: this
            }, this);
        }
    }
}

FileInputBox.property = {};

FileInputBox.property.value = {
    set: function (value) {
        value = value || null;
        var type = null;
        var size = null;
        var name = null;
        if ((value instanceof File) || (value instanceof Blob)) {
            size = value.size;
            name = value.name;
            type = name.split('.').pop().toLowerCase();

        } else if (isURLAddress(value)) {
            type = value.replace(/\.upload$/, '').split('.').pop();
            name = value.split('/').pop().replace(/%20/g, ' ');
            this.attr('title', value);
        }
        else if (value && value.name && value.url){//keeview file format
            this.attr('title', value.url);
            name = value.name;
            type = name.split('.').pop().toLowerCase();
        }
        this._value = value;
        this.fileSize = size;
        this.fileName = name;
        this.fileType = type;
        if (value) {
            this.addClass('as-has-value');
        } else {
            this.removeClass('as-has-value');
        }
    },
    get: function () {
        return this._value;
    }
};


FileInputBox.property.fileType = {
    set: function (value) {
        if (value) {
            if (ExtIcons.indexOf(value) >= 0)
                this.$bg.addStyle('backgroundImage', 'url(' + MessageInput.iconAssetRoot + '/' + value + '.svg)')
            else
                this.$bg.addStyle('backgroundImage', 'url(' + MessageInput.iconAssetRoot + '/' + 'blank' + '.svg)')
        } else {
            this.$bg.removeStyle('backgroundImage')
        }
    },
    get: function () {
        return this._fileType;
    }
};

FileInputBox.property.fileName = {
    set: function (value) {
        value = typeof value === 'string' ? value : null;
        if (value) {
            this.$fileName.firstChild.data = value;
            this.addClass('as-has-file-name');
        } else {
            this.$fileName.firstChild.data = '';
            this.removeClass('as-has-file-name');
        }
        this._fileName = value;
    },
    get: function () {
        return this._fileName;
    }
};

FileInputBox.property.fileSize = {
    set: function (value) {
        if (isRealNumber(value)) value = Math.max(0, value);
        else value = null;
        if (value === null) {
            this.$fileSize.firstChild.data = '';
            this.removeClass('as-has-file-size');
        } else {
            this.$fileSize.firstChild.data = fileSize2Text(value);
            this.addClass('as-has-file-size');
        }
        this._fileSize = value;
    },
    get: function () {
        return this._fileSize;
    }
};

FileInputBox.property.allowUpload = {
    set: function (value) {
        if (value) {
            this.addClass('as-allow-upload');
        } else {
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
        } else {
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
        } else {
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
        this.emit('change', {type: 'change', originalEvent: event, file: file, action: 'drop', target: this}, this);
    }

};


ACore.install(FileInputBox);

export default FileInputBox;
