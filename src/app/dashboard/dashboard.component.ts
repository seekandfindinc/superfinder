import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	public buyer_index: number = 0;
	public seller_index: number = 0;
	url = "http://localhost:3000/api/";
	public orders;
	private order: any = {
		buyerFieldArray: [{
			name: null,
			address: null
		}],
		sellerFieldArray: [{
			name: null,
			address: null
		}]
	};
	constructor(private http: HttpClient) { }
	ngOnInit() {
		this.http.get(this.url + "orders").subscribe((val) => {
			this.orders = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
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
		this.http.post(this.url + "order", this.order).subscribe((val) => {
			console.log("POST call successful value returned in body", val);
		}, response => {
			console.log("POST call in error", response);
		}, () => {
			console.log("The POST observable is now completed.");
		});
	}
}




