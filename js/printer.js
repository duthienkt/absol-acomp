import { PaperPrinter, ShareSerializer } from "absol/src/Print/printer";
import { saveAs } from "absol/src/Network/FileSaver";
import ACore, { _, $ } from "../ACore";
import Toast from "./Toast";
import { mergePdfs } from "absol/src/Print/pdf";
import ProgressBar from "./ProgressBar";

export function silentDownloadAsPdf(adapter) {
    if (!adapter) throw new Error("Invalid print data");
    adapter.parallel = adapter.parallel || 8;
    adapter.delay = adapter.delay || 0;
    adapter.chuckLength = 100;
    adapter.fileName = adapter.fileName || 'exports.pdf';
    if (adapter.paddingEven !== false) {
        adapter.paddingEven = true;
    }
    if (!adapter.fileName.toLowerCase().endsWith('.pdf')) adapter.fileName += '.pdf';
    var hiddenDiv = _({
        style: {
            overflow: 'scroll',
            visibility: 'hidden',
            opacity: 0,
            pointerEvents: 'none',
            position: 'fixed',
            zIndex: -1000,
        }
    }).addTo(document.body);
    var progressBar = _({
        tag: ProgressBar,
        style: {
            margin: '5px'
        }
    });
    var message = _({
        tag: 'span',
        style: {
            margin: '5px'
        },
        child: { text: 'Render' }
    });
    /***
     *
     * @type {Toast}
     */
    var toast = Toast.make({
        props: {
            htitle: "Export DPF"
        },
        child: [
            {
                tag: 'div',
                style: { margin: '5px' },
                child: {
                    tag: 'strong',
                    child: { text: adapter.fileName }
                }
            },
            message,
            progressBar
        ]
    });


    return new Promise(resolve => {
        var docs = adapter.docs.slice();
        var docsN = docs.length;
        var serializer = ShareSerializer;
        var chucks = [];

        var chuckRemain;
        var printer;

        var finish = () => {
            message.firstChild.data = "Create PDF";
            mergePdfs(chucks, pData => {
                progressBar.value = 0.9 + (pData.loaded + pData.merged) / (pData.all || 1) / 10;
            }).then(mergedPdf => {
                mergedPdf.save().then(file => {
                    saveAs(new Blob([file]), adapter.fileName);
                    progressBar.value = 1;
                    message.firstChild.data = "Complete";
                    setTimeout(() => {
                        toast.disappear();
                    }, 5000);
                });
            })
        }

        var nextChuck = () => {
            chuckRemain = Math.min(adapter.chuckLength, docs.length);
            printer = new PaperPrinter(Object.assign({ lastPagePaddingEven: docs.length <= chuckRemain }, adapter));
            process();
        }

        var finishChuck = () => {
            chucks.push(printer.pdfDoc.output('arraybuffer'));
            if (docs.length > 0) {
                nextChuck();
            }
            else {
                finish();
            }
        };

        var process = () => {
            message.firstChild.data = 'Render (' + (docsN - docs.length) + '/' + docsN + ')';
            var pg0 = 0.9 * (1 - docs.length / (docsN || 1));
            progressBar.value = pg0;
            if (chuckRemain === 0) {
                finishChuck();
                return;
            }

            var cDocs = docs.splice(0, Math.min(adapter.parallel, chuckRemain));
            chuckRemain -= cDocs.length;

            var localSync = cDocs.map(doc => {
                var ctn = _({
                    style: {
                        width: '2048px'
                    }
                }).addTo(hiddenDiv);

                var renderSync = doc.render(ctn, doc);
                if (renderSync && renderSync.then) {
                    renderSync = renderSync.then(() => Object.assign({}, doc, { elt: ctn.firstChild }));
                }
                else {
                    renderSync = Promise.resolve(Object.assign({}, doc, { elt: ctn.firstChild }));
                }
                return renderSync.then(doc => {
                    var delaySync = [];
                    delaySync.push(new Promise(resolve => {
                        setTimeout(resolve, adapter.delay);
                    }))
                    var elt = doc.elt;
                    if (elt.fmComponent) {
                        if (!doc.opt) doc.opt = {};
                        if (!doc.opt.margin) {
                            doc.opt.margin = {
                                top: elt.fmComponent.style.paddingTop || 57,
                                left: elt.fmComponent.style.paddingLeft || 57,
                                bottom: elt.fmComponent.style.paddingBottom || 57,
                                right: elt.fmComponent.style.paddingRight || 57
                            };
                        }
                        delaySync.push(elt.fmComponent.fragment.afterEntryCompleted());
                    }
                    return Promise.all(delaySync).then(() => doc);
                })
            });

            Promise.all(localSync).then(docList => {
                return serializer.serialize(docList, printer, (pData) => {
                    if (!pData.pdf) return;
                    var ng1 = pg0 + pData.pdf.done / (pData.pdf.all || 1) * cDocs.length / (docsN || 1) * 0.9;
                    if (ng1 - progressBar.value > 0.05) {
                        progressBar.value = ng1;
                    }
                });
            }).then(() => printer.flush())
                .then(() => process());
        };

        nextChuck();
    });
}