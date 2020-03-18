import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import Rectangle from "absol/src/Math/Rectangle";



var _ = Acore._;
var $ = Acore.$;


function Follower() {
    this.$attachHook = _('attachhook', this)
        .addTo(this)
        .on('error', function () {
            this.updatePosition();
            Dom.addToResizeSystem(this);
        });
    this.$attachHook.updatePosition = this.updatePosition.bind(this);

    this.$followTarget = undefined;
    this.$scrollTrackElts = [];
    this._scrollTrackEventHandler = undefined;
    this._anchor = Follower.ANCHOR_PRIORITY;

}

Follower.render = function () {
    return _('.absol-follower');
};


Follower.prototype.clearChild = function () {
    var children = Array.prototype.slice.call(this.children);
    var attachhookElt = this.$attachHook;
    children.forEach(function (elt) {
        if (elt != attachhookElt)
            elt.remove();
    });
}

//Todo: remove child, find child....

/**
 * X = $target.x + F[anchor_index][0] * $target.width + F[anchor_index][1] * $content.width 
 * Y = $target.y + F[anchor_index][2] * $target.height + F[anchor_index][3] * $content.height 
 */
Follower.ANCHOR_FACTORS = [
    [1, 0, 0, 0],//0
    [0, 0, 1, 0],//1
    [1, -1, 1, 0],//2
    [0, -1, 0, 0],//3
    [0, -1, 1, -1],//4
    [1, -1, 0, -1],//5
    [0, 0, 0, -1],//6
    [1, 0, 1, -1],//7

    [1, 0, 0.5, -0.5],//8
    [0.5, -0.5, 1, 0],//9
    [0, -1, 0.5, -0.5],//10
    [0.5, -0.5, 0, -1],//11

    [1, 0, 1, 0],//12
    [0, -1, 1, 0],//13
    [0, -1, 0, -1],//14
    [1, 0, 0, -1],//15
];

Follower.ANCHOR_PRIORITY = [1, 6, 2, 5, 0, 7, 3, 4, 9, 11, 8, 10, 12, 15, 13, 14];


Follower.prototype.updatePosition = function () {
    if (!this.$followTarget) return;
    var targetBound = this.$followTarget.getBoundingClientRect();
    var screenSize = Dom.getScreenSize();
    var outRect = new Rectangle(0, 0, screenSize.width, screenSize.height);
    var bound = this.getBoundingClientRect();
    var x = 0;
    var y = 0;
    var score;
    var anchors = this._lastAnchor === undefined ? this.anchor : [this._lastAnchor].concat(this.anchor);
    var factor;
    var bestX, bestY, bestScore = -100000;
    var newContentRect;
    var bestAnchor;
    for (var i = 0; i < anchors.length; ++i) {
        factor = Follower.ANCHOR_FACTORS[anchors[i]];
        x = targetBound.left + factor[0] * targetBound.width + factor[1] * bound.width;
        y = targetBound.top + factor[2] * targetBound.height + factor[3] * bound.height;
        newContentRect = new Rectangle(x, y, bound.width, bound.height);
        score = newContentRect.collapsedSquare(outRect);
        if (score - 10 > bestScore) {
            bestAnchor = anchors[i];
            bestScore = score;
            bestX = x;
            bestY = y;
        }
    }

    this._lastAnchor = bestAnchor;
  
    this.addStyle({
        left: bestX + 'px',
        top: bestY + 'px'
    });
};



Follower.prototype.refollow = function () {
    if (!this.$followTarget) return;
    this.addClass('following');

    if (this._scrollTrackEventHandler) this.unfollow();
    this._scrollTrackEventHandler = this.updatePosition.bind(this);
    this.$scrollTrackElts = [];

    var trackElt = this.$followTarget;
    while (trackElt) {
        if (trackElt.addEventListener)
            trackElt.addEventListener('scroll', this._scrollTrackEventHandler, false);
        else
            trackElt.attachEvent('onscroll', this._scrollTrackEventHandler, false);

        this.$scrollTrackElts.push(trackElt);
        trackElt = trackElt.parentElement;
    }
    if (document.addEventListener) {
        document.addEventListener('scroll', this._scrollTrackEventHandler, false);
    }
    else {
        document.attachEvent('onscroll', this._scrollTrackEventHandler, false);
    }
    this.$scrollTrackElts.push(document);
};

Follower.prototype.unfollow = function () {
    if (!this._scrollTrackEventHandler) return;// nothing to do
    this.removeClass('following');
    var trackElt;

    for (var i = 0; i < this.$scrollTrackElts.length; ++i) {
        trackElt = this.$scrollTrackElts[i];
        if (trackElt.removeEventListener)
            trackElt.removeEventListener('scroll', this._scrollTrackEventHandler, false);
        else
            trackElt.dettachEvent('onscroll', this._scrollTrackEventHandler, false);
    }
    this.$scrollTrackElts = [];
    this._scrollTrackEventHandler = undefined;
};


Follower.property = {};

Follower.property.followTarget = {
    set: function (elt) {
        if (elt === null || elt === undefined || !elt) {
            this.unfollow();
            this.$followTarget = undefined;
        }
        else if (typeof elt == 'string') {
            elt = $(elt) || document.getElementById(elt);
        }

        if (Dom.isDomNode(elt)) {
            this.$followTarget = elt;
            this._lastAncho = undefined;
            this.refollow();
            this.updatePosition();
        }
        else throw new Error("Invalid element");
    },
    get: function () {
        return this.$followTarget;
    }
}

Follower.property.anchor = {
    set: function (value) {
        value = value || Follower.ANCHOR_PRIORITY;
        if (value == 'auto') value = Follower.ANCHOR_PRIORITY;
        if (typeof value == null) value = [value];
        if (!(value instanceof Array)) throw new Error('Invalid anchor ' + value);
        value = value.map(function (x) {
            x = Math.floor(x);
            if (x >= 0 && x < Follower.ANCHOR_FACTORS.length) {
                return x;
            }
            else throw new Error("Invalid anchor: " + x);
        });
        this._anchor = value;
        this._lastAnchor = undefined;

        this.updatePosition();
    },
    get: function () {
        return this._anchor;
    }
}


Acore.install('follower', Follower);

export default Follower;