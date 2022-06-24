import 'absol/src/polyfill';
import "absol/src/absol";
import './js/adapter/MaterialDesignIconsAdapter';
import AComp from "./AComp";
import * as string from 'absol/src/String/stringMatching';
import './css/keeview.css';

import QuickMenu from "./js/QuickMenu";
import ChromeCalendar from "./js/ChromeCalendar";
import Radio from "./js/Radio";
import EmojiChars from "./js/EmojiChars";
import EmojiAnims from "./js/EmojiAnims";
import MessageInput, {parseMessage} from './js/messageinput/MessageInput';
import EmojiPicker from './js/EmojiPicker';
import ContextCaptor from './js/ContextMenu';
import install from "./js/dom/install";
import SearchTextInput from "./js/Searcher";
import {MaterialDesignIconsNameMap} from "./js/adapter/MaterialDesignIconsAdapter";
import {openFileDialog, vScrollIntoView} from "./js/utils";
import * as utils from "./js/utils";
import materializeIconTrigger from "./js/materializeIconTrigger";
import VariantColors from "./js/VariantColors";
import ToolTip from "./js/Tooltip";
import TextMeasure from "./js/TextMeasure";
import BContextCapture from "./js/BContextCapture";
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import Dom from "absol/src/HTML5/Dom";
import CPUViewer from "./js/CPUViewer";
import ListDictionary from "./js/list/ListDictionary";
import OverviewWidget from "./js/keeview/OverviewWidget";
import OverviewPage from "./js/keeview/OverviewPage";

absol.VariantColors = VariantColors;
absol.parseMessage = parseMessage;
absol.vScrollIntoView = vScrollIntoView;

//for export to window
absol.Tooltip = ToolTip;
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
absol.ListDictionary = ListDictionary;

window.AComp = absol.AComp;
absol.TextMeasure = TextMeasure;

Dom.documentReady.then(function () {
    var mdiLink = absol.$('link', document.head, function (e) {
        if (e.href && e.href.toLowerCase().indexOf('materialdesignicons') >= 0) return true;
    });
    if (!mdiLink) {
        mdiLink = absol._({
            tag: 'link',
            attr: {
                rel: 'stylesheet',
                href: '//cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css'
            }
        }).addTo(document.head);
    }
});

Object.assign(absol.$, utils);

materializeIconTrigger();

absol.MaterialDesignIconsNameMap = MaterialDesignIconsNameMap;
absol.openFileDialog = openFileDialog;
absol.CPUViewer = CPUViewer;

absol.OverviewWidget = OverviewWidget;
absol.OverviewPage = OverviewPage;
