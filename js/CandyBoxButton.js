import Acore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import '../css/candyboxbutton.css'; 


var _ = Svg.ShareInstance._;
var $ = Svg.ShareInstance.$;

function CandyBoxButton() {
    var res = _({
        tag: 'svg',
        attr: {
            width:'18',
            height:'18',
        },
        child: [{
            tag: 'rect',
            class:'absol-candy-box-border',
            attr: {
                x:'0.5',
                y:'0.5',
                width:'17',
                height:'17'
            }
        }]
    });

    res._paths = {};
    res._status = 'none';

    return res;
}


CandyBoxButton.prototype.addPath = function (statusName, pathString) {

};

CandyBoxButton.prototype.removePath = function (statusName) {

};


CandyBoxButton.property = {};



CandyBoxButton.property.status = {
    set: function (value) {
        value = value || 'none';

    },
    get: function () {
        return this._status || 'none';
    }
};


CandyBoxButton.property.paths = {
    get: function () {
        return this._paths;
    }
};

Acore.install('candyboxbutton', CandyBoxButton);