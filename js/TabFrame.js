import Acore from "../ACore";

function TabFrame() {
    return Acore._({
        class: 'absol-tab-frame',
        extendEvent: ['attached', 'detached']
    });
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
        //todo: change name from parent
        if (this.$parent) {
            this.$parent.notifyUpdateName(this);
        }
    },
    get: function () {
        return this._name;
    }
}

TabFrame.property.desc = {
    set: function (value) {
        if (typeof value == "undefined") {
            this._desc = undefined;
        }
        else {
            this._desc = value + '';
        }
        //todo: change name from parent
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
        console.log('.',value);

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



Acore.install('tabframe', TabFrame);
export default TabFrame;