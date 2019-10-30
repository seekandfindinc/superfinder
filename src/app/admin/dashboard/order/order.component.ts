import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavbarComponent } from '../../../navbar/navbar.component';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { Forward } from '../../../forward';
import { Note } from '../../../note';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';

@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
    public files: NgxFileDropEntry[] = [];
    @ViewChild('noteList', { static: false }) private myScrollContainer: ElementRef;
    id: number;
    inEditMode = false;
    public forwards: any = [];
    public notes: any = [];
    public order: any = {
    };
    public note: Note = {
        text: null
    };
    public forward: Forward = {
        email: null,
        coverage: null
    };
    public closing_date: any = {
    };
    public documents: any = [
    ];
    constructor(private http: HttpClient, private route: ActivatedRoute, private spinner: NgxSpinnerService, private router: Router) {}
    scrollToBottom(): void {
        try {
            setTimeout(() => {
                if (this.notes.length > 0) {
                    this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
                }
            }, 200);
        } catch (err) {
            console.log(err);
        }
    }
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = +params.orderid;
        });
        this.http.get('/api/order/' + this.id).subscribe((orderData) => {
            if (orderData) {
                this.order = orderData;
                this.http.get('/api/order/' + this.id + '/notes').subscribe((noteData) => {
                    this.notes = noteData;
                }, response => {
                    console.log('GET call in error', response);
                }, () => {
                    console.log('The GET observable is now completed.');
                });
                this.getDocuments();
                this.getForwards();
            } else {
                this.router.navigate(['/', 'admin', 'dashboard']);
            }
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
    getForwards() {
        this.http.get('/api/order/' + this.id + '/forwards').subscribe((val) => {
            this.forwards = val;
            console.log('GET call successful value returned in body', val);
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
    getDocuments() {
        this.http.get('/api/documents/' + this.id).subscribe((val) => {
            this.documents = val;
            console.log('GET call successful value returned in body', val);
        }, response => {
            console.log('GET call in error', response);
        }, () => {
            console.log('The GET observable is now completed.');
        });
    }
    closeOrder(id) {
        this.spinner.show();
        this.http.put('/api/order/' + this.id, {
            closed: true,
            closed_date: moment().format('YYYY-MM-DD HH:mm:ss')
        }).subscribe((val) => {
            console.log('PUT call successful value returned in body', val);
            $('#confirmModal').modal('hide');
            setTimeout(() => {
                this.order.closed = true;
                this.order.updatedAt = new Date();
                this.spinner.hide();
            }, 2000);
        }, response => {
            console.log('PUT call in error', response);
        }, () => {
            console.log('The PUT observable is now completed.');
        });
    }
    editOrder() {
        this.inEditMode = true;
        if (this.order.closing_date) {
            this.order.closing_date = {
                year: moment(this.order.closing_date).format('YYYY'),
                month: moment(this.order.closing_date).format('M'),
                day: moment(this.order.closing_date).format('D')
            };
        } else {
            this.order.closing_date = {
                year: null,
                month: null,
                day: null
            };
        }
    }
    saveOrder() {
        this.spinner.show();
        this.inEditMode = false;
        if (this.order.closing_date.year) {
            this.order.closing_date = moment({
                year: this.order.closing_date.year,
                month: this.order.closing_date.month - 1,
                day: this.order.closing_date.day,
            }).format('YYYY-MM-DD 00:00:00');
        } else {
            this.order.closing_date = null;
        }
        this.http.put('/api/order/' + this.id, this.order).subscribe((val) => {
            console.log('PUT call successful value returned in body', val);
            setTimeout(() => {
                this.order.updatedAt = new Date();
                this.spinner.hide();
            }, 2000);
        }, response => {
            console.log('PUT call in error', response);
        }, () => {
            console.log('The PUT observable is now completed.');
        });
    }
    add(list) {
        this.order[list].push({
            name: null,
            address: null
        });
    }
    delete(list) {
        this.order[list].splice(-1, 1);
    }
    download(id) {
        window.open('/api/document/?key=' + id, '_self');
    }
    forwardSubmit(id) {
        this.spinner.show();
        this.http.post('/api/order/' + id + '/forward', this.forward).subscribe((val) => {
            console.log('PUT call successful value returned in body', val);
            $('#emailForwardModal').modal('hide');
            setTimeout(() => {
                this.spinner.hide();
                this.getForwards();
                $('#forwardSent').show();
            }, 2000);
        }, response => {
            console.log('PUT call in error', response);
        }, () => {
            console.log('The PUT observable is now completed.');
        });
    }
    newMessage(id) {
        const user = JSON.parse(localStorage.currentUser);
        this.http.post('/api/order/' + id + '/note', {
            text: this.note.text,
            UserId: user.id
        }).subscribe((val) => {
            console.log('PUT call successful value returned in body', val);
            this.notes.push({
                User: {
                    initials: user.initials
                },
                text: this.note.text
            });
            this.note.text = null;
            this.scrollToBottom();
        }, response => {
            console.log('PUT call in error', response);
        }, () => {
            console.log('The PUT observable is now completed.');
        });
    }
    public dropped(files: NgxFileDropEntry[], orderID: string) {
        this.files = files;
        for (const droppedFile of files) {
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('OrderId', orderID);
                    this.http.post('/api/document/', formData).subscribe((val) => {
                        console.log('File Uploaded', val);
                        this.getDocuments();
                    }, response => {
                        console.log('POST call in error', response);
                    }, () => {
                        console.log('The POST observable is now completed.');
                    });
                });
            }
        }
    }
}
