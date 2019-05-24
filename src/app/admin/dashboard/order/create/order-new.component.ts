import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Owner } from '../../../../models/owner.model';

@Component({
    selector: 'app-order-new',
    templateUrl: './order-new.component.html'
})
export class OrderNewComponent implements OnInit {
    buyers: Owner[] = [
        new Owner(null, null)
    ];
    sellers: Owner[] = [
        new Owner(null, null)
    ];
    constructor(private router: Router, private http: HttpClient) {
    }
    ngOnInit() {
    }
    add (list) {
        this[list].push(new Owner(null, null));
    }
    delete (list) {
        this[list].splice(-1, 1);
    }
    orderSubmit (form) {
        this.http.post('/api/order', {
            property_address: form.value.property_address,
            reference_number: form.value.reference_number,
            lender: form.value.lender,
            corporation: form.value.corporation,
            purchase_price: form.value.purchase_price,
            loan_amount: form.value.loan_amount,
            buyers: this.buyers,
            sellers: this.sellers
        }).subscribe((val) => {
            console.log('POST call successful value returned in body', val);
            this.router.navigate(['/admin/dashboard'], { queryParams: { action: 'order_new' } });
        }, response => {
            console.log('POST call in error', response);
        }, () => {
            console.log('The POST observable is now completed.');
        });
    }
}
