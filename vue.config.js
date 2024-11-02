module.exports = {
  productionSourceMap: process.env.USER_BRANCH === 'dev'? true:false, // ソースマップはdev環境のみ
  // pdfダウンロード用
  configureWebpack: {
    devtool: 'source-map',
      module: {
        rules: [
          {
            test: /\.(pdf)(\?.*)?$/,
            use: [
              {
                loader: 'url-loader',
                options: {
                  name: 'files/[name].[hash:8].[ext]'
                }
              }
            ]
          }
        ]
      }
    },
    devServer:{
        public: process.env["C9_PID"] + ".vfs.cloud9.ap-northeast-1.amazonaws.com"
    },

    // タイトル設定
    pages: {
        index: {
          entry: "src/main.js",
          title: "Business Partner Communication System",
        }
    },
    
    // faviconパス
    pwa: {
        iconPaths: {
          favicon32: 'favicon.ico',
        }
    },

    transpileDependencies: [
      'vuetify'
    ],

  chainWebpack: config => {
    config.plugins.delete('pwa');
    config.plugins.delete('workbox');
  }
};
