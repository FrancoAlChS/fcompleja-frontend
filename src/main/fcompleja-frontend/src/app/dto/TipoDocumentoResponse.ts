import { TipoDocumento } from './TipoDocumento';
export class TipoDocumentoResponse{
    code: any;
    status: string;
    message: string;
    data: any;
    lista: TipoDocumento[];
}