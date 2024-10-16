import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  heightMax: number = 0;

  @ViewChild('mainScreen') elementView: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.calcularHeigth();
    },10);
  }

  ngOnInit() {

  }

  public calcularHeigth(): void {
    this.heightMax = window.innerHeight - (window.innerHeight * 0.11);
  }
}
