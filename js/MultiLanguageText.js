import ACore, { _, $, $$ } from "../ACore";


/***
 * @extends AElement
 * @constructor
 */
function MultiLanguageText() {
    this._v = Array(5).fill(null);
    this._key = null;
    this.$text = document.createTextNode('');
    this.addChild(this.$text);
}


MultiLanguageText.tag = 'mlt';


MultiLanguageText.render = function () {
    return _('span');
};

MultiLanguageText.prototype._updateText = function () {
    var text = '';
    if (this._key && window.LanguageModule && window.LanguageModule.text2) {
        text = window.LanguageModule.text2(this._key, this._v);
    }
    text = text.replace(/<br>/g, '\n');

    this.$text.data = text;
};

MultiLanguageText.attribute = Array(5).fill(0).reduce((ac, u, i) => {
    ac['v' + i] = {
        set: function (value) {
            this._v[i] = value;
            this._updateText();
        },
        get: function () {
            return this._v[i];
        },
        remove: function () {
            this._v[i] = null;
        }
    }
    return ac;
}, {});


MultiLanguageText.attribute.key = {
    set: function (value) {
        this._key = value;
        this._updateText();
    },
    get: function () {
        return this._key;
    },
    remove: function () {
        this._key = null;
    }
};

MultiLanguageText.replaceAll = function (root) {
  $$('mlt', root).forEach(elt=>{
      if (elt.tagName !== 'MLT') return;
      var attr = Array.prototype.reduce.call(elt.attributes,(ac, at)=>{
          ac[at.name] = at.value;
          return ac;
      },{});
      elt.selfReplace(_({
          tag: MultiLanguageText,
          attr: attr
      }));
  });
};
export default MultiLanguageText;
