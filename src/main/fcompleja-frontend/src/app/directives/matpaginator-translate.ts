import { Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material';

@Injectable()
export class MatPaginatorIntlEspanol extends MatPaginatorIntl {
  itemsPerPageLabel = 'Registros por Página: ';
  firstPageLabel = 'Primera página';
  nextPageLabel = 'Página siguiente';
  previousPageLabel = 'Página Anterior';
  lastPageLabel = 'Última página';

  getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length} Registros`;
  }
}
