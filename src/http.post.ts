import axios from 'axios';
import * as CryptoJS from "crypto-js";

const instance = axios.create({
    baseURL: 'https://akniga.org'
});

export class AudioKnigi {
    private async makeInitialRequest() {
        const headers = {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36'
        };

        return await instance.get("/", {headers});
    }

    private getBid(body: any) {
        const regex = /data-global-id\s?=\s?\"(\d{4,8})\"/;

        const match = body.match(regex);

        if (match && match.length > 1) {
            return match[1];
        }

        return null;
    }

    private getSecurityLSKey(body: any) {
        const regex = /,LIVESTREET_SECURITY_KEY\s?=\s?'(.*)',LANGUAGE/;

        const match = body.match(regex);

        if (match && match.length > 1) {
            return match[1];
        }

        return null;
    }

    private buildHash(security_ls_key: string) {
        const secretPassphrase = "EKxtcg46V";

        const encrypted = CryptoJS.AES.encrypt("\"" + security_ls_key + "\"", secretPassphrase);

        const ct = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
        const iv = encrypted.iv.toString();
        const s = encrypted.salt.toString();

        const values = {
            ct: ct,
            iv: iv,
            s: s
        };

        return encodeURIComponent(JSON.stringify(values));
    }

    private getTracks(bid: string, security_ls_key: string, hash: any, cookie: string): any {
        let data = `bid=${bid}&hash=${hash}&security_ls_key=${security_ls_key}`;


        const headers = {
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.86 Safari/537.36',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'cookie': cookie
        };
        
        return axios.post(`https://akniga.org/ajax/b/${bid}`, data, {headers});
    }

    public async run(path: string) {


      const response1 = await this.makeInitialRequest();

      const cookie = response1.headers['set-cookie'][0];


      let security_ls_key = this.getSecurityLSKey(response1.data);


      const response2 = await instance.get(path);

      const bid = "74417" //this.getBid(response2.data);

      const hash = this.buildHash(security_ls_key);


      const response3 = await this.getTracks(bid, security_ls_key, hash, cookie);

    }
}