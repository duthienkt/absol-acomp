import ACore, { _ } from "../../ACore";
import '../../css/ckplaceholder.css';
import { CKExtensionDict, CKExtensions, ckInit, ckMakeDefaultConfig } from "./plugins";
import { config } from "process";

/***
 * @extends AElement
 * @constructor
 */
function CKPlaceholder() {
    ckInit();
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.once('attached', this.eventHandler.attached);
    this._pendingData = '';
    this.editor = null;
    this._extensions = [];
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
        class: 'as-ck-placeholder'
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
    this.editor = this.mode === 'replace' ? CKEDITOR.replace(this, ckMakeDefaultConfig(this.config, this.extensions)) : CKEDITOR.inline(this, ckMakeDefaultConfig(this.config, this.extensions));
    this.editor.placeHolderElt = this;
    this.editor.on('instanceReady', this.eventHandler.instanceReady);
    this.editor.on('change', this.eventHandler.change);
    if (this.mode === 'replace'){
        this.editor.on('focus', function (event){
            this.emit('focus', {target: this, type:'focus', originalEvent: event});
        }.bind(this));
    }
    this._extensions.forEach(function (name) {
        var e = CKExtensionDict[name];
        if (e && e.extendMethods) {
            Object.assign(this, e.extendMethods);
        }
    }.bind(this));
    this.emit('editorcreated', { type: 'editorcreated', target: this, editor: this.editor }, this);
    if (this._pendingData.length > 0) {
        this.editor.setData(this._implicit(this._pendingData));
        this._pendingData = null;
    }
};

CKPlaceholder.eventHandler.instanceReady = function () {
    this.emit('editorready', { type: 'editorready', target: this, editor: this.editor }, this);
};

CKPlaceholder.eventHandler.change = function () {
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
        if (this.editor) {
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
        if (this.editor) return this._explicit(this.editor.getData());
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
}

ACore.install(CKPlaceholder);


export default CKPlaceholder;