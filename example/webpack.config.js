const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: {
		index: './example/index.jsx',
	},
	output: {
		path: path.join(__dirname, 'dist'),
	},
	mode: 'development',
	devtool: '#cheap-module-eval-source-map',
	devServer: {
		open: true,
		progress: true,
		// host: '192.168.28.38',
	},
	resolve: {
		extensions: ['.js', '.jsx', '.ts', '.tsx'],
		// import导入时别名
		alias: {
			'react-natural-store': path.join(__dirname, '..', 'dist', 'index.js'),
		}
	},
	module: {
		rules: [
			{
				test: /\.(ts|tsx|js|jsx)$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: 'react-natural-store',
			filename: 'index.html',
			template: './example/index.html',
			// inject: true,
		}),
	],
};
