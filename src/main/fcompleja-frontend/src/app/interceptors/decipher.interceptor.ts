import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { AESencryptionService } from '../service/AESencryption.service';
import { Observable } from "rxjs";
import 'rxjs/add/operator/catch';
import { CONTENT_TYPE, MENSAJES} from '../common';
import { Router } from '@angular/router';
import { ErrorDialogService } from './errordialog.service';


export class DecipherInterceptor implements HttpInterceptor {

    constructor(
        private aeSencryptionService: AESencryptionService,
        private router: Router,
        private errorDialogService:ErrorDialogService,
    ) {
    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).map(event => {
            if (!request.url.match("/token")
                && !request.url.match("./assets/i18n/en.json")
                && !request.url.match("/loginWeb")
            ) {
                if (event instanceof HttpResponse) {
                    if (event.headers.get("Content-Type")) {
                        if (event.headers.get("Content-Type").startsWith(CONTENT_TYPE.JSON)) {
                            event = event.clone({ body: this.aeSencryptionService.get(event.body) })
                        }
                    }

                }
            }
            return event;
        }).catch((error: HttpErrorResponse) => {
            if (error.status === 401) {
                this.errorDialogService.openDialogMensaje(MENSAJES.FCOMPLEJA.NO_AUTORIZADO, null, true, false, null);
            } else if (error.status === 500) {
                return Observable.throw(error);
            } else {
                return Observable.throw(
                    new HttpErrorResponse({
                        error: { ...this.aeSencryptionService.get(error.error), status: error.status },
                        headers: error.headers,
                        status: error.status,
                        statusText: error.statusText,
                        url: error.url || undefined,
                    }),
                );
            }
        });
    }
}
