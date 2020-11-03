/***
 * Old name to new name
 */
import Dom from "absol/src/HTML5/Dom";
import ACore from "../../ACore";

export var FontAwesomeIconsNameMap = {
    'close': 'times'
};

export var MaterialDesignIconsCode = {};

Dom.documentReady.then(function () {
    var _ = ACore._;
    var iElt = _({
        tag: 'i',
        class: ['fa'],
        style: {
            display: 'none'
        }
    }).addTo(document.body);
    var content;
    var cssCodeLines = [];
    for (var oldName in FontAwesomeIconsNameMap) {
        iElt.addClass('fa-' + FontAwesomeIconsNameMap[oldName]);
        content = getComputedStyle(iElt, ':before').content;
        MaterialDesignIconsCode[oldName] = content;
        cssCodeLines.push('.fa-' + oldName + '::before{content:' + content + '}');
        iElt.removeClass('fa-' + FontAwesomeIconsNameMap[oldName]);
    }

    iElt.remove();

    var styleElt = _({
        tag: 'style',
        id:'as-font-awesome-adapter',
        props: {
            innerHTML: cssCodeLines.join('\n')
        }
    }).addTo(document.head);
});
