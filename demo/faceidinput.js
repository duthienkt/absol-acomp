const supported = (() => {
    try {
        if (typeof WebAssembly === "object"
            && typeof WebAssembly.instantiate === "function") {
            const module = new WebAssembly.Module(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
            if (module instanceof WebAssembly.Module)
                return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
        }
    } catch (e) {
    }
    return false;
})();

absol._({
    style:{
        color:supported?'blue':'red',
        padding:'10px',
    },
    child:{text: supported ? "WebAssembly is supported" : "WebAssembly is not supported"}
}).addTo(document.body);



absol._({
    tag: 'flexiconbutton',
    props: {
        text: 'Kiểm tra camera',
    },
    style:{
        margin: '10px'
    },
    on: {
        click: function () {
            navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user'
                },
                audio: false
            }).then(stream => {

                const video = document.createElement('video');
                video.autoplay = true;
                video.muted = true;
                video.playsInline = true;
                video.srcObject = stream;
                video.style.width = '300px';
                video.style.height = 'auto';
                document.body.appendChild(video);

            })

                .catch(function (e) {
               absol._({
                   style:{
                       color:'red',
                   },
                   child:{text: "Error:" + e.message}
               }).addTo(document.body);
            });
        }
    }
}).addTo(document.body);



var b1 = absol._({
    tag: 'flexiconbutton',
    props: {
        text: 'Đăng kí Face ID',
    },
    style:{
        margin: '10px'
    },
    on: {
        click: function () {
            absol.faceid.openFaceIdEnrollmentDialog({verification: true, avatar: true})
                .then(resp => {
                    //console.log(resp);

                    if (resp.success) {
                        var url = URL.createObjectURL(resp.verificationImage);
                        window.open(url, '_blank')
                       // absol.FileSaver.saveAs(resp.verificationImage);
                        localStorage.setItem('face_recorded', JSON.stringify(resp.vectors));
                    }
                });
        }
    }
}).addTo(document.body);

//b1.click();

absol._({
    tag: 'br'
}).addTo(document.body);

absol._({
    tag: 'flexiconbutton',
    props: {
        text: 'Xác thực bằng Face ID',
    },
    style:{
        margin: '10px'
    },
    on: {
        click: function () {
            var data;
            try {
                data = JSON.parse(localStorage.getItem('face_recorded'));
            } catch (e) {
                data = null;
            }
            console.log(data)
            if (data)
                absol.faceid.openFaceIdAuthenticationDialog({
                    vectors: data,
                    verification: true
                    // vectors:'https://absol.cf/me/files/faceid_XWnqy.dat'
                }).then(resp => {
                    console.log(resp)
                    if (resp.success) {
                        absol.FileSaver.saveAs(resp.verificationImage);

                        absol.require('snackbar').show('Xác thực thành công');
                    }
                    else {
                        absol.require('snackbar').show('Xác thực thất bại '+ (resp.score * 100).toFixed(2) + '%');
                    }
                });
        }
    }
}).addTo(document.body);
//
// var fvi = absol._({
//     tag:'faceidverificationimage',
//     props:{
//         src:'https://absol.cf/me/files/verification_wmEox.jpg'
//     }
// }).addTo(document.body);
//

