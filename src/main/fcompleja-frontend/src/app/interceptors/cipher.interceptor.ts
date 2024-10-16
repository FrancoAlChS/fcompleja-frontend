
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AESencryptionService } from '../service/AESencryption.service';
import { CONTENT_TYPE } from 'src/app/common';

export class CipherInterceptor implements HttpInterceptor {


  constructor(
    private aeSencryptionService: AESencryptionService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!request.url.match('/token')
      && !request.url.match('./assets/i18n/en.json')
      && !request.url.match('/loginWeb')
    ) {
      if (request.headers.get('Content-Type') &&
        request.headers.get('Content-Type').toUpperCase().startsWith(CONTENT_TYPE.JSON.toUpperCase())) {
        request = request.clone({
          body: {
            data: this.aeSencryptionService.set(request.body)
          }
        });
      }
    }
    return next.handle(request);
  }

}
