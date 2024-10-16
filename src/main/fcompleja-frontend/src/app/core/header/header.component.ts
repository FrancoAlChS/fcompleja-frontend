import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CoreService } from 'src/app/service/core.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { OncoWsResponse } from 'src/app/dto/response/OncoWsResponse';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { AutenticacionService } from 'src/app/service/autenticacion.service';
import { AESencryptionService } from 'src/app/service/AESencryption.service';
import { BandejaEvaluacionService } from 'src/app/service/bandeja.evaluacion.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() loginOutput = new EventEmitter<boolean>();
  @Input() arrMenuToggle;
  constructor(private coreService: CoreService,
    public router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    private autenticacionService: AutenticacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    public crypto: AESencryptionService) { }

  personaRol: string;
  persona: string;
  login_id = this.userService.getCodUsuario;
  nombreAplicacion: string;

  validarIntervalo: any;

  @Input() mostrarlogo: boolean;

  ngOnInit() {
    const validarIntervalo = setInterval(() => {
      if (typeof this.userService.getCodUsuario !== 'undefined' && this.userService.getCodUsuario != null) {
        this.consultarUsuarioRol(this.userService.getCodUsuario);
        clearInterval(validarIntervalo);
      }
    }, 300);
    this.nombreAplicacion = 'Farmacia Compleja';
  }

  public cargarConstantes(): void {
    const variables = require('src/assets/data/propiedades.json');
    this.nombreAplicacion = variables.tituloApp;
  }

  retirarBanderaSolicitud(){
    let codSolEva = localStorage.getItem("codSolEva")
    let evaluacion = JSON.parse(localStorage.getItem("evaluacion"))
    var json = {
      "codSolEva":codSolEva,
      "tipo": "SALIENDO"
    }
    if(codSolEva == null){
    }else{
      this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(data => {
        //return false
      },
      error => {
        console.error(error);
      })
    }

  }

  public consultarUsuarioRol(login_id: number) {
    this.coreService.consultarUsuarioRol(login_id).subscribe(
      (data: OncoWsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0' && data.dataList.length === 1) {
          data.dataList.forEach(element => {
            this.userService.setNombres = element.nombres;
            this.userService.setApelPaterno = element.apePaterno;
            this.userService.setApelMaterno = element.apeMaterno;
            this.userService.setCodRol = element.codRol;
            this.userService.setRolDescripcion = element.rolDescripcion;
            localStorage.setItem('rolUsuario', this.crypto.setValue(element.rolDescripcion));
            localStorage.setItem('codRol', this.crypto.setValue(element.codRol));
            this.personaRol = element.rolDescripcion;
            this.persona = element.nombres.split(' ')[0] + ' ' + element.apePaterno;
          });
        } else {
          this.personaRol = '';
          this.persona = '';
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  public CerrarSesion() {
    let evaluacion = JSON.parse(localStorage.getItem("evaluacion"))
    if(evaluacion != null){
      this.retirarBanderaSolicitud();
      this.userService.limpiarRegistro();
      this.logOut();
    }else {
      this.userService.limpiarRegistro();
      this.logOut();
    }
  }

  logOut() {
    this.autenticacionService.getRevokeToken().subscribe(
      (data: boolean) => {
        this.retirarBanderaSolicitud()
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.router.navigate(['./login']);
      },
      error => {
        this.retirarBanderaSolicitud()
        console.error(error);
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.router.navigate(['./login']);
      }
    );
  }





}
