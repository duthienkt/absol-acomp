import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
var _ = Acore._;
var $ = Acore.$;


function TabView() {
    var res = _({
        class: 'absol-tabview',
        extendEvent: ['activetab', 'removetab'],
        child: [
            'tabbar',

        ]
    });
    res.$tabbar = $('tabbar', res);
    res.$tabbar.on({
        close: TabView.eventHandler.closeTab.bind(res),
        active: TabView.eventHandler.activeTab.bind(res)
    });
    res._frameHolders = [];
    res._history = [];
    return res;
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
    var needDeactiveHolder = [];
    var needActiveHolder = [];
    this._frameHolders.forEach(function (holder) {
        if (holder.containterElt.containsClass('absol-tabview-container-hidden')) {
            if (holder.id == id) {
                needActiveHolder.push(holder);
            }
        }
        else {
            if (holder.id != id) {
                needDeactiveHolder.push(holder);
            }
        }
    });

    needDeactiveHolder.forEach(function (holder) {
        holder.containterElt.addClass('absol-tabview-container-hidden');
        holder.tabFrame.emit('deactive', {
            type: 'deactive',
            target: holder.tabFrame,
            id: holder.id,
            userActive: !!userActive,
            tabButton: holder.tabButton,
            holder: holder
        }, holder.tabFrame);
    });

    needActiveHolder.forEach(function (holder) {
        self._history.push(holder.id);
        holder.containterElt.removeClass('absol-tabview-container-hidden');
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
                type: 'remove',
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
            holder.tabFrame.emit('remove', eventData, holder.tabFrame);
            eventData.type = 'removetab';
            eventData.target = self;
            self.emit('removetab', eventData, self);
            resPromise.push(
                eventData.__promise__.then(function () {
                    //if ok
                    holder.tabFrame.emit('deactive', {
                        type: 'deactive',
                        target: holder.tabFrame,
                        id: holder.id,
                        userActive: !!userActive,
                        tabButton: holder.tabButton,
                        holder: holder
                    }, holder.tabFrame);
                    self._frameHolders = self._frameHolders.filter(function (x) { return x.id != id; });
                    holder.tabFrame.notifyDetached();
                    self.$tabbar.removeTab(holder.id);
                    holder.containterElt.remove();
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
        var containterElt = _('.absol-tabview-container.absol-tabview-container-hidden');
        self.appendChild(containterElt);//origin function
        elt.selfRemove();
        var id = elt.attr('id');
        var desc = elt.attr('desc') || undefined;
        var name = elt.attr('name') || 'NoName';
        var modified = elt.modified;

        var tabButton = self.$tabbar.addTab({ name: name, id: id, desc: desc, modified: modified });
        containterElt.addChild(elt);
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
            containterElt: {
                value: containterElt,
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
        var id = this._history.pop();
        if (dict[id]) {
            this.activeTab(id);
            break;
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


TabView.prototype.activeFrame = function (elt) {
    return this.activeTab(elt.attr('id'));
};


Acore.install('tabview', TabView);

export default TabView;