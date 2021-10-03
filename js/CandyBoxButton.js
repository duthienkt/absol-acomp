import ACore from "../ACore";
import Svg from "absol/src/HTML5/Svg";
import '../css/candyboxbutton.css';
import AElement from "absol/src/HTML5/AElement";


var _ = Svg.ShareInstance._;
var $ = Svg.ShareInstance.$;

/**
 * @extends AElement
 * @constructor
 */
function CandyBoxButton() {
    this._paths = {};
    this._status = 'none';
}

CandyBoxButton.tag ='CandyBoxButton'.toLowerCase();

CandyBoxButton.render = function () {
    return _({
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

ACore.install('candyboxbutton', CandyBoxButton);

//not completed yet