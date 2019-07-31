import Acore from "../ACore";
import XHR from "absol/src/Network/XHR";

var _ = Acore._;
var $ = Acore.$;



function RemoteSvg() {
    return _('svg').defineEvent('load');
}

RemoteSvg.property = {
    src: {
        set: function (value) {
            this._src = value;
            var self = this;
            RemoteSvg.loadIcon(value).then(function (data) {
                self.emit('load', { target: self, src: value, data: data }, self);
                self.attr(data.attr);
                self.init(data.props);
            });
        },
        get: function () {
            return this._name;
        }
    }
}


RemoteSvg.attribute = {
    src: {
        set: function (value) {

        },
        get: function () {

        },
        remove: function () {

        }
    }
}

RemoteSvg.__cache__ = {};

RemoteSvg.__div_parser__ = document.createElement('div');

RemoteSvg.loadIcon = function (path) {
    if (RemoteSvg.__cache__[path]) {
        return RemoteSvg.__cache__[path]
    }
    else {
        RemoteSvg.__cache__[path] = XHR.getRequest(path, 'text').then(function (result) {
            RemoteSvg.__div_parser__.innerHTML = result;

            var svgElt = $('svg', RemoteSvg.__div_parser__);
            var res = {
                attr: {},
                props: {}
            };
            if (svgElt) {
                Array.prototype.forEach.call(svgElt.attributes, function (attribute) {
                    res.attr[attribute.name] = attribute.value;
                });
                res.props.innerHTML = svgElt.innerHTML;
            }
            return res;

        }, function () {
            return {};
        });
        return RemoteSvg.__cache__[path] ;
    }

};


Acore.install('remotesvg', RemoteSvg);


export default RemoteSvg;
