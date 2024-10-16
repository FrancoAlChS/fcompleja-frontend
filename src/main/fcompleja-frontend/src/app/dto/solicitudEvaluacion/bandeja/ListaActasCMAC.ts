import { ActasMac } from './ActasMac';
import { Participantes } from './Participantes';

export class ListaActasCMAC {
  fecha: String;
  fechaReal:String;
  hora: String;
  listaActasMAC: ActasMac[];
  listaParticipantes: Participantes[];
  codArchivo: number;
  codigoActa: any;
  nomComite : String;
}
