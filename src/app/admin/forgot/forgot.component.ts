import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html'
})

export class ForgotComponent implements OnInit {
    constructor(private route: ActivatedRoute) { }
    ngOnInit() {
        const status = this.route.snapshot.queryParams['status'];
        status === 's' ? $('#success').show() : $('#danger').show();
    }
}
