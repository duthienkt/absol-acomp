var p = require('./person_names');

var items;
try {
    items = JSON.parse(localStorage.getItem('select_list_item'));
} catch (err) {}

if (!items) {
    items = p.generateNames(10000).map((t, i) => ({ text: t, value: i }));
    localStorage.setItem('select_list_item', JSON.stringify(items));
}


module.exports = items;