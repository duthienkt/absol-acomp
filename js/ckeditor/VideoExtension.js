import { openVideUrlDialog } from "../videourldialog/VideoUrlDialog";
import { $, _ } from "../../ACore";
import { base64DecodeUnicode, base64EncodeUnicode } from "absol/src/Converter/base64";


var name = 'video';
var command = 'insert_video';

function getInfoFromCKImage(elt) {
    var initInfo = null;
    if (elt.getAttribute('data-node-type') === 'video') {
        initInfo = JSON.parse(base64DecodeUnicode(elt.getAttribute('data-info')));
        initInfo.embedUrl = elt.getAttribute('data-embed-url');
        initInfo.image = elt.getAttribute('src');
        initInfo.image = elt.getAttribute('src');
    }
    return initInfo;
}

function init(editor) {
    editor.ui.addButton(command, {
        label: 'Insert Video',
        command: command,
    });


    editor.on('doubleclick', (event) => {
        var info;
        if (event.data && event.data.element) {
            info = getInfoFromCKImage(event.data.element);
            if (info) {
                event.cancel();
                editor.execCommand(command);
            }
        }
    });


    editor.addCommand(command, {
        exec: function (editor) {
            var initInfo;
            var sel = editor.getSelection();
            var elt;
            if (sel) {
                elt = sel.getSelectedElement();
            }

            if (elt) {
                initInfo = getInfoFromCKImage(elt);
            }


            openVideUrlDialog(initInfo).then((result) => {
                var savedInfo = Object.assign({}, result);
                delete savedInfo.image;
                delete savedInfo.embedUrl;
                if (result) {
                    var html = `<img src="${result.image}" data-type="${result.type}" \
                        onload="window.ckeditorVideoInit && window.ckeditorVideoInit(this)"\
                         data-embed-url="${result.embedUrl}"\
                         width="${result.displayWidth}px"  height="${result.displayHeight}px"\
                          data-node-type="video" \
                          data-info="${base64EncodeUnicode(JSON.stringify(savedInfo))}"
                          
                         >`;
                    editor.insertHtml(html);

                }
            });
        }
    });
}

window.ckeditorVideoInit = function (elt) {
    $(elt);
    if (!elt.isDescendantOf(document.body)) return;
    var newElt;
    var type = elt.attr('data-type');
    if (type.startsWith('video/')) {
        newElt = _({
            tag: 'video',
            attr: {
                crossorigin: "anonymous",
                crossOrigin: "anonymous",
                preload: 'auto',
                src: elt.attr('data-embed-url'),
                width: elt.attr('width'),
                height: elt.attr('height'),
                controls: true
            },
        });
    }
    else {
        newElt = _({
            tag: 'iframe',
            attr: {
                src: elt.attr('data-embed-url'),
                width: elt.attr('width'),
                height: elt.attr('height'),
            }
        })
    }
    elt.selfReplace(newElt);
}


export default {
    name: name,
    command: command,
    plugin: {
        init: init
    },
    extendMethods: {}
}

/***
 * @name variables
 * @type {{}}
 * @memberOf CKPlaceholder#
 */