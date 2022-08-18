var SLBPropHandlers = {};

SLBPropHandlers.items = {
    set: function (items){
        console.log(items)
    },
    get: function (){

    }
};

SLBPropHandlers.value = {
    set: function (value) {

    },
    get: function () {

    }
};

SLBPropHandlers.strictValue = {
    set: function (value) {
        if (value) {
            this.addClass('as-strict-value');
        }
        else {
            this.removeClass('as-strict-value');
        }
    },
    get: function () {
        return this.hasClass('as-strict-value');
    }
};


export default SLBPropHandlers;


/**************** ADAPT **********************/
/***
 *
 * @type {{}}
 */
SLBPropHandlers.selectedIndex = {};
