module.exports = {
  extends: "airbnb-base",
  globals: {
    App: true,
    Page: true,
    wx: true,
    getApp: true
  },
  rules: {
    "new-cap": ["error", { "capIsNew": false }],
    "func-names": "off",
    "prefer-const": "off",
    "arrow-parens": ["error", "as-needed"],
    "no-unused-vars": "off",
    "semi": "off",
  }
};
