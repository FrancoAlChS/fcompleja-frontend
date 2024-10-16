import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { BandejaPreliminarComponent } from './farmaciacompleja/bandeja-preliminar/bandeja-preliminar.component';

import { MedicamentoNuevoComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/medicamento.component';
import { DetallePreliminarComponent } from './farmaciacompleja/bandeja-preliminar/detalle-preliminar/detalle-preliminar.component';
import { RegistroLineaTratamientoComponent } from './farmaciacompleja/registro-linea-tratamiento/registro.linea.tratamiento.component';
import {
  MedicamentoContinuadorComponent
} from './farmaciacompleja/bandeja-evaluacion/medicamento-continuador/medicamento-continuador.component';

import { HomeComponent } from './farmaciacompleja/home/home.component';
import { ConfiguracionComponent } from './farmaciacompleja/configuracion/configuracion.component';

import { BandejaMonitoreoComponent } from './farmaciacompleja/BandejaMonitoreo/bandeja.monitoreo.component';
import { MonitoreoPacienteComponent } from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/monitoreo-paciente.component';
import { BandejaEvaluacionComponent } from './farmaciacompleja/bandeja-evaluacion/bandeja-evaluacion.component';
import { DetalleEvaluacionComponent } from './farmaciacompleja/bandeja-evaluacion/detalle-evaluacion/detalle-evaluacion.component';
import {
  SeguimientoEvaluacionComponent
} from './farmaciacompleja/bandeja-evaluacion/seguimiento.evaluacion/seguimiento.evaluacion.component';
import { FarmaciaComplejaComponent } from './farmaciacompleja/farmacia-compleja.component';
import { AuthGuard } from './auth/auth.guard';
import { ControlGastoComponent } from './farmaciacompleja/control-gasto/control-gasto.component';
import { ExamenesMedicosComponent } from './farmaciacompleja/configuracion/examenes-medicos/examenes-medicos.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { RepoConsumoComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-consumo/reportes.consumo.component';
import { ParticipantesComponent } from './farmaciacompleja/configuracion/participantes/participantes.component';
import { RepoGeneralesComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-generales/reportes.generales.component';
import { IndicadorProcesoComponent } from './farmaciacompleja/Reportes-Indicadores/indicadores-proceso/indicador-proceso.component';
import { UsuarioComponent } from './farmaciacompleja/configuracion/usuario/usuario.component';


//guard
import { CanDeactivateGuard } from './guards/form.guard';
import { DiagnosticoComponent } from './farmaciacompleja/configuracion/diagnostico/diagnostico.component';
import { ReportesPacienteComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-paciente/reportes-paciente.component';

// COMPONENTES PERSONALIZADOS
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token/:id', component: ResetPasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

export const aplicacionRoutes: Routes = [
  {
    path: 'app',
    component: FarmaciaComplejaComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'bandeja-preliminar', component: BandejaPreliminarComponent },
      { path: 'detalle-preliminar', component: DetallePreliminarComponent },
      { path: 'bandeja-evaluacion', component: BandejaEvaluacionComponent },
      { path: 'detalle-evaluacion', component: DetalleEvaluacionComponent, canDeactivate: [CanDeactivateGuard ] },
      { path: 'seguimiento-evaluacion', component: SeguimientoEvaluacionComponent },
      { path: 'medicamento-nuevo', component: MedicamentoNuevoComponent , canDeactivate: [CanDeactivateGuard ] },
      { path: 'medicamento-continuador', component: MedicamentoContinuadorComponent , canDeactivate: [CanDeactivateGuard ]},
      { path: 'registro-linea-tratamiento', component: RegistroLineaTratamientoComponent, canDeactivate: [CanDeactivateGuard ]},
      { path: 'bandeja-monitoreo', component: BandejaMonitoreoComponent },
      { path: 'monitoreo-paciente', component: MonitoreoPacienteComponent },
      { path: 'control-gasto', component: ControlGastoComponent },
      { path: 'reporte-indicadores', component: IndicadorProcesoComponent },
      { path: 'reportes-consumo', component: RepoConsumoComponent },
      { path: 'reportes-generales', component: RepoGeneralesComponent },
      { path: 'reporte-paciente', component: ReportesPacienteComponent },
      { path: 'configuracion-mac', component: ConfiguracionComponent },
      { path: 'configuracion-examenes', component: ExamenesMedicosComponent },
      { path: 'configuracion-participantes', component: ParticipantesComponent },
      { path: 'mantenimiento-usuario', component: UsuarioComponent }, 
      { path: 'mantenimiento-diagnostico', component: DiagnosticoComponent}
    ],
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    RouterModule.forChild(aplicacionRoutes)
  ],
  exports: [RouterModule],
  providers: [
    CanDeactivateGuard
  ]
})
export class AppRoutingModule { }
