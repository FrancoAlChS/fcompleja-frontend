import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { AutenticacionService } from "../service/autenticacion.service";
import { UsuarioPersonaResponse } from "../dto/core/UsuarioPersonaResponse";
import { UsuarioService } from "../dto/service/usuario.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private loginEstado: boolean;

  constructor(
    private http: HttpClient,
    @Inject(UsuarioService) userService: UsuarioService,
    private autenticacionService: AutenticacionService
  ) {
    this.loginEstado = JSON.parse(
      localStorage.getItem("loginEstado") || "false"
    );
  }

  public setLoginEstado(value: boolean, currentUser: string) {
    this.loginEstado = value;
    localStorage.setItem("loginEstado", this.loginEstado + "");
    localStorage.setItem("tokUser", currentUser);
  }

  get getUsuario() {
    return localStorage.getItem("tokUser");
  }
  get isLoginEstado() {
    return JSON.parse(localStorage.getItem("loginEstado"));
  }
}
