import '../css/droppanel.css';
import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/**
 * @extends AElement
 * @constructor
 */
function DropPanelStack() {
    var res = this;
    this.$attachHook = _('attachhook').on('error', function () {
        Dom.addToResizeSystem(this);
        this.updateSize = res.updateSize.bind(res);
    });
    this.sync = new Promise(function (rs) {
        res.$attachHook.once('error', rs);
    });
}

DropPanelStack.tag = 'DropPanelStack'.toLowerCase();

DropPanelStack.render = function () {
    return _({
        class: 'absol-drop-panel-stack',
        child: ['attachhook']
    });
};

DropPanelStack.prototype.updateSize = function () {
};

DropPanelStack.prototype.getFreeHeight = function () {
    var childNodes = this.childNodes;
    var sumHeight = 0;
    var bound = this.getBoundingClientRect();
    var childBound;
    for (var i = 0; i < childNodes.length; ++i) {
        var child = childNodes[i];
        if (child.containsClass && child.containsClass('absol-drop-panel')) {
            childBound = child.getBoundingClientRect();
            sumHeight += childBound.height;
        }
    }
    return bound.height - sumHeight;
};


DropPanelStack.prototype.addChild = function (child) {
    var self = this;
    if (child.containsClass('absol-drop-panel')) {
        //remove last event listener off other parent
        if (child.__drop_panel_toggle_listener__) {
            child.off('toggle', child.__drop_panel_toggle_listener__);
        }
        child.__drop_panel_toggle_listener__ = function (event) {
            event.preventDefault();
            self.sync = self.sync.then(function () {
                if (event.isShowed) {
                    setTimeout(function () {
                        child.removeStyle('max-height');
                    }, 200);
                    child.toggle();
                }
                else {
                    var headBound = child.$head.getBoundingClientRect();
                    var vailableHeight = self.getFreeHeight();
                    if (vailableHeight > 3) {
                        child.addStyle('max-height', self.getFreeHeight() + headBound.height + 'px');
                        child.toggle();
                    }
                }

                return new Promise(function (rs) {
                    setTimeout(rs, 200);
                });
            })
        };
        child.on('toggle', child.__drop_panel_toggle_listener__);
        this.super(child);
    }
    else {
        throw new Error('Child element must be a DropPanel');
    }
};

ACore.install('droppanelstack', DropPanelStack);

export default DropPanelStack;