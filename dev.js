import AComp from "./AComp";
import IFrameBridge from 'absol/src/Network/IFrameBridge';


//for export to window
window.absol =  window.absol||{};
absol.AComp = AComp;

absol.ShareDom = absol.AComp;
absol.ShareDom.fromCode = absol.AComp.core.fromCode.bind(absol.AComp.core);
absol.ShareCreator = absol.AComp.creator;
absol._ = absol.ShareDom._;
absol.$ = absol.ShareDom.$;
absol.buildDom = absol.ShareDom._;

window.AComp = absol.AComp;
window.IFrameBridge = IFrameBridge;
