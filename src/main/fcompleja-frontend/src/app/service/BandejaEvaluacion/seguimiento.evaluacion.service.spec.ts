import { TestBed } from '@angular/core/testing';

import { SeguimientoEvaluacionService } from './seguimiento.evaluacion.service';

describe('SeguimientoEvaluacionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SeguimientoEvaluacionService = TestBed.get(SeguimientoEvaluacionService);
    expect(service).toBeTruthy();
  });
});
