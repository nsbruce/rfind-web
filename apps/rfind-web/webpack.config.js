const CopyPlugin = require("copy-webpack-plugin");

module.exports = (config, context) => {

    return {
        ...config,
        plugins: [
            ...config.plugins,
            new CopyPlugin({
                patterns: [
                    { from: "src/index.html", to: "" },
                    { from: "../../node_modules/scichart/_wasm/scichart2d.data", to: "" },
                    { from: "../../node_modules/scichart/_wasm/scichart2d.wasm", to: "" }
                ]
            })
        ]
    }
};