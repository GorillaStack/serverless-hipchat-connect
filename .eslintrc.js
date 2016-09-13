module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
      "arrow-parens": ["error", "as-needed"],
      "no-underscore-dangle": ["error", { "allow": ["_this", "_id"] }],
    },
};
