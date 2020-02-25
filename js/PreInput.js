import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;

function PreInput() {
    this.defineEvent(['pasteimg', 'pastetext']);
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
    console.log(text, offset);

    this.clearChild()
        .addChild(_({ text: text }));

    // this.
};

PreInput.prototype.undo = function () {
    if (this.historyIndex <= 0) return;
    this.historyIndex--;
    var record = this.history[this.historyIndex];
    this.applyData(record.text, record.offset);
};


PreInput.prototype.redo = function () {
    if (this.historyIndex + 1 >= this.history.length) return;
    this.historyIndex++;
    var record = this.history[this.historyIndex];
    this.applyData(record.text, record.offset);
};



PreInput.prototype.commitChange = function (text, offset) {
    while (this.historyIndex > this.history.length - 1) this.history.pop();
    var lastText = this.history.length > 0 ? this.history[0].text : null;
    if (text === lastText) {
        if (this.history[0].offset != offset)
            this.history[0].offset = offset;
    }
    else {
        this.historyIndex = this.history.length;
        this.history.push({
            text: text,
            offset: offset
        });
    }
};

PreInput.prototype.waitToCommit = function (text, offset) {
    var thisInput = this;
    if (this._commitTimeout > 0)
        clearTimeout(this._commitTimeout);
    this._commitTimeout = setTimeout(function () {
        thisInput.commitChange(text, offset);
    }, 500);
};

PreInput.prototype.getPosition = function (node, offset) {
    if (node == this || !node)
        return offset;
    var parent = node.parentElement;
    var text = '';
    var child;
    for (var i = 0; i < parent.childNodes.length; ++i) {
        child = parent.childNodes[i];
        if (child == node) break;
        text += this.stringOf(child);
    }
    return this.getPosition(parent, text.length + offset);
};

PreInput.prototype.stringOf = function (node) {
    if (!node) return '';
    if (node.nodeType == 3) {
        return node.data;
    }
    var thisInput = this;

    return Array.prototype.map.call(node.childNodes, function (cNode) {
        return thisInput.stringOf(cNode);
    }).join('');
}

/**
 * @type {PreInput}
*/
PreInput.eventHandler = {};


PreInput.eventHandler.paste = function (event) {
    var thisInput = this;

    var pasteData = (event.clipboardData || window.clipboardData);
    /**Safari bug */
    if (pasteData && pasteData.items) {
        var items = Array.prototype.slice.call(pasteData.items);
        var imgItems = items.filter(function (item) {
            return item.type.indexOf('image') >= 0;
        });

        var plainTextItems = items.filter(function (item) {
            return item.type.indexOf('text/plain') >= 0;
        });

        if (imgItems.length > 0) {
            var imgFiles = imgItems.map(function (it) {
                return it.getAsFile();
            })
            this.emit('pasteimg', { target: this, imageFile: imgFiles[0], imageFiles: imgFiles, orginEvent: event }, this);
        }
        else if (plainTextItems.length > 0) {
            var plainTextItem = plainTextItems[0];//only one item
            plainTextItem.getAsString(function (text) {
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
                        thisInput.commitChange(thisInput.stringOf(thisInput), thisInput.getPosition(textNode, text.length));
                    }
                } else if (document.selection && document.selection.createRange) {
                    document.selection.createRange().text = text;
                }
            });
        }
        else {
            console.error("Can not handle clipboard data");
        }
    }
    else {
        console.warn("Not support browser!");
    }
    event.preventDefault();
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
};


Acore.install('preinput', PreInput);

export default PreInput;