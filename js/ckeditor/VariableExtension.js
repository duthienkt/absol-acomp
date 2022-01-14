import { $$, _ } from "../../ACore";
import TemplateString from "absol/src/JSMaker/TemplateString";

var name = 'variable';
var command = 'insert_variable';

function init(editor) {
    editor.widgets.add(name, {
        button: 'Create Variable',
        template:
            '<span class="as-ck-widget-variable">variable</span>',
        allowedContent: 'span(!as-ck-widget-variable)',
        requiredContent: 'span(as-ck-widget-variable)',
        upcast: function (element) {
            return element.name === 'span' && element.hasClass('as-ck-widget-variable');
        }
    });


    editor.ui.addButton(command, {
        label: 'Insert Variable',
        command: command,
    });


    editor.addCommand(command, {
        exec: function (editor) {
            if (editor.placeHolderElt) {
                editor.placeHolderElt.emit('command', { command: command, target: editor, type: 'command' });
            }
        }
    });
}

var parserDiv = _('div');

function explicit(data, placeHolderElt) {
    parserDiv.innerHTML = data;
    $$('.as-ck-widget-variable', parserDiv).forEach(function (elt) {
        var text = elt.innerHTML;
        elt.parentElement.replaceChild(_({ text: text }), elt)
    });
    return parserDiv.innerHTML;
}

function implicit(data, placeHolderElt) {
    var template = TemplateString.parse(data);
    return template.parts.slice().map(function (part) {
        if (part.type === 1) {
            return '<span class="as-ck-widget-variable">' + part.data.trim()+'</span>'
        }
        else return part.data;
    }).join('');
}


export default {
    name: name,
    command: command,
    implicit: implicit,
    explicit: explicit,
    plugin: {
        requires: 'widget',
        init: init
    },
    extendMethods: {
        /***
         * @this CKPlaceholder
         * @memberOf CKPlaceholder#
         * @param variable
         *
         */
        insertVariable: function (variable) {
            this.editor.insertHtml('<span class="as-ck-widget-variable">' + variable.trim() + '</span>')
        },
        getSelectedVariable: function () {
            var sel = this.editor.getSelection();
            if (!sel) return null;
            var elt = sel.getSelectedElement();
            if (!elt) return null;
            if (!elt.hasClass('cke_widget_wrapper_as-ck-widget-variable')) return null;
            var exp = elt.getText();
            exp = exp.trim();
            return exp;
        }
    }
}