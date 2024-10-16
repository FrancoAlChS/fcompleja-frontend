import { TestBed } from '@angular/core/testing';

import { BandejaMonitoreoService } from './bandeja.monitoreo.service';

describe('BandejaMonitoreoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BandejaMonitoreoService = TestBed.get(BandejaMonitoreoService);
    expect(service).toBeTruthy();
  });
});
