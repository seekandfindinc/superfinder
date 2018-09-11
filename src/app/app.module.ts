import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
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
import { InvoiceComponent } from './invoice/invoice.component';

const appRoutes: Routes = [{
	path: "admin",
	component: LoginComponent
},{
	path: "admin/dashboard",
	component: DashboardComponent,
	canActivate: [AuthGuard]
},{
	path: "admin/dashboard/order/:orderid",
	component: OrderComponent,
	canActivate: [AuthGuard]
},{
	path: "admin/users",
	component: UserComponent,
	canActivate: [AuthGuard]
},{
	path: "admin/invoices",
	component: InvoiceComponent,
	canActivate: [AuthGuard]
},{
	path: "admin/user/forgot",
	component: ForgotComponent
},{
	path: "",
	redirectTo: "/admin",
	pathMatch: "full"
}];

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
		InvoiceComponent
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(appRoutes,{enableTracing: false}),
		HttpClientModule,
		FormsModule,
		NgbModule,
		NgxSpinnerModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }