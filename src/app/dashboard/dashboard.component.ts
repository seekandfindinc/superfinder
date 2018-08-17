import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	public buyer_index: number = 0;
	public seller_index: number = 0;
	orders = [{
		id: 1,
		isOpen: true,
		ordernumber: 12345,
		seller_last_name: "Pugliese"
	},{
		id: 2,
		isOpen: false,
		ordernumber: 12346,
		seller_last_name: "Ortiz"
	},{
		id: 3,
		isOpen: true,
		ordernumber: 12347,
		seller_last_name: "Jones"
	},{
		id: 4,
		isOpen: false,
		ordernumber: 12348,
		seller_last_name: "Mahoy"
	}];
	private buyerFieldArray: Array<any> = [{
		name: null,
		address: null
	}];
	private sellerFieldArray: Array<any> = [{
		name: null,
		address: null
	}];
	private newAttribute: any = {};
	constructor() { }
	ngOnInit() { }
	addBuyer() {
		this.buyerFieldArray.push(this.newAttribute)
		this.newAttribute = {};
		this.buyer_index++;
	}
	deleteBuyer() {
		this.buyer_index--;
		this.buyerFieldArray.splice(-1, 1);
	}
	addSeller() {
		this.sellerFieldArray.push(this.newAttribute)
		this.newAttribute = {};
		this.seller_index++;
	}
	deleteSeller() {
		this.seller_index--;
		this.sellerFieldArray.splice(-1, 1);
	}
}
