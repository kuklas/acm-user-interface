/* eslint-disable @typescript-eslint/no-var-requires */

import { merge } from 'webpack-merge';
import common from './webpack.common.js';
import { stylePaths } from './stylePaths.js';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserJSPlugin from 'terser-webpack-plugin';

export default merge(common('production'), {
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { mergeLonghand: false }],
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Separate vendor code into its own bundle
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },
        // Separate PatternFly components
        patternfly: {
          test: /[\\/]node_modules[\\/]@patternfly[\\/]/,
          name: 'patternfly',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Separate Victory/charting libraries
        charts: {
          test: /[\\/]node_modules[\\/](victory|d3)[\\/]/,
          name: 'charts',
          priority: 20,
          reuseExistingChunk: true,
        },
        // Extract CSS into fewer files
        styles: {
          name: 'styles',
          type: 'css/mini-extract',
          chunks: 'all',
          enforce: true,
        },
      },
    },
    runtimeChunk: 'single',
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].bundle.css',
      ignoreOrder: true, // Suppress CSS order warnings for dynamic imports
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        include: [...stylePaths],
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
});
