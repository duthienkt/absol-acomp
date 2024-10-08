import { _ } from "../ACore";

var counter = 30;

function makeCss(data) {
    var cssText = Object.keys(data).map(key => {
        return [
            '[data-ml-key=' + JSON.stringify(key) + ']::before {',
            '    content: ' + JSON.stringify(data[key]) + ';',
            '}'
        ].join('\n');
    }).join('\n\n');
    _({
        tag: 'style',
        attr: {
            type: 'text/css'
        },
        props: {
            innerHTML: cssText
        }
    }).addTo(document.head);
}

var data = {
    txt_ok: 'OK',
    txt_cancel: 'Cancel',
    txt_close: 'Close',
    txt_option: 'Option',
    txt_check_all: 'Check All',
    txt_select_value: '-- Select values --'
};

makeCss(data);

var overrideData = {};

var LanguageModuleLoaded = false;

export function loadLanguageModule() {
    if (LanguageModuleLoaded) return;
    var text;
    var newest = false, key;
    if (window['LanguageModule'] && window['LanguageModule'].data && window['LanguageModule'].data.length > 0) {
        LanguageModuleLoaded = true;
        for (key in data) {
            text = window['LanguageModule'].text(key);
            if (!text.startsWith('[key:') && text !== data[key]) {
                overrideData[key] = text;
                newest = true;
            }
        }
        if (newest) makeCss(overrideData);
    }

}


function waitLanguage() {
    if (window['LanguageModule'] && window['LanguageModule'].data && window['LanguageModule'].data.length > 0) {
        loadLanguageModule();
    }
    else {
        if (counter--)
            setTimeout(waitLanguage, 400 + Math.floor(16000 / counter / counter));
    }
}

waitLanguage();


export default {};

