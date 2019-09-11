import "absol/src/absol";
import AComp from "./AComp";

import QuickMenu from "./js/QuickMenu";
import ChromeCalendar from "./js/ChromeCalendar";

//for export to window
absol.Tooltip = AComp.creator.tooltip;
absol.QuickMenu = QuickMenu;
absol.AComp = AComp;

absol.ChromeCalendar = ChromeCalendar;

absol.coreDom.install(AComp.core);

window.AComp = absol.AComp;
setTimeout(function () {
    var mdiLink = absol.$('link', document.head, function (e) {
        if (e.href && e.href.toLowerCase().indexOf('materialdesignicons') >= 0) return true;
    });
    if (!mdiLink) {
        mdiLink = absol._({
            tag: 'link',
            attr: {
                rel: 'stylesheet',
                href: '//cdn.materialdesignicons.com/3.6.95/css/materialdesignicons.min.css'
            }
        }).addTo(document.head);
    }
}, 100);