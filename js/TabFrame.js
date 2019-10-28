import Acore from "../ACore";
import { randomIdent } from "absol/src/String/stringGenerate";
var $ = Acore.$;
var _ = Acore._;

function TabFrame(data) {
    data = data || {};
    data.elt = data.elt || _('div');
    $(data.elt).addClass('absol-tab-frame').attr('id', 'tabframe-'+randomIdent());
    data.elt.defineEvent(['attached', 'detached']);
    return data.elt;
}


TabFrame.prototype.preInit = function () {
    this.$parent = null;
};

TabFrame.prototype.notifyAttached = function (parentElt) {
    this.$parent = parentElt;
    this.emit('attached', { target: this, parent: parentElt }, this);
};

TabFrame.prototype.notifyDetach = function () {
    this.emit('attached', { target: this, parent: this.$parent }, this);
    this.$parent = undefined;
};

TabFrame.prototype.selfRemove = function () {
    if (this.$parent)
        this.$parent.removeChild(this);
};

TabFrame.prototype.getParent = function () {
    return this.$parent;
};



TabFrame.prototype.init = function () {
    this.super.apply(this, arguments);
};


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



Acore.install('tabframe', TabFrame);
export default TabFrame;