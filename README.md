# translator

A vscode plugin to translate to specified languages.  

## Features
- Translates to differents languages  
  ![enToKor](https://github.com/sculove/translator/raw/master/images/enToKor.gif)
  
> ### Shortcuts
> - MacOS: `Cmd + shift + t`
> - Window: `Ctrl + shift + t`

## Translate API

You can use limited Google Translate API. (default)   

If you want to use Papago Translate API of NAVER, you need NAVER API key. 

### Naver API
- Free up to 10,000 per day  
- [NAVER API Registration Guide](https://github.com/sculove/translator/wiki/Register-NAVER-API)  
  [NAVER API 등록 가이드](https://github.com/sculove/translator/wiki/Register-NAVER-API)


## Extension Settings

* `translator.type`: translate API type (google, naver). default is google
* `translator.rules`: suggest prefix rules
* `translator.naver.clientId`: Naver API ClientID
* `translator.naver.clientSecret`: Naver API clientSecret

```js
  // ...

    {
        "lang": "es",
        "langName": "Español",
        "detail": "Traducir al español",
    },
    {
        "lang": "en",
        "langName": "English",
        "detail": "English tranlation",
    },
    "translator.naver.clientId": "Naver API clientID",
    "translator.naver.clientSecret": "Naver API clientSecret",
```


## Release Notes

### 1.1.0

- add google translate API (default)
- change shortcut from `cmd + alt + t` to `cmd + shift + t` on MacOS
- change shortcut from `ctrl + alt + t` to `ctrl + shift + t` on Window

### 1.0.0

Initial release of Translator.
