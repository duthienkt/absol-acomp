import Acore from "./ACore";

import './js/IconButton';
import IconButtonStyleText from './css/iconbutton.css';

var styleText = [IconButtonStyleText].join('\n');
var AComp = {
    core: Acore,
    $style: Acore._('style').addTo(document.head),
    $: Acore.$,
    _: Acore._,
    buildDom: Acore.buildDom,
};

AComp.$style.innerHTML = styleText;

export default AComp;