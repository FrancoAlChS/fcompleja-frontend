import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    private token: string;
    private visible: boolean = false;

    constructor() { }

    public setToken(t: string): void {
        this.token = t;
    }

    public getToken(): string {
        return this.token;
    }

    public setVisible(v: boolean): void {
        this.visible = v;
    }

    public getVisible(): boolean {
        return this.visible;
    }
}
