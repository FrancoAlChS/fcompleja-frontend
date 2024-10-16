import { Directive, Input, OnInit } from "@angular/core";
import { MatGridList } from "@angular/material";
import { MediaObserver, MediaChange } from "@angular/flex-layout";

export interface IResponsiveColumnsMap {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

@Directive({
  selector: "[responsiveCols]",
})
export class ResponsiveColsDirective implements OnInit {
  private countBySize: IResponsiveColumnsMap = {
    xs: 2,
    sm: 2,
    md: 4,
    lg: 6,
    xl: 8,
  };

  public get cols(): IResponsiveColumnsMap {
    return this.countBySize;
  }

  @Input("responsiveCols")
  public set cols(map: IResponsiveColumnsMap) {
    if (map && "object" === typeof map) {
      this.countBySize = map;
    }
  }

  public constructor(
    private grid: MatGridList,
    private serviceMedia: MediaObserver
  ) {
    // IMPORTANTE VERIFICAR SI SE NECESITA

    this.initializeColsCount();
  }
  public ngOnInit(): void {
    this.initializeColsCount();

    this.serviceMedia.media$.subscribe((changes: MediaChange) => {
      this.grid.cols = this.countBySize[changes.mqAlias];
    });
  }

  private initializeColsCount(): void {
    Object.keys(this.countBySize).some((mqAlias: string): boolean => {
      const isActive = this.serviceMedia.isActive(mqAlias);

      if (isActive) {
        this.grid.cols = this.countBySize[mqAlias];
      }

      return isActive;
    });
  }
}
