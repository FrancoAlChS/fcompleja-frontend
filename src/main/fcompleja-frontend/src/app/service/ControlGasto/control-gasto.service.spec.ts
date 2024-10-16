import { TestBed } from '@angular/core/testing';

import { ControlGastoService } from './control-gasto.service';

describe('ControlGastoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ControlGastoService = TestBed.get(ControlGastoService);
    expect(service).toBeTruthy();
  });
});
