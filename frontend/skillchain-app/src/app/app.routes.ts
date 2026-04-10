import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { EmployerPageComponent } from './features/employer/employer-page.component';
import { InstitutionDashboardComponent } from './features/institution/institution-dashboard.component';
import { LandingComponent } from './features/landing/landing.component';
import { StudentDashboardComponent } from './features/student/student-dashboard.component';
import { PublicVerifyComponent } from './features/verify/public-verify.component';
import { WelcomeComponent } from './features/welcome/welcome.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'home', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'institution',
    component: InstitutionDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['institution'] },
  },
  {
    path: 'student',
    component: StudentDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['student'] },
  },
  {
    path: 'employer',
    component: EmployerPageComponent,
    canActivate: [authGuard],
    data: { roles: ['employer'] },
  },
  { path: 'verify/:tokenId', component: PublicVerifyComponent },
  { path: '**', redirectTo: '' },
];
