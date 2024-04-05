var STLBPropsHandlers = {};





STLBPropsHandlers.enableSearch = {
    set: function (value) {
        if (value) {
            this.$box.addClass('as-enable-search');
        }
        else {
            this.$box.removeClass('as-enable-search');

        }
    },
    get: function () {
        return this.$box.hasClass('as-enable-search');
    }
};

export default STLBPropsHandlers;