const path = require('path');
const webpack = require('webpack');
const os = require('os');

var packages = {
    default: {
        entry: ["./dev.js"],
        filename: "./dist/absol-acomp.js"
    }
}

var package = Object.assign({}, require("./package.json"));
package.buildPCName = os.hostname();
package.buildFolder = __dirname;
package.buildTime = new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString();

delete package.scripts;
delete package.devDependencies;
delete package.main;


const PACKAGE = 'default';


module.exports = {
    mode: process.env.MODE || "development",
    // mode: 'production',
    entry: packages[PACKAGE].entry,
    output: {
        path: path.join(__dirname, "."),
        filename: packages[PACKAGE].filename
    },
    resolve: {
        modules: [
            path.join(__dirname, './node_modules')
        ],
        fallback: {
            fs: false,
            path: require.resolve("path-browserify"),
            buffer: require.resolve("buffer/"),
            "util": false,
            semver:false,
            "assert": require.resolve("assert/")
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: { presets: [['@babel/preset-env', { modules: false }]] }
            },
            {
                test: /\.(tpl|txt|xml|rels)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }
        ]
    },
    optimization: {
        minimize: false
    },
    devServer: {
        compress: true,
        disableHostCheck: true,
        host: '0.0.0.0'
    },
    performance: {
        hints: false
    },
    plugins: [
        new webpack.DefinePlugin({
            PACKAGE: JSON.stringify(package)
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
        })
    ]
};