var render = o => absol._(o).addTo(document.body);

render('<h2>SelectMenu</h2>')

var selectmenu1 = render({
    tag: 'selectmenu',
    props: {
        items: require('./sampledata/select_list_items.js')
    }
});