import ACore, { _, $ } from "../ACore";
import FileListItem from "./FileListItem";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import ContextCaptor from "./ContextMenu";
import LanguageSystem from "absol/src/HTML5/LanguageSystem";
import { saveAs } from "absol/src/Network/FileSaver";
import DropZone from "./DropZone";
import { fileAccept, isNaturalNumber } from "./utils";
import FileInputBox from "./FileInputBox";
import { convertToSafeFile } from "absol/src/Converter/file";


/***
 * @extends AElement
 * @constructor
 */
function FileListInput() {
    ContextCaptor.auto();
    this.$add = $('.as-file-list-input-add', this);
    this.$attachhook = $('attachhook', this);
    this.$attachhook.requestUpdateSize = this.updateSize.bind(this);
    this.$attachhook.on('attached', function () {
        ResizeSystem.add(this);
        this.requestUpdateSize();
    });
    this.on('filedrop', this.eventHandler.input_fileDrop);
    this.on('contextmenu', this.eventHandler.itemContext);


    this.$addedFile = $('input', this.$add)
        .on('change', this.eventHandler.clickAdd);
    /***
     *
     * @type {FileInputBox[]}
     */
    this.$fileItems = [];
    this.$activeItem = null;
    this._files = [];
    /***
     * @name files
     * @memberOf FileListInput#
     * @type {*}
     *
     */
    /***
     * @name readOnly
     * @memberOf FileListInput#
     * @type {boolean}
     */
    /***
     * @name disabled
     * @memberOf FileListInput#
     * @type {boolean}
     */

    /***
     * @name multiple
     * @memberOf FileListInput#
     * @type {boolean}
     */
    /***
     * @name droppable
     * @memberOf FileListInput#
     * @type {boolean}
     */
}

FileListInput.tag = 'FileListInput'.toLowerCase();

FileListInput.render = function () {
    return _({
        tag: DropZone.tag,
        class: ['as-file-list-input', 'as-bscroller', 'as-empty', 'as-droppable'],
        extendEvent: ['change', 'contextmenu', 'check'],
        child: [
            {
                tag: 'label',
                class: 'as-file-list-input-add',
                child: [
                    {
                        tag: 'input',
                        attr: {
                            type: 'file',
                            accept: '*',
                            title: null
                        }
                    },
                    {
                        class: 'as-file-list-input-add-icon-ctn',
                        child: 'span.mdi.mdi-upload-outline'
                    },
                    'attachhook'
                ]
            },
            {
                tag: 'span',
                class: 'as-file-list-drag-file-text',
                child: {
                    text: '(Kéo thả  file vào đây để tải lên)'
                }
            },
            {
                class: 'as-file-list-input-upload-overlay',
                child: 'span.mdi.mdi-upload'
            }
        ]
    });
};

FileListInput.prototype.defaultChecked = false;

FileListInput.prototype.updateSize = function () {
    var bound, px, n;
    var requireWidth = this.getComputedStyleValue('--item-require-width') || '300px';
    if (requireWidth.match(/%$/)) {
        this.addStyle('--item-width', requireWidth);
    }
    else if (requireWidth.match(/px$/)) {
        bound = this.getBoundingClientRect();
        px = parseFloat(requireWidth.replace('px', ''));
        if (!isNaN(px) && px > 0) {
            n = Math.max(1, Math.floor((bound.width - 10 - 2) / px));
            this.addStyle('--item-width', Math.floor(100 / n) + '%');
        }
        else {
            this.removeStyle('--item-width');
        }
    }
    else {
        this.removeStyle('--item-width');
    }
};

FileListInput.prototype._makeFileItem = function (file) {
    file = convertToSafeFile(file);
    var fileElt = _({
        tag: FileListItem.tag,
        props: {
            $parent: this,
            allowUpload: false,
            fileData: file,
            checked: this.defaultChecked
        }
    });
    fileElt.on('mousedown', this.eventHandler.mouseDownItem.bind(this, fileElt));
    fileElt.value = file;
    return fileElt;
};

FileListInput.prototype.add = function (file, idx) {
    if (!isNaturalNumber(idx)) idx = Infinity;
    idx = Math.min(this.$fileItems.length, idx);
    var fileElt = this._makeFileItem(file);

    var bf = this.$fileItems[idx];
    if (bf) {
        this.$fileItems.splice(idx, 0, fileElt);
        this._files.splice(idx, 0, file);
        this.addChildBefore(fileElt, bf);
    }
    else {
        this.$fileItems.push(fileElt);
        this._files.push(file);
        this.addChildBefore(fileElt, this.$add);

    }
    this._updateCountClass();
};

FileListInput.prototype._updateCountClass = function () {
    if (this._files.length > 0) {
        this.removeClass('as-empty');
    }
    else {
        this.addClass('as-empty');
    }
};

FileListInput.prototype.activeFileItemElt = function (itemElt) {
    if (this.$activeItem !== itemElt) {
        if (this.$activeItem) {
            this.$activeItem.removeClass('as-active');
        }
        this.$activeItem = itemElt;
        if (this.$activeItem) {
            this.$activeItem.addClass('as-active');
        }
    }
};

FileListInput.prototype.downloadFileItemElt = function (fileElt) {
    var fileData = fileElt.fileData;
    var name = fileData.name || fileElt.fileName;
    var file;
    if (fileData instanceof File || fileData instanceof Blob) {
        file = fileData;
    }
    else if (typeof fileData === 'object') {
        if (fileData.url) file = fileData.url;
    }
    else if (typeof fileData === "string") {
        file = fileData;
    }
    if (file) {
        saveAs(file, name);
    }
};

FileListInput.prototype.deleteFileItemElt = function (fileElt) {
    var fileData = fileElt.fileData;
    var idx = this._files.indexOf(fileData);
    if (idx >= 0) {
        this._files.splice(idx, 1);
    }
    fileElt.remove();
};

FileListInput.prototype._findFileItemElt = function (target) {
    while (target && target !== this) {
        if (target.hasClass && target.hasClass('as-file-list-item')) {
            return target;
        }
        target = target.parentElement;
    }
    return null;
};

FileListInput.prototype.getChildren = function () {
    return this.$fileItems.slice();
};


FileListInput.property = {};

FileListInput.property.files = {
    /***
     * @this FileListInput
     * @param files
     */
    set: function (files) {
        files = files || [];
        files = files.slice();
        var self = this;
        this.$fileItems.forEach(function (fileElt) {
            fileElt.remove();
        });
        files = files || [];
        this._files = files;
        this.$fileItems = files.map(function (file) {
            var elt = self._makeFileItem(file);
            self.addChildBefore(elt, self.$add);
            return elt;
        });
        this._updateCountClass();
    },
    /***
     * @this FileListInput
     */
    get: function () {
        return (this._files ||[]).slice();
    }
};


FileListInput.property.readOnly = {
    set: function (value) {
        value = !!value;
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
        this.$fileItems.forEach(function (fileElt) {
            fileElt.removable = !value;
        });
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};

FileListInput.property.droppable = {
    set: function (value) {
        value = !!value;
        if (value) {
            this.addClass('as-droppable');
        }
        else {
            this.removeClass('as-droppable');
        }
        this.$fileItems.forEach(function (fileElt) {
            fileElt.removable = !value;
        });
    },
    get: function () {
        return this.hasClass('as-droppable');
    }
};

FileListInput.property.multiple = {
    set: function (value) {
        this.$addedFile.multiple = !!value;
    },
    get: function () {
        return this.$addedFile.multiple;
    }
};


FileListInput.property.accept = {
    set: function (value) {
        if (!value) value = null;
        this.$addedFile.attr('accept', value + '');
    },
    get: function () {
        return this.$addedFile.attr('accept') || null;
    }
};

FileListInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};

FileListInput.property.showCheck = {
    set: function (value) {
        if (value) {
            this.addClass('as-show-check');

        }
        else {
            this.removeClass('as-show-check');
        }
    },
    get: function () {
        return this.hasClass('as-show-check');
    }
};


ACore.install(FileListInput);

/***
 * @memberOf  FileListInput#
 * @type {{}}
 */
FileListInput.eventHandler = {};


FileListInput.eventHandler.clickAdd = function (event) {
    var files = Array.prototype.slice.call(this.$addedFile.files);
    this.$addedFile.files = null;
    if (files.length === 0) return;
    for (var i = 0; i < files.length; ++i) {
        this.add(files[i]);
    }
    this.emit('change', { files: files, type: 'change', target: this, originalEvent: event, action: 'add' }, this);
};

/***
 * @this FileListInput
 * @param itemElt
 * @param event
 */
FileListInput.eventHandler.mouseDownItem = function (itemElt, event) {
    this.activeFileItemElt(itemElt);
};


FileListInput.eventHandler.input_fileDrop = function (event) {
    if (this.readOnly || this.disabled) return;
    var self = this;
    var files = Array.prototype.slice.call(event.files);
    if (files.length === 0) return;
    if (!this.multiple) files = files.slice(0, 1);
    var accept = this.accept;
    files = files.filter(function (file) {
        return fileAccept(accept, file.type) || fileAccept(accept, file.name);
    });

    if (files.length > 0) {
        files.forEach(function (file) {
            self.add(file);
        });
        this.emit('change', { type: 'change', files: files, target: this, action: 'drop' }, this);
    }
};

/***
 * @this FileListInput
 * @param itemElt
 * @param event
 */
FileListInput.eventHandler.itemContext = function (event) {
    if (this.disabled) return;
    var self = this;
    var itemElt = this._findFileItemElt(event.target);
    var menuItems = [];
    if (itemElt) {
        menuItems.push({
            text: LanguageSystem.getText('txt_download') || "Download",
            icon: 'span.mdi.mdi-download',
            cmd: 'download'
        });
    }
    if (!this.readOnly) {
        if (itemElt)
            menuItems.push({
                text: LanguageSystem.getText('txt_delete') || "Delete",
                icon: 'span.mdi.mdi-delete',
                cmd: 'delete'
            });
        menuItems.push(
            {
                text: LanguageSystem.getText('txt_delete_all') || "Delete All",
                icon: 'span.mdi.mdi-delete-empty',
                cmd: 'delete_all'
            });
    }
    if (menuItems.length > 0) {
        event.showContextMenu({
            items: menuItems
        }, function (event) {
            var files;
            switch (event.menuItem.cmd) {
                case 'download':
                    self.downloadFileItemElt(itemElt);
                    break;
                case 'delete':
                    self.deleteFileItemElt(itemElt);
                    self.emit('change', {
                        type: 'change',
                        item: itemElt.fileData,
                        target: this,
                        action: 'delete'
                    }, this);
                    break;
                case 'delete_all':
                    files = self.files;
                    self.files = [];
                    self.emit('change', { type: 'change', items: files, target: this, action: 'delete_all' }, this);
                    break;
            }
        });
    }
};


export default FileListInput;