import { Injectable } from "@nestjs/common";
import { I18nContext, I18nService } from "nestjs-i18n";

@Injectable()
export class I18NService {
  constructor(private readonly i18n: I18nService) {}

  getMessage(key: string, lang?: string, replacePattern?: object): string {
    try {
      if (key === "" || key.indexOf(" ") > -1) return key;

      const _lang = lang ? lang : I18nContext.current().lang ? I18nContext.current().lang : "en";
      let message: string = this.i18n.t(key, { lang: _lang });
      message = this.handleReplacePattern(message, replacePattern);

      return message;
    } catch (e) {
      return "";
    }
  }

  private handleReplacePattern(text: string, replacePattern: object): string {
    if (replacePattern)
      for (const property of Object.keys(replacePattern)) {
        const regSearchPattern = "\\b" + property + "\\b";
        text = String(text).replace(new RegExp(regSearchPattern, "g"), replacePattern[property]);
      }

    return text;
  }
}

