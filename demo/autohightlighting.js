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
    var viewableStyle = document.querySelectorAll('style.viewable');
    viewableStyle.forEach(function (elt) {
        absol.$(elt.parentElement).addChildBefore(absol._({
            tag: 'pre',
            child: {
                tag: 'code',
                class: 'css',
                child: { text: elt.innerHTML }
            }
        }), elt);
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
