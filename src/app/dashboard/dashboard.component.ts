import { Component, OnInit } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { URLSearchParams } from "@angular/http";
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
	public orders: any = [];
	public filters: any = {};
	constructor(private http: HttpClient, private route: ActivatedRoute) {}
	ngOnInit() {
		let action = this.route.snapshot.queryParams["action"];
		if(action === "order_new"){
			$("#order_new").show();
		}
	}
	search(filter_values){
		let params = new URLSearchParams();
		for(let key in filter_values){
			if(filter_values[key]){
				key === "closing_date" ? params.set(key, filter_values[key].year + "-" + filter_values[key].month + "-" + filter_values[key].day) : params.set(key, filter_values[key]);
			}
		}
		this.http.get("/api/order" + (params.toString().length > 0 ? "?" + params.toString() : "")).subscribe((val) => {
			this.orders = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});	
	}
	clear(){
		this.filters = {};
	}
}