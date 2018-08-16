import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";


@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.css"]
})
export class AppComponent {
	title = "Seek and Find";
	url = "http://localhost:3000/api/";
	public email: string;
	public password: string;
	public user: any;
	constructor(private http: HttpClient) { }
	newUserSubmit() {
		this.http.post(this.url + "register", {
			email: this.email
		}).subscribe((val) => {
			console.log("POST call successful value returned in body", val);
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
	loginSubmit(){
		this.http.get(this.url + "user", {
			params: {
				email: this.email,
				password: this.password
			}
		}).subscribe((val) => {
			console.log("GET call successful value returned in body", val);
			this.user = val;
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
}