import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpHandler } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { OrderComponent } from './admin/dashboard/order/order.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchPipe } from './search.pipe';
import * as $ from 'jquery';
import * as bootstrap from 'bootstrap';
import { ForgotComponent } from './admin/forgot/forgot.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserComponent } from './admin/dashboard/user/user.component';
import { OrderNewComponent } from './admin/dashboard/order/add/order-add.component';
import { CookieService } from 'ngx-cookie-service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { AboutComponent } from './about/about.component';
import { AppRoutingModule } from './app-routing.module';
import { NgxFileDropModule } from 'ngx-file-drop';

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        AdminComponent,
        OrderComponent,
        NavbarComponent,
        SearchPipe,
        ForgotComponent,
        UserComponent,
        OrderNewComponent,
        AboutComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        NgxSpinnerModule,
        AppRoutingModule,
        NgxFileDropModule,
    ],
    providers: [CookieService, {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
    }],
    bootstrap: [AppComponent]
})
export class AppModule { }
