import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;


function TabView() {
    return _({
        class: 'frame-tabview',
        child: [
            {
                tag: 'tabbar',
                props: {
                    tabs: []
                }
            }
        ]
    });
};

TabView.prototype.preInit = function () {
    var self = this;
    this.$tabbar = $('tabbar', this);
    this.$tabbar.on({
        close: function (event, sender) {
            event.preventDefault();
            var ident = event.value.ident;
            self.removeTab(event.value).then(function (result) {
                if (result) self.$tabbar.removeTab(ident);
                window.dispatchEvent(new Event('resize'));
            });
        },
        active: function (event, sender) {
            self.onActiveTab(event.value);
        }
    })
};

TabView.prototype.init = function (props) {
    this.preInit();
    this.super(props);
};

Acore.install('tabview', TabView);