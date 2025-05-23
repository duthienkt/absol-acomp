import ACore, { _ } from "../../ACore";
import '../../css/ckplaceholder.css';
import { CKExtensionDict, CKExtensions, ckInit, ckMakeDefaultConfig } from "./plugins";
import CKStickyToolbarController from "./CKStickyToolbarController";
import Dom from "absol/src/HTML5/Dom";
import { isRealNumber } from "../utils";

Dom.documentReady.then(function () {
    setTimeout(ckInit, 100);
});

/***
 * @extends AElement
 * @constructor
 */
function CKPlaceholder() {
    ckInit();
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.once('attached', this.eventHandler.attached);
    this._pendingData = '';
    this.isReady = false;
    this.editor = null;
    this._extensions = [];
    this._config = this._makeInitConfig();
    this.afterReady = new Promise(rs => {
        this.on('editorready', rs);
    });
    this.stickyToolbarCtrl = null;
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
    /***
     *
     * @type {boolean}
     */
    this.stickyToolbar = true;
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
    console.log(this.style.width, this.style.height);
    var config = this.config;
    var width = this.style.width;
    if (width.endsWith('px')) config.width = width;
    var height = this.style.height;
    if (height.endsWith('px')) config.height = height;
    config = ckMakeDefaultConfig(this.config, this.extensions, this);
    this.editor = this.mode === 'replace' ? CKEDITOR.replace(this, config) : CKEDITOR.inline(this, config);
    this.editor.placeHolderElt = this;
    this.editor.on('instanceReady', this.eventHandler.instanceReady);
    this.editor.on('change', this.eventHandler.change);
    if (this.mode === 'replace') {
        this.editor.on('focus', function (event) {
            this.emit('focus', { target: this, type: 'focus', originalEvent: event });
        }.bind(this));
    }
    this._extensions.forEach(function (name) {
        var e = CKExtensionDict[name];
        if (e && e.extendMethods) {
            Object.assign(this, e.extendMethods);
        }
    }.bind(this));
    this.emit('editorcreated', { type: 'editorcreated', target: this, editor: this.editor }, this);

};

CKPlaceholder.eventHandler.instanceReady = function () {
    var width = this.style.width;
    if (width.endsWith('px')) width = parseFloat(width.replace('px'));
    var height = this.style.height;
    if (height.endsWith('px')) height = parseFloat(height.replace('px'));
    if (isRealNumber(width) && isRealNumber(height)) {
        this.editor.resize(width, height);
    }
    this.isReady = true;
    if (this._pendingData && this._pendingData.length > 0) {
        this.editor.setData(this._implicit(this._pendingData));
        this._pendingData = null;
    }
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


CKPlaceholder.property.stickyToolbar = {
    set: function (value) {
        if (value) {
            this.addClass('as-has-sticky-toolbar');
        }
        else {
            return this.removeClass('as-has-sticky-toolbar');
        }
        this.afterReady.then(() => {
            if (this.mode !== 'replace') return;
            if (this.stickyToolbar) {
                if (!this.stickyToolbarCtrl) {
                    this.stickyToolbarCtrl = new CKStickyToolbarController(this);
                }
                this.stickyToolbarCtrl.start();
            }
            else {
                this.editor.container.$.classList.remove('as-has-sticky-toolbar');
                if (this.stickyToolbarCtrl) this.stickyToolbarCtrl.stop();
            }
        });
    },
    get: function () {
        return this.hasClass('as-has-sticky-toolbar');
    }
};

ACore.install(CKPlaceholder);


export default CKPlaceholder;