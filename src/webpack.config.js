module.exports = {
    entry: {
        kreis: "./kreis.ts",
        test: "./test.ts"
    },
    devtool: 'inline-source-map',
    output: {
        path: __dirname.slice(0, -3) + "build",
        filename: "[name].js"
    },
    optimization: {
        minimize: false
    },
    mode: "development",
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    }
};