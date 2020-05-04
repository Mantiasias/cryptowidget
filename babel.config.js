module.exports = {
  "presets": [
    "module:metro-react-native-babel-preset",
  ],
  "plugins": [
    "@babel/plugin-transform-runtime",
    "babel-plugin-transform-class-properties",
    [
      "@babel/plugin-proposal-decorators",
      { "legacy": true }
    ],
    [
      "@babel/plugin-proposal-class-properties",
    ]
  ],
  "env": {
    "development": {
      "plugins": ["@babel/plugin-transform-react-jsx-source"]
    }
  }
}
