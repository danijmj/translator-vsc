import {
  window as vswindow,
  commands,
  Range,
  workspace,
  QuickPickItem,
} from "vscode";
import { josa } from 'josa'
import { Observable } from "rxjs/Observable";
import { pipe } from "rxjs/Rx";
import { from } from "rxjs/observable/from";
import { filter, map, mergeMap, retry } from "rxjs/operators";
import "rxjs/add/observable/throw";

export interface TranslatorOptions {
  lang: string,
  langName: string,
  detail?: string,
  active?: boolean
  quickPickItem?: QuickPickItem
}

export interface TranslatorResult {
  source: string,
  target: string,
  translatedText: string,
  itemList?: QuickPickItem[]
}

export interface TranslatorRule {
  lang: string,
  langName: string,
  detail?: string,
  active?: boolean
}

export interface TranslatorConfig {
  type: string;
  naver?: {
    clientId: string;
    clientSecret: string;
  },
  rules?: TranslatorRule[];
}

export class Translator {
  /**
   * Get the configuration of possible target translations
   * @param text Text to translate
   * @returns The list of possible traductions
   */
  public get(text: string): TranslatorOptions[] {
    const config = workspace.getConfiguration("translator-vsc");
    const apiConfig = config[config.type];
    const hasProperty = !apiConfig || Object.keys(apiConfig).every(v => !!apiConfig[v]);


    if (hasProperty) {
      // const isKo = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);
      
      /* return this[`${config.type}API`](text, config)
        .pipe(
          map((data: TranslatorResult) => {
            data.itemList = this.getItemList(text, data.translatedText, config);
            return data;
          }),
          retry(2)
        ); */
      
      vswindow.showInformationMessage('data translator-vsc-config:' + JSON.stringify(config))
      return this.getItemList(text, config)

    } else {
      // return _throw(`Please enter the API information of ${type}`);
      throw new Error(`${config.type}Please enter your API information`);
    }
  }

  /**
   * Method that translate the content.
   * Will call to the service depends of the configuration
   * @param text Text to translate
   * @param lang Lang to translate
   * @returns Observable<TranslatorResult> object with the result of the call
   */
  public translate(text, lang) : Observable<TranslatorResult> {
    const config = workspace.getConfiguration("translator-vsc");
    const apiConfig = config[config.type];
    const hasProperty = !apiConfig || Object.keys(apiConfig).every(v => !!apiConfig[v]);
    if (hasProperty) {
      return this[`${config.type}API`](text, config, lang)
      .pipe(
        map((data: TranslatorResult) => {
          return data;
        }),
        retry(2)
      );
    }
    else {
      // return _throw(`Please enter the API information of ${type}`);
      vswindow.showInformationMessage("We've found a error en la API call")
      return Observable.throw(`${config.type}Please enter your API information`);
    }
  }

  /**
   * Method to get the list of target languages to implement
   * @param text Texto to tralsate
   * @param config Config with the data
   * @returns array with the translator options
   */
  private getItemList(text: string, config): TranslatorOptions[] {
    const list: TranslatorOptions[] = []
    
    if (config.rules) {
      const prefixList: TranslatorOptions[] = config.rules.map((rule:TranslatorRule): TranslatorOptions => {
        const item: TranslatorOptions = {
          lang: rule.lang,
          langName: rule.langName,
          active: rule.active,
          detail: rule.detail,
          quickPickItem: {
            label: `Translate to ${rule.langName}`,
            description: josa(`Translate ${text.trim()} to ${rule.langName}`),
            detail: rule.detail || "",
          }
          
        };
        return item;
      });

      return list.concat(prefixList);
    } else {
      return list;
    }
  }

  /**
   * Config and call to the google API to get a translation
   * @param text Text to translate
   * @param config Config (not used)
   * @param lang target source
   * @returns 
   */
  private googleAPI(text: string, config,  lang): Observable<TranslatorResult> {
    const source = "auto"; // No stablished
    const target = lang; // target source
    const url = `https://translate.google.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&hl=${target}&dt=bd&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=${encodeURI(text)}`;
    
    vswindow.showInformationMessage('url:' + JSON.stringify(url))
    return from(fetch(url))
      .pipe(
        filter((res: Response) => res.ok),
        mergeMap((res: Response) => from(res.json())),
        map(msg => ({
            source,
            target,
            translatedText: msg.sentences.map(v => v.trans).join("")
          })
        ),
      );
  }

  /**
   * Config and call to the naver API to get a translation
   * @param text Text to translate
   * @param config Config (not used)
   * @param lang target source
   * @returns 
   */
  private naverAPI(text: string, config, lang: string): Observable<TranslatorResult>  {
    const body = {
      source: "",
      target: lang,
      text
    };

    return from(fetch("https://openapi.naver.com/v1/papago/n2mt", {
      method: "POST",
      headers: new Headers({
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          'X-Naver-Client-Id': config.naver.clientId,
          'X-Naver-Client-Secret': config.naver.clientSecret,
      }),
      body: Object.keys(body).map(v => `${v}=${encodeURI(body[v])}`).join("&"),
    }))
    .pipe(
        filter((res: Response) => res.ok),
        mergeMap((res: Response) => from(res.json())),
        map(msg => {
          const result = msg.message.result;
          return {
            source: result.srcLangType,
            target: result.tarLangType,
            translatedText: result.translatedText
          };
        }),
    );
  }
}