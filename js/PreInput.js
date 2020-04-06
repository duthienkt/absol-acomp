import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import { dataURItoBlob, blobToFile, blobToArrayBuffer } from "absol/src/Converter/file";

var _ = ACore._;
var $ = ACore.$;

function PreInput() {
    this.defineEvent(['pasteimg', 'pastetext', 'change']);
    this.on('paste', this.eventHandler.paste);
    this.on('keydown', this.eventHandler.keydown);
    this.history = [];
    this.historyIndex = -1;
    this.commitChange('', 0);
}


PreInput.render = function () {
    return _('pre.as-preinput[contenteditable="true"]');
};

PreInput.prototype.applyData = function (text, offset) {
    var textNode = _({ text: text });
    this.clearChild()
        .addChild(textNode);
    if (this.isDescendantOf(document.body)) {
        if (document.getSelection) {

            var sel = document.getSelection();
            sel.removeAllRanges();
            var range = document.createRange();
            if (typeof offset == 'number') {
                range.setStart(textNode, offset);
            }
            else {
                range.setStart(textNode, offset.start);
                range.setEnd(textNode, offset.end);
            }
            sel.addRange(range);
            this.scrollIntoRange(range);

        }
        else {
            console.error("PreInput: Not support!");
        }
    }
};


PreInput.prototype.scrollIntoRange = function (range) {
    var elementBound = range.getBoundingClientRect();

    var viewportBound = this.getBoundingClientRect();
    var currentScrollTop = this.scrollTop;
    var newScrollTop = currentScrollTop;
    if (elementBound.bottom > viewportBound.bottom) {
        newScrollTop = currentScrollTop + (elementBound.bottom - viewportBound.bottom);
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

PreInput.prototype.undo = function () {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    var record = this.history[this.historyIndex];
    this.applyData(record.text, record.offset);
    this.emit('change', { target: this, value: record.text, action: 'undo', record: record, type: 'change' }, this);
};


PreInput.prototype.redo = function () {
    if (this.historyIndex + 1 >= this.history.length) return;
    this.historyIndex++;
    var record = this.history[this.historyIndex];
    this.applyData(record.text, record.offset);
    this.emit('change', { target: this, value: record.text, action: 'redo', record: record, type: 'change' }, this);
};



PreInput.prototype.commitChange = function (text, offset) {
    while (this.historyIndex < this.history.length - 1) {
        this.history.pop();
    }
    var lastText = this.history.length > 0 ? this.history[this.history.length - 1].text : null;
    if (text === lastText) {
        if (this.history[this.history.length - 1].offset != offset)
            this.history[this.history.length - 1].offset = offset;
    }
    else {
        this.historyIndex = this.history.length;
        var record = {
            text: text,
            offset: offset
        };
        this.history.push(record);
        this.emit('change', { target: this, value: record.text, action: 'commit', record: record, type: 'change' }, this);
    }
};

PreInput.prototype.waitToCommit = function (text, offset) {
    var thisInput = this;
    if (this._commitTimeout > 0)
        clearTimeout(this._commitTimeout);
    this._commitTimeout = setTimeout(function () {
        thisInput.commitChange(text, offset);
    }, 50);
};

PreInput.prototype.getPosition = function (node, offset) {
    if (!node) return NaN;
    if (node == this)
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


PreInput.prototype.getSelectPosition = function () {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            var range = sel.getRangeAt(0);
            var startOffset = this.getPosition(range.startContainer, range.startOffset);
            var endOffset = this.getPosition(range.endContainer, range.endOffset);
            if (isNaN(startOffset)) return null;
            return {
                start: startOffset, end: endOffset
            }
        }
    } else if (document.selection) {
        console.error('May not support!');
    }
};

PreInput.prototype.stringOf = function (node) {
    if (!node) return '';
    if (node.nodeType == 3) {
        return node.data;
    }
    if (node.tagName == 'BR' || node.tagName == 'br') return '\n';
    var thisInput = this;

    return Array.prototype.map.call(node.childNodes, function (cNode, index, arr) {
        if ((cNode.tagName == 'BR' || cNode.tagName == 'br') && (index + 1 >= arr.length)) return '';
        return thisInput.stringOf(cNode);
    }).join('');

}


PreInput.prototype._pasteText = function (text) {
    var sel = window.getSelection();
    var range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            var textNode = _({ text: text });
            range.insertNode(textNode);
            sel.removeRange(range);
            range = document.createRange();
            range.setStart(textNode, text.length);
            sel.addRange(range);
            this.scrollIntoRange(range);
            this.commitChange(this.stringOf(this), this.getPosition(textNode, text.length));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
        console.error('May not support!');
    }
};


/**
 * @type {PreInput}
*/
PreInput.eventHandler = {};




PreInput.eventHandler.paste = function (event) {
    var thisIp = this;
    var clipboardData = (event.clipboardData || window.clipboardData);
    /**Safari bug */
    if (clipboardData) {
        if (clipboardData.items) {
            var items = Array.prototype.slice.call(clipboardData.items);
            var imgItems = items.filter(function (item) {
                return item.type.indexOf('image') >= 0;
            });

            var plainTextItems = items.filter(function (item) {
                return item.type.indexOf('text/plain') >= 0;
            });

            if (imgItems.length > 0) {
                var imgFiles = imgItems.map(function (it) {
                    return it.getAsFile();
                });
                this.emit('pasteimg', { target: this, imageFile: imgFiles[0], imageFiles: imgFiles, orginEvent: event }, this);
            }
            else if (plainTextItems.length > 0) {
                var plainTextItem = plainTextItems[0];//only one item
                plainTextItem.getAsString(function (text) {
                    thisIp._pasteText(text);
                });
            }
            else {
                console.error("Can not handle clipboard data");
            }
            event.preventDefault();
        }
        else {
            var text = event.clipboardData.getData('text/plain');
            if (text) {
                event.preventDefault();
                this._pasteText(text);
            }
            else {
                var currentText = this.stringOf(this);
                var currentSelection = this.getSelectPosition();
                console.log(currentSelection);

                setTimeout(function () {
                    var images = [];
                    $('img', thisIp, function (elt) {
                        images.push(elt);
                    });

                    Promise.all(images.map(function (img) {
                        return Dom.imageToCanvas(img).then(function (canvas) {
                            var dataURI = canvas.toDataURL();
                            var blob = dataURItoBlob(dataURI);
                            var file = blobToFile(blob);
                            return {
                                file: file, blob: blob, url: dataURI
                            }
                        }, function (error) { console.error(error) }).catch(function (error) { console.error(error) });
                    })).then(function (results) {
                        results = results.filter(function (it) { return !!it; });
                        if (results.length > 0) {
                            var imgFiles = results.map(function (it) { return it.file });
                            var urls = results.map(function (it) { return it.url });
                            thisIp.emit('pasteimg', { target: this, imageFile: imgFiles[0], imageFiles: imgFiles, urls: urls, url: urls[0], orginEvent: event }, thisIp);
                        }
                    });
                    thisIp.applyData(currentText, currentSelection);
                }, 1);

            }
        }
    }
    else {
        console.error("Not support browser!");
    }
};


PreInput.eventHandler.keydown = function (event) {
    if (event.ctrlKey) {
        switch (event.key) {
            case 'z':
                this.undo();
                event.preventDefault();
                break;
            case 'y':
                this.redo();
                event.preventDefault();
                break;

            default:
                break;
        }
    }
    if (!event.ctrlKey && !event.altKey) {
        setTimeout(function () {
            if (window.getSelection) {
                var sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    var range = sel.getRangeAt(0);
                    var text = this.stringOf(this);
                    var offset = this.getPosition(range.startContainer, range.startOffset);
                    this.waitToCommit(text, offset);
                }
            } else if (document.selection) {
                console.error('May not support!');
            }
        }.bind(this), 1);
    }
};

PreInput.property = {};

PreInput.property.value = {
    set: function (value) {
        value = value || '';
        this.applyData(value, value.length);
        this.commitChange(value, value.length);
    },
    get: function () {
        return this.stringOf(this);
    }
};


ACore.install('preinput', PreInput);

export default PreInput;