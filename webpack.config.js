const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const fs = require("fs");
const webpack = require("webpack");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const MAIN_TITLE = "DemoHut";

const subjs = [
    { name: "subj-envmap", title: "Environment mapping" },
    { name: "subj-wangzai", title: "旺仔与巨像" },
    { name: "subj-sudoku-gen", title: "Sudoku generator" },
    { name: "subj-bump-mapping", title: "Bump mapping" },
    { name: "subj-basic-shading", title: "Basic shading" },
    { name: "subj-log-scaling", title: "Logarithmic scaling" },
    { name: "subj-a-star", title: "A*" },
    { name: "subj-compression", title: "Compression 101" },
    { name: "subj-anim-curve", title: "Reverse-engineer animation curve" },
    { name: "subj-transparent-color", title: "Transparent color matters" },
    { name: "subj-frame-sync", title: "Frame synchronization issues" },
    { name: "subj-skdlq-linkage", title: "《思考的乐趣》复现7. 连杆系统" },
    { name: "subj-skdlq-buffon", title: "《思考的乐趣》复现6. 蒲丰投针实验" },
    { name: "subj-skdlq-cwidth", title: "《思考的乐趣》复现5. 定宽曲线" },
    { name: "subj-skdlq-mandelbrot", title: "《思考的乐趣》复现4. Mandelbrot集" },
    { name: "subj-skdlq-eulerline", title: "《思考的乐趣》复现3. 欧拉线" },
    { name: "subj-skdlq-ekg", title: "《思考的乐趣》复现2. 心电图数列" },
    { name: "subj-skdlq-golden", title: "《思考的乐趣》复现1. 黄金分割" },
    { name: "subj-fib", title: "Fibonacci number" },
    { name: "subj-oblique-text", title: "斜着看的文字" },
    { name: "subj-persp-vs-ortho", title: "透视与正交" },
    { name: "subj-ndc", title: "NDC curve" },
    { name: "subj-fov-and-zoom", title: "FOV and zoom" },
    { name: "subj-fov-and-speed", title: "FOV and speed" },
    { name: "subj-quaternions", title: "Quaternion" },
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
                    subjs: subjs,
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
                    from: 'src/**/*.+(jpg|png|mp4|html|obj|gltf|mtl|bin|json)',
                    to: './',
                    transformPath: (targetPath) => {
                        return path.relative('src/', targetPath);
                    }
                },
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