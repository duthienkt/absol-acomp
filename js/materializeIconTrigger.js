import Dom from "absol/src/HTML5/Dom";
import ACore from "../ACore";
import ResizeSystem from "absol/src/HTML5/ResizeSystem";

export default function materializeIconTrigger() {
    Dom.documentReady.then(function () {
        var linkMaterial = ACore.$('link', document.head, function (elt) {
            if (elt.href && elt.href.indexOf('Material+Icons')) return true;
        });
        if (!linkMaterial) return;
        var checkInv = -1;

        function onLoaded() {
            if (checkInv > 0) {
                clearTimeout(checkInv);
                checkInv = -1;
            }
            linkMaterial.off('loaded', onLoaded)
                .off('load', onLoaded)
                .off('error', onLoaded);
            i.remove();

            requestAnimationFrame(function () {
                ResizeSystem.update();
                if (document.cookie.indexOf('absol_debug') >= 0) {
                    console.info('Resize after MaterialIcons load');
                }
            });
        }

        linkMaterial.on('loaded', onLoaded)
            .on('load', onLoaded)
            .on('error', onLoaded);
        var i = ACore._({
            tag: 'i',
            class:"material-icons",
            style: {
                fontSize: '14px',
                position: 'fixed',
                top: '0',
                left: '0',
                zIndex: '-1000',
                visibility: 'hidden'
            },
            child: { text: 'account_balance_wallet' }
        }).addTo(document.body);
        var iBox = i.getBoundingClientRect();
        if (iBox.width < iBox.height * 3) {
            onLoaded();
            return;
        }
        var intervalCount = 50;
        checkInv = setInterval(function () {
            intervalCount--;
            if (intervalCount < 0) {
                onLoaded();
            }
            iBox = i.getBoundingClientRect();
            if (iBox.width < iBox.height * 3) {
                onLoaded();
            }
        }, 200);
    });
}

