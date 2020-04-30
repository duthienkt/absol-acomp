import ACore from "./ACore";

import Hanger from './js/Hanger';
import  './css/hanger.css';

import './js/SpanInput';
import './css/spaninput.css';

import './js/IconButton';
import './css/iconbutton.css';

import './js/FlexiconButton';
import './css/flexiconbutton.css';

import './js/FlexiconInput';
import './css/flexiconinput.css';

import './js/Scroller';
import './css/scroller.css';

import './js/NumberInput';
import './css/numberinput.css';

import './js/Searcher';
import './css/searcher.css';

import './js/SelectTable';
import './css/selecttable.css';

// import './js/SelectTable2';
// import './css/selecttable2.css';

import './js/Menu';
import './css/menu.css';

import './js/ContextMenu';
import './css/contextmenu.css';

import './js/Modal';
import './css/modal.css';


import './js/TextEditor';
import './css/texteditor.css';

import './js/MediaInput';
import './css/mediainput.css';

import './js/ResizableLayout';
import './css/resizablelayout.css';

import './js/AutoCompleteInput';
import './css/autocompleteinput.css';

import './css/selectlist.css';
import './js/SelectList';

import './css/selectmenu.css';
import './js/SelectMenu';

import './css/treelist.css';
import './js/TreeList';
import './js/TreeListItem';

import './css/selecttreemenu.css';
import './js/SelectTreeMenu';

import './css/selectbox.css';
import './js/SelectBox';

import './css/radio.css';
import './js/Radio';
import './js/RadioButton';

import './css/switch.css';
import './js/Switch';


import './css/checkbox.css';
import './js/CheckBox';
import './js/CheckboxButton';
import './js/CandyBoxButton';


import './js/TextClipboard';

import './css/editabletext.css';
import './js/EditableText';

import './css/widthheightresizer.css';
import './js/WidthHeightSizer';



import './js/Follower';
import './js/FollowerToggler';
import './css/follower.css';

import './css/tooltip.css';
import './js/Tooltip';

import './css/quicklistbutton.css';
import './js/QuickListButton';

// import './js/TextArea2';
// import './css/textarea2.css';

import './css/frame.css';
import './css/frameview.css';
import './js/Frame';
import './js/FrameView';


import './css/tabview.css';
import './js/TabBar';
import './js/TabButton';
import './js/TabFrame';
import './js/TabView';

import './js/SinglePage';
import './css/singlepage.css';

import './css/pageselector.css';
import './js/PageSelector';


import './js/ButtonArray';
import './css/buttonarray.css';

import './css/bscroller.css';
import './js/BScroller';

import './css/searchlist.css';
import './js/SearchList';


import './css/statictabbar.css';
import './js/StaticTabbar';

import './js/RemoteSvg';

import './css/exptree.css';
import './js/ExpTree';

import './css/tablevscroller.css';
import './js/TableVScroller';

import './css/tablescroller.css';
import './js/TableScroller';

import './css/quickpath.css';
import './js/QuickPath';

// import './css/quickpath.css';
import './js/QuickMenu';

import './css/droppanel.css';
import './js/DropPanel';
import './js/DropPanelStack';

import './css/draggablestack.css';
import './js/DraggableVStack';
import './js/DraggableHStack';

import './css/chromecalendar.css';
import './js/ChromeCalendar';

import './css/timepicker.css';
import './js/TimePicker';
import './css/timeinput.css';
import './js/TimeInput';

import './css/calendarinput.css';
import './js/CalendarInput';

import './css/onscreenwindow.css';
import './js/OnsScreenWindow';

import './js/HRuler';
import './css/hruler.css';
import './js/VRuler';
import './css/vruler.css';

import './js/ResizeBox';
import './css/resizebox.css';

import './js/PreInput';
import './css/preinput.css';

import './css/hexasectionlabel.css';
import './js/HexaSectionLabel';

import './css/circlesectionlabel.css';
import './js/CircleSectionLabel';

import './css/linearcolorbar.css';
import './js/LinearColorBar';

import './css/boardtable.css';
import './js/BoardTable';
import './js/Board';

import './js/Sprite';

import './js/EmojiPicker';
import './css/emojipicker.css';


// import './js/DateInput';
import './js/DateInput2';
import './css/dateinput.css';

import './js/MessageInput';
import './css/messageinput.css';


import './js/MLeftNavigator';
import './css/mleftnavigator.css';


import DebugTask from "./js/DebugTask";
import "./css/debugtask.css";
import Draggable from "./js/Draggable";
import EmojiChars from "./js/EmojiChars";
import EmojiAnims from "./js/EmojiAnims";

var AComp = {
    core: ACore,
    $: ACore.$,
    _: ACore._,
    creator: ACore.creator,
    buildDom: ACore.buildDom,
    runDebugTask: DebugTask.start.bind(DebugTask),
    Draggable: Draggable,
    EmojiChars: EmojiChars,
    EmojiAnims: EmojiAnims
};

window.runDebugTask = DebugTask.start.bind(DebugTask);

export default AComp;