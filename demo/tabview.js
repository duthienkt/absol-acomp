var _ = absol._;
var __ = o=>_(o).addTo(document.body);
var $ = absol.$;


var ctn = __({
    style:{
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 20px)',
        // backgroundColor: 'rgb(200, 200, 201)',
        backgroundColor: 'white',
    }
});

var tabview = _({
    tag:'folderliketabbar',
    style: {
        width: '100%',
        variant:'file_folder'
    }
}).addTo(ctn);