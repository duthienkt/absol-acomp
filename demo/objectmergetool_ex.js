var descriptor = {
    type: 'struct',
    fields: [
        {
            type: 'string',
            name: 'user_name',
            displayName: 'Tên người dùng'
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
            type: 'file[]'
        }

    ]
}

exports.descriptor = descriptor;

var objects = Array(3);

objects[0] = {
    user_name: 'admin',
    avatar: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=2000',
    cv: 'https://absol.cf/CV/index.html',
    old: 22,
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
    attachments: ['https://absol.cf/share/Report_Asus.htm']
};


objects[1] = {
    user_name: 'admin_a',
    avatar: 'https://www.w3schools.com/howto/img_avatar2.png',
    cv: 'https://absol.cf/CV/index.html',
    old: 25,
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
    attachments: ['https://absol.cf/share/Report_Asus.htm']
};


objects[2] = {
    user_name: 'super_user',
    cv: 'https://absol.cf/CV/index.html',
    old: 22,
    position: 3824,
    sub_position: [3585, 3607],
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
    attachments: ['https://absol.cf/share/Report_Asus.htm', { url: 'https://absol.cf/share/The%20Gioi%20Hoan%20My%20-%20Than%20Dong%20(1).azw3' }]
};

exports.objects = objects;

