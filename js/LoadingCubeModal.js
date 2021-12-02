import ACore, {_, $} from "../ACore";
import {randomIdent} from "absol/src/String/stringGenerate";


/***
 * @extends Modal
 * @constructor
 */
function LoadingCubeModal() {

}

LoadingCubeModal.tag = 'LoadingCubeModal'.toLowerCase();

LoadingCubeModal.render = function () {
    return _({
        tag:'modal',
        class: 'as-loading-cube-modal',
        child: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto; background: rgb(241, 242, 243); display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">\n' +
            '<g transform="translate(26.666666666666668,26.666666666666668)">\n' +
            '  <rect x="-20" y="-20" width="40" height="40" fill="#13a9df">\n' +
            '    <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.3s"></animateTransform>\n' +
            '  </rect>\n' +
            '</g>\n' +
            '<g transform="translate(73.33333333333333,26.666666666666668)">\n' +
            '  <rect x="-20" y="-20" width="40" height="40" fill="#4be44c">\n' +
            '    <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.2s"></animateTransform>\n' +
            '  </rect>\n' +
            '</g>\n' +
            '<g transform="translate(26.666666666666668,73.33333333333333)">\n' +
            '  <rect x="-20" y="-20" width="40" height="40" fill="#e2d58b">\n' +
            '    <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="0s"></animateTransform>\n' +
            '  </rect>\n' +
            '</g>\n' +
            '<g transform="translate(73.33333333333333,73.33333333333333)">\n' +
            '  <rect x="-20" y="-20" width="40" height="40" fill="#e1e7e7">\n' +
            '    <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.1s"></animateTransform>\n' +
            '  </rect>\n' +
            '</g>\n' +
            '</svg>'
    });
};

LoadingCubeModal.share = {
    token: null,
    $elt: null
};

/***
 *
 * @return {String}
 */
LoadingCubeModal.show = function (){
    if (!LoadingCubeModal.share.$elt) LoadingCubeModal.share.$elt = _(LoadingCubeModal.tag);
    if (!LoadingCubeModal.share.$elt.isDescendantOf(document.body)){
        document.body.appendChild(LoadingCubeModal.share.$elt);
    }
    LoadingCubeModal.share.token = randomIdent(9);
    return LoadingCubeModal.share.token;
};

/***
 *
 * @param {String} token
 * @return {Boolean}
 */
LoadingCubeModal.close = function (token){
  if (LoadingCubeModal.share.$elt &&LoadingCubeModal.share.$elt.isDescendantOf(document.body) && (!token || token ===LoadingCubeModal.share.token)){
      this.share.$elt.remove();
      LoadingCubeModal.share.token  = null;
      return  true;
  }
  return  false;
};



ACore.install(LoadingCubeModal);

export default LoadingCubeModal;