import '../../css/tokenizeinput.css';
import ACore, { _, $ } from "../../ACore";
import Dom from "absol/src/HTML5/Dom";
import { dataURItoBlob, blobToFile, blobToArrayBuffer } from "absol/src/Converter/file";
import AElement from "absol/src/HTML5/AElement";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import TIHistory from "./TIHistory";
import TITextController from "./TITextController";
import TISelectionController from "./TISelectionController";
import { keyboardEventToKeyBindingIdent } from "absol/src/Input/keyboard";
import { getTagListInTextMessage } from "../utils";
import { isToken } from "./tiutils";


var textDelay = BrowserDetector.isSafari ? 100 : 1;

/***
 * @extends AElement
 * @constructor
 */
function TokenizeHyperInput() {
    this._tagMap = {};
    this.$br = $('br', this);
    this.historyCtrl = new TIHistory(this);
    this.textCtrl = new TITextController(this);
    this.selectionCtrl = new TISelectionController(this);
    this.prevKey = null;

    this.defineEvent(['pasteimg', 'pastefile', 'pastetext', 'change']);
    this.on('paste', this.eventHandler.paste);
    this.on('keydown', this.eventHandler.keydown);
    this.on('mouseup', this.eventHandler.mouseup);
    this.value = '';
    this.historyCtrl.commit('', 0);
    /***
     * @type {{}}
     * @name tagMap
     *@memberOf TokenizeHyperInput#
     *
     */
}


TokenizeHyperInput.tag = 'TokenizeHyperInput'.toLowerCase();
TokenizeHyperInput.render = function () {
    return _({
        tag: 'pre',
        class: 'as-tokenize-hyper-input',
        attr: {
            contenteditable: 'true',
            spellcheck: "false"
        },
        child: 'br'
    });
};

TokenizeHyperInput.prototype.applyData = function (text, offset) {
    this.textCtrl.applyData(text, offset);
};


TokenizeHyperInput.prototype.select = function (offset) {
    if (document.activeElement !== this) this.focus();
    this.applyData(this.value, offset);
};

TokenizeHyperInput.prototype.scrollIntoRange = function (range) {
    var elementBound = range.getBoundingClientRect();

    var viewportBound = this.getBoundingClientRect();
    var dBottom = 0;
    if (range.startContainer && range.startContainer.data && range.startContainer.data.charAt(range.startContainer.data.length - 1) == '\n')
        dBottom += this.getFontSize() * 1.5;
    var currentScrollTop = this.scrollTop;
    var newScrollTop = currentScrollTop;
    if (elementBound.bottom + dBottom > viewportBound.bottom) {
        newScrollTop = currentScrollTop + (elementBound.bottom + dBottom - viewportBound.bottom);
    }
    if (elementBound.top < viewportBound.top) {
        newScrollTop = currentScrollTop - (viewportBound.top - elementBound.top);
    }

    if (newScrollTop != currentScrollTop) {
        this.scrollTop = newScrollTop;
    }

    var currentScrollLeft = this.scrollLeft;
    var newScrollLeft = currentScrollLeft;
    if (elementBound.right > viewportBound.right) {
        newScrollLeft = currentScrollLeft + (elementBound.right - viewportBound.right);
    }
    if (elementBound.left < viewportBound.left) {
        newScrollLeft = currentScrollLeft - (viewportBound.left - elementBound.left);
    }

    if (newScrollLeft != currentScrollLeft) {
        this.scrollLeft = newScrollLeft;
    }
};

TokenizeHyperInput.prototype.undo = function () {
    this.historyCtrl.undo();
};


TokenizeHyperInput.prototype.redo = function () {
    this.historyCtrl.redo();
};


TokenizeHyperInput.prototype.commitChange = function (text, offset) {
    this.historyCtrl.commit(text, offset);
    this.emit('change', {}, this);
};

TokenizeHyperInput.prototype.waitToCommit = function (text, offset) {
    var thisInput = this;
    if (this._commitTimeout > 0)
        clearTimeout(this._commitTimeout);
    this._commitTimeout = setTimeout(function () {
        thisInput.commitChange(text, offset);
    }, textDelay);
};

TokenizeHyperInput.prototype.getPosition = function (node, offset) {
    if (!node) return NaN;
    if (node === this)
        return offset;
    var parent = node.parentElement;
    if (!parent) return NaN;
    var text = '';
    var child;
    var lastBr = false;
    for (var i = 0; i < parent.childNodes.length; ++i) {
        child = parent.childNodes[i];
        if (child == node) break;
        text += this.stringOf(child);
    }
    return this.getPosition(parent, text.length + offset);
};


TokenizeHyperInput.prototype.getSelectPosition = function () {
    return this.selectionCtrl.getOffset();

};


/**
 * @type {TokenizeHyperInput}
 */
TokenizeHyperInput.eventHandler = {};


TokenizeHyperInput.eventHandler.paste = function (event) {
    var clipboardData = (event.clipboardData || window.clipboardData);
    if (!clipboardData) {
        alert('Input not support browser without clipboard API!');
        return;
    }

    if (clipboardData.items) {
        var items = Array.prototype.slice.call(clipboardData.items);
        var imgItems = items.filter(item => item.type.indexOf('image') >= 0);

        var fileItems = items.filter(item => item.type !== 'text/plain' && item.type.indexOf('image') < 0);
        var plainTextItems = items.filter((item) => item.type.indexOf('text/plain') >= 0);

        if (imgItems.length > 0) {
            var imgFiles = imgItems.map(function (it) {
                return it.getAsFile();
            });
            this.emit('pasteimg', {
                target: this,
                imageFile: imgFiles[0],
                imageFiles: imgFiles,
                originalEvent: event
            }, this);
        }
        if (fileItems.length > 0) {
            var files = fileItems.map(item => item.getAsFile());
            this.emit('pastefile', {
                target: this,
                file: files[0],
                files: files,
                originalEvent: event
            }, this);
        }

        if (plainTextItems.length > 0) {
            var plainTextItem = plainTextItems[0];//only one item
            plainTextItem.getAsString(text => {
                this.textCtrl.insertText(text);
            });
        }

        event.preventDefault();
    }
    else {
        var text = event.clipboardData.getData('text/plain');
        if (text) {
            event.preventDefault();
            this.textCtrl.insertText(text);
        }
    }
    this.waitToCommit();
};


TokenizeHyperInput.eventHandler.keydown = function (event) {
    this.prevKey = { time: new Date().getTime(), value: keyboardEventToKeyBindingIdent(event) };
    setTimeout(() => {
        this.selectionCtrl.onSelect();
        this.waitToCommit();
    }, textDelay);
};

/***
 * @this TokenizeHyperInput
 * @param event
 */
TokenizeHyperInput.eventHandler.mouseup = function (event) {
    this.prevKey = { time: new Date().getTime(), value: 'mouseup' };
    this.selectionCtrl.onSelect();
}

TokenizeHyperInput.property = {};

TokenizeHyperInput.property.value = {
    set: function (value) {
        value = value || '';
        this.textCtrl.setText(value);
        // this.applyData(value, value.length);
        this.commitChange(value, value.length);
    },
    get: function () {
        return this.textCtrl.getText();
    }
};

TokenizeHyperInput.property.disabled = {
    set: function (value) {
        value = !!value;
        if (value === this.hasClass('as-disabled')) return;
        if (value) {
            this.addClass('as-disabled');
            this.attr({
                contenteditable: undefined,
                oncut: 'return false',
                onpaste: 'return false',
                onkeydown: 'if(event.metaKey) return true; return false;'
            });
        }
        else {
            this.removeClass('as-disabled');
            this.attr({
                contenteditable: true,
                oncut: undefined,
                onpaste: undefined,
                onkeydown: undefined
            });
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};

TokenizeHyperInput.property.tagList = {
    get: function () {
        return getTagListInTextMessage(this.value);
    }
};

TokenizeHyperInput.property.tagMap = {
    set: function (o) {
        o = o || {};
        this._tagMap = o;
        Array.prototype.forEach.call(this.childNodes, child => {
            var id, text;
            if (child.classList && child.classList.contains('as-tag-token')) {
                id = (child.getAttribute('data-text') || '');
                id = id.substring(5, id.length - 1);
                text = this._tagMap[id];
                if (text) {
                    child.getAttribute('data-display', '@' + text);
                    child.firstChild.data = '@' + text;
                }
            }
        })
    },
    get: function () {
        return this._tagMap;
    }
}


ACore.install(TokenizeHyperInput);

export default TokenizeHyperInput;
