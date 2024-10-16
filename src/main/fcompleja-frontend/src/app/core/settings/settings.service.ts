import { Injectable } from '@angular/core';

export interface App {
  name: string;
  description: string;
  year: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public app: App;

  constructor() {

    this.app = {
      name: 'Farmacia Compleja',
      description: 'Aseguramiento Farmacia Compleja (AUNA)',
      year: ((new Date()).getFullYear())
    };
  }
}
