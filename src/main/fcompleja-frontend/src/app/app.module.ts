import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  MatInputModule,
  MatButtonModule,
  MatCheckboxModule,
  MatSelectModule,
  MatIconModule,
  MatCardModule,
  MatDatepickerModule,
  MatGridListModule,
  MatDialogModule,
  MatExpansionModule,
  MatDividerModule,
  MatMenuModule,
  MatStepperModule,
  MatSortModule,
  MatPaginatorModule,
  MatTableModule,
  MatTooltipModule,
  MatTabsModule,
  MatNativeDateModule,
  MatRadioModule,
  MatProgressBarModule,
  MatBadgeModule,
  MatListModule,
  MatSidenavModule,
  MatToolbarModule,
  MatDialog
} from '@angular/material';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {
  BandejaPreliminarComponent
} from './farmaciacompleja/bandeja-preliminar/bandeja-preliminar.component';

import { MenuComponent } from './core/menu/menu.component';
import { HeaderComponent } from './core/header/header.component';
import { FooterComponent } from './core/footer/footer.component';
import { LoginComponent } from './login/login.component';
import { DetallePreliminarComponent } from './farmaciacompleja/bandeja-preliminar/detalle-preliminar/detalle-preliminar.component';
import { MedicamentoNuevoComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/medicamento.component';

import { RegistroLineaTratamientoComponent } from './farmaciacompleja/registro-linea-tratamiento/registro.linea.tratamiento.component';
import {
  MedicamentoContinuadorComponent
} from './farmaciacompleja/bandeja-evaluacion/medicamento-continuador/medicamento-continuador.component';
import { HomeComponent } from './farmaciacompleja/home/home.component';
import { ProgramaCmacComponent } from './farmaciacompleja/bandeja-evaluacion/programa.cmac/programa.cmac.component';
import { ResponsiveColsDirective } from './directives/responsive.cols.directive';
import { ResponsiveRowsDirective } from './directives/responsive.rows.directive';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ActionDocHistoricoComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/action.doc.historico.component';
import { MessageComponent } from './core/message/message.component';

import { ConfiguracionComponent } from './farmaciacompleja/configuracion/configuracion.component';

import { MacComponent } from './farmaciacompleja/configuracion/MAC/mac.dialog.component';

import { OnlyNumberDirective } from './directives/only-number.directive';
import { CdkTableModule } from '@angular/cdk/table';
import { DatePipe, DecimalPipe } from '@angular/common';
import { OnlyDateDirective } from './directives/only-date.directive';
import { MatPaginatorIntlEspanol } from './directives/matpaginator-translate';
import { BandejaMonitoreoComponent } from './farmaciacompleja/BandejaMonitoreo/bandeja.monitoreo.component';
import { CometarioComponent } from './core/cometario/cometario.component';
import { BuscarPacienteComponent } from './modal/buscar-paciente/buscar-paciente.component';
import { BuscarClinicaComponent } from './modal/buscar-clinica/buscar-clinica.component';
import { MonitoreoPacienteComponent } from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/monitoreo-paciente.component';
import { AlphaNumericoDirective } from './directives/alpha-numerico.directive';
import {
  LineaTratamientoModalComponent
} from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/linea-tratamiento-modal/linea-tratamiento-modal.component';
import {
  MarcadoresModalComponent
} from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/marcadores-modal/marcadores-modal.component';
import {
  RegistrarEvolucionComponent
} from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/registrar-evolucion/registrar-evolucion.component';
import {
  ResultadosEvolucionComponent
} from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/resultados-evolucion/resultados-evolucion.component';
import { BuscarMacComponent } from './modal/buscar-mac/buscar-mac.component';
import { MarcadoresComponent } from './farmaciacompleja/configuracion/MAC/marcadores/marcadores.component';
import { CheckListComponent } from './farmaciacompleja/configuracion/MAC/check-list/check-list.component';
import { FichaTecnicaComponent } from './farmaciacompleja/configuracion/MAC/ficha-tecnica/ficha-tecnica.component';
import {
  ComplicacionesMedicasComponent
} from './farmaciacompleja/configuracion/MAC/complicaciones-medicas/complicaciones-medicas.component';
import { ProductoAsociadoComponent } from './farmaciacompleja/configuracion/MAC/productos-asociados/productos-asociados.component';
import {
  AlternativasConstitucionalesComponent
} from './farmaciacompleja/configuracion/alternativas-constitucionales/alternativas-constitucionales.component';
import { ExamenesMedicosComponent } from './farmaciacompleja/configuracion/examenes-medicos/examenes-medicos.component';
import { ParticipantesComponent } from './farmaciacompleja/configuracion/participantes/participantes.component';
import {
  IndicadorCriteriosComponent
} from './farmaciacompleja/configuracion/MAC/check-list/indicador-criterios/indicador-criterios.component';

import { CriteriosComponent } from './farmaciacompleja/configuracion/MAC/check-list/indicador-criterios/criterios/criterios.component';
import { AutenticacionService } from './service/autenticacion.service';
import { Ng4LoadingSpinnerModule } from 'ng4-loading-spinner';
import { CustomFormsModule } from 'ngx-custom-validators';
import { MntoFichaComponent } from './farmaciacompleja/configuracion/MAC/ficha-tecnica/mnto-ficha/mnto-ficha.component';
import { EvaluacionCmacComponent } from './farmaciacompleja/bandeja-evaluacion/evaluacion.cmac/evaluacion.cmac.component';
import {
  EvaluacionLiderTumorComponent
} from './farmaciacompleja/bandeja-evaluacion/evaluacion.lider.tumor/evaluacion.lider.tumor.component';
import {
  SeguimientoEvaluacionComponent
} from './farmaciacompleja/bandeja-evaluacion/seguimiento.evaluacion/seguimiento.evaluacion.component';
import { BandejaEvaluacionComponent } from './farmaciacompleja/bandeja-evaluacion/bandeja-evaluacion.component';
import {
  PreguntaLineaTratComponent
} from './farmaciacompleja/bandeja-evaluacion/detalle-evaluacion/registro.historico.dialog.component';
import { DetalleEvaluacionComponent } from './farmaciacompleja/bandeja-evaluacion/detalle-evaluacion/detalle-evaluacion.component';
import { FarmaciaComplejaComponent } from './farmaciacompleja/farmacia-compleja.component';
import { AuthGuard } from './auth/auth.guard';
import { UpperCaseDirective } from './directives/upper-case.directive';
import { SeguimientoEjecutivoComponent } from './farmaciacompleja/BandejaMonitoreo/monitoreo-paciente/seguimiento-ejecutivo/seguimiento-ejecutivo.component';
import { PreferenciaInstitucionalesComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/preferencia-institucionales/preferencia-institucionales.component';
import { ChecklistRequisitosComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/checklist-requisitos/checklist-requisitos.component';
import { CondicionBasalComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/condicion-basal/condicion-basal.component';
import { ChecklistPacienteComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/checklist-paciente/checklist-paciente.component';
import { AnalisisConclusionComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/analisis-conclusion/analisis-conclusion.component';
import { ControlGastoComponent } from './farmaciacompleja/control-gasto/control-gasto.component';

import { MatProgressButtonsModule } from 'mat-progress-buttons';
import { RegistrarMarcadorComponent } from './farmaciacompleja/configuracion/MAC/marcadores/registrar/registrar.component';
import { EditarMarcadorComponent } from './farmaciacompleja/configuracion/MAC/marcadores/editar/editar.component';
import { RegistrarProductoAsociadoComponent } from './farmaciacompleja/configuracion/MAC/productos-asociados/registrar/registrar.component';
import { EditarProductoAsociadoComponent } from './farmaciacompleja/configuracion/MAC/productos-asociados/editar/editar.component';
import { RegistrarComplicacionMedicaComponent } from './farmaciacompleja/configuracion/MAC/complicaciones-medicas/registrar/registrar.component';
import { RegistrarFichaTecnicaComponent } from './farmaciacompleja/configuracion/MAC/ficha-tecnica/registrar/registrar.component';
import { ResetPasswordComponent } from './login/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './login/forgot-password/forgot-password.component';
import { RepoConsumoComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-consumo/reportes.consumo.component';
import { RegistrarExamenMedicoComponent } from './farmaciacompleja/configuracion/examenes-medicos/registrar/registrar.component';
import { EditarExamenMedicoComponent } from './farmaciacompleja/configuracion/examenes-medicos/editar/editar.component';
import { RegistrarParticipanteComponent } from './farmaciacompleja/configuracion/participantes/registrar/registrar.component';
import { BuscarUsuarioComponent } from './farmaciacompleja/configuracion/participantes/buscar/buscar.component';
import { DecipherInterceptor } from './interceptors/decipher.interceptor';
import { AESencryptionService } from './service/AESencryption.service';
import { Base64encryptionService } from './service/Base64encryption.service';
import { CipherInterceptor } from './interceptors/cipher.interceptor';


// const productionInterceptors = [
//   {
//     provide: HTTP_INTERCEPTORS,
//     useClass: CipherInterceptor,
//     multi: true,
//     deps: [AESencryptionService, Base64encryptionService]
//   },
//   {
//     provide: HTTP_INTERCEPTORS,
//     useClass: DecipherInterceptor,
//     multi: true,
//     deps: [AESencryptionService, Base64encryptionService]
//   }
// ];

import { EditarParticipanteComponent } from './farmaciacompleja/configuracion/participantes/editar/editar.component';
import { RouterModule, Router } from '@angular/router';
import { RegistrarIndicadorComponent } from './farmaciacompleja/configuracion/MAC/check-list/indicador/registrar.component';
import { RegistrarCriterioComponent } from './farmaciacompleja/configuracion/MAC/check-list/criterio/registrar.component';
import { EditarCriterioComponent } from './farmaciacompleja/configuracion/MAC/check-list/criterio/editar.component';
import { EditarIndicadorComponent } from './farmaciacompleja/configuracion/MAC/check-list/indicador/editar.component';
import { IndicadorProcesoComponent } from './farmaciacompleja/Reportes-Indicadores/indicadores-proceso/indicador-proceso.component';
import { RepoGeneralesComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-generales/reportes.generales.component';
import { UsuarioComponent } from './farmaciacompleja/configuracion/usuario/usuario.component';
import { RegistrarUsuarioComponent } from './farmaciacompleja/configuracion/usuario/registrar/registrar.component';
import { EstadoUsuarioPipe } from './pipe/estado-usuario';
import { EditarUsuarioComponent } from './farmaciacompleja/configuracion/usuario/editar/editar.component';
import { NgxCaptchaModule } from 'ngx-captcha';

import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {MomentModule} from 'angular2-moment';
import { ErrorDialogService } from './interceptors/errordialog.service';
import { BuscarGrupoDiagnosticoComponent } from './modal/buscar-diagnostico/buscar-diagnostico.component';
import { DiagnosticoComponent } from './farmaciacompleja/configuracion/diagnostico/diagnostico.component';
import { ObservacionesComponent } from './farmaciacompleja/bandeja-evaluacion/medicamento-nuevo/observaciones/observaciones.component';
import { RegistrarComiteComponent } from './farmaciacompleja/configuracion/participantes/registrar-comite/registrar-comite.component';
import { RegistroParticipantesComponent } from './farmaciacompleja/bandeja-evaluacion/evaluacion.cmac/registro-participantes/registro-participantes.component';
import { RegistroResultadoEvaluacionComponent } from './farmaciacompleja/bandeja-evaluacion/evaluacion.cmac/registro-resultado-evaluacion/registro-resultado-evaluacion.component';
import { ReportesPacienteComponent } from './farmaciacompleja/Reportes-Indicadores/reportes-paciente/reportes-paciente.component';

@NgModule({
  entryComponents: [
    ProgramaCmacComponent,
    EvaluacionCmacComponent,
    ActionDocHistoricoComponent,
    PreguntaLineaTratComponent,
    RegistroLineaTratamientoComponent,
    MessageComponent,
    CometarioComponent,
    EvaluacionLiderTumorComponent,
    MacComponent,
    SeguimientoEvaluacionComponent,
    CometarioComponent,
    BuscarPacienteComponent,
    BuscarClinicaComponent,
    LineaTratamientoModalComponent,
    BuscarMacComponent,
    MarcadoresModalComponent,
    RegistrarEvolucionComponent,
    ResultadosEvolucionComponent,
    MarcadoresComponent,
    CheckListComponent,
    FichaTecnicaComponent,
    ComplicacionesMedicasComponent,
    ProductoAsociadoComponent,
    AlternativasConstitucionalesComponent,
    ExamenesMedicosComponent,
    ParticipantesComponent,
    IndicadorCriteriosComponent,
    CriteriosComponent,
    SeguimientoEjecutivoComponent,
    RegistrarMarcadorComponent,
    EditarMarcadorComponent,
    RegistrarProductoAsociadoComponent,
    EditarProductoAsociadoComponent,
    RegistrarComplicacionMedicaComponent,
    MntoFichaComponent,
    RegistrarFichaTecnicaComponent,
    RegistrarExamenMedicoComponent,
    EditarExamenMedicoComponent,
    RegistrarParticipanteComponent,
    BuscarUsuarioComponent,
    EditarParticipanteComponent,
    RegistrarIndicadorComponent,
    RegistrarCriterioComponent,
    EditarCriterioComponent,
    EditarIndicadorComponent,
    IndicadorProcesoComponent,
    RepoGeneralesComponent,
    RegistrarUsuarioComponent,
    EditarUsuarioComponent,
    BuscarGrupoDiagnosticoComponent,
    RegistrarComiteComponent,
    RegistroParticipantesComponent,
    RegistroResultadoEvaluacionComponent
  ],
  declarations: [
    AppComponent,
    ResponsiveColsDirective,
    ResponsiveRowsDirective,
    BandejaPreliminarComponent,
    ActionDocHistoricoComponent,
    MenuComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    DetallePreliminarComponent,
    MedicamentoNuevoComponent,
    BandejaEvaluacionComponent,
    HomeComponent,
    ProgramaCmacComponent,
    ResponsiveColsDirective,
    ResponsiveRowsDirective,
    EvaluacionCmacComponent,
    DetalleEvaluacionComponent,
    PreguntaLineaTratComponent,
    RegistroLineaTratamientoComponent,
    MedicamentoContinuadorComponent,
    MessageComponent,
    CometarioComponent,
    ConfiguracionComponent,
    EvaluacionLiderTumorComponent,
    MacComponent,
    SeguimientoEvaluacionComponent,
    OnlyNumberDirective,
    OnlyDateDirective,
    BandejaMonitoreoComponent,
    BuscarPacienteComponent,
    BuscarClinicaComponent,
    MonitoreoPacienteComponent,
    AlphaNumericoDirective,
    LineaTratamientoModalComponent,
    MarcadoresModalComponent,
    RegistrarEvolucionComponent,
    ResultadosEvolucionComponent,
    BuscarMacComponent,
    MarcadoresComponent,
    CheckListComponent,
    FichaTecnicaComponent,
    ComplicacionesMedicasComponent,
    ProductoAsociadoComponent,
    AlternativasConstitucionalesComponent,
    ExamenesMedicosComponent,
    ParticipantesComponent,
    IndicadorCriteriosComponent,
    CriteriosComponent,
    MntoFichaComponent,
    FarmaciaComplejaComponent,
    UpperCaseDirective,
    SeguimientoEjecutivoComponent,
    PreferenciaInstitucionalesComponent,
    ChecklistRequisitosComponent,
    CondicionBasalComponent,
    ChecklistPacienteComponent,
    AnalisisConclusionComponent,
    ControlGastoComponent,
    RegistrarMarcadorComponent,
    EditarMarcadorComponent,
    RegistrarProductoAsociadoComponent,
    EditarProductoAsociadoComponent,
    RepoConsumoComponent,
    RegistrarComplicacionMedicaComponent,
    RegistrarFichaTecnicaComponent,
    ResetPasswordComponent,
    ForgotPasswordComponent,
    RegistrarExamenMedicoComponent,
    EditarExamenMedicoComponent,
    RegistrarParticipanteComponent,
    BuscarUsuarioComponent,
    EditarParticipanteComponent,
    RegistrarIndicadorComponent,
    RegistrarCriterioComponent,
    EditarCriterioComponent,
    EditarIndicadorComponent,
    IndicadorProcesoComponent,
    RepoGeneralesComponent,
    UsuarioComponent,
    RegistrarUsuarioComponent,
    EstadoUsuarioPipe,
    EditarUsuarioComponent,
    BuscarGrupoDiagnosticoComponent,
    DiagnosticoComponent,
    ObservacionesComponent,
    RegistrarComiteComponent,
    RegistroParticipantesComponent,
    RegistroResultadoEvaluacionComponent,
    ReportesPacienteComponent,
 ],
  imports: [
    RouterModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    CdkTableModule,
    MatRadioModule,
    MatTabsModule,
    BrowserAnimationsModule,
    NgxDatatableModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatTabsModule,
    MatTooltipModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatMenuModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule,
    Ng4LoadingSpinnerModule.forRoot(),
    CustomFormsModule,
    MatBadgeModule,
    MatProgressButtonsModule.forRoot(),
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    NgxCaptchaModule,
    MomentModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  exports: [
    MatDialogModule,
    ProgramaCmacComponent,
    MatTabsModule,
    PreguntaLineaTratComponent,
    MessageComponent,
    CometarioComponent,
    MacComponent,
    AlphaNumericoDirective,
    OnlyNumberDirective,
    OnlyDateDirective,
    UpperCaseDirective,
    RegistrarComiteComponent,
    RegistroParticipantesComponent,
    RegistroResultadoEvaluacionComponent
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    AutenticacionService,
    MatPaginatorIntlEspanol,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CipherInterceptor,
      multi: true,
      deps: [AESencryptionService, Base64encryptionService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DecipherInterceptor,
      multi: true,
      deps: [AESencryptionService, Base64encryptionService, ErrorDialogService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
