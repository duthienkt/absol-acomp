import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

function QuickListButton() {
    this.$shareFollower = QuickListButton.getFollower();
    _({
        tag: 'followertoggler', elt: this,
        on: {
            preopen: this.eventHandler.preopen,
            close: this.eventHandler.closeFollower
        }
    });
    this.bindFollower(this.$shareFollower);
    this.$iconCtn.remove();
    this.$content.addChild(this.$iconCtn);
    this._items = this._items;
    this._anchor = [];
    this.$list = null;
    this._listUpdated = true;
    this._opened = false;
    this.anchor = [12, 13, 15, 14];//todo: add property
}


QuickListButton.$follower = _('follower.as-quick-list-button-follower');

QuickListButton.getFollower = function () {
    if (!QuickListButton.$follower)
        QuickListButton.$follower = _('follower.as-quick-list-button-follower');
    return QuickListButton.$follower;
};

QuickListButton.render = function () {
    return _({
        tag: 'flexiconbutton',
        class: 'as-quick-list-button',
        extendEvent: 'select',
        props: {
            text: "+ Thêm",
            icon: 'span.mdi.mdi-menu-down'
        }
    });
};



QuickListButton.property = {};

QuickListButton.property.items = {
    set: function (value) {
        value = value || [];
        this._items = value;
        this._listUpdated = false;
    },
    get: function () {
        return this._items;
    }
};

/**
 * @type {QuickListButton}
 */
QuickListButton.eventHandler = {};


QuickListButton.eventHandler.preopen = function () {
    this.$shareFollower.addTo(document.body);
    this.$shareFollower.anchor = this.anchor;
    if (this.$list == null) {
        this.$list = _('selectlist.absol-bscroller')
        .on('pressitem', this.eventHandler.pressitem);
    }
    if (!this._listUpdated) {
        this._listUpdated = true;
        this.$list.items = this._items;
    }
    this.$shareFollower.addChild(this.$list);
    this.$shareFollower.on({
        preupdateposition: this.eventHandler.preUpdatePosition,
    });

};

QuickListButton.eventHandler.preUpdatePosition = function () {
    var bound = this.getBoundingClientRect();
    var screenSize = Dom.getScreenSize();
    var maxHeight = Math.max(screenSize.height - bound.bottom, bound.top) - 10;
    this.$list.addStyle('max-height', maxHeight + 'px');
};

QuickListButton.eventHandler.closeFollower = function(){
    this.$shareFollower.off({
        preupdateposition: this.eventHandler.preUpdatePosition
    });
};

QuickListButton.eventHandler.pressitem = function(event){
    this.close();
    this.emit('select', Object.assign({}, event, {type:'select', target: this}));
};


ACore.install('QuickListButton'.toLowerCase(), QuickListButton);

export default QuickListButton;