import ACore, { _, $ } from "../../ACore";
import OOP from "absol/src/HTML5/OOP";
import CKPlaceholder from "./CKPlaceholder";
import { arrayRemoveNone, arrayUnique } from "absol/src/DataStructure/Array";
import { CKExtensionDict } from "./plugins";
import Dom, { traceOutBoundingClientRect } from "absol/src/HTML5/Dom";
import { blobToFile, dataURItoBlob } from "absol/src/Converter/file";
import { randomIdent } from "absol/src/String/stringGenerate";

/***
 * @extends CKPlaceholder
 * @constructor
 */
function CKInlineShortText() {
    CKPlaceholder.call(this);
    this.once('editorcreated', this.eventHandler.afterEditorCreated)
        .on('paste', this.eventHandler.paste, true)
        .once('editorready', this.eventHandler.afterEditorReady);

}

OOP.mixClass(CKInlineShortText, CKPlaceholder);

CKInlineShortText.tag = 'CKInlineShortText'.toLowerCase();
CKInlineShortText.property = Object.assign({}, CKPlaceholder.property);
CKInlineShortText.eventHandler = Object.assign({}, CKPlaceholder.eventHandler);


CKInlineShortText.render = function () {
    return _({
        class: 'as-ck-inline-short-text',
        extendEvent: ['editorcreated', 'editorready', 'change', 'command'],
        id: randomIdent(8),
        attr: {
            contenteditable: 'true'
        }
    });
};

CKInlineShortText.prototype.mode = 'inline';

CKInlineShortText.prototype._makeInitConfig = function () {
    var config = {
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
    return config;
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


CKInlineShortText.prototype._hookScroll = function () {
    this.$scrollers = [];
    var c = this.parentElement;
    while (c) {
        this.$scrollers.push(c);
        c = c.parentElement;
    }
    this.$scrollers.push(document);
    this.$scrollers.forEach(function (elt) {
        elt.addEventListener('scroll', this.eventHandler.scroll);
    }.bind(this))
};

CKInlineShortText.prototype._unhookScroll = function () {
    this.$scrollers.forEach(function (elt) {
        elt.removeEventListener('scroll', this.eventHandler.scroll);
    }.bind(this))
};


CKInlineShortText.eventHandler.afterEditorCreated = function () {
    this.editor.on('paste', function (evt) {
        evt.cancel();
    });
};

CKInlineShortText.eventHandler.afterEditorReady = function (){
    this.$toolbarElt = this.$toolbarElt || $('#cke_' + this.attr('id'));
    this['removeToolbar'] = this.removeToolbar;
    this._hookScroll();
    setTimeout(this.eventHandler.tick, 5000);
}


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
};

CKInlineShortText.eventHandler.tick = function () {
    if (!this.isDescendantOf(document.body)) {
        this._unhookScroll();
        return;
    }
    setTimeout(this.eventHandler.tick, 5000);
}

/***
 * @this CKInlineShortText
 */
CKInlineShortText.eventHandler.scroll = function () {
    // If we don't have any active instance of CKEDITOR - return
    if (!CKEDITOR.currentInstance) {
        return;
    }
    if (CKEDITOR.currentInstance.element.$ !== this) return;
    // Save the elements we need to work with
    if (!this.isDescendantOf(document.body)) {
        this._unhookScroll();
        return;
    }
    this.$toolbarElt = this.$toolbarElt || $('#cke_' + this.attr('id'));
    var toolbarElt = this.$toolbarElt;
    if (!toolbarElt) return;
    var bound = this.getBoundingClientRect();
    var toolBound = toolbarElt.getBoundingClientRect();
    var outbound = traceOutBoundingClientRect(this);
    var left = Math.max(0, bound.left);
    var top = bound.top - toolBound.height;
    if (outbound.top > bound.bottom ||
        outbound.bottom < bound.top) {
        top = -1000;
    }
    else if (bound.top < toolBound.height) {
        top = bound.bottom;
    }
    toolbarElt.addStyle({
        top: top + 'px',
        left: left + 'px'
    });
};


CKInlineShortText.property.removeToolbar = {
    set: function (value) {
        this._removeToolbar = !!value;
        if (this.$toolbarElt) {
            if (this._removeToolbar) {
                this.$toolbarElt.addClass('as-hidden');
            }
            else {
                this.$toolbarElt.addStyle('as-hidden');
            }
        }
    },
    get: function () {
        return !this._removeToolbar;
    }
};


ACore.install(CKInlineShortText);

export default CKInlineShortText;