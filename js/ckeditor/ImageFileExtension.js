import { $$, _ } from "../../ACore";

var name = 'image_mgn';
var command = 'image_mgn_dialog';

function init(editor) {
    editor.ui.addButton(command, {
        label: 'Insert Image',
        command: command,
    });


    editor.addCommand(command, {
        exec: function (editor) {

            if (window.contentModule && window.contentModule.chooseFile) {
                window.contentModule.chooseFile({ type: "image_file" }).then(function (result) {
                    if (result instanceof Array) result = result[0];
                    if (result) {
                        editor.insertHtml('<img alt="'+(result.title|| result.name)+'" src="'+result.url+'"  style="max-width: 100%; border-width: 1px; border-style: solid;"/>')
                    }
                }.bind(this));
            }
        }
    });
}

function explicit(data, placeHolderElt) {
    return data;
}

var tokenRgx = /("([^\\"]|(\\.))*")|([a-zA-Z_$A-Z]([a-zA-Z_$A-Z0-9]*))/g;

function implicit(data, placeHolderElt) {
    return data;

}


export default {
    name: name,
    command: command,
    // implicit: implicit,
    // explicit: explicit,
    plugin: {
        init: init
    }
}

/***
 * @name variables
 * @type {{}}
 * @memberOf CKPlaceholder#
 */