import Acore from "../ACore";
var $ = Acore.$;
var _ = Acore._;

function TabFrame() {
    var res = _({
        tag: 'frame',
        class: 'absol-tab-frame',
        extendEvent: ['requestremove', 'remove']
    }, true);
    return res;
}

TabFrame.property = {};

TabFrame.property.name = {
    set: function (value) {

        if (typeof name == "undefined") {
            this._name = undefined;
        }
        else {
            this._name = value + '';
        }
        if (this.$parent) {
            if (this.$parent.notifyUpdateName)
                this.$parent.notifyUpdateName(this);
        }
    },
    get: function () {
        return this._name;
    }
};


TabFrame.property.modified = {
    set: function (value) {
        this._modified = !!value;
        if (this.$parent) {
            if (this.$parent.notifyUpdateModified)
                this.$parent.notifyUpdateModified(this);
        }
    },
    get: function () {
        return !!this._modified;
    }
};


TabFrame.property.desc = {
    set: function (value) {
        if (typeof value == "undefined") {
            this._desc = undefined;
        }
        else {
            this._desc = value + '';
        }
        if (this.$parent) {
            if (this.$parent.notifyUpdateDesc)
                this.$parent.notifyUpdateDesc(this);
        }

    },
    get: function () {
        return this._desc;
    }
}

TabFrame.attribute = {};

TabFrame.attribute.name = {
    set: function (value) {
        this.name = value;
    },
    get: function () {
        return this.name;
    },
    remove: function () {
        this.name = undefined;
    }
};



TabFrame.attribute.desc = {
    set: function (value) {
        this.desc = value;
    },
    get: function () {
        return this.desc;
    },
    remove: function () {
        this.desc = undefined;
    }
};

TabFrame.attribute.modified = {
    set: function (value) {
        this.modified = value == 'true' || value == '1' || value === true;
    },
    get: function () {
        return this.modified ? 'true' : undefined;
    },
    remove: function () {
        this.desc = false;
    }
};


TabFrame.property.requestRemove = function () {
    if (this.$parent && this.$parent.removeTab) {
        this.$parent.removeTab(this.id, false);
    }
    else {
        this.selfRemove();
    }
};

Acore.install('tabframe', TabFrame);
export default TabFrame;