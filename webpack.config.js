module.exports = {
	entry: './app/scripts/app.js',
	devtool: 'eval',
	output: {
		path: require("path").resolve("./.tmp/scripts/"),
		filename: 'app.js',
	},
	module: {
	    preLoaders: [{
			test: /\.json$/,
			loader: 'json'
		}],
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel-loader',
		    query: {
		        presets: ['es2015']
		    }
		}]
	},
}
