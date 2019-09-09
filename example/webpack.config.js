const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
	entry: {
		index: './example/index',
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
			'react-natural-store': path.join(__dirname, '..', 'src', 'index.ts'),
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
		new ForkTsCheckerWebpackPlugin({
			// tsconfig: './server/tsconfig.json',
			async: false,
			useTypescriptIncrementalApi: true,
			checkSyntacticErrors: true,
			silent: true,
			memoryLimit: 1024,
			compilerOptions: {
				"noEmit": true,
				"baseUrl": "./",                       /* Base directory to resolve non-absolute module names. */
				"paths": {
					"react-natural-store": ["src/index.ts"]
				},
			}
		}),
	],
};
