const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require("fs");
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const MAIN_TITLE = "DemoHut";

const subjs = [
    { name: "subj-rgb565", title: "RGB565", year: 2021 },
    { name: "subj-mem", title: "Memory mountain", year: 2021 },
    { name: "subj-mwt", title: "Minimum weight triangulation", year: 2021 },
    { name: "subj-pan", title: "Panning gesture", year: 2021 },
    { name: "subj-meanshift", title: "Meanshift", year: 2020 },
    { name: "subj-shadows", title: "A glimpse into shadows", year: 2020 },
    { name: "subj-envmap", title: "Environment mapping", year: 2020 },
    { name: "subj-wangzai", title: "旺仔与巨像", year: 2020 },
    { name: "subj-sudoku-gen", title: "Sudoku generator", year: 2020 },
    { name: "subj-bump-mapping", title: "Bump mapping", year: 2020 },
    { name: "subj-basic-shading", title: "Basic shading", year: 2020 },
    { name: "subj-log-scaling", title: "Logarithmic scaling", year: 2020 },
    { name: "subj-a-star", title: "A*", year: 2020 },
    { name: "subj-compression", title: "Compression 101", year: 2020 },
    { name: "subj-anim-curve", title: "Reverse-engineer animation curve", year: 2020 },
    { name: "subj-transparent-color", title: "Transparent color matters", year: 2020 },
    { name: "subj-frame-sync", title: "Frame synchronization issues", year: 2020 },
    { name: "subj-skdlq-linkage", title: "连杆系统", year: 2019 },
    { name: "subj-skdlq-buffon", title: "蒲丰投针实验", year: 2019 },
    { name: "subj-skdlq-cwidth", title: "定宽曲线", year: 2019 },
    { name: "subj-skdlq-mandelbrot", title: "Mandelbrot集", year: 2019 },
    { name: "subj-skdlq-eulerline", title: "欧拉线", year: 2019 },
    { name: "subj-skdlq-ekg", title: "心电图数列", year: 2019 },
    { name: "subj-skdlq-golden", title: "黄金分割", year: 2019 },
    { name: "subj-oblique-text", title: "斜着看的文字", year: 2019 },
    { name: "subj-persp-vs-ortho", title: "透视与正交", year: 2019 },
    { name: "subj-ndc", title: "NDC curve", year: 2019 },
    { name: "subj-fov-and-zoom", title: "FOV and zoom", year: 2019 },
    { name: "subj-fov-and-speed", title: "FOV and speed", year: 2019 },
    { name: "subj-quaternions", title: "Quaternion", year: 2019 },
];

function gen_entry() {
    let entry = {
        main: './src/main.js',
    };
    for (subj of subjs) {
        let filename = './src/subjs/' + subj.name + '/' + subj.name + '.js';
        if (fs.existsSync(filename)) {
            entry[subj.name] = filename;
        }
    }
    return entry;
}

module.exports = {
    mode: 'development',
    entry: gen_entry(),
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.pug$/,
                use: 'pug-loader'
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader',],
            },
            {
                test: /\.(vert|frag)/i,
                use: ['raw-loader',],
            },
        ]
    },
    plugins:
        [...subjs.map(subj => new HtmlWebpackPlugin({
            inject: false,
            filename: 'subjs/' + subj.name + '/' + subj.name + '.html',
            template: './src/subjs/' + subj.name + '/' + subj.name + '.pug',
            templateParameters: {
                subj_title: subj.title,
                head_title: subj.title + " - " + MAIN_TITLE,
                backLink: '/demohut/',
                srcLink: 'https://github.com/ZhujinLi/demohut/tree/master/src/subjs/' + subj.name,
            }
        }))].concat([
            new HtmlWebpackPlugin({
                inject: false,
                filename: 'index.html',
                template: './src/index.pug',
                templateParameters: {
                    subjs_2021: subjs.filter(subj => subj.year == 2021),
                    subjs_2020: subjs.filter(subj => subj.year == 2020),
                    subjs_2019: subjs.filter(subj => subj.year == 2019),
                    head_title: MAIN_TITLE,
                    srcLink: "https://github.com/ZhujinLi/demohut",
                },
            }),
            new MiniCssExtractPlugin(),
            new CleanWebpackPlugin(),
            new CopyPlugin([
                {
                    from: 'src/libs',
                    to: 'libs/'
                },
                {
                    from: 'src/**/*.+(jpg|ico|png|mp4|html|obj|gltf|mtl|bin|json)',
                    to: './',
                    transformPath: (targetPath) => {
                        return path.relative('src/', targetPath);
                    }
                },
                // There's something wrong with path when using worker-loader...
                {
                    from: 'src/**/*.worker.js',
                    to: './',
                    transformPath: (targetPath) => {
                        return path.relative('src/', targetPath);
                    }
                }
            ]),
            new webpack.ProvidePlugin({
                THREE: 'three',
            }),
        ]),
    output: {
        filename: (chunkData) => {
            return chunkData.chunk.name === 'main' ? '[name].js' : 'subjs/[name]/[name].js';
        },
        path: path.resolve(__dirname, 'dist'),
    },
    resolve: {
        alias: {
            three$: 'three/build/three.min.js',
            'three/.*$': 'three',
        },
    },
    devServer: {
        https: true,
        host: '0.0.0.0',
        publicPath: '/demohut'
    },
};