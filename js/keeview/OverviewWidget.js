import Fragment from "absol/src/AppPattern/Fragment";
import { $, _ } from "../../ACore";
import '../../css/keeview/overviewwidget.css';
import OOP from "absol/src/HTML5/OOP";
import TabView from "../TabView";
import Hanger from "../Hanger";
import Vec2 from "absol/src/Math/Vec2";
import { isRealNumber } from "../utils";
import { getScreenSize } from "absol/src/HTML5/Dom";
import OnScreenWidget from "../OnScreenWidget";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";


/***
 * @extends Fragment
 * @param {{}} host
 * @param {Fragment[]} children
 * @constructor
 */
function OverviewWidget(host, children) {
    Fragment.call(this);
    this.setting = {
        viewPos: { x: 0, y: 0 },
        minimize: true
    };
    this.host = host;
    this.children = children || [];

    this.childrenById = this.children.reduce(function (ac, child) {
        ac[child.id] = child;
        return ac;
    }, {});
    this._position = new Vec2(0, 0);
    this.setContext("OVERVIEW_WIDGET", this);
    this.children.forEach(function (fg) {
        fg.attach(this);
    }.bind(this));
}

OOP.mixClass(OverviewWidget, Fragment);

OverviewWidget.prototype.createView = function () {
    this.$title = _({
        tag: 'span',
        class: 'kv-overview-widget-title',
        child: { text: 'Phản hồi' }
    });
    this.$tabs = this.children.map(function (fg) {
        return _({
            tag: 'tabframe',
            class: 'kv-overview-widget-page',
            child: fg.getView(), props: {
                name: '&nbsp;'.repeat(5),//||fg.name,
                tabIcon: fg.tabIcon,
                id: fg.id
            }
        });
    });
    this.$view = _({
        class: 'kv-overview-widget',
        style: {
            '--x': '0px',
            '--y': '0px',
            visibility: 'hidden'
        },
        child: [
            {
                tag: Hanger.tag,
                class: 'kv-overview-widget-header',
                child: [
                    this.$title,
                    {
                        class: 'kv-overview-widget-header-window-action',
                        child: [
                            {
                                tag: 'button',
                                child: 'span.mdi.mdi-window-minimize',
                                on: {
                                    click: this.minimize.bind(this)
                                }
                            }
                        ]
                    }
                ],
                on: {
                    predrag: this.ev_headerPredrag.bind(this),
                    dragstart: this.ev_headerDragStart.bind(this),
                    drag: this.ev_headerDrag.bind(this),
                    dragend: this.ev_headerDragEnd.bind(this),

                }
            },
            {
                class: 'kv-overview-widget-body',
                child: {
                    tag: TabView.tag,
                    class: ['kv-overview-widget-tab-view', 'xp-tiny'],
                    child: this.$tabs,
                    on: {
                        activetab: this.ev_activeTab.bind(this)
                    }
                }
            }
        ]
    });
    this._updateViewPosition();

    this.$bubble = _({
        tag: OnScreenWidget.tag,
        class: 'kv-overview-widget-bubble',
        id: 'overview_widget_bubble',
        style: {
            visibility: 'hidden'
        },
        child: [
            '<svg class="kv-overview-widget-bubble-background"  viewBox="0 0 24 24">\n' +
            '    <path fill="currentColor" d="M3 11H11V3H3M5 5H9V9H5M13 21H21V13H13M15 15H19V19H15M3 21H11V13H3M5 15H9V19H5M13 3V11H21V3M19 9H15V5H19Z" />\n' +
            '</svg>',
            {
                class: 'kv-overview-widget-bubble-badge',
                child: { tag: 'span', child: { text: '0' } }
            }
        ],
        on: {
            click: this.maximize.bind(this)
        }
    });
    this.$tabview = $('.kv-overview-widget-tab-view', this.$view);
    this.$action = $('.kv-overview-widget-header-window-action', this.$view);
    this.$bubbleBadge = $('.kv-overview-widget-bubble-badge', this.$bubble);
    this.$badgeText = $('span', this.$bubbleBadge);
    this.$badgeText.requestUpdateSize = this._updateViewPosition.bind(this);
    var self = this;
    this.$tabs.forEach(function (tabElt) {
        tabElt.on('active', function () {
            self.childrenById[this.id].start();
        });
        tabElt.on('deactive', function () {
            self.childrenById[this.id].pause();
        });

    });
    this.updateCounter();
};


OverviewWidget.prototype.saveSetting = function () {
    localStorage.setItem('overview_widget_setting', JSON.stringify(this.setting));
};

OverviewWidget.prototype.loadSetting = function () {
    var setting = {};
    try {
        var settingJson = localStorage.getItem('overview_widget_setting');
        if (settingJson) setting = JSON.parse(settingJson);

    } catch (err) {
    }

    Object.assign(this.setting, setting);
    this._position = new Vec2(this.setting.viewPos.x, this.setting.viewPos.y);
    this._updateViewPosition();
};

OverviewWidget.prototype.updateCounter = function (from) {
    var id;
    var tabElt;
    var counter;

    if (from) {
        id = from.id;
        tabElt = this.$tabview.getTabById(id);
        counter = from.counter;
        if (counter)
            tabElt.name = '(' + counter + ')';
        else tabElt.name = '&nbsp;'.repeat(5);
    }
    else {
        this.$tabs.forEach(function (tabElt) {
            id = tabElt.id;
            var frg = this.childrenById[id];
            var counter = frg.counter;
            if (counter)
                tabElt.name = '(' + counter + ')';
            else tabElt.name = '&nbsp;'.repeat(5);
        }.bind(this));
    }

    var sumCounter = this.children.reduce(function (ac, cr) {
        return ac + cr.counter;
    }, 0);
    this.$badgeText.firstChild.data = sumCounter + '';
    if (sumCounter > 0) {
        this.$bubbleBadge.removeStyle('visibility');
    }
    else {
        this.$bubbleBadge.addStyle('visibility', 'hidden');
    }
};


OverviewWidget.prototype.onStart = function () {
    this.getView();
    this.loadSetting();
    this.$view.addTo(document.body);
    this.$bubble.addTo(document.body);
    ResizeSystem.add(this.$badgeText);
    this._updateViewPosition();
    if (this.setting.minimize) {
        this.$bubble.removeStyle('visibility');
    }
    else {
        this.$view.removeStyle('visibility');
    }
    this.children.forEach(function (fg) {
        fg.start(true);
    });
    var activeTabId = this.$tabview.getActiveTabId();
    this.childrenById[activeTabId].start();
};


OverviewWidget.prototype.onStop = function () {
    this.getView().remove();
};

OverviewWidget.prototype.ev_activeTab = function (event) {
    var frag = this.childrenById[event.id];
    this.$title.firstChild.data = frag.name + '';
};

OverviewWidget.prototype.ev_headerPredrag = function (event) {
    if (hitElement(this.$action, event)) {
        event.cancel();
    }
};

OverviewWidget.prototype.ev_headerDragStart = function (event) {
    var bound = this.$view.getBoundingClientRect();
    this._dragData = {
        bound: bound,
        p0: new Vec2(bound.left, bound.top),
        modal: _({
            style: {
                position: 'fixed',
                zIndex: '1000000000',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                background: 'transparent'
            }
        }).addTo(document.body)
    };
};

OverviewWidget.prototype.ev_headerDrag = function (event) {
    var d = event.currentPoint.sub(event.startingPoint);
    this._position = this._dragData.p0.add(d);
    this._updateViewPosition();
};

OverviewWidget.prototype.ev_headerDragEnd = function (event) {
    this._dragData.modal.remove();
    this.setting.viewPos.x = this._position.x;
    this.setting.viewPos.y = this._position.y;
    this.saveSetting();
};

OverviewWidget.prototype._updateViewPosition = function () {
    if (!this.$view) return;
    var screenSize = getScreenSize();
    var bound = this.$view.getBoundingClientRect();
    var x = Math.max(0, Math.min(this._position.x, screenSize.width - bound.width));
    var y = Math.max(0, Math.min(this._position.y, screenSize.height - bound.height));
    this.$view.addStyle({
        '--x': x + 'px',
        '--y': y + 'px'
    });
};


Object.defineProperty(OverviewWidget.prototype, 'position', {
    set: function (value) {
        if (!value) value = new Vec2(0, 0);
        if (value instanceof Array) {
            if (isRealNumber(value[0] && isRealNumber(value[1]))) {
                value = new Vec2(value[0], value[1]);
            }
            else {
                value = new Vec2(0, 0);
            }
        }
        else if (!(value instanceof Vec2)) {
            if (isRealNumber(value.x && isRealNumber(value.y))) {
                value = new Vec2(value[0], value[1]);
            }
            else {
                value = new Vec2(0, 0);
            }
        }
        this._position = value;
        this._updateViewPosition();
    },
    get: function () {
        return this._position;
    }
});

OverviewWidget.prototype.minimize = function () {
    this.$view.addStyle('visibility', 'hidden');
    this.$bubble.removeStyle('visibility');
    this.setting.minimize = true;
    this.saveSetting();
    var activeTabId = this.$tabview.getActiveTabId();
    this.childrenById[activeTabId].pause();
};


OverviewWidget.prototype.maximize = function () {
    this.$bubble.addStyle('visibility', 'hidden');
    this.$view.removeStyle('visibility');
    this.setting.minimize = false;
    this.saveSetting();
    var activeTabId = this.$tabview.getActiveTabId();
    this.childrenById[activeTabId].start();
};


export default OverviewWidget;
