/***
 * Old name to new name
 */
import Dom from "absol/src/HTML5/Dom";
import ACore from "../../ACore";

export var MaterialDesignIconsNameMap = {
    'settings-outline': 'cog-outline',
    'contact-mail': 'card-account-mail',
};

export var MaterialDesignIconsCode = {};

Dom.documentReady.then(function () {
    var _ = ACore._;
    var a = _({
        tag: 'span',
        class: ['mdi'],
        style: {
            display: 'none'
        }
    }).addTo(document.body);
    var content;
    var cssCodeLines = [];
    for (var oldName in MaterialDesignIconsNameMap) {
        a.addClass('mdi-' + MaterialDesignIconsNameMap[oldName]);
        content = getComputedStyle(a, '::before').content;
        MaterialDesignIconsCode[oldName] = content;
        cssCodeLines.push('.mdi-' + oldName + '::before{content:' + content + '}');
        a.removeClass('mdi-' + MaterialDesignIconsNameMap[oldName]);
    }

    a.remove();

    var styleElt = _({
        tag: 'style',
        props: {
            innerHTML: cssCodeLines.join('\n')
        }
    }).addTo(document.head);
});
