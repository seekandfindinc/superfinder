import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(private cookieService: CookieService) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.cookieService.get('user')) {
            request = request.clone({
                setHeaders: {
                    Authorization: 'Bearer ' + this.cookieService.get('user')
                }
            });
        }
        return next.handle(request);
    }
}
