import { copyFullHTML } from "absol/src/HTML5/Clipboard";

import Snackbar from "../Snackbar";

var name = 'copy_full_html';
var command = 'copy-full-html';


function init(editor) {
    editor.ui.addButton(command, {
        label: 'Copy HyperText',
        command: command,
    });

    editor.addCommand(command, {
        readOnly: 1,
        exec: function (editor) {
            setTimeout(function () {
                copyFullHTML(editor.getData())
                    .then(function () {
                        Snackbar.show("HyperText copied to clipboard.");
                    })
                    .catch(function () {
                        Snackbar.show("Failed to copy HyperText to clipboard. Please try again.");
                    });
            }, 10);

        }
    });
}

export default {
    name: name,
    command: command,
    plugin: {
        init: init
    }
};

