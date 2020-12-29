import '../css/onscreenwidget.css';
import ACore from "../ACore";
import Hanger from "./Hanger";
import {getScreenSize, waitImageLoaded} from "absol/src/HTML5/Dom";
import Vec2 from "absol/src/Math/Vec2";
import {randomIdent} from "absol/src/String/stringGenerate";

var _ = ACore._;
var $ = ACore.$;
var $$ = ACore.$$;


/***
 * @extends Hanger
 * @constructor
 */
function OnScreenWidget() {
    this.id = 'unset-id-' + randomIdent();
    this.on({
        dragstart: this.eventHandler.widgetStartDrag,
        drag: this.eventHandler.widgetDrag,
        dragend: this.eventHandler.widgetDragEnd
    });

    this.addEventListener('click', function (event) {
        if (!this._preventClick)
            this.emit('click', event, this);
    });
    this.$attachhook = _('attachhook').addTo(this);
    this.$attachhook.on('attached', this.eventHandler.attached);
    this.config = null;
}

OnScreenWidget.tag = 'OnScreenWidget'.toLowerCase();

OnScreenWidget.render = function () {
    return _({
        tag: 'hanger',
        extendEvent: 'click',
        class: 'as-onscreen-widget',
        style: {
            visibility: 'hidden'
        }
    });
};

OnScreenWidget.prototype.configPrefix = 'on-screen-widget-';

OnScreenWidget.prototype._genConfig = function () {
    this._widgetBound = this.getBoundingClientRect();
    var screenSize = getScreenSize();
    return {
        cx: (this._widgetBound.left + this._widgetBound.width / 2) * 100 / screenSize.width,
        cy: (this._widgetBound.top + this._widgetBound.height / 2) * 100 / screenSize.height
    }

}

OnScreenWidget.prototype._saveConfig = function () {
    var id = this.id || '';
    if (id.startsWith('unset-id-') || !this.config) return;
    localStorage.setItem(this.configPrefix + id, JSON.stringify(this.config));
};

OnScreenWidget.prototype._loadConfig = function () {
    var id = this.id || '';
    if (id.startsWith('unset-id-')) return;
    var config = null;
    try {
        config = JSON.parse(localStorage.getItem(this.configPrefix + id));
        if ((typeof config !== "object") || (typeof config.cx !== "number") || (typeof config.cy !== 'number')) {
            config = this.config || this._genConfig();
        }
    } catch (error) {
        config = this.config || this._genConfig();
    }

    var cx = config.cx || 0;
    var cy = config.cy || 0;
    this.addStyle({
        '--cx': cx / 100,
        '--cy': cy / 100
    });
    this.config = config;
};


OnScreenWidget.prototype._updateCSSSize = function () {
    var bound = this.getBoundingClientRect();
    this.addStyle({
        '--client-height': bound.height + 'px',
        '--client-width': bound.width + 'px'
    });
    this.removeStyle('visibility');
};

/***
 *
 * @type {OnScreenWidget|{}}
 */
OnScreenWidget.eventHandler = {};

OnScreenWidget.eventHandler.attached = function () {
    var images = $$('img', this);
    var syncs = images.map(function (img) {
        if (img.classList.contains('absol-attachhook')) return Promise.resolve();
        return waitImageLoaded(img, 100);
    });
    var thisW = this;
    Promise.all(syncs).then(function () {
        thisW._updateCSSSize();
        thisW._loadConfig();
    });
};

OnScreenWidget.eventHandler.widgetStartDrag = function (event) {
    this._widgetBound = this.getBoundingClientRect();
    this._preventClick = true;
};

OnScreenWidget.eventHandler.widgetDrag = function (event) {
    event.preventDefault();
    var screenSize = getScreenSize();
    var p0 = new Vec2(this._widgetBound.left, this._widgetBound.top);
    var dv = event.currentPoint.sub(event.startingPoint);
    var p1 = p0.add(dv);
    var cx = (p1.x - 2) * 100 / (screenSize.width - this._widgetBound.width - 4);
    var cy = (p1.y - 2) * 100 / (screenSize.height - this._widgetBound.height - 4);
    cx = Math.max(0, Math.min(100, cx));
    cy = Math.max(0, Math.min(100, cy));
    this.addStyle({
        '--cx': cx / 100,
        '--cy': cy / 100
    });
    if (this.config) {
        this.config.cx = cx;
        this.config.cy = cy;
    }
};

OnScreenWidget.eventHandler.widgetDragEnd = function () {
    var thisWG = this;
    setTimeout(function () {
        thisWG._preventClick = false;
    }, 100);
    this._saveConfig();
};

ACore.install(OnScreenWidget);

export default OnScreenWidget;