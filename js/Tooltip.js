import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

function ToolTip() {
    var res = _({
        class: 'absol-tooltip',
        child: [
            { class: 'absol-tooltip-content', child: '<span>No</span>' },

            '.absol-tooltip-arrow'
        ]
    });

    res.$content = $('.absol-tooltip-content', res);
    res.$arrow = $('.absol-tooltip-arrow', res);
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

Dom.documentReady.then(function () {
    ToolTip.$root.addTo(document.body);
});

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
    ToolTip.$root.removeStyle('visibility');

    ToolTip.$elt.removeClass('top').removeClass('left').removeClass('right').removeClass('bottom');
    ToolTip.$elt.addClass(orientation);

    var fontSize = ToolTip.$elt.getFontSize();
    var tBound = ToolTip.$elt.getBoundingClientRect();


    var rBound = ToolTip.$root.getBoundingClientRect();
    var ebound = element.getBoundingRecursiveRect();

    var dx, dy;

    if (orientation == 'top') {
        dy = ebound.top - rBound.top - tBound.height;
        dx = ebound.left + ebound.width / 2 - rBound.left - tBound.width / 2;
    }
    else if (orientation == 'left') {
        dy = ebound.top + ebound.height/2  - rBound.top - tBound.height;
        dx = ebound.left  - rBound.left - tBound.width / 2;
    }
    else if (orientation == 'right') {

    }
    else if (orientation == 'bottom') {
        dy = ebound.bottom - rBound.top;
        dx = ebound.left + ebound.width / 2 - rBound.left - tBound.width / 2;

    }
    else {
        throw new Error("Invalid orientation, orientation:['left', 'right', 'top', 'bottom', 'auto'] ");
    }

    console.log({
        top: dx + 'px',
        left: dy + 'px'
    });

    
    ToolTip.$holder.addStyle({
        top: dy + 'px',
        left: dx + 'px'
    });

};


ToolTip.showWhenClick = function (element, content, orientation) {

};

ToolTip.showWhenOver = function (element, content, timeout, orientation) {

};



export default ToolTip;