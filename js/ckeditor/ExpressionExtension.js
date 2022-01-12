import { $$, _ } from "../../ACore";
import TemplateString from "absol/src/JSMaker/TemplateString";

var name = 'expression';
var command = 'insert_expression';

function init(editor) {
    editor.widgets.add(name, {
        button: 'Create a simple box',
        template:
            '<span class="as-ck-widget-expression">&#0123;&#0123; expression &#0125;&#0125;</span>',
        allowedContent: 'span(!as-ck-widget-expression)',
        requiredContent: 'span(as-ck-widget-expression)',
        upcast: function (element) {
            return element.name === 'span' && element.hasClass('as-ck-widget-expression');
        }
    });


    editor.ui.addButton(command, {
        label: 'Insert expression',
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
    $$('.as-ck-widget-expression', parserDiv).forEach(function (elt) {
        var text = elt.innerHTML;
        text.replace(/&#0123;/g, '{').replace(/&#0125;/g, '}');
        elt.parentElement.replaceChild(_({ text: text }), elt)
    });
    return parserDiv.innerHTML;
}

function implicit(data, placeHolderElt) {
    var template = TemplateString.parse(data);
    var res = template.parts.slice().map(function (part) {
        if (part.type === 1) {
            return '<span class="as-ck-widget-expression">&#0123;&#0123; ' + part.data.trim() + ' &#0125;&#0125;</span>'
        }
        else return part.data;
    }).join('');
    return res;
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
         * @param expression
         *
         */
        insertExpression: function (expression) {
            this.editor.insertHtml('<span class="as-ck-widget-expression">&#0123;&#0123; ' + expression.trim() + ' &#0125;&#0125;</span>')
        }
    }
}