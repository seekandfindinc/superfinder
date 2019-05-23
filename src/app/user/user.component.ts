import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as lodash from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    public users: any = [];
    constructor(private http: HttpClient, private spinner: NgxSpinnerService) {
    }
    ngOnInit() {
        this.http.get('/api/users/').subscribe((val) => {
            this.users = val;
            console.log('GET call successful value returned in body', val);
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
    userApprove(id) {
        if (confirm('Are you sure you want to approve this account?')) {
            this.spinner.show();
            this.http.put('/api/user', {
                id: id,
                approved: true
            }).subscribe((val) => {
                console.log('PUT call successful value returned in body', val);
                const user = lodash.find(this.users, {
                    id: id
                });
                setTimeout(() => {
                    user.approved = 1;
                    this.spinner.hide();
                }, 2000);
            }, response => {
                console.log('PUT call in error', response);
            }, () => {
                console.log('The PUT observable is now completed.');
            });
        }
    }
    resetPassword(id) {
        this.http.post('/api/user/forgot', {
            id: id
        }).subscribe((val) => {
            console.log('GET call successful value returned in body', val);
            if (val) {
                alert('Password reset email sent');
            }
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
}
