import Acore from "../ACore";
import { randomIdent } from 'absol/src/String/stringGenerate';
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
    this._frameHolders.forEach(function (holder) {
        if (holder.id == id) {
            self._history.push(id);
            holder.containterElt.removeClass('absol-tabview-container-hidden');
            var eventData = {
                id: id,
                userActive: !!userActive,
                target: self,
                tabFrame: holder.tabFrame,
                tabButton: holder.tabButton,
                holder: holder,
                __promise__: Promise.resolve(),
                waitFor: function (promise) {
                    this.__promise__ = promise;
                }
            };
            self.emit('activetab', eventData, self);
            eventData.__promise__.then(function () {
                //if ok
                self.$tabbar.activeTab(holder.id);
            }, function () {
                //if reject
            });
        }
        else {
            holder.containterElt.addClass('absol-tabview-container-hidden');
        }
    });
};

TabView.prototype.removeTab = function (id, userActive) {
    var self = this;
    this._frameHolders.forEach(function (holder) {
        if (holder.id == id) {
            console.log(holder);

            var eventData = {
                id: id,
                userActive: !!userActive,
                target: self,
                tabFrame: holder.tabFrame,
                tabButton: holder.tabButton,
                holder: holder,
                __promise__: Promise.resolve(),
                waitFor: function (promise) {
                    this.__promise__ = promise;
                }
            };
            self.emit('removetab', eventData, self);
            eventData.__promise__.then(function () {
                //if ok
                this._frameHolders = this._frameHolders.filter(function (x) { return x.id != holder.id; })
                holder.tabFrame.notifyDetach();
                self.$tabbar.removeTab(holder.id);
                holder.containterElt.remove();
            }, function () {
                //if reject
            });

        }
        else {
            holder.containterElt.addClass('absol-tabview-container-hidden');
        }
    });
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

        if (!elt.notifyAttached || !elt.notifyDetach) {
            throw new Error('element is not a tabframe');
        }
        var containterElt = _('.absol-tabview-container');
        self.appendChild(containterElt);//origin function
        elt.selfRemove();
        var id = elt.attr('id') || randomIdent(16);
        var desc = elt.attr('desc') || undefined;
        var name = elt.attr('name') || 'NoName';

        var tabButton = self.$tabbar.addTab({ name: name, id: id, desc: desc });
        containterElt.addChild(elt);
        elt.notifyAttached(self);
        self._frameHolders.push({
            name: name,
            id: id,
            desc: desc,
            tabButton: tabButton,
            tabFrame: elt,
            containterElt: containterElt
        });
        self.activeTab(id);
    });
};

TabView.prototype.activeLastTab = function () {
    var dict = this._frameHolders.reduce(function (ac, holder) {
        ac[holder.id] = true;
        return ac;
    }, {});
    //todo
};

TabView.prototype.getChildAt = function () {
    //todo
};

TabView.prototype.getAll = function () {
    //todo
};


Acore.install('tabview', TabView);