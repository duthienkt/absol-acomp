import { $$, _ } from "../../ACore";
import { resolveDynamicLink } from "../utils";

var name = 'dynamic_link';
var command = 'insert_dynamic_link';

function init(editor) {
    editor.widgets.add(name, {
        button: 'Create Dynamic Link',
        template:
            '<a class="as-ck-widget-dynamic-link" data-link-id="1234" href="https://absol.cf">absol.cf</a>',
        allowedContent: 'a(!as-ck-widget-dynamic-link)',
        requiredContent: 'a(as-ck-widget-dynamic-link)',
        upcast: function (element) {
            return element.name === 'a' && element.hasClass('as-ck-widget-dynamic-link');
        }
    });


    editor.ui.addButton(command, {
        label: 'Insert Dynamic Link',
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
    return data;
    // parserDiv.innerHTML = data;
    // $$('.as-ck-widget-dynamic-link', parserDiv).forEach(function (elt) {
    // });
    // return parserDiv.innerHTML;
}

function implicit(data, placeHolderElt) {
    parserDiv.innerHTML = data;
    $$('.as-ck-widget-dynamic-link', parserDiv).forEach(function (elt) {
        var anchorData = {};
        anchorData.id = elt.getAttribute('data-link-id');
        anchorData.fragment = elt.getAttribute('data-fragment');
        anchorData.href = elt.getAttribute('href');
        anchorData.text = elt.innerHTML;
        var resolved = resolveDynamicLink(placeHolderElt.dynamicLinks, anchorData);
        elt.attr(resolved.attr);
        elt.innerHTML = resolved.text;
        // //return
        // var id = elt.getAttribute('data-link-id');
        // var info = placeHolderElt.dynamicLinks && placeHolderElt.dynamicLinks[id];
        // if (info){
        //     elt.setAttribute('href', info.href);
        //     elt.innerHTML = info.text || info.href;
        // }
    });
    return parserDiv.innerHTML;
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
         * @param {string} id
         * @param {string=} href
         * @param {string=} text
         *
         */
        insertDynamicLink: function (id, href, text) {
            var info = (this.dynamicLinks && this.dynamicLinks[id]) || { href:'.', text: location.href };
            if (!href){
                href = info.href;
            }
            if (!text){
                text = info.text;
            }
            this.editor.insertHtml('<a class="as-ck-widget-dynamic-link" data-link-id="'+id+'" href="'+href+'">' + text + '</a>')
        },
        getSelectedDynamicLink: function () {
            var sel = this.editor.getSelection();
            if (!sel) return null;
            var elt = sel.getSelectedElement();
            if (!elt) return null;
            if (!elt.hasClass('cke_widget_wrapper_as-ck-widget-dynamic-link')) return null;
            return (elt.$.firstChild &&  elt.$.firstChild.getAttribute('data-link-id')) || null;
        }
    }
}


export function getCKAnchorsInHTML(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    Array.prototype.forEach.call(div.querySelectorAll('img'), function (img) {//prevent loading images
        img.src = '';
        img.remove();
    });
    var anchors = div.getElementsByTagName('a');
    anchors = Array.from(anchors).map(function (e) {
        return {
            elt: e.parentElement,
            id: e.id,
            name: e.getAttribute('name'),
        };
    }).filter(function (e) {
        return e.id && e.name;
    }).map(function (e) {
        e.text = e.elt.textContent || e.name;
        return e;
    });
    return anchors;
}

/***
 * @name dynamicLinks
 * @type {{}}
 * @memberOf CKPlaceholder#
 */
