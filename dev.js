import AComp from "./AComp";
import IFrameBridge from 'absol/src/Network/IFrameBridge';
import * as stringGen from 'absol/src/String/stringGenerate';
import * as stringForm from 'absol/src/String/stringFormat';
import * as stringMatch from 'absol/src/String/stringMatching';

//for export to window
window.absol = window.absol || {};
absol.AComp = AComp;

absol.string = absol.string || {};
Object.assign(absol.string, stringGen, stringForm, stringMatch);


absol.ShareDom = absol.AComp;
absol.ShareDom.fromCode = absol.AComp.core.fromCode.bind(absol.AComp.core);
absol.ShareCreator = absol.AComp.creator;
absol._ = absol.ShareDom._;
absol.$ = absol.ShareDom.$;
absol.buildDom = absol.ShareDom._;

window.AComp = absol.AComp;
window.IFrameBridge = IFrameBridge;
setTimeout(function () {
    var mdiLink = absol.$('link', document.head, function (e) {
        if (e.href && e.href.toLowerCase().indexOf('materialdesignicons') >= 0) return true;
    });
    if (!mdiLink) {
        mdiLink = absol._({
            tag: 'link',
            attr: {
                rel: 'stylesheet',
                href: '/css/materialdesignicons/materialdesignicons.min.css',
            },
            once: {
                error: function () {
                    console.warn('/css/materialdesignicons/materialdesignicons.min.css not found');
                    this.href = 'https://volcanion.cf/materialdesignicons/materialdesignicons.min.css';
                }
            }
        }).addTo(document.head);
    }
}, 100);