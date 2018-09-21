import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	selector: 'app-navbar',
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
	new_password: string;
	new_password_confirm: string;
	public order: any = {
		buyerFieldArray: [{
			name: null,
			address: null
		}],
		sellerFieldArray: [{
			name: null,
			address: null
		}]
	};
	public buyer_index: number = 0;
	public seller_index: number = 0;
	constructor(private router: Router, private http: HttpClient, private spinner: NgxSpinnerService) { }
	ngOnInit() {}
	logout(){
		localStorage.removeItem("currentUser");
		this.router.navigate(["/admin"]);
	}
	savePassword(){
		this.spinner.show();
		if(this.new_password === this.new_password_confirm){
			this.http.put("/api/user",{
				id: JSON.parse(localStorage.currentUser).id,
				password: this.new_password
			}).subscribe((val) => {
				console.log("PUT call successful value returned in body", val);
				$("#resetPasswordModal").modal("hide");
				setTimeout(() => {
					this.spinner.hide();
					alert("Password Changed!")
				}, 2000);
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
	addBuyer() {
		this.order.buyerFieldArray.push({
			name: null,
			address: null
		});
		this.buyer_index++;
	}
	deleteBuyer() {
		this.buyer_index--;
		this.order.buyerFieldArray.splice(-1, 1);
	}
	addSeller() {
		this.order.sellerFieldArray.push({
			name: null,
			address: null
		});
		this.seller_index++;
	}
	deleteSeller() {
		this.seller_index--;
		this.order.sellerFieldArray.splice(-1, 1);
	}
	orderSubmit(){
		this.http.post("/api/order", this.order).subscribe((val) => {
			$("#newOrderModal").modal("hide");
			this.ngOnInit();
			console.log("POST call successful value returned in body", val);
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
}