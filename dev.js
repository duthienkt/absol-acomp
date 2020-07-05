import 'absol/src/polyfill';
import "absol/src/absol";
import AComp from "./AComp";
import * as string from 'absol/src/String/stringMatching';

import QuickMenu from "./js/QuickMenu";
import ChromeCalendar from "./js/ChromeCalendar";
import Radio from "./js/Radio";
import EmojiChars from "./js/EmojiChars";
import EmojiAnims from "./js/EmojiAnims";
import MessageInput, { parseMessage } from './js/MessageInput';
import EmojiPicker from './js/EmojiPicker';
import ContextCaptor from './js/ContextMenu';
import install from "./js/install";

absol.parseMessage = parseMessage;

//for export to window
absol.Tooltip = AComp.creator.tooltip;
absol.QuickMenu = QuickMenu;
absol.AComp = AComp;
absol.Radio = Radio;
absol.EmojiChars = EmojiChars;
absol.EmojiAnims = EmojiAnims;
absol.ChromeCalendar = ChromeCalendar;
absol.coreDom.install(AComp.core);
install(absol.coreDom);
Object.assign(absol.string, string);
absol.MessageInput = MessageInput
absol.EmojiPicker = EmojiPicker;
absol.ContextCaptor = ContextCaptor;
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
                href: '//cdnjs.cloudflare.com/ajax/libs/MaterialDesign-Webfont/5.3.45/css/materialdesignicons.css'
            }
        }).addTo(document.head);
    }
}, 100);