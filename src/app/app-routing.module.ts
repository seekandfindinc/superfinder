import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AboutComponent } from './about/about.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { OrderComponent } from './order/order.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ForgotComponent } from './forgot/forgot.component';
import { UserComponent } from './user/user.component';
import { OrderNewComponent } from './order-new/order-new.component';

const routes: Routes = [{
    path: '',
    component: AboutComponent
}, {
    path: 'admin',
    component: LoginComponent
}, {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/dashboard/order/:orderid',
    component: OrderComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/dashboard/create/order',
    component: OrderNewComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/users',
    component: UserComponent,
    canActivate: [AuthGuard]
}, {
    path: 'admin/user/forgot',
    component: ForgotComponent
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
