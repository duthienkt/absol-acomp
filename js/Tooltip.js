import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

function ToolTip() {
    var res = _({
        class: 'absol-tooltip',
        child: [
            '.absol-tooltip-content',
            '.absol-tooltip-arrow'
        ]
    });

    res.$content = $('.absol-tooltip-content', res);
    return res;
}

['addChild', 'addChildBefore', 'addChildAfter', 'clearChild'].forEach(function (key) {
    ToolTip.prototype[key] = function () {
        return this.$content[key].apply(this.$content, arguments);
    }
});

Acore.install('tooltip', ToolTip);


ToolTip.$root = _('.absol-tooltip-root').addStyle('visibility', 'hidden');
ToolTip.$holder = _('.absol-tooltip-root-holder').addTo(ToolTip.$root);
ToolTip.$elt = _('tooltip').addTo(ToolTip.$holder);


ToolTip.show = function (element, content, orientation) {
    if (typeof content == 'string') {
        content = _({
            tag: 'span',
            style: {
                'white-space': 'nowrap'
            },
            props: {
                innerHTML: content
            }
        });
    }
    ToolTip.$elt.clearChild().addChild(content);
    ToolTip.$root.addTo(element.parentNode).removeStyle('visibility');
    
    var tBound = ToolTip.$elt.getBoundingClientRect();
    var rBound = ToolTip.$root.getBoundingClientRect();
    var ebound = element.getBoundingRecursiveRect(4);
    ToolTip.$elt.removeClass('top').removeClass('left').removeClass('right').removeClass('bottom');
    if (orientation == 'top') {
        ToolTip.$elt.addClass('top');
        var dy = ebound.top - rBound.top - tBound.height;
        ToolTip.$holder.addStyle('top', dy + 'px');

    }



};


ToolTip.showWhenClick = function (element, content, orientation) {

};

ToolTip.showWhenOver = function (element, content, timeout, orientation) {

};



export default ToolTip;