import '../css/onscreenwidget.css';
import ACore from "../ACore";
import Hanger from "./Hanger";
import {getScreenSize} from "absol/src/HTML5/Dom";
import Vec2 from "absol/src/Math/Vec2";

var _ = ACore._;
var $ = ACore.$;


/***
 * @extends Hanger
 * @constructor
 */
function OnScreenWidget() {
    this.on({
        dragstart: this.eventHandler.widgetStartDrag,
        drag: this.eventHandler.widgetDrag
    })

}

OnScreenWidget.tag = 'OnScreenWidget'.toLowerCase();

OnScreenWidget.render = function () {
    return _({
        tag: 'hanger',
        class: 'as-onscreen-widget'
    });
};

/***
 *
 * @type {OnScreenWidget|{}}
 */
OnScreenWidget.eventHandler = {};

OnScreenWidget.eventHandler.widgetStartDrag = function (event) {
    this._widgetBound = this.getBoundingClientRect();
};

OnScreenWidget.eventHandler.widgetDrag = function (event) {
    var screenSize = getScreenSize();
    var p0 = new Vec2(this._widgetBound.left, this._widgetBound.top);
    var dv = event.currentPoint.sub(event.startingPoint);
    var p1 = p0.add(dv);
    p1.x = Math.max(0, Math.min(screenSize.width - this._widgetBound.width, p1.x));
    p1.y = Math.max(0, Math.min(screenSize.height - this._widgetBound.height, p1.y));
    this.addStyle({
        top: p1.y + 'px',
        left: p1.x + 'px'
    });
};

ACore.install(OnScreenWidget);

export default OnScreenWidget;