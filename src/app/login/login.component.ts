import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
	login_email: string;
	register_email: string;
	forgot_email: string;
	password: string;
	first_name: string;
	last_name: string;
	constructor(private http: HttpClient, private router: Router) { }
	ngOnInit() {
	}
	newUserSubmit() {
		this.http.post("/api/register", {
			email: this.register_email,
			first_name: this.first_name,
			last_name: this.last_name,
		}).subscribe((val) => {
			alert("User Registered. Password will be emailed shortly. Once approved you will be notified.");
			console.log("POST call successful value returned in body", val);
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
	loginSubmit(){
		this.http.get("/api/user", {
			params: {
				email: this.login_email,
				password: this.password
			}
		}).subscribe((val) => {
			console.log("GET call successful value returned in body", val);
			if(val){
				localStorage.setItem("currentUser", JSON.stringify(val));
				this.router.navigate(["/admin/dashboard"]);
			}
			else{
				alert("Try again. Invalid Login");
			}
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
	forgotSubmit(){
		this.http.post("/api/user/forgot", {
			email: this.forgot_email
		}).subscribe((val) => {
			console.log("GET call successful value returned in body", val);
			if(val){
				alert("If you email is valid then a reset link will be sent.");
			}
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
}
