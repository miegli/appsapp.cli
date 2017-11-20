module.exports = {
    entry: './src/pages/home/home.ts',
    output: {
        filename: 'test.js'
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['.ts', '.tsx', '.js']
    },
    target: 'node',
    module: {

        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader?{ "stage": 0, "optional": ["runtime"] }'
            }
        ],

        rules: [
            {
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ]
            }
        ]
    }
}