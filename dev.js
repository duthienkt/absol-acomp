import 'absol/src/polyfill';
import "absol/src/absol";
import './js/adapter/MaterialDesignIconsAdapter';
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
import install from "./js/dom/install";
import SearchTextInput from "./js/Searcher";
import {MaterialDesignIconsNameMap} from "./js/adapter/MaterialDesignIconsAdapter";
import {openFileDialog} from "./js/utils";
import materializeIconTrigger from "./js/materializeIconTrigger";
import VariantColors from "./js/VariantColors";
absol.VariantColors = VariantColors;
absol.parseMessage = parseMessage;

//for export to window
absol.Tooltip = AComp.creator.tooltip;
absol.QuickMenu = QuickMenu;
absol.AComp = AComp;
absol.Radio = Radio;
absol.EmojiChars = EmojiChars;
absol.EmojiAnims = EmojiAnims;
absol.ChromeCalendar = ChromeCalendar;
install(absol.coreDom);
//old module
absol.coreDom.install('searchcrosstextinput', SearchTextInput);

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

materializeIconTrigger();

absol.MaterialDesignIconsNameMap = MaterialDesignIconsNameMap;
absol.openFileDialog = openFileDialog;