import 'absol/src/polyfill';
import "absol/src/absol";
import AComp from "./AComp";
import * as string from 'absol/src/String/stringMatching';
import './css/keeview.css';

import QuickMenu from "./js/QuickMenu";
import ChromeCalendar from "./js/ChromeCalendar";
import Radio from "./js/Radio";
import EmojiChars from "./js/EmojiChars";
import EmojiAnims from "./js/EmojiAnims";
import MessageInput, { parseMessage } from './js/messageinput/MessageInput';
import EmojiPicker from './js/EmojiPicker';
import ContextCaptor from './js/ContextMenu';
import install from "./js/dom/install";
import SearchTextInput from "./js/Searcher";
import { openFileDialog, vScrollIntoView } from "./js/utils";
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
import DynamicCSS from "absol/src/HTML5/DynamicCSS";
import { FinderFileSystem } from "./js/finder/Finder";
import { silentDownloadAsPdf } from "./js/printer";
import MApplication from "./js/mobile/MApplication";
import MActivity from "./js/mobile/MActivity";
import ListSearchMaster from "./js/list/ListSearchMaster";
import { ExpSearcher } from "./js/ExpTree";
import { openDebugDeviceInfo } from "./js/DebugDeviceInfo";
import './js/ExtendComputedStyle'
import CMDTool, { CMDToolDelegate } from "./js/CMDTool";
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
absol.FinderFileSystem = FinderFileSystem;

window.AComp = absol.AComp;
absol.TextMeasure = TextMeasure;

absol.printer.silentDownloadAsPdf = silentDownloadAsPdf;
absol.ListSearchMaster = ListSearchMaster;
absol.openDebugDeviceInfo = openDebugDeviceInfo;

Dom.documentReady.then(function () {
    var mdiLink = absol.$('link', document.head, function (e) {
        if (e.href && e.href.toLowerCase().indexOf('materialdesignicons') >= 0) return true;
    });
    var href;
    if (mdiLink) {
        if (location.href && (location.href.indexOf('localhost') >= 0 || location.href.startsWith('file:'))) {
            href = mdiLink.getAttribute('href') || 'https';
            if (!href.startsWith('http')) {
                mdiLink.href = 'https://absol.cf/vendor/materialdesignicons/materialdesignicons.css';
            }
        }
    }
    else {
        mdiLink = absol._({
            tag: 'link',
            attr: {
                rel: 'stylesheet',
                href: 'https://absol.cf/vendor/materialdesignicons/materialdesignicons.css'
            }
        }).addTo(document.head);
    }
    //<link  href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Condensed|Roboto+Mono|Roboto+Slab&display=swap" rel="stylesheet">
    var rbtLink = absol.$('link', document.head, function (e) {
        if (e.href && e.href.toLowerCase().indexOf('Roboto') >= 0) return true;
    });
    if (!rbtLink) {
        rbtLink = absol._({
            tag: 'link',
            attr: {
                rel: 'stylesheet',
                href: 'https://fonts.googleapis.com/css?family=Roboto|Roboto+Condensed|Roboto+Mono|Roboto+Slab&display=swap'
            }
        }).addTo(document.head);
    }
});

Object.assign(absol.$, utils);
absol.ExpSearcher = ExpSearcher;
// materializeIconTrigger();

absol.openFileDialog = openFileDialog;
absol.CPUViewer = CPUViewer;

absol.OverviewWidget = OverviewWidget;
absol.OverviewPage = OverviewPage;

absol.MApplication = MApplication;
absol.MActivity = MActivity;
absol.CMDTool = CMDTool;
absol.CMDToolDelegate = CMDToolDelegate;


Dom.documentReady.then(function () {
    ContextCaptor.auto();
});

function testFont() {
    var dynamicCSs = new DynamicCSS();
    var value = parseInt(localStorage.getItem('as_test_font_size')) || 14;
    var fontSizeInput = absol._({
        tag: 'numberinput',
        props: {
            step: 1,
            min: 5,
            value: value
        },
        on: {
            change: () => {
                localStorage.setItem('as_test_font_size', fontSizeInput.value + '');
                dynamicCSs.setProperty(':root', 'font-size', fontSizeInput.value + 'px')
                    .commit();
                window.dispatchEvent(new Event('resize'))
            }
        }
    });
    dynamicCSs.setProperty(':root', 'font-size', fontSizeInput.value + 'px')
        .commit();
    window.dispatchEvent(new Event('resize'))
    var modal = absol._({
        style: {
            background: 'white',
            position: 'fixed',
            top: '5px',
            right: '5px',
            padding: '5px',
            border: '1px solid #ddd',
            zIndex: 1e9
        },
        child: ['<label>font-size </label>', fontSizeInput]
    }).addTo(document.body);
}

if (location.href.indexOf('localhost') >= 0) {
    // Dom.documentReady.then(testFont);
}

