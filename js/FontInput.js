import ACore, { _, $ } from "../ACore";
import '../css/fontinput.css';
import Follower from "./Follower";
import AElement from "absol/src/HTML5/AElement";
import { getScreenSize } from "absol/src/HTML5/Dom";
import SearchTextInput from "./Searcher";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import { wordLike, wordsMatch } from "absol/src/String/stringMatching";
import { harmonicMean } from "absol/src/Math/int";


const fonts = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact',
    "'Open Sans', sans-serif",
    "'Roboto', sans-serif",
    "'Big Shoulders Text', cursive",
    "'Montserrat', sans-serif",
    "'Oswald', sans-serif",
    "'Source Sans Pro', sans-serif",
    "'Roboto Condensed', sans-serif",
    "'Literata', serif",
    "'Roboto Mono', monospace",
    "'Roboto Slab', serif",
    "'Merriweather', serif",
    "'Noto Sans', sans-serif",
    "'Lora', serif",
    "'Muli', sans-serif",
    "'Open Sans Condensed', sans-serif",
    "'Playfair Display', serif",
    "'Nunito', sans-serif",
    "'Noto Serif', serif",
    "'Fira Sans', sans-serif",
    "'Inconsolata', monospace",
    "'Dosis', sans-serif",
    "'Nunito Sans', sans-serif",
    "'Arimo', sans-serif",
    "'Quicksand', sans-serif",
    "'Cabin', sans-serif",
    "'Josefin Sans', sans-serif",
    "'Varela Round', sans-serif",
    "'Anton', sans-serif",
    "'Lobster', cursive",
    "'Yanone Kaffeesatz', sans-serif",
    "'Source Code Pro', monospace",
    "'Baloo Bhai', cursive",
    "'Barlow', sans-serif",
    "'Dancing Script', cursive",
    "'Pacifico', cursive",
    "'Exo 2', sans-serif",
    "'Barlow Semi Condensed', sans-serif",
    "'EB Garamond', serif",
    "'Archivo Narrow', sans-serif",
    "'Asap', sans-serif",
    "'Comfortaa', cursive",
    "'Barlow Condensed', sans-serif",
    "'IBM Plex Sans', sans-serif",
    "'Maven Pro', sans-serif",
    "'Play', sans-serif",
    "'Exo', sans-serif",
    "'Amatic SC', cursive",
    "'Kanit', sans-serif",
    "'Fira Sans Condensed', sans-serif",
    "'Noto Sans SC', sans-serif",
    "'Vollkorn', serif",
    "'Prompt', sans-serif",
    "'Rokkitt', serif",
    "'Cuprum', sans-serif",
    "'Alegreya Sans', sans-serif",
    "'Francois One', sans-serif",
    "'Cormorant Garamond', serif",
    "'Alegreya', serif",
    "'Alfa Slab One', cursive",
    "'Noticia Text', serif",
    "'Saira Extra Condensed', sans-serif",
    "'Old Standard TT', serif",
    "'Tinos', serif",
    "'Fira Sans Extra Condensed', sans-serif",
    "'IBM Plex Serif', serif",
    "'Patrick Hand', cursive",
    "'M PLUS 1p', sans-serif",
    "'Prata', serif",
    "'Philosopher', sans-serif",
    "'Saira Semi Condensed', sans-serif",
    "'Archivo', sans-serif",
    "'Big Shoulders Display', cursive",
    "'Bangers', cursive",
    "'Playfair Display SC', serif",
    "'Cabin Condensed', sans-serif",
    "'Paytone One', sans-serif",
    "'Montserrat Alternates', sans-serif",
    "'Taviraj', serif",
    "'Spectral', serif",
    "'Lalezar', cursive",
    "'Asap Condensed', sans-serif",
    "'M PLUS Rounded 1c', sans-serif",
    "'Sigmar One', cursive",
    "'Saira', sans-serif",
    "'Pridi', serif",
    "'Mitr', sans-serif",
    "'Baloo', cursive",
    "'Cormorant', serif",
    "'Sarabun', sans-serif",
    "'Saira Condensed', sans-serif",
    "'Be Vietnam', sans-serif",
    "'Yeseva One', cursive",
    "'Lexend Peta', sans-serif",
    "'Alegreya Sans SC', sans-serif",
    "'IBM Plex Mono', monospace",
    "'Jura', sans-serif",
    "'Bevan', cursive",
    "'Lexend Exa', sans-serif",
    "'Sawarabi Gothic', sans-serif",
    "'Cousine', monospace",
    "'Markazi Text', serif",
    "'VT323', monospace",
    "'Baloo Bhaina', cursive",
    "'Space Mono', monospace",
    "'Encode Sans', sans-serif",
    "'Encode Sans Semi Expanded', sans-serif",
    "'Arima Madurai', cursive",
    "'Lexend Deca', sans-serif",
    "'Lexend Tera', sans-serif",
    "'Lexend Giga', sans-serif",
    "'Lexend Zetta', sans-serif",
    "'Lexend Mega', sans-serif",
    "'Arsenal', sans-serif",
    "'Itim', cursive",
    "'Noto Serif SC', serif",
    "'Pangolin', cursive",
    "'Lemonada', cursive",
    "'Encode Sans Condensed', sans-serif",
    "'Bai Jamjuree', sans-serif",
    "'Alegreya SC', serif",
    "'Noto Serif TC', serif",
    "'Judson', serif",
    "'Livvic', sans-serif",
    "'Krub', sans-serif",
    "'Trirong', serif",
    "'Niramit', sans-serif",
    "'Bungee Inline', cursive",
    "'Mali', cursive",
    "'Pattaya', sans-serif",
    "'Rosario', sans-serif",
    "'Bungee', cursive",
    "'Sriracha', cursive",
    "'Metrophobic', sans-serif",
    "'Faustina', serif",
    "'Darker Grotesque', sans-serif",
    "'Encode Sans Expanded', sans-serif",
    "'Chakra Petch', sans-serif",
    "'IBM Plex Sans Condensed', sans-serif",
    "'Maitree', serif",
    "'Baloo Bhaijaan', cursive",
    "'Cormorant Infant', serif",
    "'Saira Stencil One', cursive",
    "'Chonburi', cursive",
    "'Barriecito', cursive",
    "'Bahianita', cursive",
    "'Athiti', sans-serif",
    "'Sedgwick Ave', cursive",
    "'Patrick Hand SC', cursive",
    "'Srisakdi', cursive",
    "'Cormorant SC', serif",
    "'Andika', sans-serif",
    "'Podkova', serif",
    "'Bungee Shade', cursive",
    "'Baloo Da', cursive",
    "'Spectral SC', serif",
    "'Baloo Thambi', cursive",
    "'Baloo Chettan', cursive",
    "'Cormorant Upright', serif",
    "'Encode Sans Semi Condensed', sans-serif",
    "'Charm', cursive",
    "'Baloo Paaji', cursive",
    "'K2D', sans-serif",
    "'Farsan', cursive",
    "'David Libre', serif",
    "'Coiny', cursive",
    "'Baloo Tamma', cursive",
    "'Manuale', serif",
    "'Thasadith', sans-serif",
    "'Vollkorn SC', serif",
    "'Bungee Hairline', cursive",
    "'Kodchasan', sans-serif",
    "'Hepta Slab', serif",
    "'Cormorant Unicase', serif",
    "'Crimson Pro', serif",
    "'Grenze', serif",
    "'Charmonman', cursive",
    "'Baloo Tammudu', cursive",
    "'KoHo', sans-serif",
    "'Major Mono Display', monospace",
    "'Fahkwang', sans-serif",
    "'Bungee Outline', cursive",
    "'Sedgwick Ave Display', cursive"
];//only for test

/**
 * @extends Follower
 * @constructor
 */
export function FontFamilySelectList() {
    this.on('preupdateposition', this.eventHandler.ffPreUpdatePosition);
    this.$content = $('.as-font-family-select-list-content', this);
    this.$items = [];
    this.$selectedItem = null;
    this.$itemByValue = {};
    this.$searchInput = $(SearchTextInput.tag, this);
    this.$searchInput.on('stoptyping', this.eventHandler.searchChange);
    /**
     *
     * @type {string[]}
     * @memberOf FontFamilySelectList#
     */
    this.items = fonts;
    this._searchingHolders = null;//not prepared
}

FontFamilySelectList.tag = 'FontFamilySelectList'.toLowerCase();

FontFamilySelectList.render = function () {
    return _({
        tag: Follower,
        class: ['as-font-family-select-list', 'as-dropdown-box-common-style'],
        child: [
            {
                class: 'as-font-family-select-list-header',
                child: { tag: SearchTextInput }
            },

            {
                class: ['as-bscroller', 'as-font-family-select-list-content'],
            }
        ]
    }, true);
};

FontFamilySelectList.property = {};

FontFamilySelectList.property.items = {
    set: function (items) {
        if (!Array.isArray(items)) items = [];
        this._items = items;
        this.$content.clearChild();
        this.$itemByValue = {};
        this._searchingHolders = null;
        this.$items = items.map(item => {
            var text = item.replace(/'/g, '');
            text = text.replace(/,.+/, '');
            var itemElt = _({
                class: 'as-font-family-select-item',
                style: { fontFamily: item },
                attr: { 'data-value': item },
                child: { text: text },
                on: {
                    click: () => {
                        this.value = item;
                        this.emit('select', { value: item });
                    }

                }
            });
            this.$itemByValue[item] = itemElt;
            return itemElt;
        });
        this.$content.addChild(this.$items);
    },
    get: function () {
        return this._items;
    }
};


FontFamilySelectList.property.value = {
    set: function (value) {
        if (this.$selectedItem) this.$selectedItem.removeClass('as-selected');
        this._value = value;
        this.$selectedItem = this.$itemByValue[value];
        if (this.$selectedItem) this.$selectedItem.addClass('as-selected');
    },
    get: function () {
        if (this.$itemByValue[this._value]) return this._value;
        return null;
    }
};

FontFamilySelectList.prototype._makeHolder = function (item, value) {
    var res = {
        value: value,
        text: item
    };
    res.text = res.text.trim().toLowerCase();
    res.words = res.text.split(/\s+/).filter(w => !!w);
    res.text = res.words.join(' ');
    res.nacWords = res.words.map(w => nonAccentVietnamese(w));
    res.nacText = res.nacWords.join(' ');
    res.nacWordDict =
        res.nacWords.reduce(function (ac, word) {
            ac[word] = true;
            return ac;
        }, {});
    return res;
};

FontFamilySelectList.prototype._prepareSearchingHolders = function () {
    if (this._searchingHolders) return;
    this._searchingHolders = this.items.map((item, idx) => this._makeHolder(item, idx));
};

FontFamilySelectList.prototype._calcMatching = function (queryHolder, itemHolder) {
    var res = {};
    var score = 0;
    if (itemHolder.text.indexOf(queryHolder.text) >= 0 || itemHolder.nacText.indexOf(queryHolder.nacText) >= 0) {
        res.mustIncluded = true;
    }

    score += wordsMatch(queryHolder.words, itemHolder.words) / harmonicMean(queryHolder.words.length, itemHolder.words.length);
    score += wordsMatch(queryHolder.nacWords, itemHolder.nacWords) / harmonicMean(queryHolder.nacWords.length, itemHolder.nacWords.length);
    var dict = Object.keys(itemHolder.nacWordDict);
    Object.keys(queryHolder.nacWordDict).forEach(function (qWord) {
        var bestWordScore = 0;
        var bestWord = '';
        var word;
        for (word in dict) {
            if (wordLike(qWord, word) > bestWordScore) {
                bestWordScore = wordLike(qWord, word);
                bestWord = word;
            }
        }
        if (bestWordScore > 0) {
            score += bestWordScore / harmonicMean(qWord.length, bestWord.length);
            delete dict[bestWord];
        }
    });


    res.score = score;
    return res;
};

FontFamilySelectList.eventHandler = {};

FontFamilySelectList.eventHandler.ffPreUpdatePosition = function () {
    if (!this.followTarget) return;
    var bound = this.followTarget.getBoundingClientRect();
    var screenSizes = getScreenSize();
    var availableHeight = screenSizes.height - bound.bottom;
    availableHeight = Math.max(availableHeight, bound.top);
    availableHeight -= 50;
    this.$content.addStyle('max-height', availableHeight + 'px');

};

/**
 * @this FontFamilySelectList
 */
FontFamilySelectList.eventHandler.searchChange = function () {
    var query = this.$searchInput.value.trim();
    var queryHolder = this._makeHolder(query, -1);
    var resultHolders, midScore, viewItemElements;
    if (query.length > 0) {
        this._prepareSearchingHolders();
        this._searchingHolders.forEach((itemHolder) => {
            var match = this._calcMatching(queryHolder, itemHolder);
            Object.assign(itemHolder, match);
        });
        resultHolders = this._searchingHolders.slice();
        resultHolders.sort(function (a, b) {
            return b.score - a.score;
        });
        midScore = resultHolders[0].score * 0.7;
        resultHolders = resultHolders.filter(function (holder) {
            return holder.score >= midScore || holder.mustIncluded;
        });

        viewItemElements = resultHolders.map(holder => this.$items[holder.value]);
        this.$content.clearChild().addChild(viewItemElements);

    }
    else {
        this.$content.clearChild().addChild(this.$items);
    }
    this.updatePosition();

    console.log(query)

};


ACore.install(FontFamilySelectList);

/**
 * @extends AElement
 * @constructor
 */
function FontInput() {
    /**
     * @type {FontFamilySelectList}
     */
    this.$selectList = _('fontfamilyselectlist');
    this.$selectList.cancelWaiting();
    this.$selectList.sponsorElement = this;

    setTimeout(() => {
        this.$selectList.addTo(document.body);
        this.$selectList.followTarget = this;
    }, 100)

}

FontInput.tag = 'FontInput'.toLowerCase();

FontInput.render = function () {
    return _({
        class: 'as-font-input',
    });
};


FontInput.property = {};

export default FontInput;

ACore.install(FontInput);