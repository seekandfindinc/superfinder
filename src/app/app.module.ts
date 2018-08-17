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
		SearchPipe
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(appRoutes,{enableTracing: false}),
		HttpClientModule,
		FormsModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }