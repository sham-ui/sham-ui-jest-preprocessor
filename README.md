# sham-ui-jest-preprocessor

## Install
```
npm install sham-ui-jest-preprocessor -D
```

### Jest config
```
"jest": {
    "transform": {
        "^.+\\.sht$": "sham-ui-jest-preprocessor",
        "^.+\\.js$": "babel-jest"
    },
}
```