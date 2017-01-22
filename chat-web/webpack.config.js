/**
 * @file webpack設定スクリプト。
 */
module.exports = {
    entry: './public/app/main.ts',
	output: {
		path: __dirname + '/public',
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ["", ".ts", ".tsx", ".js"]
	},
	module: {
		loaders: [
			{ test: /\.tsx?$/, loader: "ts-loader" }
		]
	},
	externals: {
	},
	watchOptions: {
		poll: 1000
	}
};