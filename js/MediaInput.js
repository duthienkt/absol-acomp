import  '../css/mediainput.css';
import Dom from "absol/src/HTML5/Dom";
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import {blobToFile, blobToArrayBuffer, dataURItoBlob} from "absol/src/Converter/file";
import Svg from "absol/src/HTML5/Svg";
import EventEmitter from "absol/src/HTML5/EventEmitter";

import {getTextIn, setSelectionRange} from 'absol/src/HTML5/Text';
import BScroller from "./BScroller";
import { normalizeFileName } from "./utils";

var MediACore = new Dom();
MediACore.install(ACore);


var _ = MediACore._;
var $ = MediACore.$;


function openFileDialog(props) {
    if (!MediACore.$fileInput) {
        MediACore.$fileInput = _({
            tag: 'input',
            class: 'vmedia-no-show',
            attr: {
                type: 'file'
            },
            props: {}
        }).addTo(document.body);
    }
    props = props || {};


    if (props.accept) {
        if (props.accept instanceof Array)
            MediACore.$fileInput.attr('accept', props.accept.join(','));
        else
            MediACore.$fileInput.attr('accept', props.accept);
    }
    else {
        MediACore.$fileInput.attr('accept', null);
    }

    if (props.multiple) {
        MediACore.$fileInput.attr('multiple', 'true');
    }
    else {
        MediACore.$fileInput.attr('multiple');
    }
    MediACore.$fileInput.value = null;
    MediACore.$fileInput.click();


    return new Promise(function (resolve, reject) {
        var finish = false;
        var body = $('body');
        MediACore.$fileInput.once('change', function () {
            finish = true;
            resolve(Array.prototype.map.call(this.files, function (file) {
                file.converted_name = normalizeFileName(file.name);
                return file;
            }));
        });

        body.once('mousedown', function () {
            if (finish) return;
            resolve();
        });

    });
}

function MediaInput() {
    this.$editor = $('.vmedia-media-input-text-container-editor', this);
    this.$editor.on('paste', this.eventHandler.paste);
    this.$editor.on('keydown', this.eventHandler.keydown, true);
    this.$addImagebtn = $('#add-image-btn', this);
    this.$addImagebtn.on('click', this.eventHandler.clickAddImage);
    this.$addFilebtn = $('#add-file-btn', this);
    this.$addFilebtn.on('click', this.eventHandler.clickAddFile);
    this.$imagePreviewContainer = $('.vmedia-media-input-imagepreview-container', this);
    this.on('dragover', this.eventHandler.dragOver);
    this.on('drop', this.eventHandler.drop);
    this.$sendbtn = $('#send-btn', this);
    this.$sendbtn.on('click', this.eventHandler.send);
    this.$toolLeftCtn = $('.vmedia-media-input-tool-container-left', this);
    this.$pluginContentCtn = $('.vmedia-media-input-plugin-content-container', this);
    this.snapData = [];
    this.snapDataHead = 0;
    this.sync = this.afterAttached();
    this.snapText();
}

MediaInput.tag = 'MediaInput'.toLowerCase();

MediaInput.render = function () {
    return _({
        class: 'vmedia-media-input',
        extendEvent: ['send', 'update', 'releaseplugin'],
        child: {
            class: 'vmedia-media-input-text-container',
            child: [{
                class: 'vmedia-media-input-imagepreview-container',
                child: {
                    class: 'vmedia-media-input-dropover',
                    child: 'download-ico'
                }
            },
                {
                    class: 'vmedia-media-input-text-container-editor',
                    attr: {
                        contenteditable: 'true'
                    },
                    on: {}
                },
                {
                    class: 'vmedia-media-input-text-container-buttons',
                    attr: {
                        title: 'Send'
                    }

                },
                {
                    class: 'vmedia-media-input-tool-container',
                    child: [
                        {
                            class: 'vmedia-media-input-tool-container-left',
                            child: [

                                {
                                    tag: 'button',
                                    attr: {
                                        id: 'add-image-btn',
                                        title: 'Add image'
                                    },
                                    child: 'add-image-ico'

                                },
                                {
                                    tag: 'button',
                                    attr: {
                                        id: 'add-file-btn',
                                        title: 'Add file'
                                    },
                                    child: 'add-file-ico'
                                },

                            ]
                        },
                        {
                            class: 'vmedia-media-input-tool-container-right',
                            child: [{
                                tag: 'button',
                                id: 'send-btn',
                                attr: {
                                    title: 'Send'
                                },
                                child: 'send-ico'
                            }]

                        }
                    ],
                },
                '.vmedia-media-input-plugin-content-container.blur',
            ]
        }
    });
};



MediaInput.prototype.addImage = function (url, title, data) {
    _({
        tag: 'imagepreview',
        attr: {
            title: title
        },
        props: {
            data: data,
            imgSrc: url
        },
        on: {
            pressremove: function () {
                this.selfRemove();
            }
        }
    }).addTo(this.$imagePreviewContainer);
};
MediaInput.prototype.addFile = function (url, ext, title, data) {
    _({
        tag: 'filepreview',
        attr: {
            title: title
        },
        props: {
            fileSrc: url,
            ext: ext,
            data: data
        },
        on: {
            pressremove: function () {
                this.selfRemove();
            }
        }
    }).addTo(this.$imagePreviewContainer);
};


MediaInput.property = {};

MediaInput.property.text = {
    set: function (value) {
        this.$editor.clearChild();
        value = value || '';
        var lines = value.split(/\r*\n/);
        if (lines.length < 1) return;
        this.$editor.addChild(document.createTextNode(lines[0]));
        lines.shift();
        lines.forEach(function (line) {
            this.$editor.addChild(_({ child: document.createTextNode(line) }));
        }.bind(this));
        this.snapText();
    },
    get: function () {
        return this.getTextFromElements(this.$editor);
    }
};

MediaInput.property.files = {
    get: function () {
        return Array.prototype.filter.call(this.$imagePreviewContainer.childNodes, function (e) {
            return e._azar_extendTags && e._azar_extendTags.filepreview;
        }).map(function (e) {
            return e.data;
        });
    }
};
MediaInput.property.images = {
    get: function () {
        return Array.prototype.filter.call(this.$imagePreviewContainer.childNodes, function (e) {
            return e._azar_extendTags && e._azar_extendTags.imagepreview;
        }).map(function (e) {
            return e.data;
        });
    }
};

// MediaInput.property

MediaInput.property.plugins = {
    set: function (value) {
        this.sync = this.sync.then(this._dettachPlugins.bind(this, this._plugins));
        if (value) {
            if (!(value instanceof Array)) value = [value];
            this._plugins = value;
            this.addClass('has-plugin');

        }
        else {
            //remove plugin
            this.sync.then(this._dettachPlugins.bind(this));
            this._plugins = null;
            this.removeClass('has-plugin');
        }
        this.sync = this.sync.then(this._attachPlugins.bind(this, this._plugins));
    },
    get: function () {
        return this._plugins || null;
    }
}


MediaInput.prototype.appendText = function (text) {
    var lastBr = null;
    if (this.$editor.childNodes && this.$editor.childNodes.length > 0
        && this.$editor.childNodes[this.$editor.childNodes.length - 1].tagName
        && this.$editor.childNodes[this.$editor.childNodes.length - 1].tagName.toLowerCase() == 'br') {
        lastBr = this.$editor.childNodes[this.$editor.childNodes.length - 1];
    }

    var lines = text.split(/\r?\n/);
    if (lastBr) {
        for (var i = 0; i < lines.length; ++i) {
            if (i > 0) this.$editor.addChild(_('br'));
            var e = _({ text: lines[i] });
            this.$editor.addChild(e);
        }
    }
    else {
        for (var i = 0; i < lines.length; ++i) {
            if (i > 0) this.$editor.addChildBefore(_('br'), lastBr);
            var e = _({ text: lines[i] });
        }
        this.$editor.addChildBefore(e, lastBr);
    }

    setSelectionRange(this.$editor, Infinity);
};


MediaInput.prototype._attachPlugins = function (plugins) {
    if (!plugins) return;
    var self = this;
    plugins.forEach(function (plugin) {
        var oldContent = null;
        var $button = _('button').addTo(self.$toolLeftCtn).on('click', function () {
            if (self._lastActivePlugin == plugin) return;
            self.releasePlugin();
            self._lastActivePlugin = plugin;
            self.$pluginContentCtn.removeClass('blur');
            self.$pluginContentCtn.clearChild();
            if (plugin.getContent) {
                var newContent = plugin.getContent(self, _, $, self.$pluginContentCtn, oldContent);
                oldContent = newContent;
                self.$pluginContentCtn.addChild(newContent);
            }
            var buttonBound = $button.getBoundingClientRect();
            var rootBound = self.$pluginContentCtn.parentNode.getBoundingClientRect();
            self.$pluginContentCtn.addStyle({
                left: buttonBound.left + buttonBound.width / 2 - rootBound.left + 'px',
                bottom: rootBound.bottom - buttonBound.top + 'px'
            });
            if (plugin.onActive) plugin.onActive(self);
            setTimeout(function () {
                var outListener = function (event) {
                    if (EventEmitter.hitElement(self.$pluginContentCtn, event)) {

                    }
                    else if (self._lastActivePlugin == plugin) {
                        var prevented = true;
                        if (plugin.onBlur) plugin.onBlur({
                            preventDefault: function () {
                                prevented = false;
                            }
                        });
                        if (prevented) {
                            self.releasePlugin();
                            $(document.body).off('click', outListener);
                        }
                    }
                    else {
                        $(document.body).off('click', outListener);
                    }
                };
                $(document.body).on('click', outListener);
                self.once('releaseplugin', function (ev) {
                    if (ev.plugin == plugin) {
                        $(document.body).off('click', outListener);
                    }
                });
            }, 100);
        });

        var btnInners = plugin.getTriggerInner(self, _, $, $button);
        if (!(btnInners instanceof Array)) btnInners = [btnInners];
        btnInners.forEach(function (e) {
            if (typeof e == 'string') {
                e = _({ text: e });
            }
            $button.addChild(e);
        });
        if (plugin.onAttached)
            plugin.onAttached(self);
    });
    //todo
    return true;
};

MediaInput.prototype.releasePlugin = function () {
    if (this._lastActivePlugin) {
        var plugin = this._lastActivePlugin;
        plugin.onDeactived && plugin.onDeactived(self);
        this.$pluginContentCtn.addClass('blur');
        this.emit('releaseplugin', { target: this, plugin: plugin }, this);
        this._lastActivePlugin = null;
    }

}

MediaInput.prototype._dettachPlugins = function (plugins) {
    if (!plugins) return;
    var self = this;
    plugins.forEach(function (plugin) {
        if (plugin.onAttached)
            plugin.onAttached(self);
    });
    //todo
    this._lastActivePlugin = null;
    return true;
};

MediaInput.prototype.focus = function () {
    this.$editor.focus();
    setSelectionRange(this.$editor, Infinity);
};

MediaInput.prototype.clear = function () {
    Array.prototype.filter.call(this.$imagePreviewContainer.childNodes, function (e) {
        return e._azar_extendTags && e._azar_extendTags.imagepreview;
    }).forEach(function (e) {
        e.selfRemove();
    });

    Array.prototype.filter.call(this.$imagePreviewContainer.childNodes, function (e) {
        return e._azar_extendTags && e._azar_extendTags.filepreview;
    }).forEach(function (e) {
        return e.selfRemove();
    });

    this.$editor.innerHTML = "";
    this.emit('update', { target: this }, this);
};


MediaInput.prototype.escapeSpace = function (s) {
    return s.replace(/\s/g, '&nbsp');
};


MediaInput.prototype.unescapeSpace = function (s) {
    return s.replace(/&nbsp/g, ' ');
};


MediaInput.prototype.getTextFromElements = function (element) {
    return getTextIn(element);
    // var self = this;

    // function visit(e, prevE) {
    //     var ac = '';
    //     var isNewLine = false;
    //     if (prevE && prevE.nodeType != Node.TEXT_NODE) {

    //         if (prevE.tagName && prevE.tagName.toLowerCase() == 'br') {
    //             isNewLine = true;
    //         }
    //         else if (Element.prototype.getComputedStyleValue.call(prevE, 'display') == 'block') {
    //             isNewLine = true;
    //         }
    //     }

    //     if (e.nodeType == Node.TEXT_NODE) {
    //         if (isNewLine) ac += '\n';
    //         ac += e.data;
    //     }
    //     else {
    //         var lastE = undefined;
    //         for (var i = 0; i < e.childNodes.length; ++i) {
    //             ac += visit(e.childNodes[i], i > 0 ? e.childNodes[i - 1] : null);

    //         }
    //     }
    //     return ac;
    // }

    // return visit(element);
};

MediaInput.prototype.getElementsFromText = function (text) {
    var newElements = text.split('\n')
        .map(function (text) {
            return document.createTextNode(text);
        })
        .reduce(function (ac, cr, i, arr) {
            if (i > 0)
                ac.push(_('br'));
            ac.push(cr);
            return ac;
        }, []);
    return newElements;
};


// MediaInput.prototype.textOnly = function(e) {
//     if (e.nodeType == Node.TEXT_NODE) return e.textContent;
//     if (!e.tagName) return '';
//     if (e.tagName.toLowerCase() == 'br') return '\n';
//     return ($(e).getComputedStyleValue('display') == 'block' ? '\n' : '') + Array.prototype.map.call(e.childNodes, this.textOnly.bind(this)).join('')
// };

MediaInput.prototype.makeTextOnly = function () {
    var self = this;
    var editor = this.$editor;
    Array.apply(null, this.$editor.childNodes).forEach(function (e) {
        e = $(e);
        if (e.nodeType == Node.TEXT_NODE) return;
        if (e.tagName) {
            var tagName = e.tagName.toLowerCase();
            if (tagName == 'br') return;
            if (tagName.match(/img|script|svg|button|iframe|hr|video|canvas/)) {
                e.selfRemove(e);
            }

            if (tagName.match(/select|input|textarea/)) {
                e.selfReplace(document.createTextNode(e.value));
                return;
            }

            var newElements = self.getElementsFromText(self.getTextFromElements(e));
            var lastElement;
            if (e.getComputedStyleValue('display') == 'block') {
                lastElement = _('br');
            }
            else {
                lastElement = newElements.pop();
            }
            e.selfReplace(lastElement);
            newElements.forEach(function (nE) {
                editor.addChildBefore(nE, lastElement);
            });
        }
    });


    this.emit('update', { target: editor }, this);
};

MediaInput.eventHandler = {};


MediaInput.eventHandler.keydown = function (event) {
    if (event.key == "Enter") {
        if (!event.ctrlKey && !event.altKey && !event.shiftKey) {
            event.preventDefault();
            this.eventHandler.send(event);
            this.snapText();
        }

    }
    if (event.ctrlKey && event.key == 'z') {
        event.preventDefault();
        this.undoText();
    }
    if (event.ctrlKey && event.key == 'x') {
        setTimeout(this.snapText.bind(this), 100)
    }
    setTimeout(this.emit.bind(this, 'update', event, this), 1);
};


MediaInput.eventHandler.send = function (event) {
    if (this.images.length == 0 && this.text.trim().length == 0 && this.files.length == 0) {
        return;
    }
    this.emit('send', event, this);
    this.snapText();
};

MediaInput.eventHandler.clickAddImage = function (event) {
    openFileDialog({ accept: 'image/*', multiple: true }).then(function (files) {
        if (!files) return;
        files.map(function (file) {
            var url = (window.URL || window.webkitURL).createObjectURL(file);
            this.addImage(url, file.name, { file: file, name: file.name, url: url });
            this.emit('update', event, this);
        }.bind(this));
    }.bind(this));
};

MediaInput.eventHandler.clickAddFile = function (event) {
    openFileDialog({ multiple: true }).then(function (files) {
        if (!files) return;
        files.map(function (file) {
            var url = (window.URL || window.webkitURL).createObjectURL(file);
            if (file.type.match(/^image/)) {
                this.addImage(url, file.name, { file: file, name: file.name, url: url });
            }
            else {
                var p = file.name.split('.');
                var ext = p.length > 1 ? p[p.length - 1] : '';
                this.addFile(url, ext.toUpperCase(), file.name, { file: file, name: file.name, url: url });
            }
        }.bind(this));
        this.emit('update', event, this);
    }.bind(this));
};


MediaInput.eventHandler.dragOver = function (event) {
    event.preventDefault();
    this._lastDragOver = new Date().getTime();
    var currentDragOver = this._lastDragOver;
    if (!this.dragOver) {
        this.dragOver = true;
        this.addClass('dragover');
        this.emit('update', event, this);
    }
    setTimeout(function () {
        this._waitDragFileOut
        if (this._lastDragOver == currentDragOver) {
            this.removeClass('dragover');
            this.dragOver = false;
            this.emit('update', event, this);
        }
    }.bind(this), 200);
};


MediaInput.eventHandler.drop = function (event) {
    event.preventDefault();
    if (event.dataTransfer.items) {
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
            if (event.dataTransfer.items[i].kind === 'file') {
                var file = event.dataTransfer.items[i].getAsFile();
                if (!file.type && file.size % 4096 == 0) {
                    //todo: folder
                }
                else {
                    this.addSystemFile(file);
                    this.emit('update', event, this);
                }

            }
        }
    }
    else {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            var file = event.dataTransfer.files[i];
            if (!file.type && file.size % 4096 == 0) {

            }
            else {
                this.addSystemFile(file);
                this.emit('update', event, this);
            }
        }
    }
};


MediaInput.prototype.addSystemFile = function (file) {
    var url = (window.URL || window.webkitURL).createObjectURL(file);
    if (file.type.match(/^image/)) {
        this.addImage(url, file.name, { file: file, name: file.name, url: url });
    }
    else {
        var p = file.name.split('.');
        var ext = p.length > 1 ? p[p.length - 1] : '';
        this.addFile(url, ext.toUpperCase(), file.name, { file: file, name: file.name, url: url });
    }
}


MediaInput.eventHandler.paste = function (event) {
    var pasteData = (event.clipboardData || window.clipboardData);
    var beforePasteElement = [];
    var self = this;

    function visit(e, ac) {
        ac.push(e);
        if (e.childNodes) {
            for (var i = 0; i < e.childNodes.length; ++i) {
                visit(e.childNodes[i], ac)
            }
        }
    }

    visit(this.$editor, beforePasteElement);


    function relocalCursor() {
        var afterPasteElement = [];
        visit(self.$editor, afterPasteElement);
        var diffElts = afterPasteElement.filter(function (e) {
            return beforePasteElement.indexOf(e) < 0;
        });
        if (diffElts.length > 0) {
            var last = diffElts.pop();
            if (last.nodeType == Node.TEXT_NODE) {
                var range = document.createRange();
                range.selectNodeContents(last);
                range.setStart(last, last.data.length);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
            }
            else {
                setSelectionRange(last, Infinity);
            }
        }
    }

    /**Safari bug */
    if (pasteData && pasteData.items) {
        var items = pasteData.items;
        var isAddImage = false;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                var blob = items[i].getAsFile();
                var URLObj = (window.URL || window.webkitURL);
                var source = URLObj.createObjectURL(blob);
                var file = blobToFile(blob);
                var buffer = blobToArrayBuffer(blob).then(function (arrayBuffer) {
                    this.addImage(source, 'Clipboard', {
                        file: blob,
                        name: null,
                        url: source,
                        blob: blob,
                        arrayBuffer: arrayBuffer
                    });
                    this.emit('update', event, this);
                }.bind(this));

                isAddImage = true;
                this.emit('update', event, this);
            }
        }
        if (isAddImage)
            event.preventDefault();
        requestAnimationFrame(function () {
            self.makeTextOnly();
            relocalCursor();
        });
    }
    else {
        requestAnimationFrame(function () {
            var img = $('img', this.$editor, function (img) {
                if (img) {
                    img = $(img);
                    var source = img.getAttribute('src');
                    img.selfRemove();
                    Dom.imageToCanvas(img).then(function (canvas) {
                        var dataURI = canvas.toDataURL();
                        var blob = dataURItoBlob(dataURI);
                        var file = blobToFile(blob);
                        var buffer = blobToArrayBuffer(blob).then(function (arrayBuffer) {
                            this.addImage(source, 'Clipboard', {
                                dataURI: dataURI,
                                file: blob,
                                name: null,
                                url: source,
                                blob: blob,
                                arrayBuffer: arrayBuffer
                            });
                            this.emit('update', event, this);
                        }.bind(this));

                    }.bind(this), function (e) {
                    }).catch(function (e) {
                    });

                }
            }.bind(this));
            this.makeTextOnly();
            relocalCursor();
        }.bind(this));
    }
};


MediaInput.prototype.undoText = function () {
    if (this.snapDataHead <= 1) return;
    this.snapDataHead--;
    if (this.snapDataHead <= 0) return;
    var newText = this.snapData[this.snapDataHead - 1];
    this.text = newText;
    setSelectionRange(this.$editor, Infinity);
};

MediaInput.prototype.redoText = function () {
    if (this.snapData.length <= this.snapDataHead) return;
    this.snapDataHead++;
    var newText = this.snapData[this.snapDataHead - 1];
    var currentText = this.text;
    this.text = newText;
    setSelectionRange(this.$editor, Infinity);
};

MediaInput.prototype.snapText = function () {
    while (this.snapData.length > this.snapDataHead && this.snapData.length > 0) this.snapData.pop();
    var oldText = this.snapData[this.snapDataHead - 1];
    var newText = this.text;
    if (newText == oldText) return;
    this.snapData.push(this.text);
    this.snapDataHead++;
}


function ImagePreview() {

    var res = _({
        extendEvent: 'pressremove',
        class: ['vmedia-media-input-imagepreview', 'vmedia-no-select'],
        child: ['img', 'times-ico']
    });

    res.$img = $('img', res);
    res.$timesIco = $('times-ico', res);
    res.$timesIco.on('click', function (event) {
        res.emit('pressremove', event, res);
    });
    OOP.drillProperty(res, res.$img, 'imgSrc', 'src');
    return res;
};


function FilePreview() {
    var res = _({
        extendEvent: 'pressremove',
        class: ['vmedia-media-input-filepreview', 'vmedia-no-select'],
        child: ['attachment-ico', 'times-ico']
    });

    res.$img = $('attachment-ico', res);
    OOP.drillProperty(res, res.$img, 'ext');
    res.$timesIco = $('times-ico', res);
    res.$timesIco.on('click', function (event) {
        res.emit('pressremove', event, res);
    });
    return res;
};


MediACore.creator.mediainput = MediaInput;
MediACore.creator.imagepreview = ImagePreview;
MediACore.creator.filepreview = FilePreview;

MediACore.creator['send-ico'] = function () {
    return _(
        [
            '<svg class="send" width="100" height="100" version="1.1" viewBox="0 0 26.458 26.458">',
            '    <g transform="translate(0 -270.54)">',
            '        <path d="m0.64298 272.44 3.1712 9.5402 22.152 1.7742-22.152 1.7482-3.1712 9.4749 25.323-11.223z" />',
            '    </g>',
            '</svg>'
        ].join('')
    );
};

MediACore.creator['add-file-ico'] = function () {
    return _(
        [
            '<svg class="add-file" width="100" height="100" version="1.1" viewBox="0 0 26.458 26.458" xmlns="http://www.w3.org/2000/svg">',
            '    <g transform="translate(0 -270.54)">',
            '        <path d="m4.2431 295.69c-0.74006-0.0759-1.4136-0.33772-2.0047-0.77942-0.19965-0.14919-0.60549-0.55475-0.75233-0.75182-0.45099-0.60524-0.7154-1.2913-0.77699-2.016-0.01275-0.15007-0.01628-2.6111-0.01252-8.7468 0.0049-8.0504 0.0068-8.5472 0.03338-8.6986 0.0883-0.50391 0.22692-0.91024 0.44705-1.3104 0.52794-0.95973 1.452-1.6645 2.5119-1.9158 0.44319-0.10508 0.12729-0.0972 4.1445-0.10308 2.5538-4e-3 3.6864-1e-4 3.7795 0.0121 0.38853 0.0508 0.80777 0.24687 1.2709 0.59434 0.44102 0.33085 0.68272 0.55272 1.7227 1.5813 0.46507 0.45998 1.2812 1.2664 1.8136 1.7921 0.96172 0.94958 1.3847 1.3824 1.696 1.7354 0.61073 0.69257 0.92 1.2063 1.0441 1.7344 0.02613 0.11122 0.02875 0.28598 0.03409 2.2731 0.0047 1.7451 0.0018 2.1574-0.01502 2.178-0.01424 0.0174-0.10685 0.0394-0.2936 0.0699-0.45695 0.0745-1.0078 0.22363-1.4356 0.38862-0.10025 0.0387-0.1888 0.0663-0.19678 0.0613-0.0085-5e-3 -0.01461-0.7983-0.01475-1.9156-2.09e-4 -1.6438-0.0036-1.9208-0.0245-2.0096-0.06972-0.29578-0.28642-0.50043-0.63767-0.60222-0.32942-0.0955-0.31104-0.0947-2.4299-0.10482l-1.9437-9e-3 -0.12495-0.0442c-0.25474-0.0901-0.45899-0.26526-0.5666-0.48578-0.10853-0.22238-0.10356-0.127-0.10407-1.9994-4.63e-4 -1.7153-0.01031-2.1544-0.05446-2.4288-0.06935-0.43095-0.22893-0.69171-0.5027-0.82138l-0.10904-0.0516h-3.1807c-3.4262 0-3.27-4e-3 -3.5482 0.0835-0.68034 0.21325-1.1718 0.754-1.3329 1.4666l-0.0345 0.15261v8.5059c0 8.1045 0.0014 8.5125 0.02871 8.6468 0.08088 0.39719 0.25808 0.72858 0.53956 1.0091 0.28082 0.27984 0.576 0.44186 0.98191 0.53896 0.11389 0.0273 0.36156 0.0293 4.5294 0.0374l4.409 9e-3 0.02019 0.0402c0.0111 0.0221 0.07695 0.15943 0.14632 0.30521s0.17519 0.3518 0.23515 0.45783c0.14341 0.25357 0.43703 0.69284 0.61725 0.92343 0.0793 0.10148 0.14077 0.19003 0.13659 0.19679-0.0073 0.0118-9.9306 0.0132-10.046 1e-3z" />',
            '        <path transform="matrix(.26458 0 0 .26458 0 270.54)" d="m72.469 65.742v7.4062h-7.4062v7.2852h7.4062v7.2812h7.2793v-7.2812h7.3535v-7.2852h-7.3535v-7.4062zm24.948 11.119a21.371 21.371 0 0 1-21.371 21.371 21.371 21.371 0 0 1-21.371-21.371 21.371 21.371 0 0 1 21.371-21.371 21.371 21.371 0 0 1 21.371 21.371z" style="fill-rule:evenodd;" />',
            '        <path d="m17.256 283.76 1.921-0.47607-0.04725-4.2884c0-0.50159-0.29516-1.2441-1.0789-2.0168l-4.6989-4.6324c-0.73814-0.72769-1.5947-0.97084-2.1519-0.97084h-7.0235c-2.1533 0.0144-3.4601 2.6226-3.4778 3.4778v17.284c0 2.121 2.2409 3.5346 3.5346 3.5346h10.058l-1.1146-1.9305h-8.6658c-1.1271 0-1.8503-1.1115-1.8503-1.8503v-16.867c0-1.0721 1.1373-1.6977 1.6977-1.6977h6.2175c0.43142 0 0.8103 0.28958 0.8103 1.1742v3.714c0 0.24768 0.36442 0.90967 0.90968 0.90967h3.2537c1.2453 0 1.6905 0.32876 1.6905 1.1613z"  />',
            '    </g>',
            '</svg>'
        ].join('')
    );
};
MediACore.creator['add-image-ico'] = function () {
    return _(
        [
            '<svg class="add-image" width="100" height="100" version="1.1" viewBox="0 0 26.458 26.458" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="absol/src/HTML5/Elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
            '    <g transform="translate(0 -270.54)">',
            '        <path d="m24.73 288.69a5.9808 5.9808 0 0 1-5.9808 5.9808 5.9808 5.9808 0 0 1-5.9808-5.9808 5.9808 5.9808 0 0 1 5.9808-5.9808 5.9808 5.9808 0 0 1 5.9808 5.9808zm1.503-0.037a7.5843 7.5843 0 0 1-7.5843 7.5843 7.5843 7.5843 0 0 1-7.5843-7.5843 7.5843 7.5843 0 0 1 7.5843-7.5843 7.5843 7.5843 0 0 1 7.5843 7.5843z" style="fill-rule:evenodd;fill:#414141"/>',
            '        <path d="m17.869 284.42v3.4127h-3.4081v1.6066h3.4081v3.438h1.6061v-3.438h3.4432v-1.6066h-3.4432v-3.4127z" style="fill-rule:evenodd;fill:#414141"/>',
            '        <path d="m24.614 281.39v-6.1305c0-1.6957-1.2841-2.6602-2.6602-2.6602h-18.412c-1.4547 0-2.7249 1.0223-2.7249 2.7249v14.986c0 1.2346 0.99768 2.6028 2.586 2.586h6.9542c-0.36184-0.63963-0.51495-1.0286-0.69323-1.6506h-6.4562c-0.29938 0-0.72246-0.40379-0.72246-0.72247v-1.8082l6.0428-6.7569 2.0296 2.0129 0.9605-1.3029-2.9734-3.1488-5.9885 6.7736v-11.426c0-0.24935 0.30766-0.63476 0.63476-0.63476h18.934c0.3592 0 0.84357 0.19284 0.84357 0.84357v5.2285c0.61147 0.22444 1.1564 0.59412 1.6454 1.0858z" style="fill:#414141"/>',
            '        <circle cx="17.869" cy="277.61" r="1.6891" style="fill-rule:evenodd;fill:#414141"/>',
            '    </g>',
            '</svg>'
        ].join('')
    );
};

MediACore.creator['attachment-ico'] = function () {
    return _(
        [
            '<svg class="attachment" width="1024" height="1024"  version="1.1" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" >',
            '    <path d="M145.6 0C100.8 0 64 35.2 64 80v862.4C64 987.2 100.8 1024 145.6 1024h732.8c44.8 0 81.6-36.8 81.6-81.6V324.8L657.6 0h-512z" fill="#8199AF"/>',
            '    <path d="M960 326.4v16H755.2s-100.8-20.8-99.2-108.8c0 0 4.8 92.8 97.6 92.8H960z" fill="#617F9B"/>',
            '    <path d="M657.6 0v233.6c0 25.6 17.6 92.8 97.6 92.8H960L657.6 0z" fill="#fff"/>',
            '    <path d="m491.77 770.31c17.6-19.2 17.6-48 0-67.2s-48-17.6-65.6 0l-147.2 147.2c-17.6 17.6-17.6 48 0 65.6s48 19.2 65.6 0l91.2-89.6c4.8-4.8 4.8-12.8 0-17.6s-14.4-6.4-19.2 0l-57.6 56c-8 8-19.2 8-27.2 0s-8-20.8 0-28.8l56-56c20.8-20.8 54.4-20.8 75.2 0s20.8 54.4 0 75.2l-89.6 89.6c-33.6 33.6-88 33.6-123.2 0-33.6-33.6-33.6-88 0-121.6l147.2-147.2c33.6-33.6 89.6-33.6 123.2 0s33.6 88 0 121.6l-14.4 14.4c-1.6-14.4-6.4-28.8-16-41.6z" style="fill:#fff"/>',
            '    <path d="m130.09 23.864h504.75v182.93h-545.65v-140.08c0.34155-16.845 13.608-42.414 40.9-42.847z" style="fill-opacity:.29648;fill-rule:evenodd;fill:#fff"/>',
            '</svg>'
        ]
            .join('')
    );
};

MediACore.creator['attachment-ico'].property = {
    ext: {
        set: function (value) {
            value = value || '';
            if (this.$ext) {
                this.$ext.selfRemove();
            }
            this.$ext = Svg.ShareInstance._('<text text-anchor="middle" x="321.39" y="170" font-size="145.76" style="fill:white;" >' + value + '</text>').addTo(this);
        },
        get: function () {
            return this._ext || '';
        }
    }
};


MediACore.creator['times-ico'] = function () {
    return _(
        [
            '<svg class="times" width="100" height="100" version="1.1" viewBox="0 0 26.458 26.458" xmlns="http://www.w3.org/2000/svg">',
            '    <g transform="translate(0 -270.54)">',
            '        <path d="m7.7013 276.49 5.4832 5.4832 5.5494-5.5494 1.7874 1.7874-5.5291 5.5291 5.4957 5.4957-1.754 1.754-5.5124-5.5124-5.5542 5.5542-1.7623-1.7623 5.5375-5.5375-5.5208-5.5208zm17.103 7.3351a11.558 11.558 0 0 1-11.558 11.558 11.558 11.558 0 0 1-11.558-11.558 11.558 11.558 0 0 1 11.558-11.558 11.558 11.558 0 0 1 11.558 11.558z" style="fill-rule:evenodd;"/>',
            '    </g>'
        ].join('')
    );
};


MediACore.creator['download-ico'] = function () {
    return _(
        [
            '<svg class="download" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
            '    <g transform="translate(0,-197)">',
            '        <path d="m44.888 209.14h13.982c1.1087 0.0459 2.2328 0.74137 2.317 2.3612v23.694h13.622c1.9742-0.18801 3.004 2.6244 1.9175 4.1118l-23.469 23.918c-0.876 0.77477-1.9993 0.77232-2.9362 0l-23.559-24.009c-0.86532-1.0422 0.11658-4.1953 2.3821-4.2047h13.268v-22.939c-0.08167-1.1772 0.78292-2.9507 2.4768-2.9312z" style="fill:#00c3e5"/>',
            '        <path d="m86.97 276.99a3.5027 3.5696 0 0 1-3.5027 3.5696 3.5027 3.5696 0 0 1-3.5027-3.5696 3.5027 3.5696 0 0 1 3.5027-3.5696 3.5027 3.5696 0 0 1 3.5027 3.5696zm-12.768 0a3.5027 3.5696 0 0 1-3.5027 3.5696 3.5027 3.5696 0 0 1-3.5027-3.5696 3.5027 3.5696 0 0 1 3.5027-3.5696 3.5027 3.5696 0 0 1 3.5027 3.5696zm-60.003-16.135h24.609c9.1206 13.508 17.573 12.942 26.609 0h23.839c2.8529 5e-3 3.5087 2.3205 3.4679 3.8227v18.953c0.04867 1.3083-1.5145 2.9901-2.7505 2.9832h-76.253c-1.049 0.0441-2.6554-1.4851-2.6306-3.1451l-1.56e-4 -18.792c0.0024-1.3549 0.50958-3.7927 3.1091-3.8227z" style="fill-rule:evenodd;fill:#00c3e5"/>',
            '    </g>',
            '</svg>'
        ].join('')
    );
};

MediACore.creator['plus-ico'] = function () {
    return _(
        '<svg class="_7oal" height="24" width="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><polygon points="-6,30 30,30 30,-6 -6,-6 "></polygon><path d="m18,11l-5,0l0,-5c0,-0.552 -0.448,-1 -1,-1c-0.5525,0 -1,0.448 -1,1l0,5l-5,0c-0.5525,0 -1,0.448 -1,1c0,0.552 0.4475,1 1,1l5,0l0,5c0,0.552 0.4475,1 1,1c0.552,0 1,-0.448 1,-1l0,-5l5,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1m-6,13c-6.6275,0 -12,-5.3725 -12,-12c0,-6.6275 5.3725,-12 12,-12c6.627,0 12,5.3725 12,12c0,6.6275 -5.373,12 -12,12" ></path></g></svg>'
    );
};


ACore.install(MediaInput);


export default MediaInput;