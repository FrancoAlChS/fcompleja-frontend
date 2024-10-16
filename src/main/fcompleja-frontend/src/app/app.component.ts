import {
  Component,
  OnInit,
  Inject,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { MediaObserver, MediaChange } from "@angular/flex-layout";
import { UsuarioService } from "./dto/service/usuario.service";
import { AuthService } from "./auth/auth-service.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { User } from "./dto/Usuario";
import { AutenticacionService } from "./service/autenticacion.service";
import { UsuarioPersonaResponse } from "./dto/core/UsuarioPersonaResponse";
import { MatDialog } from "@angular/material";
import { MessageComponent } from "./core/message/message.component";
import { MENSAJES, SESION_IDELTIME, SESION_TIMEOUT } from "./common";
import { OncoWsResponse } from "./dto/response/OncoWsResponse";
import { Idle, DEFAULT_INTERRUPTSOURCES } from "@ng-idle/core";
import { filter } from "rxjs/operators";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  usuario: User;
  login: boolean;
  ruta: string;

  idleState = "Not started.";
  timedOut = false;
  url: string;
  mensaje: any;

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private router: Router,
    private autenticacion: AutenticacionService,
    private dialog: MatDialog,
    private idle: Idle,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(AuthService) private authService: AuthService
  ) {
    router.events
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe((ev: NavigationEnd) => {
        this.url = ev.url;
      });

    idle.setIdle(SESION_IDELTIME);
    idle.setTimeout(SESION_TIMEOUT);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = "No longer idle.";
    });

    idle.onTimeout.subscribe(() => {
      this.idleState = "Su sesion ha vencido por inactividad!";
      this.timedOut = true;
      this.retirarBanderaSolicitud();
      if (this.url != "/login" && this.url != "/") {
        this.dialog.closeAll();
        this.openDialogMensaje(
          "¡Alerta!",
          "Sesión vencida por inactividad",
          true,
          false,
          null
        );
        this.logOut();
      } else {
        this.refreshIdle(SESION_IDELTIME, SESION_TIMEOUT);
      }
    });

    idle.onIdleStart.subscribe(() => (this.idleState = "You've gone idle!"));
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = "Su sesion expirará en " + countdown + " segundos!";
    });
  }

  reset() {
    this.idle.watch();
    this.idleState = "Started.";
    this.timedOut = false;
  }

  refreshIdle(sesion_ideltime: number, sesion_timeout: number) {
    this.idle.setIdle(Number(sesion_ideltime));
    this.idle.setTimeout(Number(sesion_timeout));
    this.reset();
  }

  public ngOnInit(): void {
    if (localStorage.getItem("codSolEva")) {
      this.retirarBanderaSolicitud();
    }

    this.reset();

    this.verificarLogin();
  }

  @HostListener("window:unload", ["$event"])
  unloadHandler(event) {
    // ...
    this.retirarBanderaSolicitud();
  }

  @HostListener("window:beforeunload", ["$event"])
  beforeUnloadHandler(event) {
    this.retirarBanderaSolicitud();
    // ...
  }

  public verificarLogin(): void {
    if (this.authService.isLoginEstado) {
      this.autenticacion
        .consultarUsuarioPersona(this.authService.getUsuario)
        .subscribe(
          (data: OncoWsResponse) => {
            if (data !== null && data.dataList.length > 0) {
              this.authService.setLoginEstado(
                true,
                this.authService.getUsuario
              );
              this.userService.setCodUsuario = data.dataList[0].codUsuario;
            } else {
              this.openDialogMensaje(
                "Ocurrio un error al obtener la información",
                null,
                true,
                false,
                null
              );
            }
          },
          (error) => {
            if (error.error.error === "invalid_token") {
              this.router.navigate(["./login"]);
            } else {
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                null,
                true,
                false,
                null
              );
            }
          }
        );
    }
  }

  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: "FARMACIA COMPLEJA",
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  logOut() {
    this.autenticacion.getRevokeToken().subscribe(
      (data: boolean) => {
        this.retirarBanderaSolicitud();
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.router.navigate(["./login"]);
        this.refreshIdle(SESION_IDELTIME, SESION_TIMEOUT);
      },
      (error) => {
        this.retirarBanderaSolicitud();
        console.error(error);
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.router.navigate(["./login"]);
      }
    );
  }

  retirarBanderaSolicitud() {
    let codSolEva = localStorage.getItem("codSolEva");
    let evaluacion = JSON.parse(localStorage.getItem("evaluacion"));
    var json = {
      codSolEva: codSolEva,
      tipo: "SALIENDO",
    };
    if (codSolEva == null) {
    } else {
      this.bandejaEvaluacionService.consultarBanderaEvaluacion(json);
    }
  }
}
