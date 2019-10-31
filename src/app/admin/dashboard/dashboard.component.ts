import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    public orders: any = [];
    filter = {
        property_address: '',
        corporation: '',
        reference_number: '',
        lender: '',
        closed: ''
    };
    constructor(private http: HttpClient, private route: ActivatedRoute) {}
    ngOnInit() {
        const action = this.route.snapshot.queryParams['action'];
        if (action === 'order_new') {
            $('#order_new').show();
        }
        this.http.get('/api/order').subscribe((val: any) => {
            this.orders = val.data;
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
}
