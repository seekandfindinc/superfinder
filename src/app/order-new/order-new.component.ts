import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Component({
	selector: 'app-order-new',
	templateUrl: './order-new.component.html',
	styleUrls: ['./order-new.component.css']
})
export class OrderNewComponent implements OnInit {
	buyers = [{
		name: null,
		address: null
	}];
	sellers = [{
		name: null,
		address: null
	}];
	constructor(private router: Router, private http: HttpClient) {
	}
	ngOnInit(){
	}
	add(list){
		this[list].push({
			name: null,
			address: null
		});
	}
	delete(list){
		this[list].splice(-1, 1);
	}
	orderSubmit(propertyAddress: HTMLInputElement, referenceNumber: HTMLInputElement, lender: HTMLInputElement, corporation: HTMLInputElement, purchasePrice: HTMLInputElement, loanAmount: HTMLInputElement){
		this.http.post("/api/order", {
			property_address: propertyAddress.value,
			reference_number: referenceNumber.value,
			lender: lender.value,
			corporation: corporation.value,
			purchase_price: purchasePrice.value,
			loan_amount: loanAmount.value,
			buyers: this.buyers,
			sellers: this.sellers
		}).subscribe((val) => {
			console.log("POST call successful value returned in body", val);
			this.router.navigate(["/admin/dashboard"], { queryParams: { action: "order_new" } });
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
}