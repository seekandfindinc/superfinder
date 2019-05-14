import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HttpHandler } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppComponent } from "./app.component";
import { AuthGuard } from './auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SearchPipe } from './search.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import * as $ from "jquery";
import * as bootstrap from "bootstrap";
import { ForgotComponent } from './forgot/forgot.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserComponent } from './user/user.component';
import { OrderNewComponent } from './order-new/order-new.component';
import { CookieService } from 'ngx-cookie-service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';
import { MarketingComponent } from './marketing/marketing.component';
import { AppRoutingModule } from './app-routing.module';
import { FileDropModule } from 'ngx-file-drop';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		LoginComponent,
		OrderComponent,
		NavbarComponent,
		SearchPipe,
		ForgotComponent,
		UserComponent,
		OrderNewComponent,
		MarketingComponent
	],
	imports: [
		BrowserModule,
		HttpClientModule,
		FormsModule,
		NgbModule,
		NgxSpinnerModule,
		AppRoutingModule,
		FileDropModule
	],
	providers: [CookieService, {
		provide: HTTP_INTERCEPTORS,
		useClass: TokenInterceptor,
		multi: true
	}],
	bootstrap: [AppComponent]
})
export class AppModule { }