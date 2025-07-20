var _ = absol._;
var __ = o => _(o).addTo(document.body);

__({
    tag:'table',
    class:'as-table-new',
    child:[
        'thead',
        {
            tag:'tbody',
        }
    ]
});