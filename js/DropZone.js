import '../css/dropzone.css';
import ACore from "../ACore";
import AElement from "absol/src/HTML5/AElement";


var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function DropZone() {
    this.defineEvent(['fileenter', 'fileleave', 'filedrop']);
    this.addClass('as-drop-zone');
    this.on('dragover', this.eventHandler.dragZoneFileOver)
        .on('drop', this.eventHandler.dropZoneFileDrop);
    this._fileOverTimeout = -1;
}

DropZone.tag = 'dropzone';

DropZone.render = function () {
    return _('div');
};

DropZone.eventHandler = {};
DropZone.eventHandler.dragZoneFileOver = function (event) {
    event.preventDefault();
    if (this._fileOverTimeout > 0) {
        clearTimeout(this._fileOverTimeout);
    }
    else {
        this.addClass('as-drag-over');
        this.emit('fileenter', event, this);
    }
    this._fileOverTimeout = setTimeout(this.eventHandler.dragZoneFileOverEnd, 100);
};

/***
 *
 * @param {DragEvent} event
 */
DropZone.eventHandler.dropZoneFileDrop = function (event) {
    if (this._fileOverTimeout > 0) {
        clearTimeout(this._fileOverTimeout);
        this._fileOverTimeout = -1;
    }
    event.preventDefault();
    this.removeClass('as-drag-over');
    event._files = null;
    Object.defineProperty(event, 'files',{
        get: function (){
            if (this._files) return  this._files;
            var files = [];
            var file;
            if (event.dataTransfer.items) {
                for (var i = 0; i < event.dataTransfer.items.length; i++) {
                    if (event.dataTransfer.items[i].kind === 'file') {
                        file = event.dataTransfer.items[i].getAsFile();
                        files.push(file);
                    }
                }
            } else {
                // Use DataTransfer interface to access the file(s)
                for (var i = 0; i < event.dataTransfer.files.length; i++) {
                    files.push(event.dataTransfer.files[i]);
                }
            }
            this._files = files;
            return this._files;
        }
    });

    this.emit('filedrop', event, this);
};

DropZone.eventHandler.dragZoneFileOverEnd = function () {
    this._fileOverTimeout = -1;
    this.removeClass('as-drag-over');
    this.emit('fileleave', { type: 'fileleave' }, this);
};

ACore.install(DropZone);

export default DropZone;