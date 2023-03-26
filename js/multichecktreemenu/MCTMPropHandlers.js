import { compareDate } from "absol/src/Time/datetime";
import { arrayCompare } from "absol/src/DataStructure/Array";

var MCTMPropHandlers = {};

MCTMPropHandlers.readOnly = {
    set: function (value) {
        if (value) {
            this.addClass('as-read-only');
        }
        else {
            this.removeClass('as-read-only');
        }
    },
    get: function () {
        return this.hasClass('as-read-only');
    }
};


MCTMPropHandlers.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('as-disabled');
        }
        else {
            this.removeClass('as-disabled');
        }
    },
    get: function () {
        return this.hasClass('as-disabled');
    }
};



MCTMPropHandlers.items = {
    set: function (items) {
        this.$box.items = items;
        this.tokenCtrl.updateFromViewValues();
    },
    get: function () {
        return this.$box.items;
    }
};

MCTMPropHandlers.values = {
    set: function (values) {
        this.$box.values = values || [];
        this.tokenCtrl.updateFromViewValues();
    },
    get: function () {
        if (this.isFocus) {
            return this.savedValues;
        }
        else {
            return this.$box.values;
        }
    }
};


MCTMPropHandlers.leafOnly = {
    set: function (value) {
        if (!!value === this.hasClass('as-leaf-only')) return;
        if (value) {
            this.addClass('as-leaf-only');
            this.$box.leafOnly = true;
        }
        else {
            this.removeClass('as-leaf-only');
            this.$box.leafOnly = false;
        }
        this.tokenCtrl.updateFromViewValues();
    },
    get: function () {
        return this.hasClass('as-leaf-only');
    }
};


MCTMPropHandlers.isFocus = {
    /***
     * @this MultiCheckTreeMenu
     * @param value
     */
    set: function (value) {
        if (!!value === this.hasClass('as-focus')) return;
        if (value) {
            this.savedValues = this.$box.values;
            this.addClass('as-focus');
            this.boxCtrl.onFocus();
        }
        else {
            this.removeClass('as-focus');
            this.boxCtrl.onBlur();
            var newValues = this.values;
            if (!arrayCompare(this.savedValues, newValues)) {
                this.notifyChange();
            }
            else {
                this.tokenCtrl.updateFromViewValues();
            }
            this.savedValues = this.values;


        }
    },
    get: function () {
        return this.hasClass('as-focus');
    }
};


MCTMPropHandlers.enableSearch = {
    set: function (value){
        this.$box.enableSearch = value;
    },
    get: function (){
        return this.$box.enableSearch ;
    }
};

export default MCTMPropHandlers;


/**************************** ADAPT OLD VERSION **********************************************************************/

MCTMPropHandlers.$checkTreeBox = {
    get: function () {
        return this.$box;
    }
};