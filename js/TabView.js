import '../css/tabview.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import TabBar from "./TabBar";
import { forwardEvent } from "./utils";

var _ = ACore._;
var $ = ACore.$;


function TabView() {
    var thisTV = this;
    /***
     *
     * @type {TabBar}
     */
    this.$tabbar = $('tabbar', this);
    this.$tabbar.$parent = this;
    this.$tabbar.on({
        close: TabView.eventHandler.closeTab.bind(thisTV),
        active: TabView.eventHandler.activeTab.bind(thisTV)
    });
    this._frameHolders = [];
    this._history = [];
    forwardEvent(this, 'inactivetab', 'deactivetab');
}

TabView.tag = 'TabView'.toLowerCase();

TabView.render = function () {
    return _({
        class: 'absol-tabview',
        extendEvent: ['activetab', 'inactivetab', 'removetab', 'requestremovetab', 'pressaddtab'],
        child: [
            'tabbar'
        ]
    });
};


TabView.eventHandler = {};

TabView.eventHandler.closeTab = function (event) {
    event.preventDefault();
    var id = event.value.id;
    this.removeTab(id, true);
};

TabView.eventHandler.activeTab = function (event) {
    event.preventDefault();
    var id = event.value.id;
    this.activeTab(id, true);
};

TabView.prototype.activeTab = function (id, userActive) {
    var self = this;
    var resPromise = [];
    var needDeactivatedHolder = [];
    var needActiveHolder = [];
    this._frameHolders.forEach(function (holder) {
        if (holder.containerElt.hasClass('absol-tabview-container-hidden')) {
            if (holder.id == id) {
                needActiveHolder.push(holder);
            }
        }
        else {
            if (holder.id != id) {
                needDeactivatedHolder.push(holder);
            }
        }
    });

    needDeactivatedHolder.forEach(function (holder) {
        holder.containerElt.addClass('absol-tabview-container-hidden');
        holder.tabFrame.emit('inactive', {
            type: 'inactive',
            target: holder.tabFrame,
            id: holder.id,
            userActive: !!userActive,
            tabButton: holder.tabButton,
            holder: holder
        }, holder.tabFrame);
    });

    needActiveHolder.forEach(function (holder) {
        self._history.push(holder.id);
        holder.containerElt.removeClass('absol-tabview-container-hidden');
        self.$tabbar.activeTab(holder.id);
        holder.tabFrame.emit('active', {
            type: 'active',
            target: holder.tabFrame,
            id: holder.id,
            userActive: !!userActive,
            tabButton: holder.tabButton,
            holder: holder
        }, holder.tabFrame);
        self.emit('activetab', {
            type: 'activetab',
            target: self,
            id: holder.id,
            userActive: !!userActive,
            tabButton: holder.tabButton,
            holder: holder
        }, self);
    });
};

TabView.prototype.removeTab = function (id, userActive) {
    var self = this;
    var resPromise = [];
    this._frameHolders.forEach(function (holder) {
        if (holder.id == id) {
            var eventData = {
                type: 'requestremove',
                id: id,
                userActive: !!userActive,
                target: holder.tabFrame,
                tabFrame: holder.tabFrame,
                tabButton: holder.tabButton,
                holder: holder,
                __promise__: Promise.resolve(),
                waitFor: function (promise) {
                    this.__promise__ = promise;
                }
            };
            holder.tabFrame.emit('requestremove', eventData, holder.tabFrame);
            eventData.type = 'requestremovetab';
            eventData.target = self;
            self.emit('requestremovetab', eventData, self);
            resPromise.push(
                eventData.__promise__.then(function () {
                    //if ok
                    var eventData2 = {
                        type: 'inactive',
                        target: holder.tabFrame,
                        id: holder.id,
                        userActive: !!userActive,
                        tabButton: holder.tabButton,
                        holder: holder
                    };
                    if (!holder.containerElt.hasClass('absol-tabview-container-hidden'))
                        holder.tabFrame.emit('inactive', eventData2, holder.tabFrame);
                    eventData2.type = 'inactivetab';
                    eventData2.target = self;
                    if (!holder.containerElt.hasClass('absol-tabview-container-hidden'))
                        self.emit('inactivetab', eventData2, self);
                    self._frameHolders = self._frameHolders.filter(function (x) {
                        return x.id != id;
                    });
                    holder.tabFrame.notifyDetached();
                    self.$tabbar.removeTab(holder.id);
                    holder.containerElt.remove();

                    eventData2.type = 'remove';
                    eventData2.target = holder.tabFrame;
                    holder.tabFrame.emit('remove', eventData2, holder.tabFrame);
                    eventData2.type = 'removetab';
                    eventData2.target = self;
                    self.emit('removetab', eventData2, self);
                    self.activeLastTab();
                }, function () {
                    //if reject
                })
            );
        }
    });
    return Promise.all(resPromise);

};


TabView.prototype.notifyUpdateDesc = function (elt) {
    var holder = this.findHolder(elt);
    if (holder) {
        holder.tabButton.desc = elt.desc;
    }
};

TabView.prototype.notifyUpdateName = function (elt) {
    var holder = this.findHolder(elt);
    if (holder) {
        holder.tabButton.name = elt.name;
    }
};

TabView.prototype.notifyUpdateModified = function (elt) {
    var holder = this.findHolder(elt);
    if (holder) {
        holder.tabButton.modified = elt.modified;
    }
};

TabView.prototype.findHolder = function (elt) {
    for (var i = 0; i < this._frameHolders.length; ++i) {
        var holder = this._frameHolders[i];
        if (holder.tabFrame == elt) {
            return holder;
        }
    }
};

TabView.prototype.addChild = function () {
    var self = this;
    Array.prototype.forEach.call(arguments, function (elt) {
        if (!elt.notifyAttached || !elt.notifyDetached) {
            throw new Error('element is not a tabframe');
        }
        var containerElt = _('.absol-tabview-container.absol-tabview-container-hidden');
        self.appendChild(containerElt);//origin function
        elt.selfRemove();
        var id = elt.attr('id');
        var desc = elt.attr('desc') || undefined;
        var name = elt.attr('name') || 'NoName';
        var tabIcon = elt.tabIcon;
        var modified = elt.modified;

        var tabButton = self.$tabbar.addTab({ name: name, id: id, desc: desc, modified: modified, tabIcon: tabIcon });
        containerElt.addChild(elt);
        elt.notifyAttached(self);
        var holder = {};
        OOP.drillProperty(holder, elt, 'id');
        OOP.drillProperty(holder, elt, 'desc');
        OOP.drillProperty(holder, elt, 'name');
        Object.defineProperties(holder, {
            tabButton: {
                value: tabButton,
                writable: false
            },
            tabFrame: {
                value: elt,
                writable: false
            },
            containerElt: {
                value: containerElt,
                writable: false
            }
        });
        self._frameHolders.push(holder);
        self.activeTab(id);
    });
};

TabView.prototype.activeLastTab = function () {
    var dict = this._frameHolders.reduce(function (ac, holder) {
        ac[holder.id] = true;
        return ac;
    }, {});

    while (this._history.length > 0) {
        var id = this._history[this._history.length - 1];
        if (dict[id]) {
            this.activeTab(id);
            break;
        }
        else {
            this._history.pop();
        }
    }
};

TabView.prototype.getChildAt = function (index) {
    return this._frameHolders[index].tabFrame;
};

TabView.prototype.getAllChild = function () {
    return this._frameHolders.map(function (holder) {
        return holder.tabFrame;
    });
};

TabView.prototype.getActiveTabHolder = function () {
    var holder = null;
    for (var i = 0; i < this._frameHolders.length; ++i) {
        holder = this._frameHolders[i];
        if (!holder.containerElt.hasClass('absol-tabview-container-hidden')) {
            return holder;
        }
    }
    return null;
};

TabView.prototype.getActiveTab = function () {
    var holder = this.getActiveTabHolder();
    return holder && holder.tabFrame;
};

TabView.prototype.getActiveTabId = function () {
    var holder = this.getActiveTabHolder();
    return holder && holder.id;
};

TabView.prototype.getTabById = function (id) {
    var holder = this.getTabHolderById(id);
    return holder && holder.tabFrame;
};

TabView.prototype.getTabHolderById = function (id) {
    var holder = null;
    for (var i = 0; i < this._frameHolders.length; ++i) {
        holder = this._frameHolders[i];
        if (holder.id === id) {
            return holder;
        }
    }
    return null;
}


TabView.prototype.activeFrame = function (elt) {
    if (typeof elt == "string") {
        return this.activeTab(elt);
    }
    else if (elt && elt.attr) {
        return this.activeTab(elt.attr('id'));
    }
    else {
        throw new Error("Invalid param, must be id or elt!");
    }
};


TabView.property = {};

TabView.property.historyOfTab = {
    get: function () {
        return this._history.slice();
    }
};

ACore.install('tabview', TabView);

export default TabView;