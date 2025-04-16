import ACore, { $$, $, _ } from "../../ACore";
import { findMaxZIndex } from "../utils";
import MDIPicker from "../MDIPicker";
import AElement from "absol/src/HTML5/AElement";

var name = 'mdi';

var command = 'mdi_dialog';


function init(editor) {
    editor.widgets.add(name, {
        button: 'Change MDI icon',
        template: '<span class="mdi"></span>',
        allowedContent: 'span(!as-ck-widget-mdi)',
        requiredContent: 'span(as-ck-widget-mdi)',
        upcast: function (element) {
            return element.name === 'div' && element.hasClass('mdi');
        },

    });

    editor.ui.addButton(command, {
        label: 'Insert MDI',
        command: command,
    });

    editor.addCommand(command, {
        exec: function (editor) {
            var btn = $('.cke_button.cke_button__mdi_dialog', editor.container.$);
            if (!btn) return;//unknown error
            var zIndex = findMaxZIndex(btn) + 2e3;
            var picker = _({
                tag: MDIPicker,
                style: {
                    zIndex: zIndex,
                },
                attr: {
                    tabindex: 1
                },
                on: {
                    pick: (event) => {
                        picker.followTarget = null;
                        picker.selfRemove();
                        editor.insertHtml(`<span class="as-ck-widget-mdi mdi mdi-${event.icon}">&nbsp;</span>`);
                    }
                }
            }).addTo(document.body);
            picker.followTarget = btn;
            setTimeout(() => {
                picker.focus();
            }, 100);
            picker.on('blur', () => {
                setTimeout(() => {
                    if (!document.activeElement || !AElement.prototype.isDescendantOf.call(document.activeElement, picker)) {
                        picker.followTarget = null;
                        picker.selfRemove();
                    }
                }, 200);
            }, true);
        }
    });
}


export default {
    init: init,
    name: name,
    command: command,
    plugin: {
        init: init
    }
}