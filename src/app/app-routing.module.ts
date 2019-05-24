import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AboutComponent } from './about/about.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AdminComponent } from './admin/admin.component';
import { OrderComponent } from './admin/dashboard/order/order.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ForgotComponent } from './admin/forgot/forgot.component';
import { UserComponent } from './admin/dashboard/user/user.component';
import { OrderNewComponent } from './admin/dashboard/order/create/order-new.component';

const routes: Routes = [{
    path: '',
    component: AboutComponent
}, {
    path: 'admin',
    component: AdminComponent
}, {
    path: 'admin/forgot',
    component: ForgotComponent
}, {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/dashboard/users',
    component: UserComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/dashboard/order/:orderid',
    component: OrderComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/dashboard/create/order',
    component: OrderNewComponent,
    canActivate: [AuthGuard]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(routes)
    ],
    exports: [ RouterModule ],
    declarations: []
})
export class AppRoutingModule { }
