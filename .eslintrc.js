module.exports = {
  "env": {
      "browser": true,
      "node": true,
      "es2022": true,
      "jest": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
}
