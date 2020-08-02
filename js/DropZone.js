import '../css/dropzone.css';
import ACore from "../ACore";


var _ = ACore._;
var $ = ACore.$;

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
    this.emit('filedrop', event, this);
};

DropZone.eventHandler.dragZoneFileOverEnd = function () {
    this._fileOverTimeout = -1;
    this.removeClass('as-drag-over');
    this.emit('fileleave', { type: 'fileleave' }, this);
};

ACore.install(DropZone);

export default DropZone;