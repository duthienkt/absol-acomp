import ACore, { _ } from "../ACore";
import '../css/ckplaceholder.css';

/***
 * @extends AElement
 * @constructor
 */
function CKPlaceholder() {
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.on('attached', this.eventHandler.attached);
    this._pendingData = '';
    this.editor = null;
    this.config = {};
}

CKPlaceholder.tag = 'CKPlaceholder'.toLowerCase();

CKPlaceholder.render = function () {
    return _({
        extendEvent: ['editorcreated', 'editorready'],
        class: 'as-ck-placeholder'
    });
};

/***
 * @memberOf CKPlaceholder#
 * @type {{}}
 */
CKPlaceholder.eventHandler = {};

/***
 * @this CKPlaceholder
 */
CKPlaceholder.eventHandler.attached = function () {
    this.$attachhook.remove();
    this.editor = CKEDITOR.replace(this, this.config);
    this.editor.on('instanceReady', this.eventHandler.instanceReady);
    this.emit('editorcreated', { type: 'editorcreated', target: this, editor: this.editor }, this);
    if (this._pendingData.length > 0) {
        this.editor.setData(this._pendingData);
        this._pendingData = null;
    }
};

CKPlaceholder.eventHandler.instanceReady = function () {
    this.emit('editorready', { type: 'editorready', target: this, editor: this.editor }, this);
};


CKPlaceholder.property = {};

CKPlaceholder.property.data = {
    set: function (data) {
        if (typeof data !== "string") data = '';
        if (this.editor) {
            this.editor.setData(data);
        }
        else {
            this._pendingData = data;
        }
    },
    get: function () {
        if (this.editor) return this.editor.getData();
        return this._pendingData;
    }
};

ACore.install(CKPlaceholder);


export default CKPlaceholder;