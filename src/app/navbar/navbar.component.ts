import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
	isOrder: boolean = true;
	new_password: string;
	new_password_confirm: string;
	constructor(private router: Router, private http: HttpClient) { }
	ngOnInit() {
		if(this.router.url === "/admin/dashboard"){
			this.isOrder = false;
		}
	}
	logout(){
		localStorage.removeItem("currentUser");
		this.router.navigate(["/admin"]);
	}
	savePassword(){
		if(this.new_password === this.new_password_confirm){
			this.http.put("/api/user",{
				id: JSON.parse(localStorage.currentUser).id,
				password: this.new_password
			}).subscribe((val) => {
				$("#resetPasswordModal").modal("hide");
				alert("Password Changed!")
				console.log("PUT call successful value returned in body", val);
			}, response => {
				console.log("PUT call in error", response)
			}, () => {
				console.log("The PUT observable is now completed.");
			});
		}
		else{
			alert("Passwords must match");
		}
	}
}