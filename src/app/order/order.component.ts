import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from '@angular/router';


@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
	id: number;
	url = "http://localhost:3000/api/";
	public order: any = {
	};
	constructor(private http: HttpClient, private route: ActivatedRoute) { }
	ngOnInit() {
		this.route.params.subscribe(params => {
			this.id = +params.orderid;
		});
		this.http.get(this.url + "order/" + this.id).subscribe((val) => {
			this.order = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
	closeOrder(id){
		this.http.put(this.url + "order/" + this.id,{
			closed: true
		}).subscribe((val) => {
			if(val){
				this.order.closed = true;
			}
			console.log("PUT call successful value returned in body", val);
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
}