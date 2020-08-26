import AutoCompleteInput from "../AutoCompleteInput";
import Dom from "absol/src/HTML5/Dom";
import BoardTable from "../BoardTable";
import Board from "../Board";
import BScroller from "../BScroller";
import ButtonArray from "../ButtonArray";
import CalendarInput, {OldCalendarInput} from "../CalendarInput";
import CheckboxInput from "../CheckBoxInput";
import CheckBox from "../CheckBox";
import ChromeCalendar from "../ChromeCalendar";
import CircleSectionLabel from "../CircleSectionLabel";
import {HScrollbar, HScroller, Scrollbar, VScrollbar, VScroller} from "../Scroller";
import ContextCaptor from "../ContextMenu";
import {Dropdown, Dropright, HMenu, HMenuItem, MenuButton, VMenu, VMenuItem, VMenuLine} from "../Menu";
import DateInput2 from "../DateInput2";
import DraggableHStack from "../DraggableHStack";
import DraggableVStack from "../DraggableVStack";
import Hanger from "../Hanger";
import DropPanel from "../DropPanel";
import DropPanelStack from "../DropPanelStack";
import EditableText from "../EditableText";
import EmojiPicker from "../EmojiPicker";
import Sprite from "../Sprite";
import ExpTree, {ExpNode} from "../ExpTree";
import FlexiconButton from "../FlexiconButton";
import FlexiconInput from "../FlexiconInput";
import Follower from "../Follower";
import Frame from "../Frame";
import FrameView from "../FrameView";
import TabFrame from "../TabFrame";
import TabView from "../TabView";
import SinglePage from "../SinglePage";
import HexaSectionLabel from "../HexaSectionLabel";
import VRuler from "../VRuler";
import HRuler from "../HRuler";
import IconSprite from "../IconSprite";
import LinearColorBar from "../LinearColorBar";
import MediaInput from "../MediaInput";
import MessageInput from "../MessageInput";
import NumberInput from "../NumberInput";
import NumberSpanInput from "../NumberSpanInput";
import OnScreenWindow from "../OnsScreenWindow";
import PageSelector from "../PageSelector";
import PreInput from "../PreInput";
import ProgressBar from "../ProgressBar";
import QuickListButton from "../QuickListButton";
import FollowerToggler from "../FollowerToggler";
import SelectList from "../SelectList";
import QuickMenu from "../QuickMenu";
import QuickPath from "../QuickPath";
import RadioButton from "../RadioButton";
import Radio from "../Radio";
import RemoteSvg from "../RemoteSvg";
import ResizeBox from "../ResizeBox";
import SearchTextInput from "../Searcher";
import SelectBox from "../SelectBox";
import SelectBoxItem from "../SelectBoxItem";
import SelectTable from "../SelectTable";
import SelectTable2 from "../SelectTable2";
import SpanInput from "../SpanInput";
import StaticTabbar from "../StaticTabbar";
import Switch from "../Switch";
import CheckBoxButton from "../CheckboxButton";
import TableScroller from "../TableScroller";
import TableVScroller from "../TableVScroller";
import TextArea2 from "../TextArea2";
import TextClipboard from "../TextClipboard";
import TimeInput from "../TimeInput";
import TimePicker from "../TimePicker";
import ToolTip from "../Tooltip";
import TreeList from "../TreeList";
import TreeListItem from "../TreeListItem";
import SelectTreeMenu from "../SelectTreeMenu";
import WidthHeightResizer from "../WidthHeightSizer";
import Modal from "../Modal";
import TrackBar from "../TrackBar";
import TrackBarInput from "../TrackBarInput";
import SelectMenu from "../SelectMenu";
import ButtonRange from "../ButtonRange";
import DropZone from "../DropZone";
import RadioInput from "../RadioInput";

export var publicCreators = [
    AutoCompleteInput,
    BoardTable,
    Board,
    BScroller,
    ButtonArray,
    ButtonRange,
    CalendarInput,
    OldCalendarInput,
    CheckboxInput,
    CheckBox,
    CheckBoxButton,
    ChromeCalendar,
    CircleSectionLabel,
    DropZone,
    Scrollbar,
    VScrollbar,
    HScrollbar,
    VScroller,
    HScroller,
    ContextCaptor,
    HMenu,
    VMenuItem,
    VMenu,
    Dropright,
    VMenuLine,
    Dropdown,
    HMenuItem,
    VMenu,
    MenuButton,
    DateInput2,
    Hanger,
    DraggableHStack,
    DraggableVStack,
    DropPanel,
    DropPanelStack,
    EditableText,
    EmojiPicker,
    Sprite,
    ExpNode,
    ExpTree,
    FlexiconButton,
    FlexiconInput,
    Follower,
    FollowerToggler,
    Frame,
    FrameView,
    TabFrame,
    TabView,
    SinglePage,
    HexaSectionLabel,
    VRuler,
    HRuler,
    IconSprite,
    LinearColorBar,
    MediaInput,
    MessageInput,
    Modal,
    NumberInput,
    NumberSpanInput,
    OnScreenWindow,
    PageSelector,
    PreInput,
    ProgressBar,
    QuickListButton,
    QuickMenu,
    QuickPath,
    Radio,
    RadioButton,
    RadioInput,
    SelectList,
    RemoteSvg,
    ResizeBox,
    SearchTextInput,
    SelectMenu,
    SelectBox,
    SelectBoxItem,
    SelectTable,
    SelectTable2,
    SelectTreeMenu,
    SpanInput,
    StaticTabbar,
    Switch,
    TableScroller,
    TableVScroller,
    TextArea2,
    TextClipboard,
    TimeInput,
    TimePicker,
    ToolTip,
    TreeList,
    TreeListItem,
    WidthHeightResizer,
    TrackBar,
    TrackBarInput
];

/***
 *
 * @param {Dom} core
 */
function install(core) {
    core.install(publicCreators);
    core.install('checkboxbutton', CheckboxInput);
}

export default install;