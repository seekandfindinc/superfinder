import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
	isOrder: boolean = true;
	constructor(private router: Router) { }
	ngOnInit() {
		if(this.router.url === "/admin/dashboard"){
			this.isOrder = false;
		}
	}
	logout(){
		localStorage.removeItem("currentUser");
		this.router.navigate(["/admin"]);
	}
}
