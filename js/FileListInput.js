import ACore, {_, $} from "../ACore";
import FileInputBox from "./FileInputBox";


/***
 * @extends AElement
 * @constructor
 */
function FileListInput() {
    this.$add = $('.as-file-list-input-add', this)

    this.$addedFile = $('input', this.$add)
        .on('change', this.eventHandler.add);
    /***
     *
     * @type {FileInputBox[]}
     */
    this.$fileBoxes = [];
    this._files = [];
    /***
     * @name files
     * @memberOf FileListInput#
     * @type {*}
     *
     */ /***
     * @name readOnly
     * @memberOf FileListInput#
     * @type {boolean}
     */
}

FileListInput.tag = 'FileListInput'.toLowerCase();

FileListInput.render = function () {
    return _({
        class: ['as-file-list-input', 'as-bscroller'],
        extendEvent: ['change'],
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
                            multiple: true,
                            title: null
                        }
                    },
                    {
                        class: 'as-file-list-input-add-icon-ctn',
                        child: 'span.mdi.mdi-upload-outline'
                    }
                ]
            }
        ]
    });
};

FileListInput.prototype._makeFileBox = function (file) {
    var self = this;
    var fileElt = _({
        tag: FileInputBox.tag,
        props: {
            allowUpload: false,
            fileData: file,
            downloadable: true,
            removable: !this.readOnly
        },
        on: {
            change: function () {
                if (!this.value) {
                    var idx = self.$fileBoxes.indexOf(this);
                    if (idx >= 0) {
                        self.$fileBoxes.splice(idx, 1);
                        self._files.splice(idx, 1);
                    }
                    this.remove();
                    self.emit('change', {type: 'change', action: 'remove', target: self, file: file}, self);
                }
            }
        }
    });
    if (file instanceof File || file instanceof Blob || typeof file === 'string') {
        fileElt.value = file;
    } else if (typeof file === 'object') {
        if (file.value || file.url) fileElt.value = file.value || file.url;
        if (file.fileName || file.name) fileElt.fileName = file.fileName || file.name;
        if (file.removable) fileElt.removable = file.removable && !this.readOnly;
    }
    return fileElt;
};

FileListInput.prototype.add = function (file) {
    var fileElt = this._makeFileBox(file);
    this.$fileBoxes.push(fileElt);
    this.addChildBefore(fileElt, this.$add);
    this._files.push(file);
};


FileListInput.property = {};

FileListInput.property.files = {
    /***
     * @this FileListInput
     * @param files
     */
    set: function (files) {
        var self = this;
        this.$fileBoxes.forEach(function (fileElt) {
            fileElt.remove();
        });
        files = files || [];
        this._files = files;
        this.$fileBoxes = files.map(function (file) {
            var elt = self._makeFileBox(file);
            self.addChildBefore(elt, self.$add);
            return elt;
        });

    },
    /***
     * @this FileListInput
     */
    get: function () {
        return this._files;
    }
};


FileListInput.property.readOnly = {
    set: function (value) {
        value = !!value;
        if (value) {
            this.addClass('as-read-only');
        } else {
            this.removeClass('as-read-only');
        }
        this.$fileBoxes.forEach(function (fileElt) {
            fileElt.removable = !value;
        });
    },
    get: function () {
        return this.containsClass('as-read-only');
    }
}

ACore.install(FileListInput);

FileListInput.eventHandler = {};


FileListInput.eventHandler.add = function (event) {
    var files = Array.prototype.slice.call(this.$addedFile.files);
    this.$addedFile.files = null;
    if (files.length === 0) return;
    for (var i = 0; i < files.length; ++i) {
        this.add(files[i]);
    }
    this.emit('change', {files: files, type: 'change', target: this, originalEvent: event, action: 'add'}, this);
};


export default FileListInput;