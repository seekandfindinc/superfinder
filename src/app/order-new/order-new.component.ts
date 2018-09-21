import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";

@Component({
	selector: 'app-order-new',
	templateUrl: './order-new.component.html',
	styleUrls: ['./order-new.component.css']
})
export class OrderNewComponent implements OnInit {
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
	constructor(private router: Router, private http: HttpClient) { }
	ngOnInit(){}
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
			console.log("POST call successful value returned in body", val);
			this.router.navigate(["/admin/dashboard"], { queryParams: { action: "order_new" } });
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
}