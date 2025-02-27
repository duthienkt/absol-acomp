function render(o) {
    return absol._(o).addTo(document.body);
}

render('<h2>FontInput</h2>');
var input = render({
    tag: 'FontInput'.toLowerCase()
});