import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute } from '@angular/router';
import * as moment from "moment";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
	@ViewChild("noteList") private myScrollContainer: ElementRef;
	id: number;
	public buyer_index: number;
	public seller_index: number;
	public invoices_item_index: number = 0;
	inEditMode: boolean = false;
	public forward: any = {
	};
	public forwards: any = [];
	public notes: any = [];
	public order: any = {
	};
	public note: any = {
	};
	public document: any = {
	};
	public temp_closing_date: any = {
	};
	public documents: any = [
	];
	public invoices: any = [{
		item: null,
		unit: null,
		cost: null
	}];
	constructor(private http: HttpClient, private route: ActivatedRoute, private spinner: NgxSpinnerService) { }
	scrollToBottom(): void {
		try {
			this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
		} catch(err) {
			console.log(err);
		}
	}
	ngAfterViewChecked() {        
		this.scrollToBottom();        
	} 
	ngOnInit(){
		this.route.params.subscribe(params => {
			this.id = +params.orderid;
		});
		this.http.get("/api/order/" + this.id).subscribe((val) => {
			this.order = val;
			this.order.lastUpdated = moment(this.order.updatedAt).format("dddd, MMMM Do YYYY hh:mm A");
			this.order.dateofCreation = moment(this.order.createdAt).format("dddd, MMMM Do YYYY hh:mm A");
			this.order.closed_date = this.order.closed_date ? moment(this.order.closed_date).format("dddd, MMMM Do YYYY hh:mm A") : null;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
		this.http.get("/api/order/" + this.id + "/notes").subscribe((val) => {
			this.notes = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
		this.getDocuments();
		this.getLastForward();
	}
	getLastForward(){
		this.http.get("/api/order/" + this.id + "/forwards").subscribe((val) => {
			this.forwards = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
	getDocuments(){
		this.http.get("/api/documents/" + this.id).subscribe((val) => {
			this.documents = val;
			console.log("GET call successful value returned in body", val);
		}, response => {
			console.log("GET call in error", response);
		}, () => {
			console.log("The GET observable is now completed.");
		});
	}
	closeOrder(id){
		this.spinner.show();
		this.http.put("/api/order/" + this.id,{
			closed: true,
			closed_date: moment().format("YYYY-MM-DD HH:mm:ss")
		}).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			$("#confirmModal").modal("hide");
			setTimeout(() => {
				this.order.closed = true;
				this.order.lastUpdated = moment().format("dddd, MMMM Do YYYY hh:mm A");
				this.spinner.hide();
			}, 2000);
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
		this.spinner.show();
		if(this.temp_closing_date.date){
			this.order.closing_date = moment({
				year: this.temp_closing_date.date.year,
				month: this.temp_closing_date.date.month - 1,
				day: this.temp_closing_date.date.day,
				hour: this.temp_closing_date.time.hour,
				minute: this.temp_closing_date.time.minute
			}).format("YYYY-MM-DD HH:mm:ss");
		}
		this.http.put("/api/order/" + this.id, this.order).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			setTimeout(() => {
				this.inEditMode = false;
				this.order.lastUpdated = moment().format("dddd, MMMM Do YYYY hh:mm A");
				this.spinner.hide();
			}, 2000);
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
		this.spinner.show();
		let formData = new FormData();
		formData.append("description", this.document.description);
		formData.append("file", this.document.file);
		formData.append("OrderId", id);
		this.http.post("/api/document/", formData).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			$("#newDocumentModal").modal("hide");
			setTimeout(() => {
				this.getDocuments();
				this.spinner.hide();
			}, 2000);			
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	download(id){
		window.open("/api/document/" + id, '_self');
	}
	forwardSubmit(id){
		this.spinner.show();
		this.http.post("/api/order/"+ id + "/forward", this.forward).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			$("#emailForwardModal").modal("hide");
			setTimeout(() => {
				this.spinner.hide();
				this.getLastForward();
				$("#forwardSent").show();
			}, 2000);
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	addItem() {
		this.invoices.push({
			item: null,
			unit: null,
			cost: null
		});
		this.invoices_item_index++;
	}
	deleteItem() {
		this.invoices_item_index--;
		this.invoices.splice(-1, 1);
	}
	invoiceSubmit(id){
		this.spinner.show();
		this.http.post("/api/invoice/"+ id, this.invoices).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			$("#generateInvoiceModal").modal("hide");
			setTimeout(() => {
				this.spinner.hide();
				this.getDocuments();
				$("#invoiceGenerated").show();
			}, 2000);			
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
	newMessage(id){
		var user = JSON.parse(localStorage.currentUser);
		this.http.post("/api/order/"+ id + "/note", {
			text: this.note.text,
			UserId: user.id
		}).subscribe((val) => {
			console.log("PUT call successful value returned in body", val);
			this.notes.push({
				User:{
					initials: user.initials
				},
				text: this.note.text
			});
			this.note.text = null;
		}, response => {
			console.log("PUT call in error", response)
		}, () => {
			console.log("The PUT observable is now completed.");
		});
	}
}