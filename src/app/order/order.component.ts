import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from '@angular/router';
import * as moment from "moment";

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
	id: number;
	public buyer_index: number;
	public seller_index: number;
	inEditMode: boolean = false;
	url = "http://localhost:3000/api/";
	public order: any = {
	};
	public document: any = {
	};
	public temp_closing_date: any = {
	};
	public documents: any = [
	];
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
		this.http.get(this.url + "documents/" + this.id).subscribe((val) => {
			this.documents = val;
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
			this.order.closed = true;
			$("#confirmModal").modal("hide");
			console.log("PUT call successful value returned in body", val);
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	editOrder(){
		this.inEditMode = true;
		this.buyer_index = this.order.buyers.length - 1;
		this.seller_index = this.order.sellers.length - 1;
		if(this.order.closing_date){
			this.temp_closing_date.date = {
				year: parseInt(moment(this.order.closing_date).format("YYYY")),
				month: parseInt(moment(this.order.closing_date).format("MM")),
				day: parseInt(moment(this.order.closing_date).format("DD"))
			};
			this.temp_closing_date.time = {
				hour: parseInt(moment(this.order.closing_date).format("HH")),
				minute: parseInt(moment(this.order.closing_date).format("mm"))
			};
		}
	}
	saveOrder(){
		if(this.temp_closing_date.date){
			this.order.closing_date = moment({
				year: this.temp_closing_date.date.year,
				month: this.temp_closing_date.date.month - 1,
				day: this.temp_closing_date.date.day,
				hour: this.temp_closing_date.time.hour,
				minute: this.temp_closing_date.time.minute
			}).format("YYYY-MM-DD HH:mm:ss");
		}
		this.http.put(this.url + "order/" + this.id, this.order).subscribe((val) => {
			if(val){
				this.inEditMode = false;
			}
			console.log("PUT call successful value returned in body", val);
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	addBuyer() {
		this.order.buyers.push({
			name: null,
			address: null
		});
		this.buyer_index++;
	}
	deleteBuyer() {
		this.buyer_index--;
		this.order.buyers.splice(-1, 1);
	}
	addSeller() {
		this.order.sellers.push({
			name: null,
			address: null
		});
		this.seller_index++;
	}
	deleteSeller() {
		this.seller_index--;
		this.order.sellers.splice(-1, 1);
	}
	onFileChange(event) {
		if(event.target.files.length > 0) {
			let file = event.target.files[0];
			this.document.file = file;
		}
	}
	docSubmit(id){
		let formData = new FormData();
		formData.append("description", this.document.description);
		formData.append("file", this.document.file);
		formData.append("OrderId", id);
		this.http.post(this.url + "document/", formData).subscribe((val) => {
			$("#newDocumentModal").modal("hide");
			this.ngOnInit();
			console.log("PUT call successful value returned in body", val);
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	download(id){
		window.open(this.url + "document/" + id, '_self');
	}
}