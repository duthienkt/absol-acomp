import CKPlaceholder from "./CKPlaceholder";
import OOP from "absol/src/HTML5/OOP";
import ACore, { $$, _ } from "../ACore";
import { measureText } from "./utils";
import { base64EncodeUnicode } from "absol/src/Converter/base64";


export function parseCKTemplate(data, replacements) {
    var replaceF = replacements;
    if (typeof replacements !== "function") {
        replaceF = function (variable) {
            return replacements[variable] || ('{{' + variable + '}}');
        }
    }
    return data.replace(/\{\{([a-zA-Z_$]([a-zA-Z_$0-9]*))(\.([a-zA-Z_$]([a-zA-Z_$0-9]*)))*\}\}/g, function (all) {
        var variable = all.substr(2, all.length - 2);
        return replaceF(variable) || ('{{' + variable + '}}');
    }.bind(this));
}


/***
 * @extends CKPlaceholder
 * @constructor
 */
function CKTemplatePlaceholder() {
    CKPlaceholder.call(this);

}

OOP.mixClass(CKTemplatePlaceholder, CKPlaceholder);
CKTemplatePlaceholder.property = Object.assign({}, CKPlaceholder.property);
CKTemplatePlaceholder.eventHandler = Object.assign({}, CKPlaceholder.eventHandler);

CKTemplatePlaceholder.tag = 'CKTemplatePlaceholder'.toLowerCase();
CKTemplatePlaceholder.render = function () {
    return _({
        tag: 'as-ck-template-placeholder',
        extendEvent: ['editorcreated', 'editorready', 'command_add_variable']
    });
};

CKTemplatePlaceholder.prototype._makeConfig = function (config) {
    config.toolbar = [
        {
            name: 'feature',
            items: ['add_variable']
        },
        {
            name: 'clipboard',
            groups: ['clipboard', 'undo'],
            items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']
        },
        {
            name: 'editing',
            groups: ['find', 'selection'],
            items: ['Find', 'Replace', '-', 'SelectAll']
        },
        '/',
        {
            name: 'basicstyles',
            groups: ['basicstyles', 'cleanup'],
            items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat']
        },
        {
            name: 'paragraph',
            groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
            items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl']
        },
        { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
        { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak'] },
        '/',
        { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
        { name: 'colors', items: ['TextColor', 'BGColor'] },
        { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
        { name: 'others', items: ['-'] },
        { name: 'about', items: ['About'] }
    ];
    config.styles = { 'font-family': 'Arial', 'font-size': '14px' }
    return config;
};

CKTemplatePlaceholder.prototype._setupTemplatePlugin = function () {
    var editor = this.editor;
    editor.ui.addButton('add_variable',
        {
            label: 'Add Variable',
            command: 'add_variable',
            icon: 'as-variable-box-ico'
        });
    var cmd = editor.addCommand('add_variable', {
        exec: function () {
            this.emit('command_add_variable', { type: 'commandaddvariable', editor: this.editor, target: this }, this);
        }.bind(this)
    });
};

/***
 * @this CKTemplatePlaceholder
 ***/
CKTemplatePlaceholder.eventHandler.attached = function () {
    this.$attachhook.remove();
    this.editor = CKEDITOR.replace(this, this._makeConfig(this.config));
    this.editor.on('instanceReady', this.eventHandler.instanceReady);
    if (this._pendingData.length > 0) {
        this.editor.setData(this._pendingData);
        this._pendingData = null;
    }
    this._setupTemplatePlugin();
    this.emit('editorcreated', { type: 'editorcreated', target: this, editor: this.editor }, this);
};


CKTemplatePlaceholder.prototype._makeVariableHtml = function (variable, text) {
    text = '{{' + text + '}}';
    var width = measureText(text, '16px arial').width;
    var img = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"  viewBox="0 0 ' + (width + 2) + ' 24">\n' +
        '    <text style="font-family:Arial;font-size:16px;fill:blue" x="1" y="20">' + text + '</text>\n' +
        '</svg>';
    var n64Ulr = 'data:image/svg+xml;base64,' + base64EncodeUnicode(img);
    return '<img style="position: relative;bottom: -0.2em;height:1.5em; font-size: inherit;display: inline;" alt="{{' + variable + '}}" src="' + n64Ulr + '"></img>';
};
/**
 * @param {{value:string, text: string}} item
 */
CKTemplatePlaceholder.prototype.insertVariable = function (item) {
    this.editor.insertHtml(this._makeVariableHtml(item.value, item.text || item.value));
};

/**
 * @param {{value:string, text: string}} item
 */
CKTemplatePlaceholder.prototype.insertExpression = function (item) {
    this.editor.insertHtml(this._makeVariableHtml(item.value, item.text || item.value));
};

CKTemplatePlaceholder.prototype.dataExplicit = function (data) {
    var div = document.createElement('div');
    div.innerHTML = data;
    $$('img', div).forEach(function (elt) {
        var alt = elt.attr('alt');
        var isVar = alt && !!alt.match(/^\{\{([a-zA-Z_$]([a-zA-Z_$0-9]*))(\.([a-zA-Z_$]([a-zA-Z_$0-9]*)))*\}\}$/);
        var textNode;
        if (isVar) {
            textNode = document.createTextNode(alt);
            elt.parentElement.replaceChild(textNode, elt);
        }
    });
    return div.innerHTML;
};


CKTemplatePlaceholder.prototype.dataImplicit = function (data) {
    if (typeof data !== "string") data = '';
    var var2text = this.variable2Text || {};
    return parseCKTemplate(data, function (variable) {
        return this._makeVariableHtml(variable, var2text[variable] || variable);
    }.bind(this));
};


CKTemplatePlaceholder.property.data = {
    set: function (data) {
        if (typeof data !== "string") data = '';
        data = this.dataImplicit(data);
        if (this.editor) {
            this.editor.setData(data);
        }
        else {
            this._pendingData = data;
        }
    },
    get: function () {
        if (this.editor) return this.editor.getData();
        return this.dataExplicit(this._pendingData);
    }
};


ACore.install(CKTemplatePlaceholder);

export default CKTemplatePlaceholder