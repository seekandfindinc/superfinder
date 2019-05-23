import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    constructor(private http: HttpClient, private router: Router, private cookieService: CookieService) {
    }
    ngOnInit() {
    }
    newUserSubmit(form) {
        this.http.post('/api/register', {
            email: form.value.email,
            first_name: form.value.first_name,
            last_name: form.value.last_name,
        }).subscribe((val) => {
            alert('User Registered. Password will be emailed shortly. Once approved you will be notified.');
            console.log('POST call successful value returned in body', val);
        }, response => {
            console.log('POST call in error', response);
        }, () => {
            console.log('The POST observable is now completed.');
        });
    }
    loginSubmit (form) {
        this.http.get('/api/user', {
            params: {
                email: form.value.email,
                password: form.value.password
            }
        }).subscribe((val) => {
            if (val) {
                const token = val['token'];
                const user = JSON.stringify(val['user']);
                this.cookieService.set('user', token);
                localStorage.setItem('currentUser', user);
                this.router.navigate(['/admin/dashboard']);
            } else {
                alert('Try again. Invalid Login');
            }
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
    forgotSubmit(form) {
        this.http.post('/api/user/forgot', {
            email: form.value.email
        }).subscribe((val) => {
            console.log('GET call successful value returned in body', val);
            if (val) {
                alert('If you email is valid then a reset link will be sent.');
            }
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
}
