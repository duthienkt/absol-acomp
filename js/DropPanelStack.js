import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;
function DropPannelStack() {
    var res = _({
        class: 'absol-drop-pannel-stack'
    });
    return res;
}


DropPannelStack.prototype.addChild = function (child) {
    if (child.containsClass('absol-drop-panel')) {

    }
    else {
        throw new Error('Child element must be a DropPanel');
    }
};


export default DropPannelStack;