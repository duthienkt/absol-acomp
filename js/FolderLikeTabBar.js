import ACore, { _, $ } from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import { getScreenSize } from "absol/src/HTML5/Dom";
import Turtle from "absol/src/Math/Turtle";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";
import Vec2 from "absol/src/Math/Vec2";

var _g = Svg.ShareInstance._;

/**
 * @extends AElement
 * @constructor
 */
function FolderLikeTabBar() {
    this.createTime = Date.now();
    this.$cavas = $('.as-folder-like-tab-bar-canvas', this);
    this.$path = $('.as-folder-like-tab-bar-path', this);
    this.layoutCtrl = new FLBLayoutController(this);
    this.pathCtrl = new FLBPathController(this);
    this.$attachHook = _('attachhook').addTo(this).on('attached', () => {
        this.layoutCtrl.onAttached();
        ResizeSystem.add(this.$attachHook);
    });
    this.$attachHook.requestUpdateSize = this.requestUpdateSize.bind(this);
}

FolderLikeTabBar.tag = 'FolderLikeTabBar'.toLowerCase();

FolderLikeTabBar.render = function () {
    return _({
        class: 'as-folder-like-tab-bar',
        child: [
            _g({
                tag: 'svg',
                class: 'as-folder-like-tab-bar-canvas',
                attr: {
                    height: '41',
                    width: getScreenSize().width
                },
                child: {
                    tag: 'path',
                    class: 'as-folder-like-tab-bar-path',
                }
            }),
            {
                class: 'as-folder-like-tab-button-list-ctn'
            }
        ]
    });
};


FolderLikeTabBar.prototype.requestUpdateSize = function () {
    this.layoutCtrl.updateSize();

};

FolderLikeTabBar.property = {};

FolderLikeTabBar.property.tabs = {
    set: function (value) {

    },
    get: function () {

    }
}

ACore.install(FolderLikeTabBar);
export default FolderLikeTabBar;


/**
 *
 * @param {FolderLikeTabBar} elt
 * @constructor
 */
function FLBLayoutController(elt) {
    this.elt = elt;
    this.$canvas = elt.$cavas;
}

FLBLayoutController.prototype.updateSize = function () {
    this.bound = this.elt.getBoundingClientRect();
    this.$canvas.attr({
        width: this.bound.width,
        height: 45,
        viewBox: `-0.5 -0.5 ${this.bound.width} ${45}`
    });
    console.log(this.bound);


    this.elt.pathCtrl.update();
}

FLBLayoutController.prototype.onAttached = function () {
    this.updateSize();
};


/**
 *
 * @param {FolderLikeTabBar} elt
 * @constructor
 */
function FLBPathController(elt) {
    this.elt = elt;
    this.$path = elt.$path;
}


FLBPathController.prototype.update = function () {
    var bound = this.elt.layoutCtrl.bound;
    var startX = 100, toX = 400;
    var turtle = new Turtle();
    //sin = 7/33
    var v1n = new Vec2(7, -33).normalized();
    var v1 = v1n.mult(-(35 - 12) / v1n.y);
    var delta = new Vec2(6, -6).add(v1).add(new Vec2(6, -6));

    var rv1n = new Vec2(-v1n.x, v1n.y);
    var rv1 = new Vec2(-v1.x, v1.y);
    var rDelta = new Vec2(-delta.x, delta.y);

    turtle.moveTo(4, 41)
        .hLineTo(startX)
        .cubicBezierBy(4, 0, 6 - v1n.x * 4, -6 - v1n.y * 4, 6, -6)
        .lineBy(v1.x, v1.y)
        .cubicBezierBy(v1n.x * 4, v1n.y * 4, 4, -6, 6, -6)
        .hLineTo(toX - rDelta.x)
        .cubicBezierBy(4, 0, 6 + rv1n.x * 4, 6 + rv1n.y * 4, 6, 6)
        .lineBy(-rv1.x, -rv1.y)
        .cubicBezierBy(-rv1n.x * 4, -rv1n.y * 4, 4, 6, 6, 6)
        .lineTo(bound.width - 1 - 4, 41 )
        .arcBy(5, 5, 0, 0, 1, 5, 5)
        .vLineBy(7)
        .hLineTo(-1)
        .vLineBy(-7)
        .arcBy(5, 5, 0, 0, 1, 5, -5)
    this.$path.attr('d', turtle.getPath());
};