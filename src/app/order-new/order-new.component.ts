import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { Order } from "../order";

@Component({
	selector: 'app-order-new',
	templateUrl: './order-new.component.html',
	styleUrls: ['./order-new.component.css']
})
export class OrderNewComponent implements OnInit {
	public order: Order = {
		lender: null,
		loan_amount: null,
		purchase_price: null,
		property_address: null,
		corporation: null,
		reference_number: null,
		buyers: [{
			name: null,
			address: null
		}],
		sellers: [{
			name: null,
			address: null
		}]
	};
	constructor(private router: Router, private http: HttpClient) {
	}
	ngOnInit(){
	}
	add(list){
		this.order[list].push({
			name: null,
			address: null
		});
	}
	delete(list){
		this.order[list].splice(-1, 1);
	}
	orderSubmit(){
		this.http.post("/api/order", this.order).subscribe((val) => {
			console.log("POST call successful value returned in body", val);
			this.router.navigate(["/admin/dashboard"], { queryParams: { action: "order_new" } });
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
}