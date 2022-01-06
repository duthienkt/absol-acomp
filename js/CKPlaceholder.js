import ACore, { _ } from "../ACore";

/***
 * @extends AElement
 * @constructor
 */
function CKPlaceholder() {
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.on('attached', this.eventHandler.attached);
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
};

CKPlaceholder.eventHandler.instanceReady = function () {
    this.emit('editorready', { type: 'editorready', target: this, editor: this.editor }, this);
};


CKPlaceholder.property = {};


ACore.install(CKPlaceholder);


export default CKPlaceholder;