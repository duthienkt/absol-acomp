import AutoCompleteInput from "../AutoCompleteInput";
import Dom from "absol/src/HTML5/Dom";
import BoardTable from "../BoardTable";
import Board from "../Board";
import BScroller from "../BScroller";
import ButtonArray from "../ButtonArray";
import CalendarInput, { OldCalendarInput } from "../CalendarInput";
import CheckboxInput from "../CheckBoxInput";
import CheckBox from "../CheckBox";
import ChromeCalendar from "../ChromeCalendar";
import CircleSectionLabel from "../CircleSectionLabel";
import { HScrollbar, HScroller, Scrollbar, VScrollbar, VScroller } from "../Scroller";
import ContextCaptor from "../ContextMenu";
import { Dropdown, Dropright, HMenu, HMenuItem, MenuButton, VMenu, VMenuItem, VMenuLine, VRootMenu } from "../Menu";
import DateInput2 from "../DateInput2";
import DraggableHStack from "../DraggableHStack";
import DraggableVStack from "../DraggableVStack";
import Hanger from "../Hanger";
import DropPanel from "../DropPanel";
import DropPanelStack from "../DropPanelStack";
import EditableText from "../EditableText";
import EmojiPicker from "../EmojiPicker";
import Sprite from "../Sprite";
import ExpTree, { ExpGroup, ExpNode } from "../ExpTree";
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
import MessageInput, { MessageQuote } from "../messageinput/MessageInput";
import NumberInput from "../numberinput/NumberInput";
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
import SelectMenu2 from "../SelectMenu2";
import ButtonRange from "../ButtonRange";
import DropZone from "../DropZone";
import RadioInput from "../RadioInput";
import OnScreenWidget from "../OnScreenWidget";
import SelectListBox from "../SelectListBox";
import SelectTreeBox from "../SelectTreeBox";
import RibbonSplitButton from "../RibbonSplitButton";
import RibbonButton from "../RibbonButton";
import TimeSelectInput from "../TimeSelectInput";
import SnackBar from "../Snackbar";
import MultiSelectMenu from "../MultiSelectMenu";
import CountdownClock from "../CountdownClock";
import Toast from "../Toast";
import { MdiStoreMarkerOutline, SpinnerIco } from "../Icons";
import EmojiPickerTooltip from "../EmojiPickerTooltip";
import PageIndicator from "../PageIndicator";
import EmojiCounter from "../EmojiCounter";
import EmojiCounterList from "../EmojiCounterList";
import RotatedText from "../RotatedText";
import VerticalTreeDiagram, { VerticalTreeDiagramNode } from "../VerticalTreeDiagram";
import TokenField from "../TokenField";
import DateTimeInput from "../DateTimeInput";
import ChromeTimePicker from "../ChromeTimePicker";
import DVExpTree from "../DVExpTree";
import CheckListItem from "../CheckListItem";
import CheckListBox from "../CheckListBox";
import MultiCheckMenu from "../MultiCheckMenu";
import ChromeTime24Picker from "../ChromeTime24Picker";
import Time24Input from "../Time24Input";
import TimeRange24Input from "../TimeRange24Input";
import CheckTreeItem from "../CheckTreeItem";
import CheckTreeBox from "../CheckTreeBox";
import MultiCheckTreeMenu from "../MultiCheckTreeMenu";
import FileInputBox from "../FileInputBox";
import CountdownText from "../CountdownText";
import YesNoQuestionDialog from "../YesNoQuestionDialog";
import LoadingCubeModal from "../LoadingCubeModal";
import SelectTreeLeafBox from "../SelectTreeLeafBox";
import SelectTreeLeafMenu from "../SelectTreeLeafMenu";
import MultiCheckTreeLeafBox from "../MultiCheckTreeLeafBox";
import MultiCheckTreeLeafMenu from "../MultiCheckTreeLeafMenu";
import FileListInput from "../FileListInput";
import DateInYearPicker from "../DateInYearPicker";
import DateInYearInput from "../DateInYearInput";
import CheckTreeLeafOnlyBox from "../CheckTreeLeafOnlyBox";
import FileListItem from "../FileListItem";
import DualSelectBox from "../DualSelectBox";
import DualSelectMenu from "../DualSelectMenu";
import TOCItem from "../TOCItem";
import TOCList from "../TOCList";
import CKPlaceholder from "../ckeditor/CKPlaceholder";
import CKInlineShortText from "../ckeditor/CKInlineShortText";
import VerticalTimeline from "../VerticalTimeline";
import LocationView from "../LocationView";
import PlaceSearchAutoCompleteInput from "../PlaceSearchAutoCompleteInput";
import LocationPicker from "../LocationPicker";
import LocationInput from "../LocationInput";
import MKNavigator from "../MKNavigator";
import ProcessLBar from "../ProcessLBar";
import KVCommentItem from "../KVCommentItem";
import DynamicTable from "../dynamictable/DynamicTable";
import WindowBox from "../WindowBox";
import MessageDialog from "../MessageDialog";
import ObjectMergeTool from "../objectmergetool/ObjectMergeTool";
import TokenizeHyperInput from "../tokenizeiput/TokenizeHyperInput";
import SelectListBoxV2 from "../selectlistbox/SelectListBox";
import MCheckTreeBox from "../checktreebox/MCheckTreeBox";
import PathMenu from "../PathMenu";
import MultiCheckTreeMenuV2 from '../multichecktreemenu/MultiCheckTreeMenu';
import MultiCheckTreeLeafMenuV2 from '../multichecktreeleafmenu/MultiCheckTreeLeafMenu';
import BrowserDetector from "absol/src/Detector/BrowserDetector";
import MCheckTreeLeafBox from "../checktreeleafbox/MCheckTreeLeafBox";
import MSelectTreeLeafBox from "../selecttreeleafbox/MSelectTreeLeafBox";
import SelectTreeLeafMenuV2 from '../selecttreeleafmenu/SelectTreeLeafMenu';
import MDualSelectBox from "../dualselectbox/MDualSelectBox";
import DualSelectMenuV2 from '../dualselectmenu/DualSelectMenu';

export var publicCreators = [
    MdiStoreMarkerOutline,
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
    CheckListItem,
    CheckListBox,
    CheckTreeLeafOnlyBox,
    ChromeCalendar,
    ChromeTimePicker,
    ChromeTime24Picker,
    CircleSectionLabel,
    CountdownClock,
    CountdownText,
    DateInYearPicker,
    DateInYearInput,
    DateTimeInput,
    DropZone,
    EmojiPickerTooltip,
    FileInputBox,
    FileListItem,
    FileListInput,
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
    VRootMenu,
    MenuButton,
    DateInput2,
    Hanger,
    DraggableHStack,
    DraggableVStack,
    DropPanel,
    DropPanelStack,
    EditableText,
    EmojiPicker,
    EmojiCounter,
    EmojiCounterList,
    Sprite,
    ExpNode,
    ExpTree,
    ExpGroup,
    DVExpTree,
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
    MessageQuote,
    Modal,
    LoadingCubeModal,
    NumberInput,
    NumberSpanInput,
    OnScreenWindow,
    OnScreenWidget,
    PageIndicator,
    PageSelector,
    PreInput,
    ProgressBar,
    QuickListButton,
    QuickMenu,
    QuickPath,
    PathMenu,
    Radio,
    RadioButton,
    RadioInput,
    RibbonSplitButton,
    RibbonButton,
    RotatedText,
    SelectList,
    RemoteSvg,
    ResizeBox,
    SearchTextInput,
    SelectListBox,
    SelectTreeBox,
    SelectMenu2,
    SelectBox,
    MultiSelectMenu,
    MultiCheckTreeLeafBox,
    BrowserDetector.isMobile ? MultiCheckTreeLeafMenuV2 : MultiCheckTreeLeafMenu,
    SelectBoxItem,

    DualSelectBox,
    BrowserDetector.isMobile ?DualSelectMenuV2: DualSelectMenu,

    SelectTable,
    SelectTable2,
    SelectTreeMenu,
    SelectTreeLeafBox,
    BrowserDetector.isMobile ? SelectTreeLeafMenuV2 : SelectTreeLeafMenu,
    SpanInput,
    SnackBar,
    StaticTabbar,
    Switch,
    TableScroller,
    TableVScroller,
    TextArea2,
    TextClipboard,
    TimeInput,
    Time24Input,
    TimeRange24Input,
    TimeSelectInput,
    TimePicker,
    DateTimeInput,
    ToolTip,
    Toast,
    TreeList,
    TreeListItem,
    TokenField,
    WidthHeightResizer,
    TrackBar,
    TrackBarInput,
    SpinnerIco,
    VerticalTreeDiagramNode,
    VerticalTreeDiagram,
    MultiCheckMenu,
    CheckTreeItem,
    CheckTreeBox,
    BrowserDetector.isMobile ? MultiCheckTreeMenuV2 : MultiCheckTreeMenu,
    MessageDialog,
    YesNoQuestionDialog,
    TOCItem,
    TOCList,
    CKPlaceholder,
    CKInlineShortText,
    VerticalTimeline,
    WindowBox,

    LocationView,
    LocationPicker,
    LocationInput,
    PlaceSearchAutoCompleteInput,
    MKNavigator,
    ProcessLBar,
    KVCommentItem,
    DynamicTable,
    ObjectMergeTool,
    TokenizeHyperInput,
    SelectListBoxV2,
    MCheckTreeBox,
    MCheckTreeLeafBox,
    MSelectTreeLeafBox,
    MDualSelectBox
];

/***
 *
 * @param {Dom} core
 */
function install(core) {
    core.install(publicCreators);
    core.install('checkboxbutton', CheckboxInput);
    core.install('selectbox', MultiSelectMenu);
}

export default install;