var descriptor = {
    type: 'struct',
    fields: [
        {
            type: 'string',
            name: 'user_name',
            displayName: 'Tên người dùng'
        },
        {
            type: 'bool',
            name: 'active',
            displayName: 'Đang hoạt động'
        },
        {
            type: 'color',
            name: 'fcolor',
            displayName: "Màu yêu thích"
        },
        {
            type: 'date',
            name: 'birthday',
            displayName: 'Ngày sinh'
        },
        {
            type: 'image',
            name: 'avatar',
            displayName: 'Ảnh đại diện',

        },
        {
            type: 'file',
            name: 'cv',
            displayName: 'CV'
        },
        {
            type: 'enum',
            name: 'position',
            displayName: 'Bộ phận',
            items: require('./demo_tree_list')
        },
        {
            type: '{enum}',
            name: 'sub_position',
            displayName: 'Bộ phận dưới cấp',
            items: require('./demo_tree_list')
        },
        {
            type: 'number',
            name: 'old',
            displayName: "Tuổi"
        },
        {
            type: 'struct',
            name: 'contract',
            displayName: 'Liên hệ',
            fields: [
                {
                    name: 'address_book',
                    displayName: 'Sổ địa chỉ',
                    type: 'array',
                    of: {
                        type: 'string'
                    }
                },
                {
                    type: 'string',
                    name: 'phone',
                    displayName: 'Điện thoại'
                },
                {
                    type: "string",
                    name: 'email',
                    displayName: "E-Mail"
                }
            ]
        },
        {
            name: 'album',
            type: 'array',
            of: {
                type: 'image'
            }
        },
        {
            name: 'attachments',
            displayName: 'Danh sách tệp đính kèm',
            type: 'file[]'
        },
        {
            name: 'sd',
            displayName: 'Tự thuật',
            type: 'html'
        }

    ]
}

exports.descriptor = descriptor;

var objects = Array(3);

objects[0] = {
    user_name: 'admin',
    active: true,
    fcolor: 'red',
    avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000',
    cv: 'https://absol.cf/CV/index.html',
    old: 22,
    birthday: new Date(1995, 5, 13),
    position: 3824,
    sub_position: [3585, 3606],
    contract: {
        address_book: [
            '588 Ngô Đức Kế, p. Thắng Lợi, tp. Kon Tum',
            '666/64/37 Ba Tháng Hai, q.10, HCM'
        ],
        phone: '0363844698',
        email: 'bluesky2010@gmail.com'
    },
    album: [
        'https://absol.cf/share/DSC_6233.jpg',
        {
            url: 'https://absol.cf/share/8TEb9p4ec.jpg'
        }
    ],
    attachments: ['https://absol.cf/share/Report_Asus.htm'],
    sd: `<h3>Destination of the Month</h3><h4>Valletta</h4><figure class="image ck-widget image-style-side ck-widget_with-resizer" contenteditable="false"><img src="https://i.pinimg.com/originals/d8/a5/6d/d8a56dc32c91206ee4eac41635217e53.jpg" alt="Picture of a sunlit facade of a Maltan building."><figcaption class="ck-editor__editable ck-editor__nested-editable" data-placeholder="Enter image caption" contenteditable="true">It's siesta time in Valletta.</figcaption><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div></div><div class="ck ck-reset_all ck-widget__resizer" style="display: none;"><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div><div class="ck ck-size-view" style="display: none;"></div></div></figure><p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>`
};


objects[1] = {
    user_name: 'admin_a',
    active: false,
    fcolor: 'blue',
    avatar: 'https://www.w3schools.com/howto/img_avatar2.png',
    cv: 'https://absol.cf/CV/index.html',
    old: 25,
    birthday: new Date(1995, 5, 13),
    position: 3571,
    sub_position: [3604, 3605],
    contract: {
        address_book: [
            '57 Ngô Đức Kế, p. Thắng Lợi, tp. Kon Tum',
            '666/64/55 Ba Tháng Hai, q.10, HCM'
        ],
        phone: '0363844669',
        email: 'bluesky2011@gmail.com'
    },
    album: [
        {
            url: 'https://absol.cf/share/8TEb9p4ec.jpg'
        },
        'https://img.freepik.com/free-photo/cool-geometric-triangular-figure-neon-laser-light-great-backgrounds-wallpapers_181624-9331.jpg?w=2000'
    ],
    attachments: ['https://absol.cf/share/Report_Asus.htm'],
    sd: `<h3>Destination of the Month</h3><h4>Valletta</h4><figure class="image ck-widget image-style-side ck-widget_with-resizer" contenteditable="false"><img src="https://i.pinimg.com/originals/d8/a5/6d/d8a56dc32c91206ee4eac41635217e53.jpg" alt="Picture of a sunlit facade of a Maltan building."><figcaption class="ck-editor__editable ck-editor__nested-editable" data-placeholder="Enter image caption" contenteditable="true">It's siesta time in Valletta.</figcaption><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div></div><div class="ck ck-reset_all ck-widget__resizer" style="display: none;"><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div><div class="ck ck-size-view" style="display: none;"></div></div></figure><p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>`

};


objects[2] = {
    user_name: 'super_user',
    active: false,
    cv: 'https://absol.cf/CV/index.html',
    fcolor: 'cyan',
    old: 22,
    position: 3824,
    birthday: new Date(1995, 5, 13),
    sub_position: [3585, 3607],
    contract: {
        address_book: [
            '588 Ngô Đức Kế, p. Thắng Lợi, tp. Kon Tum',
            '666/64/37 Ba Tháng Hai, q.10, HCM',
            ''
        ],
        phone: '0363844698',
        email: 'bluesky2010@gmail.com'
    },
    album: [
        'https://absol.cf/share/DSC_6233.jpg',
        {
            url: 'https://absol.cf/share/8TEb9p4ec.jpg'
        }
    ],
    attachments: ['https://absol.cf/share/Report_Asus.htm', {url: 'https://absol.cf/share/The%20Gioi%20Hoan%20My%20-%20Than%20Dong%20(1).azw3'}],
    sd: `<h3>Destination of the Month</h3><h4>Valletta</h4><figure class="image ck-widget image-style-side ck-widget_with-resizer" contenteditable="false"><img src="https://i.pinimg.com/originals/d8/a5/6d/d8a56dc32c91206ee4eac41635217e53.jpg" alt="Picture of a sunlit facade of a Maltan building."><figcaption class="ck-editor__editable ck-editor__nested-editable" data-placeholder="Enter image caption" contenteditable="true">It's siesta time in Valletta.</figcaption><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Insert paragraph before block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Insert paragraph after block"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div></div><div class="ck ck-reset_all ck-widget__resizer" style="display: none;"><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-left"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-top-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-right"></div><div class="ck-widget__resizer__handle ck-widget__resizer__handle-bottom-left"></div><div class="ck ck-size-view" style="display: none;"></div></div></figure><p>The capital city of <a href="https://en.wikipedia.org/wiki/Malta">Malta</a> is the top destination this summer. It’s home to a cutting-edge contemporary architecture, baroque masterpieces, delicious local cuisine and at least 8 months of sun. It’s also a top destination for filmmakers, so you can take a tour through locations familiar to you from Game of Thrones, Gladiator, Troy and many more.</p>`
};

exports.objects = objects;

