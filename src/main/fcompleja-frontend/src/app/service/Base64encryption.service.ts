import {Injectable} from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class Base64encryptionService {

  constructor() {
  }

  //The set method is use for encrypt the value.
  set(value) {
    var base64 = btoa(JSON.stringify(value));
    return base64;
  }

  //The get method is use for decrypt the value.
  get(value) {
    if (value.data != undefined) {
      const encrypted = value.data;
      
      const encryptedWord = CryptoJS.enc.Base64.parse(encrypted);
      const decrypted = CryptoJS.enc.Utf8.stringify(encryptedWord);
      return JSON.parse(decrypted);
    }
    return value;
  }
}
