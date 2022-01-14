import ACore, { _ } from "../../ACore";
import OOP from "absol/src/HTML5/OOP";
import CKPlaceholder from "./CKPlaceholder";
import { arrayRemoveNone, arrayUnique } from "absol/src/DataStructure/Array";
import { CKExtensionDict } from "./plugins";
import Dom from "absol/src/HTML5/Dom";
import { blobToFile, dataURItoBlob } from "absol/src/Converter/file";

/***
 * @extends CKPlaceholder
 * @constructor
 */
function CKInlineShortText() {
    CKPlaceholder.call(this);
    this.on('editorcreated', this.eventHandler.afterEditorCreated)
        .on('paste', this.eventHandler.paste, true)

}

OOP.mixClass(CKInlineShortText, CKPlaceholder);

CKInlineShortText.tag = 'CKInlineShortText'.toLowerCase();
CKInlineShortText.property = Object.assign({}, CKPlaceholder.property);
CKInlineShortText.eventHandler = Object.assign({}, CKPlaceholder.eventHandler);


CKInlineShortText.render = function () {
    return _({
        class: 'as-ck-inline-short-text',
        extendEvent: ['editorcreated', 'editorready', 'change', 'command'],
        attr: {
            contenteditable: 'true'
        }
    });
};

CKInlineShortText.prototype.mode = 'inline';

CKInlineShortText.prototype._makeInitConfig = function () {
    return {
        toolbar: [
            {
                name: 'extension',
                items: arrayRemoveNone(this._extensions.map(function (eName) {
                    if (CKExtensionDict[eName] && CKExtensionDict[eName].command) {
                        return CKExtensionDict[eName].command;
                    }
                }))
            }
        ],
        keystrokes: [
            [13 /* Enter */, 'blur'],
            [CKEDITOR.SHIFT + 13 /* Shift + Enter */, 'blur']
        ]
    };
};

CKInlineShortText.property.extensions = Object.assign({}, CKPlaceholder.property.extensions,
    {
        set: function (value) {
            value = value || [];
            value.push('simple_text')
            value = arrayUnique(value);
            CKPlaceholder.property.extensions.set.call(this, value);
            this._config = this._makeInitConfig();
        }
    });


CKInlineShortText.eventHandler.afterEditorCreated = function () {
    this.editor.on('paste', function (evt) {
        evt.cancel();
    });
};

CKInlineShortText.eventHandler.paste = function (event) {
    var self = this;
    var clipboardData = (event.clipboardData || window.clipboardData);
    /**Safari bug */
    event.preventDefault();

    if (clipboardData) {
        if (clipboardData.items) {
            var items = Array.prototype.slice.call(clipboardData.items);

            var plainTextItems = items.filter(function (item) {
                return item.type.indexOf('text/plain') >= 0;
            });
            if (plainTextItems.length > 0) {

                var plainTextItem = plainTextItems[0];//only one item
                plainTextItem.getAsString(function (text) {
                    self.editor.insertHtml(self._implicit(text))
                });
            }
        }
        else {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                self.editor.insertHtml(self._implicit(text))
            }

        }
    }
}

ACore.install(CKInlineShortText);

export default CKInlineShortText;