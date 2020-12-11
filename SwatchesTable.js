import CPCore from "./CPCore";
import Color from 'absol/src/Color/Color';
var _ = CPCore._;
var $ = CPCore.$;


function SwatchesTable() {
    this._data = [];
    this._poolCells = [];
    this._poolRows = [];
    this._dict = {};
}

SwatchesTable.tag = 'SwatchesTable'.toLowerCase();

SwatchesTable.render = function () {
    return _({
        extendEvent: 'presscell',
        class: 'as-swatches-table'
    });
};


SwatchesTable.prototype.getCell = function () {
    if (arguments.length == 1) {
        var key = arguments[0];
        if (key.toHex8) {
            key = key.toHex8();
        }
        else if (typeof key == 'string') {
            key = Color.parse(key);
            if (key)
                key = key.toHex8();
        }
        key = key + '';
        return this._dict[key];
    }
    else if (arguments.length == 2) {
        return this.childNodes[arguments[0]] && this.childNodes[arguments[0]].childNodes[arguments[1]];
    }
};

SwatchesTable.eventHandler = {};

SwatchesTable.eventHandler.clickCell = function (cell, event) {
    this.emit('presscell', {
        target: this,
        cellElt: cell,
        value: cell.__swatchescell_value,
        rowIdx: cell.__swatchescell_row_idx,
        colIdx: cell.__swatchescell_col_idx
    });
}

SwatchesTable.property = {};


SwatchesTable.property.data = {
    set: function (value) {
        this._dict = {};
        value = value || [[null]];
        if (typeof value == 'string') {
            value = {
                classic: MoqupsClassicSwathes,
                material: MaterialSwatches,
                bootstrap: BootstrapSwatches,
                ios: iOsSwatches,
                moqupsclassic: MoqupsClassicSwathes
            }[value] || [[null]];
        }
        this._data = value;
        var child;
        while (this.childNodes.length > value.length) {
            child = this.firstChild;
            this._poolRows.push(child);
            this.removeChild(child);
        }
        while (this.childNodes.length < value.length) {
            if (this._poolRows.length > 0) child = this._poolRows.pop();
            else child = _('.as-swatches-table-row');
            this.addChild(child);
        }

        var rowElt;
        var row;
        for (var i = 0; i < value.length; ++i) {
            rowElt = this.childNodes[i];
            row = value[i];
            while (rowElt.childNodes.length > row.length) {
                child = rowElt.firstChild;
                this._poolCells.push(child);
                rowElt.removeChild(child);
            }
            while (rowElt.childNodes.length < row.length) {
                if (this._poolCells.length > 0)
                    child = this._poolCells.pop();
                else {
                    child = _({
                        class: 'as-swatches-table-cell',
                        child: '.as-swatches-table-cell-color'
                    });
                    child.on('click', this.eventHandler.clickCell.bind(this, child));
                }
                rowElt.addChild(child);
            }
            for (var j = 0; j < row.length; ++j) {
                rowElt.childNodes[j].__swatchescell_row_idx = i;
                rowElt.childNodes[j].__swatchescell_col_idx = j;
                if (!row[j]) {
                    rowElt.childNodes[j]
                        .attr('title', null)
                    rowElt.childNodes[j].firstChild.removeStyle('background-color');
                    rowElt.childNodes[j].__swatchescell_value = row[j];
                    this._dict['null'] = rowElt.childNodes[j];
                }
                else if (row[j].toHex8) {
                    rowElt.childNodes[j].firstChild.addStyle('background-color', row[j].toString());
                    rowElt.childNodes[j].attr('title', null);
                    rowElt.childNodes[j].__swatchescell_value = row[j];
                    this._dict[row[j].toHex8()] = rowElt.childNodes[j];
                }
                else if (typeof row[j] == 'object') {
                    if (row[j].value) {
                        rowElt.childNodes[j].firstChild.addStyle('background-color', row[j].value);
                        rowElt.childNodes[j].__swatchescell_value = row[j].value;
                        this._dict[Color.parse(row[j].value + '').toHex8()] = rowElt.childNodes[j];
                    }
                    else {
                        rowElt.childNodes[j].firstChild.removeStyle('background-color');
                        this._dict[Color.parse('transparent').toHex8()] = rowElt.childNodes[j];
                    }
                    rowElt.childNodes[j].attr('title', row[j].name || null)
                }
                else if (typeof row[j] == 'string') {
                    rowElt.childNodes[j].firstChild.addStyle('background-color', row[j]);
                    rowElt.childNodes[j].attr('title', null);
                    rowElt.childNodes[j].__swatchescell_value = row[j];
                    this._dict[Color.parse(row[j]).toHex8()] = rowElt.childNodes[j];
                }
                
            }
        }
    },
    get: function () {
        return this._data;
    }
};


export var MoqupsClassicSwathes = [
    [
        { "name": "White", "value": "#ffffff" },
        { "name": "± Wild Sand", "value": "#f7f6f6" },
        { "name": "± Gallery", "value": "#ebebeb" },
        { "name": "± Alto", "value": "#d6d6d6" },
        { "name": "Silver", "value": "#c0c0c0" },
        { "name": "± Silver Chalice", "value": "#aaaaaa" },
        { "name": "± Gray", "value": "#929292" },
        { "name": "Boulder", "value": "#7a7a7a" },
        { "name": "± Scorpion", "value": "#606060" },
        { "name": "± Tundora", "value": "#444444" },
        { "name": "± Mine Shaft", "value": "#232323" },
        { "name": "Black", "value": "#000000" }
    ],
    [
        { "name": "± Prussian Blue", "value": "#003748" },
        { "name": "± Green Vogue", "value": "#021f54" },
        { "name": "± Black Rock", "value": "#120639" },
        { "name": "± Violet", "value": "#2f073b" },
        { "name": "± Bulgarian Rose", "value": "#3d051b" },
        { "name": "± Lonestar", "value": "#5e0202" },
        { "name": "± Brown Bramble", "value": "#5b1a04" },
        { "name": "± Cioccolato", "value": "#58330a" },
        { "name": "± Bronze Olive", "value": "#553d0d" },
        { "name": "± Himalaya", "value": "#656119" },
        { "name": "± West Coast", "value": "#4e5516" },
        { "name": "± Seaweed", "value": "#243e16" }
    ],
    [
        { "name": "± Astronaut Blue", "value": "#004e63" },
        { "name": "± Catalina Blue", "value": "#033076" },
        { "name": "± Violet", "value": "#1c0c4f" },
        { "name": "± Jagger", "value": "#460e56" },
        { "name": "± Maroon Oak", "value": "#570e28" },
        { "name": "± Dark Burgundy", "value": "#840705" },
        { "name": "± Kenyan Copper", "value": "#7d2709" },
        { "name": "± Raw Umber", "value": "#7b4812" },
        { "name": "± Raw Umber", "value": "#785616" },
        { "name": "± Wasabi", "value": "#8c8525" },
        { "name": "± Fern Frond", "value": "#6e7623" },
        { "name": "± Woodland", "value": "#355723" }
    ],
    [
        { "name": "± Blue Lagoon", "value": "#006e8c" },
        { "name": "± Cobalt", "value": "#0844a4" },
        { "name": "± Persian Indigo", "value": "#2e1572" },
        { "name": "± Honey Flower", "value": "#631878" },
        { "name": "± Claret", "value": "#7a163c" },
        { "name": "± Milano Red", "value": "#b70f0a" },
        { "name": "± Rust", "value": "#af3a11" },
        { "name": "± Desert", "value": "#aa671d" },
        { "name": "± Reef Gold", "value": "#a77a23" },
        { "name": "± Earls Green", "value": "#c3bb38" },
        { "name": "± Sushi", "value": "#99a534" },
        { "name": "± Fern Green", "value": "#4c7a34" }
    ],
    [
        { "name": "± Bondi Blue", "value": "#008db1" },
        { "name": "± Denim", "value": "#0c59cf" },
        { "name": "± Daisy Bush", "value": "#3b1d8f" },
        { "name": "± Seance", "value": "#7e2199" },
        { "name": "± Disco", "value": "#9c1f4d" },
        { "name": "± Crimson", "value": "#e61610" },
        { "name": "± Orange Roughy", "value": "#dc4c18" },
        { "name": "± Brandy Punch", "value": "#d68227" },
        { "name": "± Hokey Pokey", "value": "#d39c2f" },
        { "name": "± Starship", "value": "#f4eb49" },
        { "name": "± Turmeric", "value": "#c1d045" },
        { "name": "± Apple", "value": "#629c44" }
    ],
    [
        { "name": "± Cerulean", "value": "#00a4d3" },
        { "name": "± Blue Ribbon", "value": "#1464f6" },
        { "name": "± Daisy Bush", "value": "#5125ad" },
        { "name": "± Purple Heart", "value": "#9c29b7" },
        { "name": "± Maroon Flush", "value": "#bb285c" },
        { "name": "± Red Orange", "value": "#ff3823" },
        { "name": "± Orange", "value": "#ff6624" },
        { "name": "± Sunshade", "value": "#ffa834" },
        { "name": "± Bright Sun", "value": "#fec63d" },
        { "name": "± Laser Lemon", "value": "#fefb64" },
        { "name": "± Confetti", "value": "#d7eb5a" },
        { "name": "± Mantis", "value": "#72bb53" }
    ],
    [
        { "name": "± Bright Turquoise", "value": "#00c8f8" },
        { "name": "± Dodger Blue", "value": "#3d8af7" },
        { "name": "± Purple Heart", "value": "#6334e3" },
        { "name": "± Electric Violet", "value": "#c238eb" },
        { "name": "± Cerise Red", "value": "#e93578" },
        { "name": "± Persimmon", "value": "#ff5d55" },
        { "name": "± Coral", "value": "#ff8351" },
        { "name": "± Texas Rose", "value": "#ffb253" },
        { "name": "± Golden Tainoi", "value": "#ffc957" },
        { "name": "± Dolly", "value": "#fef67f" },
        { "name": "± Manz", "value": "#e2ee79" },
        { "name": "± Feijoa", "value": "#92d36e" }
    ],
    [
        { "name": "± Malibu", "value": "#4dd7fa" },
        { "name": "± Malibu", "value": "#75a9f9" },
        { "name": "± Cornflower Blue", "value": "#8b51f5" },
        { "name": "± Heliotrope", "value": "#d757f6" },
        { "name": "± Froly", "value": "#f06e9c" },
        { "name": "± Vivid Tangerine", "value": "#ff8a84" },
        { "name": "± Hit Pink", "value": "#ffa382" },
        { "name": "± Macaroni and Cheese", "value": "#ffc581" },
        { "name": "± Grandis", "value": "#ffd783" },
        { "name": "± Picasso", "value": "#fef8a0" },
        { "name": "± Khaki", "value": "#e9f29b" },
        { "name": "± Feijoa", "value": "#aedd94" }
    ],
    [
        { "name": "± Anakiwa", "value": "#91e4fb" },
        { "name": "± Sail", "value": "#a8c6fa" },
        { "name": "± Perfume", "value": "#b38df7" },
        { "name": "± Heliotrope", "value": "#e692f8" },
        { "name": "± Illusion", "value": "#f6a2bf" },
        { "name": "± Sundown", "value": "#ffb4b0" },
        { "name": "± Wax Flower", "value": "#ffc3ae" },
        { "name": "± Caramel", "value": "#ffd8ad" },
        { "name": "± Navajo White", "value": "#ffe3ae" },
        { "name": "± Pale Prim", "value": "#fefac0" },
        { "name": "± Corn Field", "value": "#f1f6be" },
        { "name": "± Tea Green", "value": "#cbe8ba" }
    ],
    [
        { "name": "± French Pass", "value": "#c9f1fd" },
        { "name": "± Hawkes Blue", "value": "#d4e3fc" },
        { "name": "± Perfume", "value": "#dacafb" },
        { "name": "± Perfume", "value": "#f2c9fb" },
        { "name": "± Chantilly", "value": "#fad2e0" },
        { "name": "± Cosmos", "value": "#ffdad8" },
        { "name": "± Peach Schnapps", "value": "#ffe2d8" },
        { "name": "± Derby", "value": "#ffecd7" },
        { "name": "± Pink Lady", "value": "#fff1d7" },
        { "name": "± Off Yellow", "value": "#fefce0" },
        { "name": "± Citrine White", "value": "#f7fade" },
        { "name": "± Zanah", "value": "#dfedd6" }
    ]
];

export var MaterialSwatches = [
    [
        { "name": "Red 50", "value": "#ffebee" },
        { "name": "Red 100", "value": "#ffcdd2" },
        { "name": "Red 200", "value": "#ef9a9a" },
        { "name": "Red 300", "value": "#e57373" },
        { "name": "Red 400", "value": "#ef5350" },
        { "name": "Red 500", "value": "#f44336" },
        { "name": "Red 600", "value": "#e53935" },
        { "name": "Red 700", "value": "#d32f2f" },
        { "name": "Red 800", "value": "#c62828" },
        { "name": "Red 900", "value": "#b71c1c" }
    ],
    [
        { "name": "Pink 50", "value": "#fce4ec" },
        { "name": "Pink 100", "value": "#f8bbd0" },
        { "name": "Pink 200", "value": "#f48fb1" },
        { "name": "Pink 300", "value": "#f06292" },
        { "name": "Pink 400", "value": "#ec407a" },
        { "name": "Pink 500", "value": "#e91e63" },
        { "name": "Pink 600", "value": "#d81b60" },
        { "name": "Pink 700", "value": "#c2185b" },
        { "name": "Pink 800", "value": "#ad1457" },
        { "name": "Pink 900", "value": "#880e4f" }
    ],
    [
        { "name": "Purple 50", "value": "#f3e5f5" },
        { "name": "Purple 100", "value": "#e1bee7" },
        { "name": "Purple 200", "value": "#ce93d8" },
        { "name": "Purple 300", "value": "#ba68c8" },
        { "name": "Purple 400", "value": "#ab47bc" },
        { "name": "Purple 500", "value": "#9c27b0" },
        { "name": "Purple 600", "value": "#8e24aa" },
        { "name": "Purple 700", "value": "#7b1fa2" },
        { "name": "Purple 800", "value": "#6a1b9a" },
        { "name": "Purple 900", "value": "#4a148c" }
    ],
    [
        { "name": "Deep Purple 50", "value": "#ede7f6" },
        { "name": "Deep Purple 100", "value": "#d1c4e9" },
        { "name": "Deep Purple 200", "value": "#b39ddb" },
        { "name": "Deep Purple 300", "value": "#9575cd" },
        { "name": "Deep Purple 400", "value": "#7e57c2" },
        { "name": "Deep Purple 500", "value": "#673ab7" },
        { "name": "Deep Purple 600", "value": "#5e35b1" },
        { "name": "Deep Purple 700", "value": "#512da8" },
        { "name": "Deep Purple 800", "value": "#4527a0" },
        { "name": "Deep Purple 900", "value": "#311b92" }
    ],
    [
        { "name": "Indigo 50", "value": "#e8eaf6" },
        { "name": "Indigo 100", "value": "#c5cae9" },
        { "name": "Indigo 200", "value": "#9fa8da" },
        { "name": "Indigo 300", "value": "#7986cb" },
        { "name": "Indigo 400", "value": "#5c6bc0" },
        { "name": "Indigo 500", "value": "#3f51b5" },
        { "name": "Indigo 600", "value": "#3949ab" },
        { "name": "Indigo 700", "value": "#303f9f" },
        { "name": "Indigo 800", "value": "#283593" },
        { "name": "Indigo 900", "value": "#1a237e" }
    ],
    [
        { "name": "Blue 50", "value": "#e3f2fd" },
        { "name": "Blue 100", "value": "#bbdefb" },
        { "name": "Blue 200", "value": "#90caf9" },
        { "name": "Blue 300", "value": "#64b5f6" },
        { "name": "Blue 400", "value": "#42a5f5" },
        { "name": "Blue 500", "value": "#2196f3" },
        { "name": "Blue 600", "value": "#1e88e5" },
        { "name": "Blue 700", "value": "#1976d2" },
        { "name": "Blue 800", "value": "#1565c0" },
        { "name": "Blue 900", "value": "#0d47a1" }
    ],
    [
        { "name": "Light Blue 50", "value": "#e1f5fe" },
        { "name": "Light Blue 100", "value": "#b3e5fc" },
        { "name": "Light Blue 200", "value": "#81d4fa" },
        { "name": "Light Blue 300", "value": "#4fc3f7" },
        { "name": "Light Blue 400", "value": "#29b6f6" },
        { "name": "Light Blue 500", "value": "#03a9f4" },
        { "name": "Light Blue 600", "value": "#039be5" },
        { "name": "Light Blue 700", "value": "#0288d1" },
        { "name": "Light Blue 800", "value": "#0277bd" },
        { "name": "Light Blue 900", "value": "#01579b" }
    ],
    [
        { "name": "Cyan 50", "value": "#e0f7fa" },
        { "name": "Cyan 100", "value": "#b2ebf2" },
        { "name": "Cyan 200", "value": "#80deea" },
        { "name": "Cyan 300", "value": "#4dd0e1" },
        { "name": "Cyan 400", "value": "#26c6da" },
        { "name": "Cyan 500", "value": "#00bcd4" },
        { "name": "Cyan 600", "value": "#00acc1" },
        { "name": "Cyan 700", "value": "#0097a7" },
        { "name": "Cyan 800", "value": "#00838f" },
        { "name": "Cyan 900", "value": "#006064" }
    ],
    [
        { "name": "Teal 50", "value": "#e0f2f1" },
        { "name": "Teal 100", "value": "#b2dfdb" },
        { "name": "Teal 200", "value": "#80cbc4" },
        { "name": "Teal 300", "value": "#4db6ac" },
        { "name": "Teal 400", "value": "#26a69a" },
        { "name": "Teal 500", "value": "#009688" },
        { "name": "Teal 600", "value": "#00897b" },
        { "name": "Teal 700", "value": "#00796b" },
        { "name": "Teal 800", "value": "#00695c" },
        { "name": "Teal 900", "value": "#004d40" }
    ],
    [
        { "name": "Green 50", "value": "#e8f5e9" },
        { "name": "Green 100", "value": "#c8e6c9" },
        { "name": "Green 200", "value": "#a5d6a7" },
        { "name": "Green 300", "value": "#81c784" },
        { "name": "Green 400", "value": "#66bb6a" },
        { "name": "Green 500", "value": "#4caf50" },
        { "name": "Green 600", "value": "#43a047" },
        { "name": "Green 700", "value": "#388e3c" },
        { "name": "Green 800", "value": "#2e7d32" },
        { "name": "Green 900", "value": "#1b5e20" }
    ],
    [
        { "name": "Light Green 50", "value": "#f1f8e9" },
        { "name": "Light Green 100", "value": "#dcedc8" },
        { "name": "Light Green 200", "value": "#c5e1a5" },
        { "name": "Light Green 300", "value": "#aed581" },
        { "name": "Light Green 400", "value": "#9ccc65" },
        { "name": "Light Green 500", "value": "#8bc34a" },
        { "name": "Light Green 600", "value": "#7cb342" },
        { "name": "Light Green 700", "value": "#689f38" },
        { "name": "Light Green 800", "value": "#558b2f" },
        { "name": "Light Green 900", "value": "#33691e" }
    ],
    [
        { "name": "Lime 50", "value": "#f9fbe7" },
        { "name": "Lime 100", "value": "#f0f4c3" },
        { "name": "Lime 200", "value": "#e6ee9c" },
        { "name": "Lime 300", "value": "#dce775" },
        { "name": "Lime 400", "value": "#d4e157" },
        { "name": "Lime 500", "value": "#cddc39" },
        { "name": "Lime 600", "value": "#c0ca33" },
        { "name": "Lime 700", "value": "#afb42b" },
        { "name": "Lime 800", "value": "#9e9d24" },
        { "name": "Lime 900", "value": "#827717" }
    ],
    [
        { "name": "Yellow 50", "value": "#fffde7" },
        { "name": "Yellow 100", "value": "#fff9c4" },
        { "name": "Yellow 200", "value": "#fff59d" },
        { "name": "Yellow 300", "value": "#fff176" },
        { "name": "Yellow 400", "value": "#ffee58" },
        { "name": "Yellow 500", "value": "#ffeb3b" },
        { "name": "Yellow 600", "value": "#fdd835" },
        { "name": "Yellow 700", "value": "#fbc02d" },
        { "name": "Yellow 800", "value": "#f9a825" },
        { "name": "Yellow 900", "value": "#f57f17" }
    ],
    [
        { "name": "Amber 50", "value": "#fff8e1" },
        { "name": "Amber 100", "value": "#ffecb3" },
        { "name": "Amber 200", "value": "#ffe082" },
        { "name": "Amber 300", "value": "#ffd54f" },
        { "name": "Amber 400", "value": "#ffca28" },
        { "name": "Amber 500", "value": "#ffc107" },
        { "name": "Amber 600", "value": "#ffb300" },
        { "name": "Amber 700", "value": "#ffa000" },
        { "name": "Amber 800", "value": "#ff8f00" },
        { "name": "Amber 900", "value": "#ff6f00" }
    ],
    [
        { "name": "Orange 50", "value": "#fff3e0" },
        { "name": "Orange 100", "value": "#ffe0b2" },
        { "name": "Orange 200", "value": "#ffcc80" },
        { "name": "Orange 300", "value": "#ffb74d" },
        { "name": "Orange 400", "value": "#ffa726" },
        { "name": "Orange 500", "value": "#ff9800" },
        { "name": "Orange 600", "value": "#fb8c00" },
        { "name": "Orange 700", "value": "#f57c00" },
        { "name": "Orange 800", "value": "#ef6c00" },
        { "name": "Orange 900", "value": "#e65100" }
    ],
    [
        { "name": "Deep Orange 50", "value": "#fbe9e7" },
        { "name": "Deep Orange 100", "value": "#ffccbc" },
        { "name": "Deep Orange 200", "value": "#ffab91" },
        { "name": "Deep Orange 300", "value": "#ff8a65" },
        { "name": "Deep Orange 400", "value": "#ff7043" },
        { "name": "Deep Orange 500", "value": "#ff5722" },
        { "name": "Deep Orange 600", "value": "#f4511e" },
        { "name": "Deep Orange 700", "value": "#e64a19" },
        { "name": "Deep Orange 800", "value": "#d84315" },
        { "name": "Deep Orange 900", "value": "#bf360c" }
    ],
    [
        { "name": "Brown 50", "value": "#efebe9" },
        { "name": "Brown 100", "value": "#d7ccc8" },
        { "name": "Brown 200", "value": "#bcaaa4" },
        { "name": "Brown 300", "value": "#a1887f" },
        { "name": "Brown 400", "value": "#8d6e63" },
        { "name": "Brown 500", "value": "#795548" },
        { "name": "Brown 600", "value": "#6d4c41" },
        { "name": "Brown 700", "value": "#5d4037" },
        { "name": "Brown 800", "value": "#4e342e" },
        { "name": "Brown 900", "value": "#3e2723" }
    ],
    [
        { "name": "Grey 50", "value": "#fafafa" },
        { "name": "Grey 100", "value": "#f5f5f5" },
        { "name": "Grey 200", "value": "#eeeeee" },
        { "name": "Grey 300", "value": "#e0e0e0" },
        { "name": "Grey 400", "value": "#bdbdbd" },
        { "name": "Grey 500", "value": "#9e9e9e" },
        { "name": "Grey 600", "value": "#757575" },
        { "name": "Grey 700", "value": "#616161" },
        { "name": "Grey 800", "value": "#424242" },
        { "name": "Grey 900", "value": "#212121" }
    ],
    [
        { "name": "Blue Grey 50", "value": "#eceff1" },
        { "name": "Blue Grey 100", "value": "#cfd8dc" },
        { "name": "Blue Grey 200", "value": "#b0bec5" },
        { "name": "Blue Grey 300", "value": "#90a4ae" },
        { "name": "Blue Grey 400", "value": "#78909c" },
        { "name": "Blue Grey 500", "value": "#607d8b" },
        { "name": "Blue Grey 600", "value": "#546e7a" },
        { "name": "Blue Grey 700", "value": "#455a64" },
        { "name": "Blue Grey 800", "value": "#37474f" },
        { "name": "Blue Grey 900", "value": "#263238" }
    ],
    [
        { "name": "Black", "value": "#000000" },
        { "name": "White", "value": "#ffffff" }
    ]
];

export var BootstrapSwatches = [
    [
        { "name": "Gray Light", "value": "#777777" },
        { "name": "Base", "value": "#000000" },
        { "name": "Highlight Blue", "value": "#0055cc" },
        { "name": "Dark Blue", "value": "#005580" },
        { "name": "Success Text Green", "value": "#468847" },
        { "name": "Orange", "value": "#f89406" },
        { "name": "Red", "value": "#9d261d" },
        { "name": "Purple", "value": "#7a43b6" }
    ],
    [
        { "name": "Border Gray", "value": "#cccccc" },
        { "name": "Gray Darker", "value": "#222222" },
        { "name": "Primary Blue", "value": "#337ab7" },
        { "name": "Info Blue", "value": "#2f96b4" },
        { "name": "Green", "value": "#46a546" },
        { "name": "Light Orange", "value": "#fbb450" },
        { "name": "Danger Button Red", "value": "#bd362f" },
        { "name": "Pink", "value": "#c3325f" }
    ],
    [
        { "name": "Gray Lighter", "value": "#eeeeee" },
        { "name": "Gray Dark", "value": "#333333" },
        { "name": "Link Blue", "value": "#0088cc" },
        { "name": "Info Light Blue", "value": "#5bc0de" },
        { "name": "Success Button Green", "value": "#62c462" },
        { "name": "Yellow", "value": "#ffc40d" },
        { "name": "Error Text Red", "value": "#b94a48" },
        { "name": "Danger Highlight Red", "value": "#ee5f5b" }
    ],
    [
        { "name": "White", "value": "#ffffff" },
        { "name": "Gray", "value": "#555555" },
        { "name": "Accent Blue", "value": "#049cdb" },
        { "name": "Info Lighter Blue", "value": "#d9edf7" },
        { "name": "Success Background Green", "value": "#dff0d8" },
        { "name": "Warning Background Brown", "value": "#f3edd2" },
        { "name": "Warning Text Brown", "value": "#c09853" },
        { "name": "Danger Background Red", "value": "#f2dede" }
    ]
];
export var iOsSwatches = [
    [
        { "name": "Red", "value": "#ff3b30" },
        { "name": "Orange", "value": "#ff9500" },
        { "name": "Yellow", "value": "#ffcc00" },
        { "name": "Green", "value": "#4cd964" },
        { "name": "Teal Blue", "value": "#5ac8fa" },
        { "name": "Blue", "value": "#007aff" },
        { "name": "Purple", "value": "#5856d6" },
        { "name": "Pink", "value": "#ff2d55" }
    ],
    [
        { "name": "White", "value": "#ffffff" },
        { "name": "Custom Gray", "value": "#efeff4" },
        { "name": "Light Gray", "value": "#e5e5ea" },
        { "name": "Light Gray 2", "value": "#d1d1d6" },
        { "name": "Mid Gray", "value": "#c7c7cc" },
        { "name": "Gray", "value": "#8e8e93" },
        { "name": "Black", "value": "#000000" }
    ]
];

CPCore.install('swatchestable', SwatchesTable);

export default SwatchesTable;