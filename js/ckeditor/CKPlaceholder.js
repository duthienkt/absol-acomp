import ACore, { $, _ } from "../../ACore";
import '../../css/ckplaceholder.css';
import { CKExtensionDict, CKExtensions, ckInit, ckMakeDefaultConfig } from "./plugins";
import { config } from "process";
import XLoader from "absol/src/Network/XLoader";


var ckeditor5Sync = null;

function loadCKEditor5Lib() {
    if (!ckeditor5Sync) {
        if (window.CKEDITOR5) ckeditor5Sync = Promise.resolve(window.CKEDITOR5);
        else {
            ckeditor5Sync = new Promise(function (resolve) {
                XLoader.loadScript('/vendor/ckeditor5/ckeditor.js').then(function () {
                }, function (e) {
                    if (location.origin.indexOf('keeview') >= 0) {
                        XLoader.loadScript('/vendor/ckeditor5/ckeditor.js').then(resolve);
                    }
                    else {
                        XLoader.loadScript('https://absol.cf/vendor/ckeditor5/ckeditor.js').then(resolve);
                    }
                })
            });
        }
    }
    return ckeditor5Sync;
}


/***
 * @extends AElement
 * @constructor
 */
function CKPlaceholder() {
    this.sync = loadCKEditor5Lib();
    ckInit();
    this.$textarea = $('textarea', this);
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.once('attached', this.eventHandler.attached);
    this._pendingData = '';
    this._extensions = [];

    this.editor = null;
    this._config = this._makeInitConfig();

    /***
     * @type {{}}
     * @name config
     * @memberOf CKPlaceholder#
     */
    /***
     * @type {string[]}
     * @name extensions
     * @memberOf CKPlaceholder#
     */
}

CKPlaceholder.tag = 'CKPlaceholder'.toLowerCase();

CKPlaceholder.render = function () {
    return _({
        extendEvent: ['editorcreated', 'editorready', 'change', 'command', 'focus'],
        class: 'as-ck-placeholder',
        child: [
            {
                tag: 'textarea'
            }
        ]
    });
};

CKPlaceholder.prototype.mode = 'replace';

/**
 *
 * @param {string}data
 * @private
 * @returns {string}
 */
CKPlaceholder.prototype._implicit = function (data) {
    if (typeof data !== "string") data = '';
    var self = this;
    return this._extensions.reverse().reduce(function (ac, cr) {
        var extension = CKExtensionDict[cr];
        if (extension.implicit) {
            ac = extension.implicit(ac, self);
        }
        return ac;
    }, data);
};

/**
 *
 * @param {string}data
 * @private
 * @returns {string}
 */
CKPlaceholder.prototype._explicit = function (data) {
    var self = this;
    return this._extensions.reduce(function (ac, cr) {
        var extension = CKExtensionDict[cr];
        if (extension && extension.explicit) {
            ac = extension.explicit(ac, self);
        }
        return ac;
    }, data);
};

/***
 * @returns {{}}
 * @protected
 */
CKPlaceholder.prototype._makeInitConfig = function () {
    return {};
};


CKPlaceholder.prototype.selectNext = function () {
    var editor = this.editor;
    if (!editor) return;
    var ranges = editor.getSelection().getRanges();
    // var startIndex = editor.element.getHtml().indexOf(findString);
    // if (startIndex != -1)  {
    //     ranges[0].setStart(element.getFirst(), startIndex);
    //     ranges[0].setEnd(element.getFirst(), startIndex + findString.length);
    //     sel.selectRanges([ranges[0]]);
    // }
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
    this.sync = this.sync.then(()=>{
        var EditorClass = this.mode === 'replace' ? CKEDITOR5.ClassicEditor : CKEDITOR5.InlineEditor;
        return EditorClass.create(this.$textarea, {
            // plugins: [/* 'Paragraph', 'Bold', 'Italic', 'Alignment'*/].map(function (x){
            //     return CKEDITOR5.plugins[x];
            // }),
            // toolbar: [ 'bold', 'italic', 'alignment' ]
            autosave: {
                save: this.eventHandler.change,
                // waitingTime: 500,
            }
        })
            .then(this.eventHandler.instanceReady);

    });


    // this.editor = this.mode === 'replace' ? CKEDITOR.replace(this, ckMakeDefaultConfig(this.config, this.extensions, this)) : CKEDITOR.inline(this, ckMakeDefaultConfig(this.config, this.extensions, this));
    // this.editor.placeHolderElt = this;
    // this.editor.on('instanceReady', this.eventHandler.instanceReady);


};


CKPlaceholder.eventHandler.instanceReady = function (editor) {
    this.editor = editor;
    this.editor.on('change', this.eventHandler.change);
    // if (this.mode === 'replace') {
    //     this.editor.on('focus', function (event) {
    //         this.emit('focus', { target: this, type: 'focus', originalEvent: event });
    //     }.bind(this));
    // }
    // this._extensions.forEach(function (name) {
    //     var e = CKExtensionDict[name];
    //     if (e && e.extendMethods) {
    //         Object.assign(this, e.extendMethods);
    //     }
    // }.bind(this));
    // this.emit('editorcreated', { type: 'editorcreated', target: this, editor: this.editor }, this);

    // this.isReady = true;
    // if (this._pendingData && this._pendingData.length > 0) {
    //     this.editor.setData(this._implicit(this._pendingData));
    //     this._pendingData = null;
    // }
    // this.emit('editorready', { type: 'editorready', target: this, editor: this.editor }, this);

};

CKPlaceholder.eventHandler.change = function () {
    console.log(this.editor.getData())
    this.emit('change', { type: 'change', target: this, editor: this.editor }, this);
};


CKPlaceholder.property = {};

CKPlaceholder.property.data = {
    /***
     * @this CKPlaceholder
     * @param data
     */
    set: function (data) {
        if (typeof data !== "string") data = '';
        if (this.isReady) {
            this.editor.setData(this._implicit(data));
        }
        else {
            this._pendingData = data;
        }
    },
    /***
     * @this CKPlaceholder
     * @returns {string}
     */
    get: function () {
        if (this.isReady) return this._explicit(this.editor.getData());
        return this._pendingData;
    }
};

CKPlaceholder.property.rawData = {
    get: function () {
        if (this.editor) this.editor.getData();
        else return this._implicit(this._pendingData);
    }
};

CKPlaceholder.property.config = {
    set: function (value) {
        if (this.editor) {
            throw  new Error("Can not set config after the CKEditor created");
        }
        this._config = Object.assign(this._makeInitConfig(), value);
    },
    get: function () {
        return this._config;
    }
};

CKPlaceholder.property.extensions = {
    set: function (value) {
        if (this.editor) {
            throw  new Error("Can not set extensions after the CKEditor created");
        }
        value = value || [];
        if (typeof value === "string") value = [value];
        if (!(value instanceof Array)) value = [];
        this._extensions = value.filter(function (c) {
            return typeof c === "string" && c.length > 0 && CKExtensionDict[c];
        });
        this._extensions = value;
    },
    get: function () {
        return this._extensions;
    }
};

CKPlaceholder.property.isReady = {
    get: function () {
        return !!this.editor;
    }
}

ACore.install(CKPlaceholder);


export default CKPlaceholder;