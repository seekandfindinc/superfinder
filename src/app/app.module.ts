import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AppComponent } from "./app.component";

const appRoutes: Routes = [{
	path: "admin",
	component: AppComponent
},{
	path: "",
	redirectTo: "/admin",
	pathMatch: "full"
}];


@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(appRoutes,{enableTracing: true})
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }