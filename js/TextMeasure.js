// import sText from './sample.tpl';
import {measureText} from "./utils";

// var charList = Object.keys(sText.split('').reduce(function (ac, cr){
//     ac[cr] = true;
//     return ac;
// }));
//
// console.log(charList)


function TextMeasure() {
    this._makeSizeData();
}


TextMeasure.prototype.supportFont = ['Times New Roman', 'Arial'];
TextMeasure.prototype.characterList  = []

TextMeasure.prototype._makeSizeData = function () {

};

TextMeasure.prototype._makeFontSize = function (fontName){
    measureText()
}


export default new TextMeasure;