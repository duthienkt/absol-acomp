import ckContentStyleText from './ckcontentstyle.css.tpl';
import { stringToBlob } from "absol/src/Converter/file";
import { _ } from "../../ACore";
import { arrayUnique } from "absol/src/DataStructure/Array";
import VariableExtension from "./ExpressionExtension";

var ckContentStyleUrl;
var ckPluginInitialized = false;

export var CKExtensions = [VariableExtension];

export var CKExtensionDict = CKExtensions.reduce(function (ac, cr) {
    ac[cr.name] = cr;
    return ac;
}, {});


export var CKStylesSetDefault = [
    {
        name: 'Notice',
        element: 'p',
        attributes: {
            class: 'as-ck-alert as-variant-notice'
        }
    },
    {
        name: 'Warning',
        element: 'p',
        attributes: {
            class: 'as-ck-alert as-variant-warning'
        }
    },
    {
        name: 'Tip',
        element: 'p',
        attributes: {
            class: 'as-ck-alert as-variant-info'
        }
    },
    {
        name: 'Success',
        element: 'p',
        attributes: {
            class: 'as-ck-alert as-variant-success'
        }
    }
];

export function ckInit() {
    if (!window.CKEDITOR) return;
    if (ckPluginInitialized) return;
    var styleCode = ckContentStyleText;
    ckContentStyleUrl = URL.createObjectURL(stringToBlob(styleCode, 'css'));
    ckPluginInitialized = true;
    document.head.appendChild(_('<link rel="stylesheet" href="' + ckContentStyleUrl + '">'));
    console.log('<link rel="stylesheet" href="' + ckContentStyleUrl + '">')
    CKEDITOR.stylesSet.add('as_styles_set_default', CKStylesSetDefault);
    CKExtensions.forEach(function (e) {
        if (e.plugin) {
            CKEDITOR.plugins.add(e.name, e.plugin)
        }
    })
}

export function ckMakeDefaultConfig(config, extensions) {
    ckInit();
    config = config || {};
    config.stylesSet = ['as_styles_set_default'].concat(arrayUnique((config.stylesSet || '').trim().split(/\s*,\s*/)))
        .filter(function (c) {
            return !!c;
        }).join(',');
    if (!config.toolbar) {
        config.toolbar = [
            { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript'] },
            { name: 'colors', items: ['TextColor', 'BGColor'] },
            { name: "format", items: ['CopyFormatting', 'RemoveFormat'] },
            {
                name: 'paragraph',
                items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            },
            { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
            { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
            {
                name: 'insert',
                items: ['Image', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe']
            },
            { name: 'tools', items: ['Maximize', 'ShowBlocks'] },
            { name: 'editing', items: ['Find', 'Replace'] },
            // { name: "linkdb", items: ['LinkDB'] },
            {
                name: "extensions", items: extensions.map(function (eName) {
                    if (CKExtensionDict[eName] && CKExtensionDict[eName].command) {
                        return CKExtensionDict[eName].command;
                    }
                }).filter(function (u) {
                    return !!u;
                })
            },
            { name: 'document', items: ['Source'] }
        ];
    }

    config.toolbar = config.toolbar.filter(function (i) {
        return i.items && i.items.length > 0;
    })

    if (!config.height) {
        config.height = '500px';
    }

    var contentsCss = [ckContentStyleUrl];
    if (typeof config.contentsCss === "string") {
        contentsCss.push(config.contentsCss);
    }
    else if (config.contentsCss instanceof Array) {
        contentsCss.push.apply(contentsCss, config.contentsCss);
    }

    var has = contentsCss.some(function (url) {
        return url.indexOf('family=Material+Icons') >= 0;
    });
    if (!has) {
        contentsCss.push('https://fonts.googleapis.com/icon?family=Material+Icons');
    }
    has = contentsCss.some(function (url) {
        return url.indexOf(CKEDITOR.basePath + 'contents.css') >= 0;
    });
    if (!has) {
        contentsCss.push(CKEDITOR.basePath + 'contents.css?time=' + Math.random());
    }
    config.contentsCss = contentsCss;

    var extraPlugins = [];
    if (typeof config.extraPlugins === 'string') {
        extraPlugins.push.apply(extraPlugins, config.extraPlugins.trim().split(/\s*,\s*/));
    }
    else if (extraPlugins instanceof Array) {
        extraPlugins.push.apply(extraPlugins, config.extraPlugins)
    }

    extraPlugins = extraPlugins.filter(function (c) {
        return typeof c === 'string' && !!c;
    });
    CKExtensions.forEach(function (e) {
        if (extensions.indexOf(e.name) >= 0) extraPlugins.push(e.name);
    });
    extraPlugins = arrayUnique(extraPlugins);
    config.extraPlugins = extraPlugins.join(',');
    config.allowedContent = true;//false: you must add button ui => bug

    Object.assign(config, {
        //style

        // htmlEncodeOutput: false,
        // entities: false,
        // basicEntities: false,
        // // config.cloudServices_uploadUrl: 'DDFFE2739B83A73DDF16AB641ECA2',
        // // config.cloudServices_tokenUrl: 'https://lab.daithangminh.vn/hr_system_settings/php/uploadMedia.php',
        // extraPlugins: 'LinkDB, Note',
        // filebrowserBrowseUrl: 'js/ckfinder/ckfinder.html',
        // filebrowserImageBrowseUrl: 'js/ckfinder/ckfinder.html?type=Images',
        // filebrowserFlashBrowseUrl: 'js/ckfinder/ckfinder.html?type=Flash',
        // filebrowserUploadUrl: 'js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Files',
        // filebrowserImageUploadUrl: 'js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Images',
        // filebrowserFlashUploadUrl: 'js/ckfinder/core/connector/php/connector.php?command=QuickUpload&type=Flash'
    });

    return config;
}

export function ckAddDefaultStyleSet(ckEditor) {

}