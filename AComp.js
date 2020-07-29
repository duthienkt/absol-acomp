import ACore from "./ACore";




import DebugTask from "./js/DebugTask";
import "./css/debugtask.css";
import Draggable from "./js/Draggable";
import EmojiChars from "./js/EmojiChars";
import EmojiAnims from "./js/EmojiAnims";
import install from "./js/dom/install";

var AComp = {
    core: ACore,
    $: ACore.$,
    _: ACore._,
    creator: ACore.creator,
    buildDom: ACore.buildDom,
    runDebugTask: DebugTask.start.bind(DebugTask),
    Draggable: Draggable,
    EmojiChars: EmojiChars,
    EmojiAnims: EmojiAnims,
    install: install
};

window.runDebugTask = DebugTask.start.bind(DebugTask);

export default AComp;