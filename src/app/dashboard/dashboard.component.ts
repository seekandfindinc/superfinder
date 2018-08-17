import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
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
	constructor() { }
	ngOnInit() { }
}
