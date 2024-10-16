import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Inject,
  ChangeDetectorRef,
  OnDestroy,
} from "@angular/core";
import { CoreService } from "src/app/service/core.service";
import { MatSidenav } from "@angular/material";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { MediaMatcher } from "@angular/cdk/layout";
import { hideAnimation } from "src/app/animaciones/menu-animado";

import { GlobalService } from "src/app/service/global.service";
import { AESencryptionService } from "../../service/AESencryption.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
  animations: [hideAnimation],
})
export class MenuComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  menuItems = [];
  opened: boolean;
  @Input() arrMenuToggle;
  @ViewChild("sidenav") sideNav: MatSidenav;
  opcionMenu2: BOpcionMenuLocalStorage;

  hideTooltip: boolean;
  mostrarNombres: boolean;
  hideAnimacion: string;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private coreService: CoreService,
    @Inject(UsuarioService) private userService: UsuarioService,
    public globalService: GlobalService,
    public crypto: AESencryptionService,
    private router: Router
  ) {
    this.mobileQuery = media.matchMedia("(max-width: 600px)");
    //this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    //this.mobileQuery.addListener(this._mobileQueryListener);
  }

  ngOnDestroy(): void {
    //this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  ngOnInit() {
    /*const validarIntervalo = setInterval(() => {

    }, 100);*/
    //this.validarMenu();
    this.consultaMenu(this.userService.getCodUsuario);
    this.mostrarNombres = true;
    this.hideTooltip = this.mostrarNombres;
    this.hideAnimacion = "no-collapse";
  }

  validarMenu(){
    if (
      typeof this.userService.getCodUsuario !== "undefined" &&
      this.userService.getCodUsuario != null
    ) {
      this.consultaMenu(this.userService.getCodUsuario);
      //clearInterval(validarIntervalo);
    }else{
      //this.validarMenu();
      setTimeout(()=> {
        this.validarMenu();
      }, 100 )
    }
  }

  public consultaMenu(login_id: number) {
    let tokenTemporal = this.crypto.get(this.globalService.getToken());
    this.coreService.ConsultarMenu(login_id, tokenTemporal).subscribe(
      (data: OncoWsResponse) => {

        if (data.audiResponse.codigoRespuesta === "0") {
          let tokenTemporalResidente = this.crypto.get(
            this.globalService.getToken()
          );
          if (data.audiResponse.tokenTemporal === tokenTemporalResidente) {
            this.menuItems = data.dataList !== null ? data.dataList : [];
            this.menuItems.forEach((menu) => {
              if (menu.url === "#") {
                menu.enableLink = false;
                menu.url = null;
              } else {
                menu.enableLink = true;
                menu.url = `/app${menu.url}`;
              }

              if (menu.subMenu && menu.subMenu.length > 0) {
                menu.subMenu.forEach((sub) => {
                  sub.opened = false;
                  sub.url = `/app${sub.url}`;
                });
              }
            });
          }
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  public close() {
    this.sideNav.close();
  }

  public verificarSubMenu(menuItem): void {
    if (menuItem.subMenu && menuItem.subMenu.length > 0) {
      menuItem.subMenu.opened = !menuItem.subMenu.opened;
      this.menuItems.forEach((menu) => {
        if (menuItem !== menu) {
          menu.subMenu.opened = false;
        }
      });
    } else {
      this.opcionMenu(menuItem.codMenu, menuItem.opcionResponse);
    }
  }

  public opcionMenu(codMenu: Number, opcion: Object) {
    const opcionMenu: BOpcionMenuLocalStorage = new BOpcionMenuLocalStorage();
    opcionMenu.codMenu = Number(codMenu);
    opcionMenu.opcion = Object(opcion);
    localStorage.setItem("opcionMenu", JSON.stringify(opcionMenu));
    this.opcionMenu2 = JSON.parse(localStorage.getItem("opcionMenu"));
  }

  public verMenuLateral(): void {
    this.mostrarNombres = !this.mostrarNombres;
    this.hideTooltip = this.mostrarNombres;
    this.hideAnimacion =
      this.hideAnimacion === "collapse" ? "no-collapse" : "collapse";
  }

  public onActivate(e) {
    const scrollToTop = window.setInterval(() => {
      const pos = window.pageYOffset;
      if (pos > 0) {
        window.scrollTo(0, pos - 20);
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 16);
  }
}
