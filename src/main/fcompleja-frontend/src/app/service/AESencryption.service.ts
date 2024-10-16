import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AES_KEY } from 'src/app/common';

@Injectable({
    providedIn: 'root'
})
export class AESencryptionService {

    private _keys: string = AES_KEY;

    constructor() {
    }

    get keys(): string {
        return this._keys;
    }

    set keys(value: string) {
        this._keys = value;
    }

    public sha256(value) {
        var key = CryptoJS.enc.Utf8.parse(this._keys);
        return CryptoJS.HmacSHA1(CryptoJS.enc.Utf8.parse(value.toString()), key);
    }

    //The set method is use for encrypt the value.
    set(value) {
        var json = JSON.stringify(value);
        var key = CryptoJS.enc.Utf8.parse(this._keys);
        var iv = CryptoJS.enc.Utf8.parse(this._keys);
        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(json.toString()), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        return encrypted.toString();
    }
    setValue(value) {        
        var key = CryptoJS.enc.Utf8.parse(this._keys);
        var iv = CryptoJS.enc.Utf8.parse(this._keys);
        var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
            {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

        return encrypted.toString();
    }

    //The get method is use for decrypt the value.
    get(value) {
        if (value != undefined) {
            if (value.data != undefined) {
                var key = CryptoJS.enc.Utf8.parse(this._keys);
                var iv = CryptoJS.enc.Utf8.parse(this._keys);
                var decrypted = CryptoJS.AES.decrypt(value.data, key, {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                try {
                    const data = CryptoJS.enc.Utf8.stringify(decrypted);
                    //
                    return JSON.parse(data.toString());
                } catch (e) {
                    
                }
            }
        }
        return value;
    }
    getValue(value) {
        if (value != undefined) {
            var key = CryptoJS.enc.Utf8.parse(this._keys);
            var iv = CryptoJS.enc.Utf8.parse(this._keys);
            var decrypted = CryptoJS.AES.decrypt(value, key, {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return CryptoJS.enc.Utf8.stringify(decrypted);
        }
        return value;
    }
}
