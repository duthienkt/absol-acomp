import Acore from "./ACore";

import './js/IconButton';
import IconButtonStyleText from './css/iconbutton.css';

import './js/Scroller';
import ScrollerStyleText from './css/scroller.css';

import './js/Searcher';
import SearcherStyleText from './css/searcher.css';

import './js/SelectTable';
import SelectTableStyleText from './css/selecttable.css';

import './js/Menu';
import MenuStyleText from './css/menu.css';

import './js/ContextMenu';
import ContextMenuStyleText from './css/contextmenu.css';

import './js/Modal';
import ModalStyleText from './css/modal.css';


import './js/ImageViewer';
import ImageViewerStyleText from './css/imageviewer.css';

import './js/MediaInput';
import MediaInputStyleText from './css/mediainput.css';

import './js/ResizableLayout';
import ResizableLayoutStyleText from './css/resizablelayout.css';

import './js/AutoCompleteInput';
import AutoCompleteInputLayoutStyleText from './css/autocompleteinput.css';

import SelectListLayoutStyleText from './css/selectlist.css';
import './js/SelectList';

import SelectMenuLayoutStyleText from './css/selectmenu.css';
import './js/SelectMenu';

import TreeListLayoutStyleText from './css/treelist.css';
import './js/TreeList';
import './js/TreeListItem';

import SelectTreeMenuLayoutStyleText from './css/selecttreemenu.css';
import './js/SelectTreeMenu';

import SelectBoxLayoutStyleText from './css/selectbox.css';
import './js/SelectBox';

import RadioLayoutStyleText from './css/radio.css';
import './js/Radio';
import './js/RadioInput';

import './js/TextClipboard';

import EditableTextLayoutStyleText from './css/editabletext.css';
import './js/EditableText';

var styleText = [IconButtonStyleText, SelectTableStyleText,
    ScrollerStyleText, SearcherStyleText,
    MenuStyleText, ContextMenuStyleText,
    ModalStyleText, ImageViewerStyleText, MediaInputStyleText,
    ResizableLayoutStyleText, AutoCompleteInputLayoutStyleText,
    TreeListLayoutStyleText, SelectTreeMenuLayoutStyleText, SelectListLayoutStyleText,
    SelectMenuLayoutStyleText, SelectBoxLayoutStyleText, 
    RadioLayoutStyleText, EditableTextLayoutStyleText].join('\n');

var AComp = {
    core: Acore,
    $style: Acore._('style').addTo(document.head),
    $: Acore.$,
    _: Acore._,
    creator: Acore.creator,
    buildDom: Acore.buildDom
};

AComp.$style.innerHTML = styleText;

export default AComp;