import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private codUsuario: number;
  private userName: string;
  private nombres: string;
  private apelPaterno: string;
  private apelMaterno: string;
  private codRol: number;
  private rolDescripcion: string;
  private codFirma: number;

  constructor() { }

  set setCodUsuario(codUsuario: number) { this.codUsuario = codUsuario; }
  set setUserName(userName: string) { this.userName = userName; }
  set setNombres(nombres: string) {this.nombres = nombres; }
  set setApelPaterno(apelPaterno: string) {this.apelPaterno = apelPaterno; }
  set setApelMaterno(apelMaterno: string) {this.apelMaterno = apelMaterno; }
  set setCodRol(codRol: number) {this.codRol = codRol; }
  set setRolDescripcion(rolDescripcion: string) {this.rolDescripcion = rolDescripcion; }
  set setCodFirma(codFirma: number) { this.codFirma = codFirma; }

  get getCodUsuario() { return this.codUsuario; }
  get getUserName() { return this.userName; }
  get getNombres() { return this.nombres; }
  get getApelPaterno() { return this.apelPaterno; }
  get getApelMaterno() { return this.apelMaterno; }
  get getCodRol() { return this.codRol; }
  get getRolDescripcion() { return this.rolDescripcion; }
  get getCodFirma() { return this.codFirma; }

  public limpiarRegistro(): void {
    this.codUsuario = null;
    this.userName = null;
    this.nombres = null;
    this.apelPaterno = null;
    this.apelMaterno = null;
    this.codRol = null;
    this.rolDescripcion = null;
    this.codFirma = null;
    return null;
  }

}
