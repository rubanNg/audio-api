import { Injectable } from "@nestjs/common";
import puppeteer, { Browser, Page } from 'puppeteer'

@Injectable()
export class BrowserService {

  private _browser: Browser = null;

  async browser() {
    if (this._browser === null) {
      console.log("WARN!! launch");
      this._browser = await puppeteer.launch();
    }
    return this._browser;
  }

  async getPageHtml(url: string, waitResponse: (response?: puppeteer.HTTPResponse) => Promise<boolean>) {

    const page = await (await this.browser()).newPage();

    return new Promise<{ html: string, response: any }>(async (resolve) => {
      if (typeof waitResponse === 'function') {
        page.on('response', async (httpResponse) => {
          if (await waitResponse(httpResponse) === true) {
            resolve({ html: await page.content(), response: await httpResponse.json() });
          }
        });
        await page.goto(url, { waitUntil: ['domcontentloaded'] });
      } else {
        await page.goto(url, { waitUntil: ['domcontentloaded'] });
        resolve({ html: await page.content(), response: null });
      }
    }).then(async response => {
      try {
        const pages = await this._browser.pages();
        if (pages.length > 1) await page.close();
      } catch (error) {
        
      } finally {
        return response;
      }
    })
  }
}