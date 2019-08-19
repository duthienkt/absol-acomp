setTimeout(function () {
    var viewableScript = document.querySelectorAll('script.viewable');
    viewableScript.forEach(function (elt) {
        absol.$(elt).selfReplace(absol._({
            tag: 'pre',
            child: {
                tag: 'code',
                class: 'js',
                child: { text: elt.innerHTML }
            }
        }));
    });
    hljs.initHighlighting();
    var href = location.href;
    var mathedscroll = href.match(/\#([a-z0-9\_A-Z\-]+)/);
    if (mathedscroll) {
        var e = absol.$(mathedscroll[0]);
        if (e) e.scrollIntoView();
    }
    window.dispatchEvent(new Event('resize'));
}, 1000);
