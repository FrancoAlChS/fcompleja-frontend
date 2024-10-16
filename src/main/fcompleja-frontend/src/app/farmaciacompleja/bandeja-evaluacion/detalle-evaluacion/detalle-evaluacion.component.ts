import {
  Component,
  Inject,
  NgZone,
  OnInit,
  ViewChild,
  forwardRef,
} from "@angular/core";
import { MACResponse } from "src/app/dto/configuracion/MACResponse";

import { MacService } from "src/app/service/mac.service";
// Others
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDialog,
  MatPaginator,
  MatPaginatorIntl,
  MatSort,
  MatTableDataSource,
} from "@angular/material";
import { Router } from "@angular/router";
import {
  ACCESO_EVALUACION,
  EMAIL,
  ESTADOEVALUACION,
  ESTADOMONITOREOMED,
  ESTADO_LINEA_TRAT,
  FILEFTP,
  MENSAJES,
  MY_FORMATS_MONTH,
  PARAMETRO,
  ROLES,
  TIPOSCGSOLBEN,
  TIPO_SOL_EVA
} from "src/app/common";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { WsResponse } from "src/app/dto/WsResponse";
import { ApiResponse } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ApiResponse";
import { InfoAnteOncoPers } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoAnteOncoPers";
import { InfoAntecOncoFam } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoAntecOncoFam";
import { InfoAntecPatoPers } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoAntecPatoPers";
import { InfoAntecPersGine } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoAntecPersGine";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { EvaluacionAutorizadorRequest } from "src/app/dto/request/EvaluacionAutorizadorRequest";
import { SolbenRequest } from "src/app/dto/request/SolbenRequest";
import { LineaTratamiento } from "src/app/dto/solicitudEvaluacion/bandeja/LineaTratamiento";
import { listaLineaTratamientoRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { EvaluacionLiderTumorComponent } from "../evaluacion.lider.tumor/evaluacion.lider.tumor.component";
import { PreguntaLineaTratComponent } from "./registro.historico.dialog.component";

import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { DatePipe } from "@angular/common";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import * as _moment from "moment";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { take } from "rxjs/operators";
import { MessageComponent } from "src/app/core/message/message.component";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { EmailDTO } from "src/app/dto/core/EmailDTO";
import { EnvioCorreoRequest } from "src/app/dto/core/EnvioCorreoRequest";
import { BandejaMonitoreoRequest } from "src/app/dto/request/BandejaMonitoreo/BandejaMonitoreoRequest";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { MonitoreoResponse } from "src/app/dto/response/BandejaMonitoreo/MonitoreoResponse";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { CoreService } from "src/app/service/core.service";
import { CorreosService } from "src/app/service/cross/correos.service";
import { GlobalService } from "src/app/service/global.service";
import { AESencryptionService } from "./../../../service/AESencryption.service";

@Component({
  selector: "app-detalle-evaluacion",
  templateUrl: "./detalle-evaluacion.component.html",
  styleUrls: ["./detalle-evaluacion.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_MONTH },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class DetalleEvaluacionComponent implements OnInit {
  codLiderTumor: number;
  nombreLiderTumor: string;
  proBarTabla: boolean;
  liderTumor: number;
  mostrarBtnAlertMon: boolean = false;
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  existePrevioSolido = false;
  existeActualSolido = false;
  codigoTratamientoActual: any;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  datosFrmGroup: FormGroup;
  detalleFrmGroup: FormGroup;
  TprevioLiquidoInicial = [];
  TactualLiquidoInicial = "";
  codigoTratamiento = "";
  existeFormAntecedente: Number;
  hayTratamientos = false;
  //Antecedentes
  fieldArray = new FormArray([]);
  fieldFamiliar1erGrado = new FormArray([]);
  fieldFamiliar2doGrado = new FormArray([]);
  arrayAntecOncoPers = [];
  arrayAntecOncoFam = [];
  arrayAntecOncoFam1 = [];
  arrayAntecOncoFam2 = [];
  AntecOncoOtros = "";
  AplicaAntecOncoPer = Number;
  AplicaAntecOncoFam_1 = Number;
  dataGlobal: any = {};
  isRequired = false;
  isRequired2 = false;
  variable: boolean = true;
  CodigoAntecedente = "";
  listaMedicamentos;
  listaRespuesta;

  listaLugar;
  listaLugarMieldi;
  listaLugarLin;
  listaLugarMielo;
  listaLugarLeu;
  listaLinea;
  listaMotivo;

  //antecedentesFrmGrp: FormGroup;
  aplica5;
  aplica6;
  aplica7;
  aplica8;
  aplica9;
  noAplica5;
  noAplica6;
  noAplica7;
  noAplica8;
  noAplica9;
  solido;
  noSolido;
  solido2;
  noSolido2;

  codEstadoEva: Number;
  pTipoEva: number;
  disableMedNuevo: boolean;
  disableMedCont: boolean;

  fam1btnAdd: boolean = true;
  fam2btnAdd: boolean = true;

  chkFamiliar1 = new FormControl(false);
  chkFamiliar2 = new FormControl(false);

  isEditable = false;
  isEditable2 = false;
  tipoMielo: any;
  hideBotonMon: boolean = true;
  invisibleModal: boolean;
  dataMonitoreo: MonitoreoResponse[];
  listMonit: MonitoreoResponse;
  modeConsulta;
  menuItems = [];
  menu;
  isContinuador: boolean = true;
  isFlujoNuevo: boolean = true;

  existsInArray(arr = [], item) {
    if (arr) {
      return arr.includes(item + "");
    }
    return false;
  }

  editableStatus() {
    this.isEditable = !this.isEditable;
    if (this.isEditable) {
      this.activarTratamientos();
    } else {
      this.desactivarTratamientos();
    }
  }
  editableStatus2() {
    this.isEditable2 = !this.isEditable2;
    if (this.isEditable2 && this.tratamientoActual.value.aplica) {
      this.activarTratamientos2();
    } else {
      this.desactivarTratamientos2();
    }
  }
  desactivarGrupo(form: FormGroup, aplica = false) {
    const keys = Object.keys(form.value);
    keys.forEach((el) => {
      form.get(el).disable();
    });
  }
  activarGrupo(form: FormGroup) {
    const keys = Object.keys(form.value);
    keys.forEach((el) => {
      form.get(el).enable();
    });
  }
  desactivarArray(arr, aplica = false, callback = () => {}) {
    arr.controls.forEach((el) => {
      this.desactivarGrupo(el, aplica);
    });
    callback();
  }
  activarArray(arr) {
    arr.controls.forEach((el) => {
      if (el.getRawValue().aplica) {
        this.activarGrupo(el);
      } else {
        el.controls.aplica.enable();
      }
    });
  }

  log(message) {}

  private revisarObjVacio(obj) {
    if (!obj.aplica) return true;
    for (let i in obj) {
      if (
        (typeof obj[i] == "string" || typeof obj[i] == "number") &&
        obj[i] != "" &&
        obj.aplica
      )
        return true;
    }
    return false;
  }

  private revisarArrayVacio(array) {
    const newArr = array.filter((el) => {
      return this.revisarObjVacio(el);
    });

    return newArr.length == 0;
  }
  //antecedentesPatPersonalesFrmGrp: FormGroup;
  //antecedentesOncoPersonalesFrmGrp: FormGroup;
  //antecedentesOncoFamFrmGrp: FormGroup;
  //antecedentesOtros: FormGroup;

  apiToDataRadio() {
    const adyuvante = [];
    const neoAdyuvante = [];
    const paliativa = [];
    this.dummieData.trat_radio.trat_radio_adyuvante.map((el) => {
      adyuvante.push({
        region: el.regionTrat,
        fecha_inicio: el.fechIni,
        tipo_dosis: el.tipoDosis,
        fecha_fin: el.fechFin,
        observaciones: el.observaciones,
        aplica: true,
      });
    });
    this.dummieData.trat_radio.trat_radio_neoadyuvante.map((el) => {
      neoAdyuvante.push({
        region: el.regionTrat,
        fecha_inicio: el.fechIni,
        tipo_dosis: el.tipoDosis,
        fecha_fin: el.fechFin,
        observaciones: el.observaciones,
        aplica: true,
      });
    });
    this.dummieData.trat_radio.trat_radio_paliativa.map((el) => {
      paliativa.push({
        region: el.regionTrat,
        fecha_inicio: el.fechIni,
        tipo_dosis: el.tipoDosis,
        fecha_fin: el.fechFin,
        observaciones: el.observaciones,
        aplica: true,
      });
    });
    return {
      adyuvante: adyuvante,
      neoAdyuvante: neoAdyuvante,
      paliativa: paliativa,
    };
  }

  apiToDataPalia() {
    const dolor = [];
    const compasivo = [];
    this.dummieData.trat_paliativo.trat_paliativo_dolor.map((el) => {
      dolor.push({
        dosis: el.dosis,
        tipo: el.tipo,
        fecha_inicio: el.fechIni,
        aplica: el.aplica,
        fecha_fin: el.fechFin,
        observaciones: el.observaciones,
      });
    });
    this.dummieData.trat_paliativo.trat_paliativo_compasivo.map((el) => {
      compasivo.push({
        dosis: el.dosis,
        aplica: el.aplica,
        tipo: el.tipo,
        fecha_inicio: el.fechIni,
        fecha_fin: el.fechFin,
        observaciones: el.observaciones,
      });
    });
    return { dolor: dolor, compasivo: compasivo };
  }

  apiToDataAntineo(data) {
    const adyuvante = [];
    const neoAdyuvante = [];
    const metastasico = [];
    const linfoMante = [];
    const linfolineas = [];
    const mieloInd = [];
    const mieloMante = [];
    const mieloRel = [];
    const leuInd = [];
    const leuMant = [];
    const leuCon = [];
    const leuRel = [];
    const mieldiLineas = [];
    const mielproLineas = [];

    data.trat_ta_tum_solido.map((el) => {
      if (el.terap_antineo_tipo_solido == "369") {
        adyuvante.push({
          fecha_inicio: el.fechIni,
          fecha_fin: el.fechFin,
          aplica: true,
          medicamento: el.medicamento,
          otros: el.espc_otros,
          n_cursos: el.num_cursos,
          estado_trat: el.estado_trat,
          resp_alc: el.resp_alc,
          lugar: el.lug_recu,
          mot_inac: el.mot_inac,
          medico_tratante: el.med_trat,
          observaciones: el.observaciones,
        });
      } else if (el.terap_antineo_tipo_solido == "370") {
        neoAdyuvante.push({
          fecha_inicio: el.fechIni,
          fecha_fin: el.fechFin,
          aplica: true,
          medicamento: el.medicamento,
          otros: el.espc_otros,
          estado_trat: el.estado_trat,
          n_cursos: el.num_cursos,
          resp_alc: el.resp_alc,
          lugar: el.lug_recu,
          mot_inac: el.mot_inac,
          medico_tratante: el.med_trat,
          observaciones: el.observaciones,
        });
      } else if (el.terap_antineo_tipo_solido == "371") {
        metastasico.push({
          fecha_inicio: el.fechIni,
          fecha_fin: el.fechFin,
          aplica: true,
          estado_trat: el.estado_trat,
          medicamento: el.medicamento,
          lineas_tratamiento: el.lineas_tratamiento + "",
          otros: el.espc_otros,
          n_cursos: el.num_cursos,
          resp_alc: el.resp_alc,
          lugar: el.lug_recu,
          mot_inac: el.mot_inac,
          medico_tratante: el.med_trat,
          observaciones: el.observaciones,
        });
      }
    });

    data.trat_ta_tum_liquido.trat_ta_tl_linfoma
      .concat(
        data.trat_ta_tum_liquido.trat_ta_tl_leucemia,
        data.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico,
        data.trat_ta_tum_liquido.trat_ta_tl_mieloma,
        data.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo
      )
      .map((el) => {
        //@ts-ignore
        if (
          el.terap_antineo_tipo_liquido == "372" &&
          el.terap_antineo_tipo_linfo == "377"
        ) {
          linfoMante.push({
            fecha_inicio: el.fechIni,

            fecha_fin: el.fechFin,
            aplica: true,
            estado_trat: el.estado_trat,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            //@ts-ignore
            organo: el.espc_org || "",
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "372" &&
          el.terap_antineo_tipo_linfo == "378"
        ) {
          linfolineas.push({
            //@ts-ignore
            lineas_tratamiento: el.lineas_tratamiento + "",

            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            //@ts-ignore
            organo: el.espc_org || "",
            estado_trat: el.estado_trat,
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "373" &&
          el.terap_antineo_tipo_mielo == "379"
        ) {
          mieloInd.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            //@ts-ignore
            organo: el.espc_org || "",
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            estado_trat: el.estado_trat,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "373" &&
          el.terap_antineo_tipo_mielo == "380"
        ) {
          mieloMante.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            //@ts-ignore
            organo: el.espc_org || "",
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            estado_trat: el.estado_trat,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "373" &&
          el.terap_antineo_tipo_mielo == "381"
        ) {
          mieloRel.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            //@ts-ignore
            organo: el.espc_org || "",
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            estado_trat: el.estado_trat,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "374" &&
          el.terap_antineo_tipo_leuce == "382"
        ) {
          leuInd.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            estado_trat: el.estado_trat,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "374" &&
          el.terap_antineo_tipo_leuce == "383"
        ) {
          leuMant.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            estado_trat: el.estado_trat,
            organo: el.espc_org || "",

            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "374" &&
          el.terap_antineo_tipo_leuce == "384"
        ) {
          leuCon.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            organo: el.espc_org || "",

            lugar: el.lug_recu,
            estado_trat: el.estado_trat,
            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (
          el.terap_antineo_tipo_liquido == "374" &&
          el.terap_antineo_tipo_leuce == "385"
        ) {
          leuRel.push({
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            organo: el.espc_org || "",
            estado_trat: el.estado_trat,
            lugar: el.lug_recu,
            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else if (el.terap_antineo_tipo_liquido == "375") {
          mieldiLineas.push({
            //@ts-ignore
            n_lineas: el.lin_tratamiento,
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            aplica: true,
            medicamento: el.medicamento,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            //@ts-ignore
            transformacion_leucemia: el.trans_leuc_aguda == 1,
            mot_inac: el.mot_inac,
            estado_trat: el.estado_trat,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
          //@ts-ignore
        } else {
          //@ts-ignore
          this.tipoMielo = el.terap_antineo_tipo_mieloproliferativo;
          mielproLineas.push({
            //@ts-ignore
            n_lineas: el.lin_tratamiento,
            fecha_inicio: el.fechIni,
            fecha_fin: el.fechFin,
            tipo_miel: el.terap_antineo_tipo_mieloproliferativo,
            aplica: true,
            medicamento: el.medicamento,
            estado_trat: el.estado_trat,
            otros: el.espc_otros,
            n_cursos: el.num_cursos,
            resp_alc: el.resp_alc,
            lugar: el.lug_recu,
            //@ts-ignore
            transformacion_leucemia: el.trans_leuc_aguda,
            mot_inac: el.mot_inac,
            medico_tratante: el.med_trat,
            observaciones: el.observaciones,
          });
        }
      });

    return {
      adyuvante,
      neoAdyuvante,
      metastasico,
      linfoMante,
      linfolineas,
      mieloInd,
      mieloMante,
      mieloRel,
      leuInd,
      leuMant,
      leuCon,
      leuRel,
      mieldiLineas,
      mielproLineas,
    };
  }

  findActual() {
    const value = this.apiToDataAntineo(
      this.dummieData.trat_terap_antineoplasica
    );

    value.adyuvante.forEach((el) => {
      if (el.estado_trat == true) {
        this.tratamientoActual.controls.adyuvante = this.transformToFormArray(
          value.adyuvante
        );
      }
    });
  }

  dummieData2 = {
    trat_ciru: [
      {
        condicion: false,
        fecha: "",
        tipo_cirugia: "",
        hallazgos: "",
      },
    ],
    trat_radio: {
      condicion: false,
      trat_radio_adyuvante: [
        {
          tipoRad: 362,
          regionTrat: "",
          fechIni: "",
          tipoDosis: "",
          fechFin: "",
          observaciones: "",
        },
      ],
      trat_radio_neoadyuvante: [],
      trat_radio_paliativa: [],
    },
    trat_paliativo: {
      condicion: false,
      trat_paliativo_dolor: [],
      trat_paliativo_compasivo: [],
    },
    trat_terap_antineoplasica: {
      condicion: true,
      trat_ta_tum_solido: [],
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: [],
        trat_ta_tl_mieloma: [],
        trat_ta_tl_leucemia: [],
        trat_ta_tl_sindmielodisplasico: [],
        trat_ta_tl_sindmieloproliferativo: [],
      },
    },
    codigo_usu_trat: {
      estadoTrat: false,
      cod_evaluacion_trat: "0000000088",
      cod_solben_trat: "1912045939",
      cod_usuario_trat: 13001,
      nombres_trat: "LAURA",
      apellido_paterno_trat: "OLIVARES",
      apellido_materno_trat: "MONGRUT",
      codigo_afiliado_trat: "10008743100104787",
    },
  };
  dummieData = {
    trat_ciru: [
      {
        condicion: false,
        fecha: "",
        tipo_cirugia: "",
        hallazgos: "",
        modificado: false,
      },
    ],
    trat_radio: {
      condicion: false,
      modificado: false,
      trat_radio_adyuvante: [
        {
          tipoRad: 362,
          regionTrat: "",
          fechIni: "",
          tipoDosis: "",
          fechFin: "",
          observaciones: "",
        },
      ],
      trat_radio_neoadyuvante: [],
      trat_radio_paliativa: [],
    },
    trat_paliativo: {
      condicion: false,
      modificado: false,
      trat_paliativo_dolor: [],
      trat_paliativo_compasivo: [],
    },
    trat_terap_antineoplasica: {
      condicion: false,
      modificado: false,
      trat_ta_tum_solido: [],
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: [],
        trat_ta_tl_mieloma: [],
        trat_ta_tl_leucemia: [],
        trat_ta_tl_sindmielodisplasico: [],
        trat_ta_tl_sindmieloproliferativo: [],
      },
    },
    trat_terap_actual: {
      condicion: false,
      modificado: false,
      trat_ta_tum_solido: [],
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: [],
        trat_ta_tl_mieloma: [],
        trat_ta_tl_leucemia: [],
        trat_ta_tl_sindmielodisplasico: [],
        trat_ta_tl_sindmieloproliferativo: [],
      },
    },
    codigo_usu_trat: {
      cod_evaluacion_trat: "0000000088",
      cod_solben_trat: "1912045939",
      cod_usuario_trat: 13001,
      nombres_trat: "LAURA",
      apellido_paterno_trat: "OLIVARES",
      apellido_materno_trat: "MONGRUT",
      codigo_afiliado_trat: "10008743100104787",
    },
  };

  registrarTratamientoActual() {
    let data = JSON.parse(JSON.stringify(this.dummieData2));
    if (data.trat_ciru.length == 0) {
      data.trat_ciru = [
        {
          condicion: false,
          fecha: "",
          tipo_cirugia: "",
          hallazgos: "",
        },
      ];
    }
    data.codigo_usu_trat = {
      estadoTrat: false,
      cod_evaluacion_trat: this.codSolEvaluacionFrmCtrl.value,
      cod_solben_trat: this.codScgSolbenFrmCtrl.value,
      cod_usuario_trat: this.userService.getCodUsuario,
      nombres_trat: this.userService.getNombres,
      apellido_paterno_trat: this.userService.getApelPaterno,
      apellido_materno_trat: this.userService.getApelMaterno,
      codigo_afiliado_trat:
        this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
    };

    if (this.existeActual && this.codigoTratamientoActual) {
      data.codigo_usu_trat["cod_tratamiento"] = this.codigoTratamientoActual;
    }

    if (!this.tratamientoActual.value.aplica) {
      this.mensaje = "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      return false;
    }

    if (this.tratamientoActual.value.aplica) {
      if (
        this.revisarArrayVacio(this.tratamientoActual.value.adyuvante) ||
        this.revisarArrayVacio(this.tratamientoActual.value.neoAdyuvante) ||
        this.revisarArrayVacio(this.tratamientoActual.value.metastasico)
      ) {
        this.mensaje = "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
      // data.trat_terap_antineoplasica.trat_ta_tum_solido = data.trat_terap_antineoplasica.trat_ta_tum_solido.filter(
      //   (el) => el.estado_trat == true
      // );
      // data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma = data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma.filter(
      //   (el) => el.estado_trat == true
      // );
      // data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma = data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.filter(
      //   (el) => el.estado_trat == true
      // );
      // data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia = data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.filter(
      //   (el) => el.estado_trat == true
      // );
      // data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico = data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico.filter(
      //   (el) => el.estado_trat == true
      // );
      // data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo = data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo.filter(
      //   (el) => el.estado_trat == true
      // );

      if (this.tratamientoActual.value.solido) {
        if (
          this.tratamientoActual.value.solido &&
          !this.validarAplicas(this.tratamientoActual.value.adyuvante) &&
          !this.validarAplicas(this.tratamientoActual.value.neoAdyuvante) &&
          !this.validarAplicas(this.tratamientoActual.value.metastasico)
        ) {
          this.mensaje =
            "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR SOLIDO)";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        }
        this.tratamientoActual.value.adyuvante.forEach((el) => {
          if (el.aplica) {
            data.trat_terap_antineoplasica.trat_ta_tum_solido.push({
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              terap_antineo_tipo_solido: "369",
              terap_antineo_tipo_tumor: "367",
              medicamento: el.medicamento,
              espc_otros: el.otros,
              num_cursos: el.n_cursos,
              lug_recu: el.lugar,
              mot_inac: el.mot_inac,
              med_trat: el.medico_tratante,
              observaciones: el.observaciones,
              resp_alc: el.resp_alc,
              estado_trat: false,
            });
          }
        });
        this.tratamientoActual.value.neoAdyuvante.forEach((el) => {
          if (el.aplica) {
            data.trat_terap_antineoplasica.trat_ta_tum_solido.push({
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              medicamento: el.medicamento,
              espc_otros: el.otros,
              terap_antineo_tipo_solido: "370",
              terap_antineo_tipo_tumor: "367",
              num_cursos: el.n_cursos,
              lug_recu: el.lugar,
              resp_alc: el.resp_alc,
              mot_inac: el.mot_inac,
              med_trat: el.medico_tratante,
              observaciones: el.observaciones,
              estado_trat: false,
            });
          }
        });
        this.tratamientoActual.value.metastasico.forEach((el) => {
          if (el.aplica) {
            data.trat_terap_antineoplasica.trat_ta_tum_solido.push({
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              medicamento: el.medicamento,
              espc_otros: el.otros,
              //@ts-ignore
              lin_tratamiento: el.lineas_tratamiento + "",
              num_cursos: el.n_cursos,
              lug_recu: el.lugar,
              terap_antineo_tipo_solido: "371",
              terap_antineo_tipo_tumor: "367",
              resp_alc: el.resp_alc,
              mot_inac: el.mot_inac,
              med_trat: el.medico_tratante,
              observaciones: el.observaciones,
              estado_trat: false,
            });
          }
        });
      } else {
        if (
          !this.tratamientoActual.value.solido &&
          !this.tratamientoActual.value.tipo
        ) {
          this.mensaje =
            "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        }
        switch (this.tratamientoActual.value.tipo) {
          case "372": {
            if (
              this.tratamientoActual.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttLinfoma.mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLinfoma.mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LINFOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }

            this.tratamientoActual.value.ttLinfoma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_liquido: "372",
                      terap_antineo_tipo_linfo: "377",
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      espc_org: el.organo,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            this.tratamientoActual.value.ttLinfoma.lineas_tto.forEach((el) => {
              if (el.aplica) {
                data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                  {
                    lin_tratamiento: el.lineas_tratamiento + "",
                    fechIni: el.fecha_inicio,
                    espc_org: el.organo,
                    terap_antineo_tipo_liquido: "372",
                    terap_antineo_tipo_linfo: "378",

                    fechFin: el.fecha_fin,
                    medicamento: el.medicamento,
                    resp_alc: el.resp_alc,
                    espc_otros: el.otros,
                    num_cursos: el.n_cursos,
                    lug_recu: el.lugar,
                    mot_inac: el.mot_inac,
                    med_trat: el.medico_tratante,
                    observaciones: el.observaciones,
                    estado_trat: false,
                  }
                );
              }
            });
            break;
          }
          case "373": {
            if (
              this.tratamientoActual.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttMieloma.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttMieloma.mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttMieloma.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttMieloma.mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoActual.value.ttMieloma.induccion.forEach((el) => {
              if (el.aplica) {
                data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                  {
                    fechIni: el.fecha_inicio,
                    fechFin: el.fecha_fin,
                    medicamento: el.medicamento,
                    resp_alc: el.resp_alc,
                    espc_org: el.organo,
                    espc_otros: el.otros,
                    num_cursos: el.n_cursos,
                    terap_antineo_tipo_liquido: "373",
                    terap_antineo_tipo_mielo: "379",
                    lug_recu: el.lugar,
                    mot_inac: el.mot_inac,
                    med_trat: el.medico_tratante,
                    observaciones: el.observaciones,
                    estado_trat: false,
                  }
                );
              }
            });
            this.tratamientoActual.value.ttMieloma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_org: el.organo,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "380",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            this.tratamientoActual.value.ttMieloma.relapso.forEach((el) => {
              if (el.aplica) {
                data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                  {
                    fechIni: el.fecha_inicio,
                    fechFin: el.fecha_fin,
                    medicamento: el.medicamento,
                    resp_alc: el.resp_alc,
                    espc_otros: el.otros,
                    num_cursos: el.n_cursos,
                    espc_org: el.organo,
                    terap_antineo_tipo_liquido: "373",
                    terap_antineo_tipo_mielo: "381",
                    lug_recu: el.lugar,
                    mot_inac: el.mot_inac,
                    med_trat: el.medico_tratante,
                    observaciones: el.observaciones,
                    estado_trat: false,
                  }
                );
              }
            });
            break;
          }
          case "374": {
            if (
              this.tratamientoActual.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttLeucemia.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttLeucemia.mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.value.ttLeucemia
              ) &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLeucemia.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLeucemia.mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLeucemia.consolidacion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LEUCEMIA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoActual.value.ttLeucemia.induccion.forEach((el) => {
              if (el.aplica) {
                data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                  {
                    fechIni: el.fecha_inicio,
                    fechFin: el.fecha_fin,
                    medicamento: el.medicamento,
                    resp_alc: el.resp_alc,
                    espc_otros: el.otros,
                    num_cursos: el.n_cursos,
                    lug_recu: el.lugar,
                    terap_antineo_tipo_liquido: "374",
                    terap_antineo_tipo_leuce: "382",
                    mot_inac: el.mot_inac,
                    med_trat: el.medico_tratante,
                    observaciones: el.observaciones,
                    estado_trat: false,
                  }
                );
              }
            });
            this.tratamientoActual.value.ttLeucemia.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "383",
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            this.tratamientoActual.value.ttLeucemia.consolidacion.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "384",
                      espc_org: el.organo,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            this.tratamientoActual.value.ttLeucemia.relapso.forEach((el) => {
              if (el.aplica) {
                data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                  {
                    fechIni: el.fecha_inicio,
                    fechFin: el.fecha_fin,
                    medicamento: el.medicamento,
                    resp_alc: el.resp_alc,
                    espc_otros: el.otros,
                    terap_antineo_tipo_liquido: "374",
                    terap_antineo_tipo_leuce: "385",
                    num_cursos: el.n_cursos,
                    lug_recu: el.lugar,
                    espc_org: el.organo,
                    mot_inac: el.mot_inac,
                    med_trat: el.medico_tratante,
                    observaciones: el.observaciones,
                    estado_trat: false,
                  }
                );
              }
            });
            break;
          }
          case "375": {
            if (
              this.tratamientoActual.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttMielodisplasico.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttMielodisplasico.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELODISPLASICO ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoActual.value.ttMielodisplasico.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      terap_antineo_tipo_liquido: "375",
                      trat_ta_tl_sindmielodisplasico: "",
                      espc_otros: el.otros,
                      lug_recu: el.lugar,
                      num_cursos: el.n_cursos,
                      trans_leuc_aguda: el.transformacion_leucemia ? 1 : 0,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            break;
          }
          case "376": {
            if (
              this.tratamientoActual.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoActual.value.ttMieloprofilerativo.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoActual.value.ttMieloprofilerativo.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOPROFILERATIVO-OTROS ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoActual.value.ttMieloprofilerativo.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  data.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_mieloproliferativo:
                        this.tratamientoActual.value.ttMieloprofilerativo
                          .tipo_terapia,
                      medicamento: el.medicamento,
                      terap_antineo_tipo_liquido: "376",
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      trans_leuc_aguda: el.transformacion_leucemia,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: false,
                    }
                  );
                }
              }
            );
            break;
          }
        }
      }
    }

    if (this.existeActual && this.codigoTratamientoActual) {
      this.detalleServicioSolEva.editarTratamientosPacientes(data).subscribe(
        (data) => {
          this.mensaje = "Guardado exitosamente";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          if (this.tratamientoActual.value.solido) {
            localStorage.setItem("tipo_tumor", "Tumor Solido");
          } else {
            localStorage.setItem("tipo_tumor", "Tumor Liquido");
          }

          // if (data.status === '0') {

          // } else {
          //   console.error(data);
          //   this.mensaje = 'No se logró obtener la información correctamente.';
          //   this.openDialogMensaje(this.mensaje, null, true, false, null);
          //   this.spinnerService.hide();
          // }
        },
        (error) => {
          console.error(error);

          this.mensaje = error;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
    } else {
      data.codigo_usu_trat["nombClinica"] = this.infoSolben.clinica;
      data.codigo_usu_trat["diagnostico"] = this.infoSolben.diagnostico;
      data.codigo_usu_trat["tipoDoc"] = this.infoSolben.tipoDoc;
      data.codigo_usu_trat["numDoc"] = this.infoSolben.numDoc;

      this.detalleServicioSolEva.registrarTratamientosPacientes(data).subscribe(
        (data) => {
          this.mensaje = "Guardado exitosamente";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          if (this.tratamientoActual.value.solido) {
            localStorage.setItem("tipo_tumor", "Tumor Solido");
          } else {
            localStorage.setItem("tipo_tumor", "Tumor Liquido");
          }
          // if (data.status === '0') {

          // } else {
          //   console.error(data);
          //   this.mensaje = 'No se logró obtener la información correctamente.';
          //   this.openDialogMensaje(this.mensaje, null, true, false, null);
          //   this.spinnerService.hide();
          // }
        },
        (error) => {
          console.error(error);

          this.mensaje = error;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
    }
  }

  // transform

  transformToFormGroup(obj) {
    const newObj = {};
    for (let o in obj) {
      newObj[o] = new FormControl(obj[o]);
    }
    return new FormGroup(newObj);
  }
  transformToFormArray(arr) {
    const newArr = arr.map((el) => {
      return this.transformToFormGroup(el);
    });
    return new FormArray(newArr);
  }

  public codSolEvaluacion: any;
  public flagLiderTumor: string;
  public step: number;

  public solbenRequest: SolbenRequest = new SolbenRequest();
  public evaAutorizadorRequest: EvaluacionAutorizadorRequest =
    new EvaluacionAutorizadorRequest();

  public mostrarBoton: boolean;

  request: InformeSolEvaReporteRequest = new InformeSolEvaReporteRequest();
  listaLineaTratamientoRequest: listaLineaTratamientoRequest =
    new listaLineaTratamientoRequest();
  rpta = {};
  listaHistoriaLineaTrata: LineaTratamiento[] = [];
  linea: String;
  existeActual: boolean;
  codMac: any;
  codAfiliado: any;

  mostraEvaluacion: boolean;
  resultadoEvaluacionLiderTumor: any[] = [];
  correoRequest: EmailDTO;
  envioCorreoRequest: EnvioCorreoRequest;
  archivoRqt: ArchivoFTP;

  ESTADOEVALUACION: any = ESTADOEVALUACION;

  // DECLARACION DE LAS VARIABLES FORMGROUP Y FORMCONTROL DETALLE EVALUACION
  detEvaluacionFrmGrp: FormGroup = new FormGroup({
    codSolEvaluacionFrmCtrl: new FormControl(null),
    estadoDescripFrmCtrl: new FormControl(null),
    descripCodMacFrmCtrl: new FormControl(null),
    descripMacFrmCtrl: new FormControl(null),
    codScgSolbenFrmCtrl: new FormControl(null),
    estadoScgSolbenFrmCtrl: new FormControl(null),
    fechaScgSolbenFrmCtrl: new FormControl(null),
    tipoScgSolbenFrmCtrl: new FormControl(null),
    nroCartaGarantiaFrmCtrl: new FormControl(null),
    clinicaFrmCtrl: new FormControl(null),
    medicoTrataPrescripFrmCtrl: new FormControl(null),
    cmpMedicoFrmCtrl: new FormControl(null),
    fechaRecetaFrmCtrl: new FormControl(null),
    fechaQuimioterapiaFrmCtrl: new FormControl(null),
    fechaHospitalInicioFrmCtrl: new FormControl(null),
    fechaHospitalFinFrmCtrl: new FormControl(null),
    descripMedicamentoFrmCtrl: new FormControl(null),
    esquemaFrmCtrl: new FormControl(null),
    personaContactoFrmCtrl: new FormControl(null),
    totalPresupuestoFrmCtrl: new FormControl(null),
    pacienteFrmCtrl: new FormControl(null),
    edadFrmCtrl: new FormControl(null),
    descripDiagFrmCtrl: new FormControl(null),
    codDiagFrmCtrl: new FormControl(null),
    descripGrupoDiagFrmCtrl: new FormControl(null),
    contratanteFrmCtrl: new FormControl(null),
    planFrmCtrl: new FormControl(null),
    codAfiliadoFrmCtrl: new FormControl(null),
    fechaAfiliacionFrmCtrl: new FormControl(null),
    estadioClinicoFrmCtrl: new FormControl(null),
    tnmFrmCtrl: new FormControl(null),
    observacionFrmCtrl: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null),
  });

  get codSolEvaluacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codSolEvaluacionFrmCtrl");
  }
  get estadoDescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoDescripFrmCtrl");
  }
  get descripCodMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripCodMacFrmCtrl");
  }
  get descripMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMacFrmCtrl");
  }
  get codScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codScgSolbenFrmCtrl");
  }
  get estadoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoScgSolbenFrmCtrl");
  }
  get fechaScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaScgSolbenFrmCtrl");
  }
  get tipoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tipoScgSolbenFrmCtrl");
  }
  get nroCartaGarantiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("nroCartaGarantiaFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("clinicaFrmCtrl");
  }
  get medicoTrataPrescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("medicoTrataPrescripFrmCtrl");
  }
  get cmpMedicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("cmpMedicoFrmCtrl");
  }
  get fechaRecetaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaRecetaFrmCtrl");
  }
  get fechaQuimioterapiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaQuimioterapiaFrmCtrl");
  }
  get fechaHospitalInicioFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalInicioFrmCtrl");
  }
  get fechaHospitalFinFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalFinFrmCtrl");
  }
  get descripMedicamentoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMedicamentoFrmCtrl");
  }
  get esquemaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("esquemaFrmCtrl");
  }
  get personaContactoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("personaContactoFrmCtrl");
  }
  get totalPresupuestoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("totalPresupuestoFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("pacienteFrmCtrl");
  }
  get edadFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("edadFrmCtrl");
  }
  get descripDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripDiagFrmCtrl");
  }
  get codDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codDiagFrmCtrl");
  }
  get descripGrupoDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripGrupoDiagFrmCtrl");
  }
  get contratanteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("contratanteFrmCtrl");
  }
  get planFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("planFrmCtrl");
  }
  get codAfiliadoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl");
  }
  get fechaAfiliacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaAfiliacionFrmCtrl");
  }
  get estadioClinicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadioClinicoFrmCtrl");
  }
  get tnmFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tnmFrmCtrl");
  }
  get observacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("observacionFrmCtrl");
  }

  //codigo luis
  get codHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codHisFrmCtrl");
  }
  get descHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descHisFrmCtrl");
  }
  //

  antecedenteEditFrmGrp: FormGroup = new FormGroup({
    editFrm: new FormControl(false),
  });

  tratamientoEditFrmGrp: FormGroup = new FormGroup({
    editTratFrm: new FormControl(false),
  });

  tratActualEditFrmGrp: FormGroup = new FormGroup({
    editActualFrm: new FormControl(false),
  });

  get editFrm() {
    return this.antecedenteEditFrmGrp.get("editFrm");
  }

  get editTratFrm() {
    return this.tratamientoEditFrmGrp.get("editTratFrm");
  }

  get editActualFrm() {
    return this.tratActualEditFrmGrp.get("editActualFrm");
  }

  //ANTECEDENTES
  antecedentesFrmGrp: FormGroup = new FormGroup({
    menarquia: new FormControl(null),
    gestaciones: new FormControl(null),
    nro_hijos: new FormControl(null),
    fur: new FormControl(null),
    abortos: new FormControl(null),
    anticoceptivo: new FormControl(null),
    observaciones: new FormControl(null),
    aplica1: new FormControl(null),
    noAplica1: new FormControl(null),
  });

  get menarquia() {
    return this.antecedentesFrmGrp.get("menarquia");
  }
  get gestaciones() {
    return this.antecedentesFrmGrp.get("gestaciones");
  }
  get nro_hijos() {
    return this.antecedentesFrmGrp.get("nro_hijos");
  }
  get fur() {
    return this.antecedentesFrmGrp.get("fur");
  }
  get abortos() {
    return this.antecedentesFrmGrp.get("abortos");
  }
  get anticoceptivo() {
    return this.antecedentesFrmGrp.get("anticoceptivo");
  }
  get observaciones() {
    return this.antecedentesFrmGrp.get("observaciones");
  }
  get aplica1() {
    return this.antecedentesFrmGrp.get("aplica1");
  }
  get noAplica1() {
    return this.antecedentesFrmGrp.get("noAplica1");
  }

  antecedentesPatPersonalesFrmGrp: FormGroup = new FormGroup({
    hta: new FormControl(null),
    ima_icc: new FormControl(null),
    reumatologicas: new FormControl(null),
    dim: new FormControl(null),
    epoc_epid: new FormControl(null),
    endocrinopatias: new FormControl(null),
    asma: new FormControl(null),
    otros: new FormControl(null),
    ram: new FormControl(null),
    habitos_nocivos: new FormControl(null),
    aplica2: new FormControl(null),
    noAplica2: new FormControl(null),
  });

  get hta() {
    return this.antecedentesPatPersonalesFrmGrp.get("hta");
  }
  get ima_icc() {
    return this.antecedentesPatPersonalesFrmGrp.get("ima_icc");
  }
  get reumatologicas() {
    return this.antecedentesPatPersonalesFrmGrp.get("reumatologicas");
  }
  get dim() {
    return this.antecedentesPatPersonalesFrmGrp.get("dim");
  }
  get epoc_epid() {
    return this.antecedentesPatPersonalesFrmGrp.get("epoc_epid");
  }
  get endocrinopatias() {
    return this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias");
  }
  get asma() {
    return this.antecedentesPatPersonalesFrmGrp.get("asma");
  }
  get otros() {
    return this.antecedentesPatPersonalesFrmGrp.get("otros");
  }
  get ram() {
    return this.antecedentesPatPersonalesFrmGrp.get("ram");
  }
  get habitos_nocivos() {
    return this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos");
  }
  get aplica2() {
    return this.antecedentesPatPersonalesFrmGrp.get("aplica2");
  }
  get noAplica2() {
    return this.antecedentesPatPersonalesFrmGrp.get("noAplica2");
  }

  antecedentesOncoPersonalesFrmGrp: FormGroup = new FormGroup({
    aplica3: new FormControl(null),
    noAplica3: new FormControl(null),
  });

  get aplica3() {
    return this.antecedentesOncoPersonalesFrmGrp.get("aplica3");
  }
  get noAplica3() {
    return this.antecedentesOncoPersonalesFrmGrp.get("noAplica3");
  }

  antecedentesOncoFamFrmGrp: FormGroup = new FormGroup({
    aplica4: new FormControl(null),
    noAplica4: new FormControl(null),
  });

  get aplica4() {
    return this.antecedentesOncoFamFrmGrp.get("aplica4");
  }
  get noAplica4() {
    return this.antecedentesOncoFamFrmGrp.get("noAplica4");
  }

  antecedentesOtros: FormGroup = new FormGroup({
    otros_onco_fami: new FormControl(null),
  });
  get otros_onco_fami() {
    return this.antecedentesOtros.get("otros_onco_fami");
  }

  fam1FrmGroup: FormGroup = new FormGroup({
    fam1erGrado: new FormControl(null),
  });
  get fam1erGrado() {
    return this.fam1FrmGroup.get("fam1erGrado");
  }

  fam2FrmGroup: FormGroup = new FormGroup({
    fam1erGrado: new FormControl(null),
  });
  get fam2doGrado() {
    return this.fam2FrmGroup.get("fam2doGrado");
  }

  infoSolben: InfoSolben;
  InfoAntecPersGine: InfoAntecPersGine;
  InfoAntecPatoPers: InfoAntecPatoPers;
  InfoAnteOncoPers: InfoAnteOncoPers;
  InfoAntecOncoFam: InfoAntecOncoFam;

  mostrarCampoDetalle: number;
  mostrarFechaReceta: number;
  mostrarFechaQuimio: number;
  mostrarFechaHospital: number;

  flagVerActaCmac: number;
  reporteActaCmac: string;
  flagVerInforme: number;
  reportePdf: string;
  mensaje: string;
  codRolLiderTum: number;
  codUsrLiderTum: number;
  usrLiderTum: string;
  codArchFichaTec: number;
  codArchCompMed: number;
  // previo
  tratamientoPrevioCirugia: FormGroup;

  tpCirugiaArray: FormArray;
  tpCirugiaFecha: FormControl;
  tpCirugiaTipo: FormControl;
  tpCirugiaHallazgo: FormControl;

  tratamientoActual = new FormGroup({
    aplica: new FormControl(true),
    noAplica: new FormControl(false),
    solido: new FormControl(true),
    noSolido: new FormControl(false),
    tipo: new FormControl(""),
    adyuvante: new FormArray([
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      }),
    ]),
    neoAdyuvante: new FormArray([
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      }),
    ]),
    metastasico: new FormArray([
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        resp_alc: new FormControl(0),
        medicamento: new FormControl(""),
        lineas_tratamiento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      }),
    ]),
    ttLinfoma: new FormGroup({
      mantenimiento: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          resp_alc: new FormControl(0),
          otros: new FormControl(""),
          organo: new FormControl(""),
          n_cursos: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      lineas_tto: new FormArray([
        new FormGroup({
          lineas_tratamiento: new FormControl(""),
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          resp_alc: new FormControl(0),
          otros: new FormControl(""),
          organo: new FormControl(""),
          n_cursos: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
    }),
    ttMieloma: new FormGroup({
      induccion: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          resp_alc: new FormControl(0),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          organo: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      mantenimiento: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          resp_alc: new FormControl(0),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          organo: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      relapso: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          resp_alc: new FormControl(0),
          organo: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
    }),
    ttLeucemia: new FormGroup({
      induccion: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          resp_alc: new FormControl(0),
          lugar: new FormControl(""),
          organo: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      mantenimiento: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          resp_alc: new FormControl(0),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          organo: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      consolidacion: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          resp_alc: new FormControl(0),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          organo: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      relapso: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          resp_alc: new FormControl(0),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          organo: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
    }),
    ttMielodisplasico: new FormGroup({
      lineas_tto: new FormArray([
        new FormGroup({
          n_lineas: new FormControl(""),
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          lugar: new FormControl(""),
          organo: new FormControl(""),
          n_cursos: new FormControl(""),
          resp_alc: new FormControl(0),
          transformacion_leucemia: new FormControl(false),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
    }),
    ttMieloprofilerativo: new FormGroup({
      tipo_terapia: new FormControl("386"),
      lineas_tto: new FormArray([
        new FormGroup({
          n_lineas: new FormControl(""),
          lugar: new FormControl(""),
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          organo: new FormControl(""),
          n_cursos: new FormControl(""),
          resp_alc: new FormControl(0),
          transformacion_leucemia: new FormControl(false),
          mot_inac: new FormControl(0),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
    }),
  });
  tratamientoPrevioRadioterapia: FormGroup;
  tratamientoPrevioPaliativo: FormGroup;
  tratamientoPrevioAntineoplasica: FormGroup;

  //

  public isLoading: boolean;
  public dataSource: MatTableDataSource<LineaTratamiento>;

  public columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.detalle.lineaTratamiento,
      columnDef: "lineaTratamiento",
      header: "LÍNEA DE TRATAMIENTO",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.lineaTratamiento !== null
          ? `${lineaTrat.lineaTratamiento}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.medicamentoSolicitado,
      columnDef: "macSolicitado",
      header: "MEDICAMENTO SOLICITADO",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.macSolicitado !== null ? `${lineaTrat.macSolicitado}` : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.numeroSolicitud,
      columnDef: "codEvaluacion",
      header: "N° SOLICITUD EVALUACIÓN",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.codEvaluacion !== null ? `${lineaTrat.codEvaluacion}` : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.fechaAprobacion,
      columnDef: "fec_Aprobacion",
      header: "FECHA DE APROBACIÓN",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.fechaAprobacion !== null
          ? `${this.datePipe.transform(
              lineaTrat.fechaAprobacion,
              "dd/MM/yyyy"
            )}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.fechaInicio,
      columnDef: "fecchaInicio",
      header: "FECHA INICIO",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.fechaInicio !== null
          ? `${this.datePipe.transform(lineaTrat.fechaInicio, "dd/MM/yyyy")}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.fechaFin,
      columnDef: "fechaFin",
      header: "FECHA FIN",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.fechaFin !== null
          ? `${this.datePipe.transform(lineaTrat.fechaFin, "dd/MM/yyyy")}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.numeroCursos,
      columnDef: "nroCurso",
      header: "N° CURSOS",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.nroCurso !== null ? `${lineaTrat.nroCurso}` : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.tipoTumor,
      columnDef: "tipoTumor",
      header: "TIPO TUMOR",
      cell: (lineaTrat: LineaTratamiento) =>
        {
          console.log("Se ejecuto este método")
          console.log(lineaTrat);
          console.log(lineaTrat.tipoTumor !== null ? `${lineaTrat.tipoTumor}` : "")
          return lineaTrat.tipoTumor !== null ? `${lineaTrat.tipoTumor}` : "";
        }
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.respuestaAlcanzada,
      columnDef: "respAlcansada",
      header: "RESPUESTA ALCANZADA",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.respAlcansada !== null ? `${lineaTrat.respAlcansada}` : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.estado,
      columnDef: "estado",
      header: "ESTADO",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.estado !== null ? `${lineaTrat.estado}` : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.motivoInactivacion,
      columnDef: "motivoInactivacion",
      header: "MOTIVO INACTIVACIÓN",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.motivoInactivacion !== null
          ? `${lineaTrat.motivoInactivacion}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.medicoTratante,
      columnDef: "medicoTratantePrescriptor",
      header: "MÉDICO TRATANTE",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.medicoTratantePrescriptor !== null
          ? `${lineaTrat.medicoTratantePrescriptor}`
          : "",
    },
    {
      codAcceso: ACCESO_EVALUACION.detalle.montoAutorizado,
      columnDef: "montoAutorizado",
      header: "MONTO AUTORIZADO",
      cell: (lineaTrat: LineaTratamiento) =>
        lineaTrat.montoAutorizado !== null
          ? `${lineaTrat.montoAutorizado}`
          : "",
    },
  ];

  public displayedColumns: string[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  listaTumorLiquido;
  listaTumorLiquidoMielo;
  opcionMenu: BOpcionMenuLocalStorage;
  txtCodigoSolicitud: number;
  txtEstadoSolicitud: number;
  txtCodigoMac: number;

  txtDescripcionMac: number;
  btnInforme: number;
  btnActaMac: number;
  txtNroSCG: number;
  txtEstadoSCG: number;
  txtFechaSCG: number;
  txtTipoSCG: number;
  txtNroCartaGarantiaDet: number;
  txtClinicaDet: number;
  txtMedicoTratante: number;
  txtCMP: number;
  txtFechaReceta: number;
  txtFechaQuimioterapia: number;
  txtFechaHospitalizacion: number;
  txtMedicamentos: number;
  txtEsquemaQuimioterapia: number;
  txtPersonaContacto: number;
  txtTotalPresupuesto: number;
  txtPacienteDet: number;
  txtEdad: number;
  txtDiagnostico: number;
  txtCie10: number;
  txtGrupoDiagnostico: number;
  txtContratante: number;
  txtPlan: number;
  txtCodigoAfiliado: number;
  txtFechaAfiliacion: number;
  txtEstadioClinico: number;
  txtTNM: number;
  txtObservacion: number;
  btnEnviarAlertaMonitoreo: number;
  btnRegistrarEvaAutorizador: number;
  btnRegistrarEvaLiderTumor: number;
  resumenCrono = new FormControl("");
  flagEvaluacion = true;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;
  // tratamiento previo

  constructor(
    private macService: MacService,
    public dialog: MatDialog,
    private adapter: DateAdapter<any>,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private router: Router,
    private listaParametroservice: ListaParametroservice,
    private datePipe: DatePipe,
    private correoService: CorreosService,
    private coreService: CoreService,
    private spinnerService: Ng4LoadingSpinnerService,
    private _ngZone: NgZone,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    public globalService: GlobalService,
    public crypto: AESencryptionService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService
  ) {
    this.adapter.setLocale("es-PE");
    this.listaRespuesta = {};
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.capturarRegistroEval();
    this.inicializarVariables();
    this.consultarInformacionScgEva()
    this.definirTablaHistoria();
    //antecedentes
    this.obtenerDatosAntecedentes();
    this.obtenerDatosTratamiento();
    this.getCrono();
    this.chkFamiliar1.disable();
    this.chkFamiliar2.disable();
  }

  public ValidarFlujos() {
    if (this.pTipoEva == 33 && this.codEstadoEva == 516) {
      this.isFlujoNuevo = true;
      this.isContinuador = false;
    } else if (this.pTipoEva == 32 && this.codEstadoEva == 516) {
      this.isFlujoNuevo = false;
      this.isContinuador = true;
    }
  }

  getCrono() {
    this.detalleServicioSolEva
      .mostrarResumenCrono({
        codAfiliado: localStorage.getItem("codigoPaciente"),
      })
      .subscribe(
        (data) => {
          if (data["codResultado"] == 0) {
            this.resumenCrono.setValue(data["response"]["resum_cronologico"]);
          }
        },

        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );
  }

  getTratamientoData() {
    const macRequest = new MACResponse();
    macRequest.descripcion = "";
    macRequest.nombreComercial = "";
    macRequest.busqueda = "1";

    this.macService.getBusquedaMac(macRequest).subscribe((response) => {
      this.listaMedicamentos = response.dataList;
      this.listaParametroservice
      .listaParametro({ codigoGrupo: "81" })
      .subscribe((response) => {
        this.listaLinea = response.filtroParametro;
        this.listaParametroservice
      .listaParametro({ codigoGrupo: "82" })
      .subscribe((response) => {
        this.listaRespuesta.solido = response.filtroParametro.filter(
          (el) => el.codigoExterno == "367"
        );
        this.listaRespuesta.linfoma = response.filtroParametro.filter(
          (el) => el.codigoExterno == "372"
        );
        this.listaRespuesta.mieloma = response.filtroParametro.filter(
          (el) => el.codigoExterno == "373"
        );
        this.listaRespuesta.leucemia = response.filtroParametro.filter(
          (el) => el.codigoExterno == "374"
        );
        this.listaRespuesta.mielodisplasico = response.filtroParametro.filter(
          (el) => el.codigoExterno == "375"
        );
        this.listaRespuesta.mieloprofilerativoTrombo =
          response.filtroParametro.filter((el) => el.codigoExterno == "386");
        this.listaRespuesta.mieloprofilerativoTrombo2 =
          response.filtroParametro.filter((el) => el.codigoExterno == "387");
        this.listaRespuesta.mieloprofilerativoFibrosis =
          response.filtroParametro.filter((el) => el.codigoExterno == "388");
        this.listaRespuesta.mieloprofilerativoLeucemia =
          response.filtroParametro.filter((el) => el.codigoExterno == "389");
          this.listaParametroservice
      .listaParametro({ codigoGrupo: "83" })
      .subscribe((response) => {
        this.listaLugarMieldi = response.filtroParametro.filter(
          (el) => el.codigoExterno == "375"
        );
        this.listaLugarLin = response.filtroParametro.filter(
          (el) => el.codigoExterno == "372"
        );
        this.listaLugarMielo = response.filtroParametro.filter(
          (el) => el.codigoExterno == "373"
        );
        this.listaLugarLeu = response.filtroParametro.filter(
          (el) => el.codigoExterno == "374"
        );
        this.listaParametroservice
      .listaParametro({ codigoGrupo: "84" })
      .subscribe((response) => {
        this.listaMotivo = response.filtroParametro;
        this.listaParametroservice
        .listaParametro({ codigoGrupo: "76" })
        .subscribe((response) => {
          this.listaTumorLiquido = response.filtroParametro;
          this.listaParametroservice
        .listaParametro({ codigoGrupo: "80" })
        .subscribe((response) => {
          this.listaTumorLiquidoMielo = response.filtroParametro;
        });
        });
      });
      });
      });
      });
    });
    this.verificarDataMonitoreo();
  }

  createTratamientosForm() {
    this.aplica9 = new FormControl(true);
    this.noAplica9 = new FormControl(false);
    this.solido = new FormControl(true);
    this.noSolido = new FormControl(false);
    this.solido2 = new FormControl(true);
    this.noSolido2 = new FormControl(false);

    this.tratamientoPrevioPaliativo = new FormGroup({
      aplica: this.aplica7,
      noAplica: this.noAplica7,
      dolor: new FormArray([
        new FormGroup({
          dosis: new FormControl(""),
          tipo: new FormControl(""),
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
      compasivo: new FormArray([
        new FormGroup({
          tipo: new FormControl(""),
          fecha_inicio: new FormControl(""),
          dosis: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
    });

    this.tpCirugiaArray =
      this.dummieData.trat_ciru.length > 0
        ? this.transformToFormArray(this.dummieData.trat_ciru)
        : new FormArray([
            new FormGroup({
              fecha: new FormControl(""),
              tipo_cirugia: new FormControl(""),
              hallazgos: new FormControl(""),
            }),
          ]);

    this.tratamientoPrevioCirugia = new FormGroup({
      aplica5: this.aplica5 || false,
      noAplica5: this.noAplica5 || true,
      datos_cirugia: this.tpCirugiaArray,
    });

    this.tratamientoPrevioRadioterapia = new FormGroup({
      aplica: this.aplica6,
      noAplica: this.noAplica6,
      adyuvante:
        this.dummieData.trat_radio.condicion == true &&
        this.apiToDataRadio().adyuvante.length > 0
          ? this.transformToFormArray(this.apiToDataRadio().adyuvante)
          : new FormArray([
              new FormGroup({
                region: new FormControl(""),
                fecha_inicio: new FormControl(""),
                tipo_dosis: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                observaciones: new FormControl(""),
              }),
            ]),
      neoAdyuvante:
        this.dummieData.trat_radio.condicion == true &&
        this.apiToDataRadio().neoAdyuvante.length > 0
          ? this.transformToFormArray(this.apiToDataRadio().neoAdyuvante)
          : new FormArray([
              new FormGroup({
                region: new FormControl(""),
                fecha_inicio: new FormControl(""),
                tipo_dosis: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                observaciones: new FormControl(""),
              }),
            ]),
      paliativa:
        this.dummieData.trat_radio.condicion == true &&
        this.apiToDataRadio().paliativa.length > 0
          ? this.transformToFormArray(this.apiToDataRadio().paliativa)
          : new FormArray([
              new FormGroup({
                region: new FormControl(""),
                fecha_inicio: new FormControl(""),
                tipo_dosis: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                observaciones: new FormControl(""),
              }),
            ]),
    });

    this.tratamientoPrevioPaliativo = new FormGroup({
      aplica: this.aplica7,
      noAplica: this.noAplica7,
      dolor:
        this.dummieData.trat_paliativo.condicion == true &&
        this.apiToDataPalia().dolor.length > 0
          ? this.transformToFormArray(this.apiToDataPalia().dolor)
          : new FormArray([
              new FormGroup({
                dosis: new FormControl(""),
                tipo: new FormControl(""),
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                observaciones: new FormControl(""),
              }),
            ]),
      compasivo:
        this.dummieData.trat_paliativo.condicion == true &&
        this.apiToDataPalia().compasivo.length > 0
          ? this.transformToFormArray(this.apiToDataPalia().compasivo)
          : new FormArray([
              new FormGroup({
                tipo: new FormControl(""),
                fecha_inicio: new FormControl(""),
                dosis: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                observaciones: new FormControl(""),
              }),
            ]),
    });

    const checkAntineo = this.apiToDataAntineo(
      this.dummieData.trat_terap_antineoplasica
    );

    const checkAntineoActual = this.apiToDataAntineo(
      this.dummieData.trat_terap_actual
    );

    if (
      checkAntineoActual.adyuvante.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.neoAdyuvante.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.metastasico.filter((el) => el.estado_trat == false)
        .length > 0
    ) {
      localStorage.setItem("tipo_tumor", "Tumor Solido");
    } else if (
      checkAntineoActual.leuCon.filter((el) => el.estado_trat == false).length >
        0 ||
      checkAntineoActual.leuInd.filter((el) => el.estado_trat == false).length >
        0 ||
      checkAntineoActual.leuMant.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.leuRel.filter((el) => el.estado_trat == false).length >
        0 ||
      checkAntineoActual.linfoMante.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.linfolineas.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.mieldiLineas.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.mieloInd.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.mieloMante.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.mieloRel.filter((el) => el.estado_trat == false)
        .length > 0 ||
      checkAntineoActual.mielproLineas.filter((el) => el.estado_trat == false)
        .length > 0
    ) {
      localStorage.setItem("tipo_tumor", "Tumor Liquido");
    } else {
      localStorage.setItem("tipo_tumor", "Sin definir");
    }

    this.aplica9.setValue(
      this.existeActualSolido || this.TactualLiquidoInicial.length > 0
    );
    this.noAplica9.setValue(!this.aplica9.value);
    this.tratamientoActual = new FormGroup({
      aplica: this.aplica9,
      noAplica: this.noAplica9,
      solido: new FormControl(this.existeActualSolido),
      noSolido: new FormControl(this.TactualLiquidoInicial.length > 0),
      tipo: new FormControl(this.TactualLiquidoInicial),
      adyuvante:
        this.dummieData.trat_terap_actual.condicion == true &&
        checkAntineoActual.adyuvante.filter((el) => {
          return el.estado_trat == false;
        }).length > 0
          ? this.transformToFormArray(
              checkAntineoActual.adyuvante.filter(
                (el) => el.estado_trat == false
              )
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                medicamento: new FormControl(""),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                resp_alc: new FormControl(0),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                observaciones: new FormControl(""),
              }),
            ]),
      neoAdyuvante:
        this.dummieData.trat_terap_actual.condicion == true &&
        checkAntineoActual.neoAdyuvante.filter((el) => el.estado_trat == false)
          .length > 0
          ? this.transformToFormArray(
              checkAntineoActual.neoAdyuvante.filter(
                (el) => el.estado_trat == false
              )
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                medicamento: new FormControl(""),
                resp_alc: new FormControl(0),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                observaciones: new FormControl(""),
              }),
            ]),
      metastasico:
        this.dummieData.trat_terap_actual.condicion == true &&
        checkAntineoActual.metastasico.filter((el) => el.estado_trat == false)
          .length > 0
          ? this.transformToFormArray(
              checkAntineoActual.metastasico.filter((el) => {
                return el.estado_trat == false;
              })
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                resp_alc: new FormControl(0),
                medicamento: new FormControl(""),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                lineas_tratamiento: new FormControl(""),
                observaciones: new FormControl(""),
              }),
            ]),
      ttLinfoma: new FormGroup({
        mantenimiento:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.linfoMante.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.linfoMante.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "372",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        lineas_tto:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.linfolineas.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.linfolineas.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "372",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  lineas_tratamiento: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttMieloma: new FormGroup({
        induccion:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.mieloInd.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.mieloInd.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "373",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  resp_alc: new FormControl(0),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        mantenimiento:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.mieloMante.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.mieloMante.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "373",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        relapso:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.mieloRel.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.mieloRel.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "373",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttLeucemia: new FormGroup({
        induccion:
          checkAntineoActual.leuInd.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.leuInd.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "374",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  lugar: new FormControl(""),
                  organo: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        mantenimiento:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.leuMant.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.leuMant.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "374",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        consolidacion:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.leuCon.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.leuCon.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "374",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  resp_alc: new FormControl(0),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  organo: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        relapso:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.leuRel.filter((el) => el.estado_trat == false)
            .length > 0
            ? this.transformToFormArray(
                checkAntineoActual.leuRel.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "374",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttMielodisplasico: new FormGroup({
        lineas_tto:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.mieldiLineas.filter(
            (el) => el.estado_trat == false
          ).length > 0
            ? this.transformToFormArray(
                checkAntineoActual.mieldiLineas.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "375",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  n_lineas: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  transformacion_leucemia: new FormControl(false),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),

      ttMieloprofilerativo: new FormGroup({
        tipo_terapia: this.tipoMielo
          ? new FormControl(this.tipoMielo + "")
          : new FormControl("386"),

        lineas_tto:
          this.dummieData.trat_terap_actual.condicion == true &&
          checkAntineoActual.mielproLineas.filter(
            (el) => el.estado_trat == false
          ).length > 0
            ? this.transformToFormArray(
                checkAntineoActual.mielproLineas.filter((el) => {
                  this.tratamientoActual.patchValue({
                    tipo: "376",
                  });
                  return el.estado_trat == false;
                })
              )
            : new FormArray([
                new FormGroup({
                  n_lineas: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  lugar: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  transformacion_leucemia: new FormControl(false),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
    });

    this.desactivarTratamientos2();
    this.tratamientoPrevioAntineoplasica = new FormGroup({
      aplica: this.aplica8,
      noAplica: this.noAplica8,
      solido: new FormControl(this.existePrevioSolido),
      noSolido: new FormControl(this.TprevioLiquidoInicial.length > 0),
      tipo: new FormControl(this.TprevioLiquidoInicial),
      adyuvante:
        this.dummieData.trat_terap_antineoplasica.condicion == true &&
        checkAntineo.adyuvante.filter((el) => el.estado_trat == true).length > 0
          ? this.transformToFormArray(
              checkAntineo.adyuvante.filter((el) => el.estado_trat == true)
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                medicamento: new FormControl(""),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                resp_alc: new FormControl(0),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                observaciones: new FormControl(""),
              }),
            ]),
      neoAdyuvante:
        this.dummieData.trat_terap_antineoplasica.condicion == true &&
        checkAntineo.neoAdyuvante.filter((el) => el.estado_trat == true)
          .length > 0
          ? this.transformToFormArray(
              checkAntineo.neoAdyuvante.filter((el) => el.estado_trat == true)
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                medicamento: new FormControl(""),
                resp_alc: new FormControl(0),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                observaciones: new FormControl(""),
              }),
            ]),
      metastasico:
        this.dummieData.trat_terap_antineoplasica.condicion == true &&
        checkAntineo.metastasico.filter((el) => el.estado_trat == true).length >
          0
          ? this.transformToFormArray(
              checkAntineo.metastasico.filter((el) => el.estado_trat == true)
            )
          : new FormArray([
              new FormGroup({
                fecha_inicio: new FormControl(""),
                fecha_fin: new FormControl(""),
                aplica: new FormControl(false),
                resp_alc: new FormControl(0),
                medicamento: new FormControl(""),
                otros: new FormControl(""),
                n_cursos: new FormControl(""),
                lugar: new FormControl(""),
                mot_inac: new FormControl(0),
                medico_tratante: new FormControl(""),
                observaciones: new FormControl(""),
                lineas_tratamiento: new FormControl(""),
              }),
            ]),
      ttLinfoma: new FormGroup({
        mantenimiento:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.linfoMante.filter((el) => el.estado_trat == true)
            .length > 0
            ? this.transformToFormArray(
                checkAntineo.linfoMante.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        lineas_tto:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.linfolineas.filter((el) => el.estado_trat == true)
            .length > 0
            ? this.transformToFormArray(
                checkAntineo.linfolineas.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  lineas_tratamiento: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttMieloma: new FormGroup({
        induccion:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.mieloInd.filter((el) => el.estado_trat == true).length >
            0
            ? this.transformToFormArray(
                checkAntineo.mieloInd.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  resp_alc: new FormControl(0),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        mantenimiento:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.mieloMante.filter((el) => el.estado_trat == true)
            .length > 0
            ? this.transformToFormArray(
                checkAntineo.mieloMante.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        relapso:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.mieloRel.filter((el) => el.estado_trat == true).length >
            0
            ? this.transformToFormArray(
                checkAntineo.mieloRel.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttLeucemia: new FormGroup({
        induccion:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.leuInd.filter((el) => el.estado_trat == true).length > 0
            ? this.transformToFormArray(
                checkAntineo.leuInd.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  lugar: new FormControl(""),
                  organo: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        mantenimiento:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.leuMant.filter((el) => el.estado_trat == true).length > 0
            ? this.transformToFormArray(
                checkAntineo.leuMant.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        consolidacion:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.leuCon.filter((el) => el.estado_trat == true).length > 0
            ? this.transformToFormArray(
                checkAntineo.leuCon.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  resp_alc: new FormControl(0),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  organo: new FormControl(""),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
        relapso:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.leuRel.filter((el) => el.estado_trat == true).length > 0
            ? this.transformToFormArray(
                checkAntineo.leuRel.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  resp_alc: new FormControl(0),
                  otros: new FormControl(""),
                  n_cursos: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttMielodisplasico: new FormGroup({
        lineas_tto:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.mieldiLineas.filter((el) => el.estado_trat == true)
            .length > 0
            ? this.transformToFormArray(
                checkAntineo.mieldiLineas.filter((el) => el.estado_trat == true)
              )
            : new FormArray([
                new FormGroup({
                  n_lineas: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  lugar: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  transformacion_leucemia: new FormControl(false),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
      ttMieloprofilerativo: new FormGroup({
        tipo_terapia: this.tipoMielo
          ? new FormControl(this.tipoMielo + "")
          : new FormControl("386"),

        lineas_tto:
          this.dummieData.trat_terap_antineoplasica.condicion == true &&
          checkAntineo.mielproLineas.filter((el) => el.estado_trat == true)
            .length > 0
            ? this.transformToFormArray(
                checkAntineo.mielproLineas.filter(
                  (el) => el.estado_trat == true
                )
              )
            : new FormArray([
                new FormGroup({
                  n_lineas: new FormControl(""),
                  fecha_inicio: new FormControl(""),
                  fecha_fin: new FormControl(""),
                  lugar: new FormControl(""),
                  aplica: new FormControl(false),
                  medicamento: new FormControl(""),
                  otros: new FormControl(""),
                  organo: new FormControl(""),
                  n_cursos: new FormControl(""),
                  resp_alc: new FormControl(0),
                  transformacion_leucemia: new FormControl(false),
                  mot_inac: new FormControl(0),
                  medico_tratante: new FormControl(""),
                  observaciones: new FormControl(""),
                }),
              ]),
      }),
    });
  }

  // activables

  changeAdyuvante(event, adyuvante) {
    if (event.checked) {
      adyuvante.enable();
    } else {
      this.desactivarGrupo(adyuvante);
    }
    adyuvante.controls.aplica.enable();
  }

  desactivar5() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioCirugia.reset();

          this.tratamientoPrevioCirugia.patchValue({
            noAplica5: true,
            aplica5: false,
          });
          this.desactivarArray(this.tpCirugiaArray);
        } else {
          this.tratamientoPrevioCirugia.patchValue({
            aplica5: true,
            noAplica5: false,
          });
        }
      }
    );
  }
  activar5() {
    // this.activarArray(this.tpCirugiaArray);

    this.tpCirugiaArray.controls.forEach((el) => {
      //@ts-ignore
      this.activarGrupo(el);
    });
    this.tratamientoPrevioCirugia.patchValue({
      noAplica5: false,
    });
  }
  desactivar6() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioRadioterapia.reset();

          this.tratamientoPrevioRadioterapia.patchValue({
            noAplica: true,
            aplica: false,
          });
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.adyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.paliativa
          );
        } else {
          this.tratamientoPrevioRadioterapia.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.adyuvante
          );
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
          );
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.paliativa
          );
        }
      }
    );
  }
  activar6() {
    this.tratamientoPrevioRadioterapia.patchValue({
      noAplica: false,
    });

    this.activarArray(this.tratamientoPrevioRadioterapia.controls.adyuvante);

    this.activarArray(this.tratamientoPrevioRadioterapia.controls.neoAdyuvante);

    this.activarArray(this.tratamientoPrevioRadioterapia.controls.paliativa);
  }
  desactivar7() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioPaliativo.reset();
          this.tratamientoPrevioPaliativo.patchValue({
            aplica: false,
            noAplica: true,
          });

          this.desactivarArray(this.tratamientoPrevioPaliativo.controls.dolor);
          this.desactivarArray(
            this.tratamientoPrevioPaliativo.controls.compasivo
          );
        } else {
          this.tratamientoPrevioPaliativo.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(this.tratamientoPrevioPaliativo.controls.dolor);
          this.activarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
        }
      }
    );
  }
  activar7() {
    this.tratamientoPrevioPaliativo.patchValue({
      noAplica: false,
    });

    this.activarArray(this.tratamientoPrevioPaliativo.controls.dolor);

    this.activarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
  }
  desactivar8() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioAntineoplasica.reset();

          this.tratamientoPrevioAntineoplasica.patchValue({
            aplica: false,
            noAplica: true,
          });
          this.tratamientoPrevioAntineoplasica.controls.tipo.disable();
          this.tratamientoPrevioAntineoplasica.controls.solido.disable();
          this.tratamientoPrevioAntineoplasica.controls.noSolido.disable();
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.adyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.metastasico
          );
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
          // this.tratamientoPrevioAntineoplasica.reset()
        } else {
          this.tratamientoPrevioAntineoplasica.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.adyuvante
          );
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
          );
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.metastasico
          );
          this.tratamientoPrevioAntineoplasica.controls.tipo.enable();

          this.tratamientoPrevioAntineoplasica.controls.solido.enable();
          this.tratamientoPrevioAntineoplasica.controls.noSolido.enable();
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
        }
      }
    );
  }

  activar8() {
    if (this.tratamientoPrevioAntineoplasica.get("aplica").value == false) {
      this.tratamientoPrevioAntineoplasica.patchValue({
        noAplica: false,
      });

      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.adyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.metastasico
      );

      this.tratamientoPrevioAntineoplasica.controls.tipo.enable();
      this.tratamientoPrevioAntineoplasica.controls.solido.enable();
      this.tratamientoPrevioAntineoplasica.controls.noSolido.enable();
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
    } else {
      this.tratamientoPrevioAntineoplasica.patchValue({
        noAplica: false,
        aplica: true,
      });
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.adyuvante
      );
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
      );
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.metastasico
      );
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
    }
  }
  desactivar9() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoActual.reset();

          this.tratamientoActual.patchValue({
            aplica: false,
            noAplica: true,
          });
          this.desactivarArray(this.tratamientoActual.controls.adyuvante);
          this.desactivarArray(this.tratamientoActual.controls.neoAdyuvante);
          this.desactivarArray(this.tratamientoActual.controls.metastasico);
          this.tratamientoActual.controls.solido.disable();
          this.tratamientoActual.controls.tipo.disable();
          this.tratamientoActual.patchValue({
            noSolido: true,

            solido: false,
          });
          this.tratamientoActual.controls.noSolido.disable();
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
        } else {
          this.tratamientoActual.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(this.tratamientoActual.controls.adyuvante);
          this.activarArray(this.tratamientoActual.controls.neoAdyuvante);
          this.activarArray(this.tratamientoActual.controls.metastasico);
          this.tratamientoActual.controls.tipo.enable();
          this.tratamientoActual.controls.solido.enable();
          this.tratamientoActual.controls.noSolido.enable();
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
        }
      }
    );
  }

  activar9() {
    if (this.tratamientoActual.get("aplica").value == false) {
      this.tratamientoActual.patchValue({
        noAplica: false,
        aplica: true,
      });

      this.activarArray(this.tratamientoActual.controls.adyuvante);
      this.activarArray(this.tratamientoActual.controls.neoAdyuvante);
      this.activarArray(this.tratamientoActual.controls.metastasico);
      this.tratamientoActual.controls.solido.enable();
      this.tratamientoActual.controls.tipo.enable();
      this.tratamientoActual.controls.noSolido.enable();
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
    } else {
      this.tratamientoActual.patchValue({
        noAplica: false,
        aplica: true,
      });
      this.desactivarArray(this.tratamientoActual.controls.adyuvante);
      this.desactivarArray(this.tratamientoActual.controls.neoAdyuvante);
      this.tratamientoActual.controls.tipo.disable();

      this.desactivarArray(this.tratamientoActual.controls.metastasico);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
    }
  }

  activar10() {
    if (this.tratamientoActual.get("solido").value == false) {
      this.tratamientoActual.patchValue({
        noSolido: false,
        solido: true,
      });
    }
  }
  desactivar10() {
    if (this.tratamientoActual.get("noSolido").value == false) {
      this.tratamientoActual.patchValue({
        noSolido: true,

        solido: false,
      });
    }
  }

  soloLecturaFormAnte() {
    this.antecedentesFrmGrp.get("menarquia").disable();
    this.antecedentesFrmGrp.get("gestaciones").disable();
    this.antecedentesFrmGrp.get("nro_hijos").disable();
    this.antecedentesFrmGrp.get("fur").disable();
    this.antecedentesFrmGrp.get("abortos").disable();
    this.antecedentesFrmGrp.get("anticoceptivo").disable();
    this.antecedentesFrmGrp.get("observaciones").disable();
    this.antecedentesFrmGrp.get("aplica1").disable();
    this.antecedentesFrmGrp.get("noAplica1").disable();
  }

  obtenerDatosAntecedentes() {
    var data = {
      codAfiliado: localStorage.getItem("codigoPaciente"),
    };
    this.detalleServicioSolEva.mostrarAntecedentes(data).subscribe(
      (data) => {
        this.existeFormAntecedente = data["codResultado"];
        if (this.existeFormAntecedente == 0) {
          var antecPersGine_ = data["dataListjSON"]["ANTEC_PERS_GINE"];
          var antecPatoPers = data["dataListjSON"]["ANTEC_PATO_PERS"];
          var antecOncoPers =
            data["dataListjSON"]["ANTEC_ONCO_PERS"]["ANTEC_ONCO_PERS"];
          var aplicaAntecOncoPers =
            data["dataListjSON"]["ANTEC_ONCO_PERS"]["APLICA_ONCO_PERS"];
          var antecOncoFam = data["dataListjSON"]["ANTEC_ONCO_FAM"];
          var antecOncoFam1 =
            data["dataListjSON"]["ANTEC_ONCO_FAM"]["ANTEC_ONCO_FAM1"];
          var antecOncoFam2 =
            data["dataListjSON"]["ANTEC_ONCO_FAM"]["ANTEC_ONCO_FAM2"];
          var aplicaAntecOncoFam1 =
            data["dataListjSON"]["ANTEC_ONCO_FAM"]["APLICA_ONCO_FAM"];
          var otros =
            data["dataListjSON"]["ANTEC_ONCO_FAM"]["ANTEC_ONCO_FAM1"].length ==
            0
              ? ""
              : data["dataListjSON"]["ANTEC_ONCO_FAM"]["ANTEC_ONCO_FAM1"][0]
                  .OTROS;

          this.InfoAntecPersGine = antecPersGine_[0];
          this.InfoAntecPatoPers = antecPatoPers[0];
          this.arrayAntecOncoPers = antecOncoPers;
          this.arrayAntecOncoFam = antecOncoFam;
          this.arrayAntecOncoFam1 = antecOncoFam1;
          this.arrayAntecOncoFam2 = antecOncoFam2;
          this.AplicaAntecOncoPer = aplicaAntecOncoPers;
          this.AplicaAntecOncoFam_1 = aplicaAntecOncoFam1;
          this.AntecOncoOtros = otros;
          this.CodigoAntecedente = antecPersGine_[0].COD_ANTECEDENTE;
          this.mostrarInfoAntecPersGine();
          this.mostrarInfoAntecPatoPers();
          this.mostrarInfoAnteOncoPers();
          this.mostrarInfoAnteOncoFam();
          this.mostrarInfoOncoFamOtros();
          this.addFieldValue();
          this.addFieldValue1erGrado();
          this.addFieldValue2doGrado();
          this.lecturaFormAntecPersGine();
          //this.observaciones = new FormControl(antecPersGine.observaciones);
        }
      },
      (error) => {
        console.error(error);
        this.mensaje = "Error al obtener el detalle de la Evaluacion.";
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          this.mensaje,
          true,
          false,
          null
        );
        this.proBarTabla = false;
      }
    );
  }

  getDataAntineoFromMostrarActual(data) {
    return {
      trat_ta_tum_solido: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
        "T_P_A_SOLIDO"
      ]["T_P_S_AD"]
        .concat(
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_SOLIDO"][
            "T_P_S_MET"
          ],
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_SOLIDO"][
            "T_P_S_NEO"
          ]
        )
        .map((el) => {
          if (this.codigoTratamiento.length == 0) {
            this.codigoTratamientoActual = el.COD_TRATAMIENTO;
          }

          this.existeActualSolido = true;
          return {
            fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
            fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
            terap_antineo_tipo_solido: el.P_TA_TIPO_TERAP_TUMOR,
            terap_antineo_tipo_tumor: "367",
            medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "",
            espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
            num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
            lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
            mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
            med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
            observaciones: el.TA_OBS ? el.TA_OBS : "",
            resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
            estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            lineas_tratamiento: el.P_TA_NUM_LINEA_TRAT
              ? el.P_TA_NUM_LINEA_TRAT + ""
              : "",
          };
        }),
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: (
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
            "T_P_A_L_LINFO"
          ]["T_P_A_L_LIN_LT"] || []
        )
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LINFO"
            ]["T_P_A_L_LIN_M"]
          )
          .map((el) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe
            this.TactualLiquidoInicial = "372";
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_linfo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              lineas_tratamiento: el.P_TA_NUM_LINEA_TRAT
                ? el.P_TA_NUM_LINEA_TRAT + ""
                : "",

              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_mieloma: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
          "T_P_A_LIQUIDO"
        ]["T_P_A_L_MIELOMA"]["T_P_A_L_M_IN"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_MIELOMA"
            ]["T_P_A_L_M_MANT"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_MIELOMA"
            ]["T_P_A_L_M_RELA"]
          )
          .map((el) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }

            // push para seleccionar el tipo de tumor liquido, si existe
            this.TactualLiquidoInicial = "373";
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_mielo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_leucemia: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
          "T_P_A_LIQUIDO"
        ]["T_P_A_L_LEUC"]["T_P_A_L_L_CONS"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_IN"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_MANT"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_RELA"]
          )
          .map((el) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe
            this.TactualLiquidoInicial = "374";
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_leuce: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_sindmielodisplasico: data["dataListjSON"][
          "T_P_ANTINEOPLASICO"
        ]["T_P_A_LIQUIDO"]["T_P_A_L_SMIELODISPLASICO"][
          "T_P_A_L_SMIELODISPLASICO_LT"
        ].map((el) => {
          if (this.codigoTratamiento.length == 0) {
            this.codigoTratamiento = el.COD_TRATAMIENTO;
          }
          // push para seleccionar el tipo de tumor liquido, si existe
          this.TactualLiquidoInicial = "375";
          return {
            fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
            fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
            terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
              ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
              : "",
            trat_ta_tl_sindmielodisplasico: el.P_TA_TIPO_TERAP_TUMOR
              ? el.P_TA_TIPO_TERAP_TUMOR
              : "",
            trans_leuc_aguda: el.TA_TRANS_LEUC ? el.TA_TRANS_LEUC : 0,
            medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
            resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
            espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
            espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
            num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
            lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
            mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
            med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
            observaciones: el.TA_OBS ? el.TA_OBS : "",
            estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            lin_tratamiento: el.P_TA_NUM_LINEA_TRAT
              ? el.P_TA_NUM_LINEA_TRAT + ""
              : "",
          };
        }),
        trat_ta_tl_sindmieloproliferativo: data["dataListjSON"][
          "T_P_ANTINEOPLASICO"
        ]["T_P_A_LIQUIDO"]["T_P_A_L_SMIELOPROLIFERATIVO"]["T_P_A_L_SMP_LMC"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_M"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_PV"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_TE"]
          )
          .map((el) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe
            this.TactualLiquidoInicial = "376";
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_mieloproliferativo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              trans_leuc_aguda: el.TA_TRANS_LEUC ? el.TA_TRANS_LEUC : 0,
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              lin_tratamiento: el.P_TA_NUM_LINEA_TRAT
                ? el.P_TA_NUM_LINEA_TRAT + ""
                : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
      },
    };
  }
  getDataAntineoFromMostrar(data) {
    return {
      trat_ta_tum_solido: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
        "T_P_A_SOLIDO"
      ]["T_P_S_AD"]
        .concat(
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_SOLIDO"][
            "T_P_S_MET"
          ],
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_SOLIDO"][
            "T_P_S_NEO"
          ]
        )
        .map((el) => {
          if (this.codigoTratamiento.length == 0) {
            this.codigoTratamiento = el.COD_TRATAMIENTO;
          }

          this.existePrevioSolido = true;
          return {
            fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
            fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
            terap_antineo_tipo_solido: el.P_TA_TIPO_TERAP_TUMOR,
            terap_antineo_tipo_tumor: "367",
            medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "",
            espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
            num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
            lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
            mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
            med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
            lineas_tratamiento: el.P_TA_NUM_LINEA_TRAT
              ? el.P_TA_NUM_LINEA_TRAT + ""
              : "",
            observaciones: el.TA_OBS ? el.TA_OBS : "",
            resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
            estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
          };
        }),
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: (
          data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
            "T_P_A_L_LINFO"
          ]["T_P_A_L_LIN_LT"] || []
        )
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LINFO"
            ]["T_P_A_L_LIN_M"]
          )
          .map((el, i) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe}
            if (i == 0) {
              this.TprevioLiquidoInicial.push("372");
            }
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_linfo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              lineas_tratamiento: el.P_TA_NUM_LINEA_TRAT
                ? el.P_TA_NUM_LINEA_TRAT + ""
                : "",

              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_mieloma: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
          "T_P_A_LIQUIDO"
        ]["T_P_A_L_MIELOMA"]["T_P_A_L_M_IN"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_MIELOMA"
            ]["T_P_A_L_M_MANT"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_MIELOMA"
            ]["T_P_A_L_M_RELA"]
          )
          .map((el, i) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }

            // push para seleccionar el tipo de tumor liquido, si existe
            if (i == 0) {
              this.TprevioLiquidoInicial.push("373");
            }
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_mielo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_leucemia: data["dataListjSON"]["T_P_ANTINEOPLASICO"][
          "T_P_A_LIQUIDO"
        ]["T_P_A_L_LEUC"]["T_P_A_L_L_CONS"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_IN"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_MANT"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_LEUC"
            ]["T_P_A_L_L_RELA"]
          )
          .map((el, i) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe
            if (i == 0) {
              this.TprevioLiquidoInicial.push("374");
            }
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_leuce: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            };
          }),
        trat_ta_tl_sindmielodisplasico: data["dataListjSON"][
          "T_P_ANTINEOPLASICO"
        ]["T_P_A_LIQUIDO"]["T_P_A_L_SMIELODISPLASICO"][
          "T_P_A_L_SMIELODISPLASICO_LT"
        ].map((el, i) => {
          if (this.codigoTratamiento.length == 0) {
            this.codigoTratamiento = el.COD_TRATAMIENTO;
          }
          // push para seleccionar el tipo de tumor liquido, si existe
          if (i == 0) {
            this.TprevioLiquidoInicial.push("375");
          }
          return {
            fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
            fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
            terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
              ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
              : "",
            trat_ta_tl_sindmielodisplasico: el.P_TA_TIPO_TERAP_TUMOR
              ? el.P_TA_TIPO_TERAP_TUMOR
              : "",
            medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "",
            resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
            espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
            espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
            num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
            lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
            mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
            med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
            observaciones: el.TA_OBS ? el.TA_OBS : "",
            estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
            trans_leuc_aguda: el.TA_TRANS_LEUC ? el.TA_TRANS_LEUC : 0,
            lin_tratamiento: el.P_TA_NUM_LINEA_TRAT
              ? el.P_TA_NUM_LINEA_TRAT + ""
              : "",
          };
        }),
        trat_ta_tl_sindmieloproliferativo: data["dataListjSON"][
          "T_P_ANTINEOPLASICO"
        ]["T_P_A_LIQUIDO"]["T_P_A_L_SMIELOPROLIFERATIVO"]["T_P_A_L_SMP_LMC"]
          .concat(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_M"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_PV"],
            data["dataListjSON"]["T_P_ANTINEOPLASICO"]["T_P_A_LIQUIDO"][
              "T_P_A_L_SMIELOPROLIFERATIVO"
            ]["T_P_A_L_SMP_TE"]
          )
          .map((el, i) => {
            if (this.codigoTratamiento.length == 0) {
              this.codigoTratamiento = el.COD_TRATAMIENTO;
            }
            // push para seleccionar el tipo de tumor liquido, si existe
            if (i == 0) {
              this.TprevioLiquidoInicial.push("376");
            }
            return {
              fechIni: el.TA_FEC_INI ? el.TA_FEC_INI : "",
              fechFin: el.TA_FEC_FIN ? el.TA_FEC_FIN : "",
              terap_antineo_tipo_liquido: el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                ? el.P_TA_TIPO_TERAP_TUMOR_LIQUIDO
                : "",
              terap_antineo_tipo_mieloproliferativo: el.P_TA_TIPO_TERAP_TUMOR
                ? el.P_TA_TIPO_TERAP_TUMOR
                : "",
              medicamento: el.TA_MEDICAMENTO ? el.TA_MEDICAMENTO : "  ",
              resp_alc: el.P_TA_RESP_ALC ? el.P_TA_RESP_ALC : "",
              espc_otros: el.TA_ESPEC_OTROS ? el.TA_ESPEC_OTROS : "",
              espc_org: el.TA_ESPC_ORGANOS ? el.TA_ESPC_ORGANOS : "",
              num_cursos: el.TA_NUM_CURSOS ? el.TA_NUM_CURSOS : "",
              lug_recu: el.P_TA_LUG_REC_PRO ? el.P_TA_LUG_REC_PRO : "",
              lin_tratamiento: el.P_TA_NUM_LINEA_TRAT
                ? el.P_TA_NUM_LINEA_TRAT + ""
                : "",
              mot_inac: el.P_TA_MOT_INAC ? el.P_TA_MOT_INAC : "",
              med_trat: el.TA_MED_TRAT ? el.TA_MED_TRAT : "",
              observaciones: el.TA_OBS ? el.TA_OBS : "",
              estado_trat: el.TA_ESTADO == "PREVIO" ? true : false,
              trans_leuc_aguda: el.TA_TRANS_LEUC ? el.TA_TRANS_LEUC : 0,
            };
          }),
      },
    };
  }

  obtenerDatosTratamiento() {
    let actualData;

    var data = {
      codAfiliado: localStorage.getItem("codigoPaciente"),
    };
    this.detalleServicioSolEva
      .mostrarTratamientoActual(data)
      .subscribe((data2) => {
        actualData = data2;
        this.existeActual = true;
        // @ts-ignore
        if (data2.codResultado != 0) {
          this.existeActual = false;
        }
      });

    this.detalleServicioSolEva.mostrarTratamientos(data).subscribe(
      (data) => {
        this.aplica5 = new FormControl(false);

        this.aplica6 = new FormControl(false);
        this.aplica7 = new FormControl(false);
        this.aplica8 = new FormControl(false);

        this.noAplica5 = new FormControl(true);
        this.noAplica6 = new FormControl(true);
        this.noAplica7 = new FormControl(true);
        this.noAplica8 = new FormControl(true);

        if (data["codResultado"] == 0) {
          localStorage.setItem("existeTratamientosPrevios", "1");
          this.hayTratamientos = true;

          this.aplica5 = new FormControl(
            data["dataListjSON"]["T_PRE_CIRUGIA"]["APLICA_T_PRE_CIR"] == 1 ||
              false
          );

          this.aplica6 = new FormControl(
            data["dataListjSON"]["T_P_RAD"]["APLICA_T_P_RAD"] == 1 || false
          );
          this.aplica7 = new FormControl(
            data["dataListjSON"]["T_P_PALI"]["APLICA_T_P_PALIATIVO"] == 1 ||
              false
          );
          //this.aplica6=new FormControl(data["dataListjSON"]["T_P_RAD"]["APLICA_T_P_RAD"].length>0 && data["dataListjSON"]["T_P_RAD"]["T_P_RAD_NEOADY"].length>0 &&data["dataListjSON"]["T_P_RAD"]["T_P_RAD_PALI"].length>0)
          //this.aplica7=new FormControl(data["dataListjSON"]["T_P_PALI"]["APLICA_T_P_PALIATIVO"].length>0 &&  data["dataListjSON"]["T_P_PALI"]["T_P_PAL_COM"].length>0)
          this.aplica8 = new FormControl(
            data["dataListjSON"]["T_P_ANTINEOPLASICO"][
              "APLICA_T_P_ANTINEOPLASICO"
            ] == 1 || false
          );

          this.noAplica5 = new FormControl(!this.aplica5.value);
          this.noAplica6 = new FormControl(!this.aplica6.value);
          this.noAplica7 = new FormControl(!this.aplica7.value);
          this.noAplica8 = new FormControl(!this.aplica8.value);

          const formatedDummie = {
            trat_ciru: data["dataListjSON"]["T_PRE_CIRUGIA"]["T_PRE_CIR"]
              ? data["dataListjSON"]["T_PRE_CIRUGIA"]["T_PRE_CIR"].map((el) => {
                  if (this.codigoTratamiento.length == 0) {
                    this.codigoTratamiento = el.COD_TRATAMIENTO;
                  }
                  return {
                    fecha: el.FECHA_TPC,
                    tipo_cirugia: el.TIPO_TPC,
                    condicion: true,

                    hallazgos: el.HALLAZGOS_TPC,
                    modificado: false,
                  };
                })
              : [],
            trat_radio: {
              condicion: true,
              modificado: false,
              trat_radio_adyuvante: data["dataListjSON"]["T_P_RAD"][
                "T_P_RAD_ADY"
              ]
                ? data["dataListjSON"]["T_P_RAD"]["T_P_RAD_ADY"].map((el) => {
                    if (this.codigoTratamiento.length == 0) {
                      this.codigoTratamiento = el.COD_TRATAMIENTO;
                    }

                    return {
                      tipoRad: 362,
                      regionTrat: el.TPR_REGION,
                      fechIni: el.TPR_FECH_INI,
                      fechFin: el.TPR_FECH_FIN,
                      tipoDosis: el.TPR_TIPO_DOSIS,
                      observaciones: el.TPR_OBS,
                    };
                  })
                : [],
              trat_radio_neoadyuvante: data["dataListjSON"]["T_P_RAD"][
                "T_P_RAD_NEOADY"
              ]
                ? data["dataListjSON"]["T_P_RAD"]["T_P_RAD_NEOADY"].map(
                    (el) => {
                      if (this.codigoTratamiento.length == 0) {
                        this.codigoTratamiento = el.COD_TRATAMIENTO;
                      }

                      return {
                        tipoRad: 363,
                        regionTrat: el.TPR_REGION,
                        fechIni: el.TPR_FECH_INI,
                        fechFin: el.TPR_FECH_FIN,
                        tipoDosis: el.TPR_TIPO_DOSIS,
                        observaciones: el.TPR_OBS,
                      };
                    }
                  )
                : [],
              trat_radio_paliativa: data["dataListjSON"]["T_P_RAD"][
                "T_P_RAD_PALI"
              ]
                ? data["dataListjSON"]["T_P_RAD"]["T_P_RAD_PALI"].map((el) => {
                    if (this.codigoTratamiento.length == 0) {
                      this.codigoTratamiento = el.COD_TRATAMIENTO;
                    }

                    return {
                      tipoRad: 364,
                      regionTrat: el.TPR_REGION,
                      fechIni: el.TPR_FECH_INI,
                      fechFin: el.TPR_FECH_FIN,
                      tipoDosis: el.TPR_TIPO_DOSIS,
                      observaciones: el.TPR_OBS,
                    };
                  })
                : [],
            },
            trat_paliativo: {
              condicion: true,
              modificado: false,
              trat_paliativo_dolor: data["dataListjSON"]["T_P_PALI"][
                "T_P_PAL_DOLOR"
              ]
                ? data["dataListjSON"]["T_P_PALI"]["T_P_PAL_DOLOR"].map(
                    (el) => {
                      if (this.codigoTratamiento.length == 0) {
                        this.codigoTratamiento = el.COD_TRATAMIENTO;
                      }

                      return {
                        tipo: el.TPPR_TIPO,
                        fechIni: el.TPPR_FECHA_FIN,
                        fechFin: el.TPPR_FECHA_INI,
                        aplica: true,
                        dosis: el.TPPR_DOSIS,
                        observaciones: el.TPPR_OBS,
                      };
                    }
                  )
                : [],
              trat_paliativo_compasivo: data["dataListjSON"]["T_P_PALI"][
                "T_P_PAL_COM"
              ]
                ? data["dataListjSON"]["T_P_PALI"]["T_P_PAL_COM"].map((el) => {
                    if (this.codigoTratamiento.length == 0) {
                      this.codigoTratamiento = el.COD_TRATAMIENTO;
                    }

                    return {
                      tipo: el.TPPR_TIPO,
                      fechIni: el.TPPR_FECHA_FIN,
                      fechFin: el.TPPR_FECHA_INI,
                      dosis: el.TPPR_DOSIS,
                      observaciones: el.TPPR_OBS,
                      aplica: true,
                    };
                  })
                : [],
            },
            trat_terap_antineoplasica: {
              condicion: true,
              modificado: false,
              ...this.getDataAntineoFromMostrar(data),
            },

            trat_terap_actual: this.existeActual
              ? {
                  condicion: true,
                  modificado: false,

                  ...this.getDataAntineoFromMostrarActual(
                    this.existeActual ? actualData : data
                  ),
                }
              : this.dummieData.trat_terap_actual,
            codigo_usu_trat: {
              cod_evaluacion_trat: "0000000088",
              cod_solben_trat: "1912045939",
              cod_usuario_trat: 13001,
              nombres_trat: "LAURA",
              apellido_paterno_trat: "OLIVARES",
              apellido_materno_trat: "MONGRUT",
              codigo_afiliado_trat: "10008743100104787",
              cod_tratamiento: this.codigoTratamiento,
            },
          };

          this.dummieData = formatedDummie;
        } else {
          localStorage.setItem("existeTratamientosPrevios", "0");
          this.aplica5 = new FormControl(false);
          this.aplica6 = new FormControl(false);
          this.aplica7 = new FormControl(false);
          this.aplica8 = new FormControl(false);

          this.noAplica5 = new FormControl(true);
          this.noAplica6 = new FormControl(true);
          this.noAplica7 = new FormControl(true);
          this.noAplica8 = new FormControl(true);

          if (this.existeActual) {
            const formatedDummie = {
              trat_terap_actual: {
                condicion: true,
                modificado: false,
                ...this.getDataAntineoFromMostrarActual(
                  this.existeActual ? actualData : data
                ),
              },
              codigo_usu_trat: {
                cod_evaluacion_trat: "0000000088",
                cod_solben_trat: "1912045939",
                cod_usuario_trat: 13001,
                nombres_trat: "LAURA",
                apellido_paterno_trat: "OLIVARES",
                apellido_materno_trat: "MONGRUT",
                codigo_afiliado_trat: "10008743100104787",
                cod_tratamiento: this.codigoTratamiento,
              },
            };
            this.dummieData.trat_terap_actual =
              formatedDummie.trat_terap_actual;
          }
        }
        this.createTratamientosForm();
        //this.soloLecturaFormAnte();
        this.getTratamientoData();

        this.desactivarTratamientos();
      },

      (error) => {
        console.error(error);
        this.mensaje = "Error al obtener el detalle de la Evaluacion.";
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          this.mensaje,
          true,
          false,
          null
        );
        this.proBarTabla = false;
      }
    );
  }

  lecturaFormAntecPersGine() {
    this.antecedentesFrmGrp.get("menarquia").disable();
    this.antecedentesFrmGrp.get("gestaciones").disable();
    this.antecedentesFrmGrp.get("nro_hijos").disable();
    this.antecedentesFrmGrp.get("fur").disable();
    this.antecedentesFrmGrp.get("abortos").disable();
    this.antecedentesFrmGrp.get("anticoceptivo").disable();
    this.antecedentesFrmGrp.get("observaciones").disable();
    // this.antecedentesFrmGrp.get('noAplica1').disable()
    // this.antecedentesFrmGrp.get('aplica1').disable()

    this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
    this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
    this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
    this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
    this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
    this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
    this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
    this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
    this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
    this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    this.otros_onco_fami.disable();

    for (let field of this.fieldArray.controls) {
      field.disable();
    }

    this.fieldFamiliar1erGrado.controls.forEach((e) => {
      e.disable();
    });
    this.fieldFamiliar2doGrado.controls.forEach((e) => {
      e.disable();
    });
    //
  }

  editarFormAntecPersGine() {
    if (this.antecedenteEditFrmGrp.get("editFrm").value == false) {
      // this.antecedentesFrmGrp.get("aplica1").setValue(true);
      // this.antecedentesFrmGrp.get("noAplica1").setValue(false);

      if (this.antecedentesFrmGrp.get("aplica1").value == 1) {
        this.antecedentesFrmGrp.get("menarquia").enable();
        this.antecedentesFrmGrp.get("gestaciones").enable();
        this.antecedentesFrmGrp.get("nro_hijos").enable();
        this.antecedentesFrmGrp.get("fur").enable();
        this.antecedentesFrmGrp.get("abortos").enable();
        this.antecedentesFrmGrp.get("anticoceptivo").enable();
        this.antecedentesFrmGrp.get("observaciones").enable();
      }

      //---------------
      // this.antecedentesPatPersonalesFrmGrp.get("aplica2").setValue(true);
      // this.antecedentesPatPersonalesFrmGrp.get("noAplica2").setValue(false);
      if (this.antecedentesPatPersonalesFrmGrp.get("aplica2").value == 1) {
        this.antecedentesPatPersonalesFrmGrp.get("hta").enable();
        this.antecedentesPatPersonalesFrmGrp.get("ima_icc").enable();
        this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").enable();
        this.antecedentesPatPersonalesFrmGrp.get("dim").enable();
        this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").enable();
        this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").enable();
        this.antecedentesPatPersonalesFrmGrp.get("asma").enable();
        this.antecedentesPatPersonalesFrmGrp.get("ram").enable();
        this.antecedentesPatPersonalesFrmGrp.get("otros").enable();
        this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").enable();
      }

      //---------------

      // this.antecedentesOncoPersonalesFrmGrp.get("aplica3").setValue(true);
      // this.antecedentesOncoPersonalesFrmGrp.get("noAplica3").setValue(false);
      if (this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value == 1) {
        this.fieldArray.controls.forEach((e) => {
          e.enable();
        });
      }

      if (this.antecedentesOncoFamFrmGrp.get("aplica4").value == 1) {
        this.chkFamiliar1.setValue(true);
        this.chkFamiliar2.setValue(true);
        this.chkFamiliar1.enable();
        this.chkFamiliar2.enable();

        this.required1ck(this.chkFamiliar1.value);
        this.required2ck(this.chkFamiliar2.value);
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
        this.otros_onco_fami.enable();
      }

      // -----------------
      // this.antecedentesOncoFamFrmGrp.get("aplica4").setValue(true);
      // this.antecedentesOncoFamFrmGrp.get("noAplica4").setValue(false);

      // this.fam1FrmGroup.get('fam1erGrado').enable()
      // this.fam2FrmGroup.get('fam2doGrado').enable()
    } else {
      this.antecedentesFrmGrp.get("menarquia").disable();
      this.antecedentesFrmGrp.get("gestaciones").disable();
      this.antecedentesFrmGrp.get("nro_hijos").disable();
      this.antecedentesFrmGrp.get("fur").disable();
      this.antecedentesFrmGrp.get("abortos").disable();
      this.antecedentesFrmGrp.get("anticoceptivo").disable();
      this.antecedentesFrmGrp.get("observaciones").disable();

      // ---
      this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
      this.otros_onco_fami.disable();

      // ----
      this.fieldArray.controls.forEach((e) => {
        e.disable();
      });

      // ------------
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.disable();
      });
      this.chkFamiliar1.disable();
      this.chkFamiliar2.disable();
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.disable();
      });
    }
  }

  public inicializarVariables(): void {
    this.step = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.codAfiliado = this.solicitud.codAfiliado;
    this.codMac = this.solicitud.codMac;
    this.request.codSolEva = this.solicitud.codSolEvaluacion
      ? this.solicitud.codSolEvaluacion
      : this.solicitud.codEvaluacion;

    this.flagLiderTumor = this.solicitud.flagLiderTumor;
    this.dataSource = null;
    this.isLoading = false;
    this.infoSolben = new InfoSolben();
    this.InfoAntecPersGine = new InfoAntecPersGine();
    this.InfoAnteOncoPers = new InfoAnteOncoPers();

    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
    this.estadioClinicoFrmCtrl.setValue("---");
    this.tnmFrmCtrl.setValue("---");

    if (localStorage.getItem("modeConsulta")) {
      this.modeConsulta = true;
      let tokenTemporal = this.crypto.get(this.globalService.getToken());
      let login_id = this.userService.getCodUsuario;
      this.coreService.ConsultarMenu(login_id, tokenTemporal).subscribe(
        (data: OncoWsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            let tokenTemporalResidente = this.crypto.get(
              this.globalService.getToken()
            );
            if (data.audiResponse.tokenTemporal === tokenTemporalResidente) {
              data.dataList.forEach((element) => {
                if (element.nombreCorto == "EVALUACION") {
                  this.menuItems = data.dataList !== null ? data.dataList : [];
                  this.menu = new Object();

                  this.menu = {
                    codMenu: element.codMenu,
                    opcion: element.opcionResponse,
                  };
                }
              });

              localStorage.setItem("opcionMenu", JSON.stringify(this.menu));
            }
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }

    if (typeof this.solicitud.codSolEvaluacion !== "undefined") {
      this.solicitud.setEvaluacion = this.solicitud;
    }
    this.verificarTipoEvaluacion();
  }

  public verificarDataMonitoreo(): void {
    const evaRequest: BandejaMonitoreoRequest = new BandejaMonitoreoRequest();
    this.bandejaMonitoreoService
      .consultarMonitoreo(evaRequest)
      .subscribe((data) => {
        this.dataMonitoreo = data.data;
        this.dataMonitoreo.forEach((element: MonitoreoResponse) => {
          if (element.codSolEvaluacion == this.solicitud.codSolEvaluacion) {
            this.hideBotonMon = false;
          }
        });
      });
  }

  public irDetalleMonitoreo() {
    const evaRequest: BandejaMonitoreoRequest = new BandejaMonitoreoRequest();
    this.bandejaMonitoreoService
      .consultarMonitoreo(evaRequest)
      .subscribe((data) => {
        this.dataMonitoreo = data.data;
        this.dataMonitoreo.forEach((element: MonitoreoResponse) => {
          if (element.codSolEvaluacion == this.solicitud.codSolEvaluacion) {
            this.verDetalleSolicitud(element);

            this.invisibleModal = true;
          }
        });
      });
  }

  public verDetalleSolicitud(rowMonitoreo: MonitoreoResponse) {
    const request = new BandejaMonitoreoRequest();
    request.codEvaluacion = rowMonitoreo.codSolEvaluacion;

    this.bandejaMonitoreoService.consultarMonitoreo(request).subscribe(
      (data) => {
        this.router.navigate(["/app/monitoreo-paciente"]);
        localStorage.setItem("modeConsultaEva", "true");
        localStorage.setItem("monitoreo", JSON.stringify(rowMonitoreo));
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA MONITOREO.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  public definirTablaHistoria(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumns.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumns.push(c.columnDef);
          }
        });
      }
    });
  }

  public verificarTipoEvaluacion() {
    switch (this.solicitud.estadoEvaluacion + "") {
      case PARAMETRO.aprobadoEstado:
      case PARAMETRO.aprobadoTumorEstado:
      case PARAMETRO.aprobadoCMACEstado:
      case PARAMETRO.rechazadoEstado:
      case PARAMETRO.rechazadoTumorEstado:
      case PARAMETRO.rechazadoCMACEstado:
        this.mostraEvaluacion = false;
        break;
      default:
        this.mostraEvaluacion = true;
        break;
    }
  }

  public capturarRegistroEval(): void {
    if (typeof this.solicitud.codSolEvaluacion === "undefined") {
      this.solicitud = this.solicitud.getEvaluacion;
    }
  }

  public cargarDatosTabla(): void {
    if (this.listaHistoriaLineaTrata.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaHistoriaLineaTrata);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public registrarEvaluacionAutorizador() {
    this.openDialogRegHistorico();
    this.openDialogRegHistorico2();
  }

  public openDialogRegHistorico2(): void {
    // if (this.validarEstadoSolicitud()) {
    const dialogRef = this.dialog.open(PreguntaLineaTratComponent, {
      disableClose: true,
      width: "500px",
      data: {
        codMacEvaluacion: this.codMac,
        codAfiliado: this.solicitud.codAfiliado,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // if (!this.existeFormAntecedente) {
        //   this.mensaje = "Ya existe un antecedente";
        //   this.openDialogMensaje(this.mensaje, null, true, false, "");
        // } else {
        this.router.navigate(["./app/registro-linea-tratamiento"]);
        // }
      } else {
        this.router.navigate(["./app/medicamento-nuevo"]);
        this.actualizarTipoSolEvaluacion(
          this.solicitud.numeroSolEvaluacion,
          true
        );
      }
    });
    // }
  }

  public openDialogRegHistorico(): void {
    // if (this.validarEstadoSolicitud()) {
    const dialogRef = this.dialog.open(PreguntaLineaTratComponent, {
      disableClose: true,
      width: "500px",
      data: {
        codMacEvaluacion: this.codMac,
        codAfiliado: this.solicitud.codAfiliado,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        if (!this.existeFormAntecedente) {
          this.mensaje = "Ya existe un antecedente";
          this.openDialogMensaje(this.mensaje, null, true, false, "");
        } else {
          this.router.navigate(["./app/registro-linea-tratamiento"]);
        }
      } else {
        this.router.navigate(["./app/medicamento-continuador"]);
        this.actualizarTipoSolEvaluacion(
          this.solicitud.numeroSolEvaluacion,
          false
        );
      }
    });
    // }
  }

  /*public retornarMonitoreo(): void{
    this.router.navigate(["./app/monitoreo-paciente"]);
  }*/

  public validarEstadoSolicitud(): boolean {
    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoAprobadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación ya fue aprobada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoRechazadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación fue rechazada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoObservadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoAprobadoLiderTumor
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoRechazadoLiderTumor
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoObservadoLiderTumor
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra observada por Lider Tumor.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion === ESTADOEVALUACION.estadoAprobadoCMAC
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra aprobada por Autorizador CMAC.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion === ESTADOEVALUACION.estadoRechazadoCMAC
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra rechazada por CMAC.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (this.descripGrupoDiagFrmCtrl.value === null) {
      this.mensaje =
        "Error de comunicacion con el Servicio Oncosys, no se obtiene el Grupo de Diagnostico";
      return false;
    }

    return true;
  }

  public consultar(codAfiliado: any, codMacEvaluacion: any) {
    this.solbenRequest.codAfiliado = codAfiliado;
    this.spinnerService.show();
    this.detalleServicioSolEva
      .consultarEvaluacionAutorizador(this.solbenRequest)
      .subscribe(
        (data: ApiResponse) => {
          if (data.status === "0") {
            if (data.response.length > 0) {
              const codMacHistorico = data.response[0].codMac;
              const estadoMonitoreoMed = data.response[0].estadoMonitoreoMedic;
              this.solicitud.nroLineaTratamiento =
                data.response[0].nroLineaTratamiento;

              // quitar el false cuando se confirme
              //&& false
              if (codMacEvaluacion === codMacHistorico) {
                this.solicitud.codLineaTratamiento =
                  //this.solicitud.fechaSolEva = data.response[0].fecSolEva;
                  this.solicitud.codGrupoDiagnostico =
                    data.response[0].codGrpDiag;
                // insertar parametro P_ESTADO = MEDICAMENTO CONTINUADOR

                this.router.navigate(["/app/medicamento-continuador"]);
                this.actualizarTipoSolEvaluacion(
                  this.solicitud.numeroSolEvaluacion,
                  false
                ); // FALSE MED-CONTINUADOR
                this.spinnerService.hide();
                // P_TIPO_EVA
              } else if (
                ESTADOMONITOREOMED.estadoInactivo === estadoMonitoreoMed
              ) {
                this.router.navigate(["./app/medicamento-nuevo"]);
                this.actualizarTipoSolEvaluacion(
                  this.solicitud.numeroSolEvaluacion,
                  true
                ); // FALSE MED-NUEVO
                this.spinnerService.hide();
                // INSERTAR parametro P_ESTADO = MED NUEVO
              } else if (
                codMacEvaluacion !== codMacHistorico &&
                ESTADOMONITOREOMED.estadoActivo === estadoMonitoreoMed
              ) {
                this.enviarEmailMonitoreoImplicito();
              }
            } else {
              this.solicitud.nroLineaTratamiento = 0;
              this.actualizarTipoSolEvaluacion(
                this.solicitud.numeroSolEvaluacion,
                true
              ); // FALSE MED-NUEVO
              this.spinnerService.hide();
              this.router.navigate(["./app/medicamento-nuevo"]);
            }
          } else {
            console.error(data);
            this.mensaje = "No se logró obtener la información correctamente.";
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },
        (error) => {
          console.error(error);
          this.mensaje =
            "Error al consultar el tipo de evaluación del autorizador.";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public openDialogRegEvaluacionLTumor(): void {
    const dialogRef = this.dialog.open(PreguntaLineaTratComponent, {
      disableClose: true,
      width: "600px",
      data: {
        codMacEvaluacion: this.codMac,
        codAfiliado: this.solicitud.codAfiliado,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public guardarDetalleEvaluacion(): void {
    this.solicitud.codDiagnostico = this.infoSolben.codDiagnostico;
    this.solicitud.descDiagnostico = this.infoSolben.diagnostico;
    this.solicitud.codAfiliado = this.infoSolben.codAfiliado;
    this.solicitud.paciente = this.infoSolben.paciente;
    this.solicitud.sexoPaciente = this.infoSolben.sexoPaciente;
    this.solicitud.descDiagnostico = this.infoSolben.diagnostico;
    this.solicitud.codGrupoDiagnostico = this.infoSolben.codGrupoDiagnostico;
    this.solicitud.descGrupoDiagnostico = this.infoSolben.grupoDiagnostico;
    this.solicitud.edad = this.infoSolben.edad;
    this.solicitud.codArchFichaTec = this.codArchFichaTec;
    this.solicitud.codArchCompMed = this.codArchCompMed;
    this.solicitud.codInformePDF = Number(this.reportePdf);
    this.solicitud.codCmacPDF = Number(this.reporteActaCmac);
    this.solicitud.codCmp = this.infoSolben.cmpMedico;
    this.solicitud.fechaSolEva = this.infoSolben.fecSolEva;
  }

  /**Funcionalidad de Detalle Solicitud Evaluacion */
  public consultarInformacionScgEva() {
    this.proBarTabla = true;
    this.detalleServicioSolEva
      .consultarInformacionScgEva(this.request)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.codLiderTumor = data.data.codLiderTumor;
            this.nombreLiderTumor = data.data.nombreLiderTumor;
            this.infoSolben = data.data.solbenBean;
            this.liderTumor = data.data.liderTumor;
            this.flagVerActaCmac = data.data.flagVerActaCmac;
            this.reporteActaCmac = data.data.reporteActaCmac;
            this.flagVerInforme = data.data.flagVerInforme;
            this.reportePdf = data.data.reportePdf;
            this.codArchCompMed = data.data.codArchComplMed;
            this.codArchFichaTec = data.data.codArchFichaTec;
            if (this.infoSolben.codAfiliado != null) {
              this.listaLineaTratamientoRequest.codigoAfiliado =
                this.infoSolben.codAfiliado;
              //this.listaHistorialdelineas();
            }

            if (this.liderTumor === ESTADOEVALUACION.estadoLiderTumor) {
              this.validacionLiderTumor();
            }

            this.codEstadoEva = this.infoSolben.estadoSolEva;
            this.pTipoEva = this.infoSolben.pTipoEvaluacion;
            this.ValidarFlujos();

            this.mostrarInformacionSCG();
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );
  }

  public mostrarInformacionSCG(): void {
    this.validarClaseEstadioClinico();
    this.validarClaseTnm();
    this.mostrarInformacionRestSolben();
  }

  mostrarInformacionRestSolben(){
    let infoSolbenRequest = new InfoSolben();

    infoSolbenRequest.codDiagnostico = this.infoSolben.codDiagnostico;
    infoSolbenRequest.codAfiliado = this.infoSolben.codAfiliado;
    infoSolbenRequest.codClinica = this.infoSolben.codClinica;

    this.detalleServicioSolEva
      .consultarInformacionScgEvaRest(infoSolbenRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben.codDiagnostico = data.data.codDiagnostico;
            this.infoSolben.diagnostico = data.data.diagnostico;
            this.infoSolben.codGrupoDiagnostico = data.data.codGrupoDiagnostico;
            this.infoSolben.grupoDiagnostico = data.data.grupoDiagnostico;
            this.infoSolben.paciente = data.data.paciente;
            this.infoSolben.sexoPaciente = data.data.sexoPaciente;
            this.infoSolben.clinica = data.data.clinica;

            this.codSolEvaluacionFrmCtrl.setValue(this.codSolEvaluacion);
            this.estadoDescripFrmCtrl.setValue(this.infoSolben.descripEstadoSolEva);
            this.descripCodMacFrmCtrl.setValue(this.infoSolben.descripCodMac);
            this.descripMacFrmCtrl.setValue(this.infoSolben.descripcionMac);
            this.codScgSolbenFrmCtrl.setValue(this.infoSolben.nroSCGSolben);
            this.estadoScgSolbenFrmCtrl.setValue(this.infoSolben.estadoSCGSolben);
            this.fechaScgSolbenFrmCtrl.setValue(this.datePipe.transform(this.infoSolben.fecSCGSolben, "dd/MM/yyyy") + " " +this.infoSolben.horaSCGSolben);
            this.tipoScgSolbenFrmCtrl.setValue(this.infoSolben.tipoSolben);
            this.nroCartaGarantiaFrmCtrl.setValue(this.infoSolben.nroCartaGarantia);
            this.clinicaFrmCtrl.setValue(this.infoSolben.clinica);
            this.medicoTrataPrescripFrmCtrl.setValue(this.infoSolben.medicoTratante);
            this.cmpMedicoFrmCtrl.setValue(this.infoSolben.cmpMedico);
            this.mostrarFechaReceta = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.farmaciaCompleja ||this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaRecetaFrmCtrl.setValue(this.infoSolben.fechaReceta);
            this.mostrarFechaQuimio = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria ? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaQuimioterapiaFrmCtrl.setValue(this.infoSolben.fechaQuimio);
            this.mostrarFechaHospital = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.hospitalizacion ? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaHospitalInicioFrmCtrl.setValue(this.infoSolben.fechaHospitalInicio);
            this.fechaHospitalFinFrmCtrl.setValue(this.infoSolben.fechaHospitalFin);
            this.descripMedicamentoFrmCtrl.setValue( this.infoSolben.medicamentos !== null ? this.infoSolben.medicamentos.replace(/\|/g, ",") : null);
            this.esquemaFrmCtrl.setValue(this.infoSolben.esquemaQuimio !== null ? this.infoSolben.esquemaQuimio.replace(/\|/g, ",") : null);
            this.personaContactoFrmCtrl.setValue(this.infoSolben.personaContacto);
            this.totalPresupuestoFrmCtrl.setValue(this.infoSolben.totalPresupuesto); // TO-DO FALTA DECIMAL
            this.pacienteFrmCtrl.setValue(this.infoSolben.paciente);
            this.edadFrmCtrl.setValue(this.infoSolben.edad);
            this.descripDiagFrmCtrl.setValue(this.infoSolben.diagnostico);
            this.codDiagFrmCtrl.setValue(this.infoSolben.codDiagnostico);
            this.descripGrupoDiagFrmCtrl.setValue(this.infoSolben.grupoDiagnostico);
            this.contratanteFrmCtrl.setValue(this.infoSolben.contratante);
            this.planFrmCtrl.setValue(this.infoSolben.plan);
            this.codAfiliadoFrmCtrl.setValue(this.infoSolben.codAfiliado);
            this.fechaAfiliacionFrmCtrl.setValue(this.infoSolben.fechaAfiliado);
            this.estadioClinicoFrmCtrl.setValue(this.infoSolben.estadoClinico == "" ? "---" : this.infoSolben.estadoClinico);
            this.tnmFrmCtrl.setValue(this.infoSolben.tnm != "" ? this.infoSolben.tnm : "---");
            this.observacionFrmCtrl.setValue(this.infoSolben.observacion);
            this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
            this.descHisFrmCtrl.setValue(this.infoSolben.descHis);
            this.guardarDetalleEvaluacion();
            localStorage.setItem("codSolEva", this.codSolEvaluacionFrmCtrl.value);
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );

  }

  mostrarInfoAntecPersGine(): void {
    this.menarquia.setValue(this.InfoAntecPersGine.MENARQUIA);
    this.gestaciones.setValue(this.InfoAntecPersGine.GESTACIONES);
    this.nro_hijos.setValue(this.InfoAntecPersGine.NUM_HIJOS);
    this.fur.setValue(this.InfoAntecPersGine.FUR);
    this.abortos.setValue(this.InfoAntecPersGine.ABORTOS);
    this.anticoceptivo.setValue(this.InfoAntecPersGine.MET_ANTICON);
    this.observaciones.setValue(this.InfoAntecPersGine.OBSERVACIONES);
    this.aplica1.setValue(this.InfoAntecPersGine.APLICA);
    this.noAplica1.setValue(!this.InfoAntecPersGine.APLICA);
  }

  mostrarInfoAntecPatoPers(): void {
    this.hta.setValue(this.InfoAntecPatoPers.HTA);
    this.ima_icc.setValue(this.InfoAntecPatoPers.IMA_ICC);
    this.reumatologicas.setValue(this.InfoAntecPatoPers.REUMATOLOGIA);
    this.dim.setValue(this.InfoAntecPatoPers.DM);
    this.epoc_epid.setValue(this.InfoAntecPatoPers.EPOC_EPID);
    this.endocrinopatias.setValue(this.InfoAntecPatoPers.ENDOCRINO);
    this.asma.setValue(this.InfoAntecPatoPers.ASMA);
    this.otros.setValue(this.InfoAntecPatoPers.OTROS);
    this.ram.setValue(this.InfoAntecPatoPers.RMA);
    this.habitos_nocivos.setValue(this.InfoAntecPatoPers.HAB_NOCI);
    this.aplica2.setValue(this.InfoAntecPatoPers.APLICA);
    this.noAplica2.setValue(!this.InfoAntecPatoPers.APLICA);
  }

  mostrarInfoAnteOncoPers(): void {
    this.aplica3.setValue(this.AplicaAntecOncoPer);
    this.noAplica3.setValue(!this.AplicaAntecOncoPer);
  }

  mostrarInfoOncoFamOtros(): void {
    this.otros_onco_fami.setValue(this.AntecOncoOtros);
  }

  mostrarInfoAnteOncoFam(): void {
    this.aplica4.setValue(this.AplicaAntecOncoFam_1);
    this.noAplica4.setValue(!this.AplicaAntecOncoFam_1);
  }

  // public listaHistorialdelineas() {
  //   this.dataSource = null;
  //   this.listaHistoriaLineaTrata = [];
  //   this.isLoading = true;
  //   this.bandejaEvaluacionService
  //     .listarHistorialLinea(this.listaLineaTratamientoRequest)
  //     .subscribe(
  //       (data: ApiLineaTrataresponse) => {
  //         if (data.status === '0') {
  //           this.listaHistoriaLineaTrata = (data.response.lista != null) ? data.response.lista : [];
  //           this.cargarDatosTabla();
  //           this.mostrarBotonEnvioEmail();
  //         } else {
  //           this.openDialogMensaje(data.message, null, true, false, null);
  //         }
  //         this.isLoading = false;
  //       },
  //       error => {
  //         console.error('Error al lista el historial de linea de tratamiento');
  //         this.isLoading = false;
  //       }
  //     );
  // }

  public validacionLiderTumor() {
    this.mostrarBoton = true;
    // if (
    //   this.solicitud.estadoEvaluacion ===
    //     ESTADOEVALUACION.estadoAprobadoLiderTumor ||
    //   this.solicitud.estadoEvaluacion ===
    //     ESTADOEVALUACION.estadoRechazadoLiderTumor ||
    //   this.solicitud.estadoEvaluacion ===
    //     ESTADOEVALUACION.estadoObservadoLiderTumor
    // ) {
    //   this.mostrarBoton = false;
    //   return;
    // }

    // this.evaAutorizadorRequest.cmpMedico = this.infoSolben.cmpMedico;
    // this.evaAutorizadorRequest.codGrpDiag = this.infoSolben.codGrupoDiagnostico;
    // const estadoEvaluacion = this.solicitud.estadoEvaluacion;

    // this.listaParametroservice
    //   .consultarPValidacionAutorizador(this.evaAutorizadorRequest)
    //   .subscribe(
    //     (response: WsResponse) => {
    //       if (
    //         estadoEvaluacion === ESTADOEVALUACION.estadoObservadoAutorizador
    //       ) {
    //         if (response.audiResponse.codigoRespuesta === "0") {
    //           this.mostrarBoton = true;
    //           this.solicitud.codRolLiderTum = response.data.codigoRol;
    //           this.solicitud.codUsrLiderTum = response.data.codUsuario;
    //           this.solicitud.usrLiderTum = response.data.nombreUsuarioRol;
    //         } else if (
    //           response.audiResponse.codigoRespuesta === "2" ||
    //           response.audiResponse.codigoRespuesta === "3" ||
    //           response.audiResponse.codigoRespuesta === "4"
    //         ) {
    //           this.mensaje = response.audiResponse.mensajeRespuesta;
    //           this.mostrarBoton = false;
    //           this.openDialogMensaje(
    //             MENSAJES.ERROR_SERVICIO,
    //             this.mensaje,
    //             true,
    //             false,
    //             null
    //           );
    //         } else {
    //           this.mensaje = response.audiResponse.mensajeRespuesta;
    //           this.mostrarBoton = false;
    //           this.openDialogMensaje(
    //             MENSAJES.ERROR_SERVICIO,
    //             this.mensaje,
    //             true,
    //             false,
    //             null
    //           );
    //         }
    //       } else {
    //         this.mostrarBoton = false;
    //       }
    //     },
    //     (error) => {
    //       console.error(error);
    //       this.mensaje =
    //         "Error al obtener la validación para Evaluación del Lider Tumor";
    //       this.openDialogMensaje(
    //         MENSAJES.ERROR_SERVICIO,
    //         this.mensaje,
    //         true,
    //         false,
    //         null
    //       );
    //     }
    //   );
  }

  public openDialog(): void {
    const dialogRef = this.dialog.open(EvaluacionLiderTumorComponent, {
      disableClose: true,
      width: "550px",
      data: {
        title: "EVALUACION DEL LIDER TUMOR",
        codLiderTumor: this.codLiderTumor,
        nombreLiderTumor: this.nombreLiderTumor,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public descargarDocumento(): void {
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(this.archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          this.mensaje,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento();
  }

  public visualizarActaPDF() {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codCmacPDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento();
  }

  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any,
    callback = (result) => {}
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.EVALUACION.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      callback(result);
    });
  }

  public openDialogMensajeEstadoSolicitud(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.EVALUACION.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.consultarInformacionScgEva();
    });
  }

  public enviarEmailMonitoreo() {
    this.spinnerService.show();
    const date = new Date();
    this.correoRequest = new EmailDTO();
    this.correoRequest.codPlantilla =
      EMAIL.EVALUACION_MONITOREO.codigoPlantilla;
    this.correoRequest.fechaProgramada =
      _moment(date).format("DD/MM/YYYY HH:mm");
    this.correoRequest.flagAdjunto = EMAIL.EVALUACION_MONITOREO.flagAdjunto;
    this.correoRequest.tipoEnvio = EMAIL.EVALUACION_MONITOREO.tipoEnvio;
    this.correoRequest.usrApp = EMAIL.usrApp;

    this.correoService.generarCorreo(this.correoRequest).subscribe(
      (response: OncoWsResponse) => {
        let result = "";
        let codigoEnvio;
        const lista: any = response.dataList;

        result += lista[0].cuerpo
          .toString()
          .replace(
            "{{paciente}}",
            this.pacienteFrmCtrl.value != null
              ? this.pacienteFrmCtrl.value
              : " "
          )
          .replace(
            "{{descripcionMac}}",
            this.descripMacFrmCtrl.value != null
              ? this.descripMacFrmCtrl.value
              : " "
          )
          .replace(
            "{{nroScgSolben}}",
            this.codScgSolbenFrmCtrl.value != null
              ? this.codScgSolbenFrmCtrl.value
              : " "
          )
          .replace(
            "{{codSolEvaluacion}}",
            this.codSolEvaluacionFrmCtrl.value != null
              ? this.codSolEvaluacionFrmCtrl.value
              : " "
          )
          .replace(
            "{{medicoAutorizador}}",
            this.userService.getNombres +
              " " +
              this.userService.getApelPaterno +
              " " +
              this.userService.getApelMaterno
          );
        codigoEnvio = lista[0].codigoEnvio;

        this.correoRequest.asunto = EMAIL.EVALUACION_MONITOREO.asunto.concat(
          this.pacienteFrmCtrl.value != null ? this.pacienteFrmCtrl.value : " "
        );
        this.correoRequest.cuerpo = result;
        this.correoRequest.codigoEnvio = codigoEnvio;
        this.correoRequest.ruta = "";
        this.correoRequest.codigoPlantilla = this.correoRequest.codPlantilla;
        this.correoRequest.codigoGrupoDiagnostico =
          this.infoSolben.codGrupoDiagnostico;
        this.correoRequest.edadPaciente = this.infoSolben.edad;
        this.correoRequest.codRol = ROLES.responsableMonitoreo;
        this.envioCorreoRequest = new EnvioCorreoRequest();
        this.envioCorreoRequest.codSolicitudEvaluacion =
          this.codSolEvaluacionFrmCtrl.value;
        this.envioCorreoRequest.codigoEnvio = codigoEnvio;
        this.envioCorreoRequest.usrApp = EMAIL.usrApp;

        this.correoService.finalizarEnvioCorreo(this.correoRequest).subscribe(
          (response: OncoWsResponse) => {
            if (response.audiResponse.codigoRespuesta == "0") {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                "su correo está en proceso de envio",
                null
              );
              this.correoService
                .actualizarCodigoEnvio(this.envioCorreoRequest)
                .subscribe(
                  (response: OncoWsResponse) => {},
                  (error) => {
                    console.error(error);
                  }
                );
            } else {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                response.audiResponse.mensajeRespuesta,
                null
              );
            }
          },
          (error) => {
            this.spinnerService.hide();
            console.error(error);
            this.verConfirmacion(
              "Envio de correo",
              "Error al enviar correo",
              null
            );
          }
        );
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        this.verConfirmacion("Envio de correo", "Error al enviar correo", null);
      }
    );
  }

  public verConfirmacion(
    titulo: string,
    message: string,
    message2: string
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: titulo,
        message: message,
        message2: message2,
        alerta: true,
        confirmacion: false,
        valor: null,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != null) {
        if (result == 1) {
          //DESEA MANTENER SIN REGISTRO EL MARCADOR 1=>SI 0=>NO
        } else {
        }
      }
    });
  }

  public enviarEmailMonitoreoImplicito() {
    const date = new Date();
    this.correoRequest = new EmailDTO();
    this.correoRequest.codPlantilla =
      EMAIL.EVALUACION_MONITOREO.codigoPlantilla;
    this.correoRequest.fechaProgramada =
      _moment(date).format("DD/MM/YYYY HH:mm");
    this.correoRequest.flagAdjunto = EMAIL.EVALUACION_MONITOREO.flagAdjunto;
    this.correoRequest.tipoEnvio = EMAIL.EVALUACION_MONITOREO.tipoEnvio;
    this.correoRequest.usrApp = EMAIL.usrApp;

    this.correoService.generarCorreo(this.correoRequest).subscribe(
      (response: OncoWsResponse) => {
        let result = "";
        let codigoEnvio;
        const lista: any = response.dataList;

        result += lista[0].cuerpo
          .toString()
          .replace(
            "{{paciente}}",
            this.pacienteFrmCtrl.value != null
              ? this.pacienteFrmCtrl.value
              : " "
          )
          .replace(
            "{{descripcionMac}}",
            this.descripMacFrmCtrl.value != null
              ? this.descripMacFrmCtrl.value
              : " "
          )
          .replace(
            "{{nroScgSolben}}",
            this.codScgSolbenFrmCtrl.value != null
              ? this.codScgSolbenFrmCtrl.value
              : " "
          )
          .replace(
            "{{codSolEvaluacion}}",
            this.codSolEvaluacionFrmCtrl.value != null
              ? this.codSolEvaluacionFrmCtrl.value
              : " "
          )
          .replace(
            "{{medicoAutorizador}}",
            this.userService.getNombres +
              " " +
              this.userService.getApelPaterno +
              " " +
              this.userService.getApelMaterno
          );
        codigoEnvio = lista[0].codigoEnvio;

        this.correoRequest.asunto = EMAIL.EVALUACION_MONITOREO.asunto.concat(
          this.pacienteFrmCtrl.value != null ? this.pacienteFrmCtrl.value : " "
        );
        this.correoRequest.cuerpo = result;
        this.correoRequest.codigoEnvio = codigoEnvio;
        this.correoRequest.ruta = "";
        this.correoRequest.codigoPlantilla = this.correoRequest.codPlantilla;
        this.correoRequest.codigoGrupoDiagnostico =
          this.infoSolben.codGrupoDiagnostico;
        this.correoRequest.edadPaciente = this.infoSolben.edad;
        this.correoRequest.codRol = ROLES.responsableMonitoreo;
        this.envioCorreoRequest = new EnvioCorreoRequest();
        this.envioCorreoRequest.codSolicitudEvaluacion =
          this.codSolEvaluacionFrmCtrl.value;
        this.envioCorreoRequest.codigoEnvio = codigoEnvio;
        this.envioCorreoRequest.usrApp = EMAIL.usrApp;

        this.correoService.finalizarEnvioCorreo(this.correoRequest).subscribe(
          (response: OncoWsResponse) => {
            if (response.audiResponse.codigoRespuesta == "0") {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                null,
                "*Existe un monitoreo pendiente de registro de resultado.\n*Se envio un correo al Responsable de Monitoreo (verifique el estado de envio del email con el boton 'VER ESTADO DE CORREO')"
              );
              this.correoService
                .actualizarCodigoEnvio(this.envioCorreoRequest)
                .subscribe(
                  (response: OncoWsResponse) => {},
                  (error) => {
                    console.error(error);
                  }
                );
            } else {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                null,
                "*Existe un monitoreo pendiente de registro de resultado.\n*" +
                  response.audiResponse.mensajeRespuesta
              );
            }
          },
          (error) => {
            this.spinnerService.hide();
            console.error(error);
            this.verConfirmacion(
              "Envio de correo",
              null,
              "*Existe un monitoreo pendiente de registro de resultado.\n*" +
                response.audiResponse.mensajeRespuesta
            );
          }
        );
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        this.verConfirmacion(
          "Envio de correo",
          null,
          "*Existe un monitoreo pendiente de registro de resultado.\n*Error de generacion de correo para envio al Responsable de Monitoreo"
        );
      }
    );
  }

  public refrescarEstadoSolicitud() {
    this.spinnerService.show();
    this.envioCorreoRequest = new EnvioCorreoRequest();
    this.envioCorreoRequest.codSolicitudEvaluacion =
      this.codSolEvaluacionFrmCtrl.value;
    this.envioCorreoRequest.usrApp = EMAIL.usrApp;
    this.correoService.verificarCodigoEnvio(this.envioCorreoRequest).subscribe(
      (response: OncoWsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.mensaje = MENSAJES.EVALUACION.CORREO_ENVIADO;
          this.openDialogMensajeEstadoSolicitud(
            this.mensaje,
            null,
            true,
            false,
            null
          );
        } else {
          this.openDialogMensajeEstadoSolicitud(
            response.audiResponse.mensajeRespuesta,
            "",
            true,
            false,
            null
          );
        }
        this.spinnerService.hide();
      },
      (error) => {
        this.spinnerService.hide();
        this.openDialogMensajeEstadoSolicitud(
          MENSAJES.EVALUACION.ERROR_VERIFICAR_CORREO,
          null,
          true,
          false,
          null
        );
        console.error(error);
      }
    );
  }

  public actualizarTipoSolEvaluacion(codSolEva: string, tipo: boolean) {
    let solEvaRequest = new SolicitudEvaluacionRequest();
    solEvaRequest.codSolicitudEvaluacion = Number(codSolEva);
    if (tipo) {
      //SI IGUAL TRUE => NUEVO   -   FALSE=> CONTINUADOR
      solEvaRequest.pTipoEva = TIPO_SOL_EVA.medicamentoNuevo;
    } else {
      solEvaRequest.pTipoEva = TIPO_SOL_EVA.continuador;
    }

    this.detalleServicioSolEva
      .actualizarTipoSolEvaluacion(solEvaRequest)
      .subscribe(
        (response: WsResponse) => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public mostrarBotonEnvioEmail() {
    if (
      this.listaHistoriaLineaTrata[0].pEstado == ESTADO_LINEA_TRAT.estadoActivo
    ) {
      this.mostrarBtnAlertMon = true;
    }
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtCodigoSolicitud:
            this.txtCodigoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadoSolicitud:
            this.txtEstadoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnInforme:
            this.btnInforme = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnActaMac:
            this.btnActaMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroSCG:
            this.txtNroSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadoSCG:
            this.txtEstadoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaSCG:
            this.txtFechaSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTipoSCG:
            this.txtTipoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroCartaGarantiaDet:
            this.txtNroCartaGarantiaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtClinicaDet:
            this.txtClinicaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtMedicoTratante:
            this.txtMedicoTratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCMP:
            this.txtCMP = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaReceta:
            this.txtFechaReceta = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaQuimioterapia:
            this.txtFechaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaHospitalizacion:
            this.txtFechaHospitalizacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtMedicamentos:
            this.txtMedicamentos = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEsquemaQuimioterapia:
            this.txtEsquemaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPersonaContacto:
            this.txtPersonaContacto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTotalPresupuesto:
            this.txtTotalPresupuesto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPacienteDet:
            this.txtPacienteDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEdad:
            this.txtEdad = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDiagnostico:
            this.txtDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCie10:
            this.txtCie10 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtContratante:
            this.txtContratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPlan:
            this.txtPlan = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodigoAfiliado:
            this.txtCodigoAfiliado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaAfiliacion:
            this.txtFechaAfiliacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadioClinico:
            this.txtEstadioClinico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTNM:
            this.txtTNM = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtObservacion:
            this.txtObservacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnEnviarAlertaMonitoreo:
            this.btnEnviarAlertaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnRegistrarEvaAutorizador:
            this.btnRegistrarEvaAutorizador = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnRegistrarEvaLiderTumor:
            this.btnRegistrarEvaLiderTumor = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  //antecedentes

  addFieldValue() {
    for (let index = 0; index < this.arrayAntecOncoPers.length; index++) {
      this.fieldArray.push(
        new FormGroup({
          diagnostico: new FormControl(
            this.arrayAntecOncoPers[index].DIAGNOSTICO
          ),
          fecha: new FormControl(
            new Date(this.arrayAntecOncoPers[index].FECHA_AOP)
          ),
        })
      );
    }
  }

  addFieldValueAntecOncoPers() {
    this.fieldArray.push(
      new FormGroup({
        diagnostico: new FormControl(null),
        fecha: new FormControl(new Date()),
      })
    );
  }

  deleteFieldValue(index) {
    this.fieldArray.removeAt(index);
  }

  addFieldValue1erGrado() {
    for (let index = 0; index < this.arrayAntecOncoFam1.length; index++) {
      this.fieldFamiliar1erGrado.push(
        new FormGroup({
          diagnostico: new FormControl(
            this.arrayAntecOncoFam1[index].DIAGNOSTICO
          ),
          fecha: new FormControl(this.arrayAntecOncoFam1[index].FECHA_AOF),
        })
      );
    }
    // this.fieldFamiliar1erGrado.push(
    //   new FormGroup({
    //     "diagnostico": new FormControl(""),
    //     "fecha": new FormControl("")
    //   })
    // )
  }

  agregarFieldValue1erGrado() {
    this.fieldFamiliar1erGrado.push(
      new FormGroup({
        diagnostico: new FormControl(null),
        fecha: new FormControl(null),
      })
    );
  }

  deleteFieldValue1erGrado(index) {
    this.fieldFamiliar1erGrado.removeAt(index);
  }

  addFieldValue2doGrado() {
    for (let index = 0; index < this.arrayAntecOncoFam2.length; index++) {
      this.fieldFamiliar2doGrado.push(
        new FormGroup({
          diagnostico: new FormControl(
            this.arrayAntecOncoFam2[index].DIAGNOSTICO
          ),
          fecha: new FormControl(this.arrayAntecOncoFam2[index].FECHA_AOF),
        })
      );
    }
  }

  agregarFieldValue2erGrado() {
    this.fieldFamiliar2doGrado.push(
      new FormGroup({
        diagnostico: new FormControl(null),
        fecha: new FormControl(null),
      })
    );
  }

  deleteFieldValue2doGrado(index) {
    this.fieldFamiliar2doGrado.removeAt(index);
  }

  activar1() {
    if (this.antecedentesFrmGrp.get("aplica1").value == false) {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: false,
        aplica1: false,
      });
      this.antecedentesFrmGrp.get("menarquia").enable();
      this.antecedentesFrmGrp.get("gestaciones").enable();
      this.antecedentesFrmGrp.get("nro_hijos").enable();
      this.antecedentesFrmGrp.get("fur").enable();
      this.antecedentesFrmGrp.get("abortos").enable();
      this.antecedentesFrmGrp.get("anticoceptivo").enable();
      this.antecedentesFrmGrp.get("observaciones").enable();
      this.antecedentesFrmGrp.get("menarquia").enable();
    } else {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: true,
        aplica1: true,
        menarquia: null,
        gestaciones: null,
        nro_hijos: null,
        fur: null,
        abortos: null,
        anticoceptivo: null,
        observaciones: null,
      });
      this.antecedentesFrmGrp.get("menarquia").disable();
      this.antecedentesFrmGrp.get("gestaciones").disable();
      this.antecedentesFrmGrp.get("nro_hijos").disable();
      this.antecedentesFrmGrp.get("fur").disable();
      this.antecedentesFrmGrp.get("abortos").disable();
      this.antecedentesFrmGrp.get("anticoceptivo").disable();
      this.antecedentesFrmGrp.get("observaciones").disable();
    }
  }

  desactivar1() {
    if (this.antecedentesFrmGrp.get("noAplica1").value == false) {
      this.antecedentesFrmGrp.patchValue({
        aplica1: false,
        menarquia: null,
        gestaciones: null,
        nro_hijos: null,
        fur: null,
        abortos: null,
        anticoceptivo: null,
        observaciones: null,
      });
      this.antecedentesFrmGrp.get("menarquia").disable();
      this.antecedentesFrmGrp.get("gestaciones").disable();
      this.antecedentesFrmGrp.get("nro_hijos").disable();
      this.antecedentesFrmGrp.get("fur").disable();
      this.antecedentesFrmGrp.get("abortos").disable();
      this.antecedentesFrmGrp.get("anticoceptivo").disable();
      this.antecedentesFrmGrp.get("observaciones").disable();
      this.antecedentesFrmGrp.get("menarquia").disable();
    } else {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: true,
        aplica1: true,
      });
      this.antecedentesFrmGrp.get("menarquia").enable();
      this.antecedentesFrmGrp.get("gestaciones").enable();
      this.antecedentesFrmGrp.get("nro_hijos").enable();
      this.antecedentesFrmGrp.get("fur").enable();
      this.antecedentesFrmGrp.get("abortos").enable();
      this.antecedentesFrmGrp.get("anticoceptivo").enable();
      this.antecedentesFrmGrp.get("observaciones").enable();
      this.antecedentesFrmGrp.get("menarquia").enable();
    }
  }

  activar2() {
    if (this.antecedentesPatPersonalesFrmGrp.get("aplica2").value == false) {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: false,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").enable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").enable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").enable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").enable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").enable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").enable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").enable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").enable();
    } else {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: true,
        aplica2: true,
        hta: null,
        ima_icc: null,
        reumatologicas: null,
        dim: null,
        epoc_epid: null,
        endocrinopatias: null,
        asma: null,
        ram: null,
        otros: null,
        habitos_nocivos: null,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    }
  }

  desactivar2() {
    if (this.antecedentesPatPersonalesFrmGrp.get("noAplica2").value == false) {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        aplica2: false,
        hta: null,
        ima_icc: null,
        reumatologicas: null,
        dim: null,
        epoc_epid: null,
        endocrinopatias: null,
        asma: null,
        ram: null,
        otros: null,
        habitos_nocivos: null,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    } else {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: true,
        aplica2: true,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").enable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").enable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").enable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").enable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").enable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").enable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").enable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").enable();
    }
  }

  activar3() {
    if (this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value == false) {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: false,
      });
      this.fieldArray.controls.forEach((e) => {
        e.enable();
      });
    } else {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: true,
        aplica3: true,
      });
      this.fieldArray.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
    }
  }

  desactivar3() {
    if (this.antecedentesOncoPersonalesFrmGrp.get("noAplica3").value == false) {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        aplica3: false,
      });
      this.fieldArray.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
    } else {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: true,
        aplica3: true,
      });
      this.fieldArray.controls.forEach((e) => {
        e.enable();
      });
    }
  }

  activar4() {
    if (this.antecedentesOncoFamFrmGrp.get("aplica4").value == false) {
      this.chkFamiliar1.setValue(true);
      this.chkFamiliar2.setValue(true);
      if (this.chkFamiliar1.value) {
        this.required1ck(this.chkFamiliar1.value);
      }
      if (this.chkFamiliar2.value) {
        this.required2ck(this.chkFamiliar2.value);
      }
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: false,
      });
      if (this.isRequired) {
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      if (this.isRequired2) {
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      this.chkFamiliar1.enable();
      this.chkFamiliar2.enable();
      this.otros_onco_fami.enable();
    } else {
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: true,
        aplica4: true,
      });
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
      this.chkFamiliar1.disable();
      this.chkFamiliar2.disable();
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
      this.otros_onco_fami.disable();
    }
  }

  desactivar4() {
    if (this.antecedentesOncoFamFrmGrp.get("noAplica4").value == false) {
      this.chkFamiliar1.setValue(false);
      this.chkFamiliar2.setValue(false);
      if (!this.chkFamiliar1.value) {
        this.required1ck(this.chkFamiliar1.value);
      }
      if (!this.chkFamiliar2.value) {
        this.required2ck(this.chkFamiliar2.value);
      }
      this.antecedentesOncoFamFrmGrp.patchValue({
        aplica4: false,
      });
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: null,
          fecha: null,
        });
        e.disable();
      });
      this.chkFamiliar1.disable();
      this.chkFamiliar2.disable();
      this.otros_onco_fami.disable();
    } else {
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: true,
        aplica4: true,
      });
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.enable();
      });
      this.chkFamiliar1.enable();
      this.chkFamiliar2.enable();
      this.otros_onco_fami.enable();
    }
  }

  required1() {
    if (
      this.antecedenteEditFrmGrp.get("editFrm").value == true &&
      this.antecedentesOncoFamFrmGrp.get("aplica4").value == true
    ) {
      if (!this.chkFamiliar1.value) {
        this.chkFamiliar1.setValue(false);
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
        this.fam1btnAdd = false;
      } else {
        this.chkFamiliar1.setValue(true);
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.setValue({
            diagnostico: null,
            fecha: null,
          });
          e.disable();
        });
        this.fam1btnAdd = true;
      }
    }
  }

  required1ck(valor) {
    if (valor) {
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam1btnAdd = false;
    } else {
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam1btnAdd = true;
    }
  }

  required2() {
    if (
      this.antecedenteEditFrmGrp.get("editFrm").value == true &&
      this.antecedentesOncoFamFrmGrp.get("aplica4").value == true
    ) {
      if (!this.chkFamiliar2.value) {
        this.chkFamiliar2.setValue(false);
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
        this.fam2btnAdd = false;
      } else {
        this.chkFamiliar2.setValue(true);
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.setValue({
            diagnostico: null,
            fecha: null,
          });
          e.disable();
        });
        this.fam2btnAdd = true;
      }
    }
  }

  required2ck(valor) {
    if (valor) {
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam2btnAdd = false;
    } else {
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam2btnAdd = true;
    }
  }

  onSubmitCrono() {
    this.detalleServicioSolEva
      .registrarResumenCrono({
        cod_evaluacion_trat: this.codSolEvaluacionFrmCtrl.value,
        cod_solben_trat: this.codScgSolbenFrmCtrl.value,
        codigo_afiliado_trat:
          this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
        resum_crono: this.resumenCrono.value,
        modificado: false,
      })
      .subscribe(
        (data) => {
          this.mensaje = "Guardado exitosamente";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          // if (data.status === '0') {

          // } else {
          //   console.error(data);
          //   this.mensaje = 'No se logró obtener la información correctamente.';
          //   this.openDialogMensaje(this.mensaje, null, true, false, null);
          //   this.spinnerService.hide();
          // }
        },
        (error) => {
          console.error(error);

          this.mensaje = error;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  async canDeactivate() {
    const result = await this.openDialogMensajeSalida(
      "Los cambios no guardados se perderán ¿Desea continuar?",
      null,
      false,
      true,
      null
    );
    //const result = await this.openDialogMensaje(MENSAJES.medicNuevo.TITLE, "Se perderan los cambios,¿esta seguro que desea salir?", MENSAJES.INFO_SALIR2, false, true, null, 'salir')

    return result;
  }

  public openDialogMensajeSalida(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): any {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.EVALUACION.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef
      .afterClosed()
      .toPromise() // here you have a Promise instead an Observable
      .then((result) => {
        if (result == 1) {
          this.retirarBanderaSolicitud();
          return Promise.resolve(result == 1);
        }
        //return Promise.resolve(result == 1); // will return a Promise here
      });
  }

  retirarBanderaSolicitud() {
    let codSolEva = localStorage.getItem("codSolEva");

    var json = {
      codSolEva: codSolEva,
      tipo: "SALIENDO",
    };

    this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(
      (data) => {
        //return false
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensajeSalida(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  used_to_compare_two_arrays(a, b) {
    // This block will make the array of indexed that array b contains a elements
    var c = a.filter(function (value, index, obj) {
      return b.indexOf(value) > -1;
    });

    // This is used for making comparison that both have same length if no condition go wrong
    if (c.length !== a.length) {
      return 0;
    } else {
      return 1;
    }
  }

  public onSubmitTratamiento() {
    const radioterapiaItems = {
      condicion: this.tratamientoPrevioRadioterapia.value.aplica,
      modificado: this.tratamientoPrevioRadioterapia.value.aplica,
      trat_radio_adyuvante: [],
      trat_radio_neoadyuvante: [],
      trat_radio_paliativa: [],
    };
    const paleativaItems = {
      condicion: this.tratamientoPrevioPaliativo.value.aplica,
      modificado: this.tratamientoPrevioPaliativo.value.aplica,

      trat_paliativo_dolor: [],
      trat_paliativo_compasivo: [],
    };
    const antineoplasicoItems = {
      condicion: this.tratamientoPrevioAntineoplasica.value.aplica,
      modificado: this.tratamientoPrevioAntineoplasica.value.aplica,

      trat_ta_tum_solido: [],
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: [],
        trat_ta_tl_mieloma: [],
        trat_ta_tl_leucemia: [],
        trat_ta_tl_sindmielodisplasico: [],
        trat_ta_tl_sindmieloproliferativo: [],
      },
    };

    const some = this.tpCirugiaArray.value.filter((el) => {
      if (
        !el.fecha &&
        !el.tipo_cirugia &&
        !el.hallazgos &&
        this.tratamientoPrevioCirugia.value.aplica5
      ) {
        return false;
      }
      return true;
    });
    if (some.length == 0) {
      this.mensaje = "CIRUGIA TIENE CAMPOS INCOMPLETOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      this.spinnerService.hide();
      return false;
    }

    if (!this.aplica5 && !this.aplica6 && !this.aplica7 && this.aplica8) {
      this.mensaje = "LOS FORMULARIOS ESTAN SIN DATOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      return false;
    }

    if (this.tratamientoPrevioRadioterapia.value.aplica) {
      if (
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.adyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.neoAdyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.paliativa
        )
      ) {
        this.mensaje = "LOS FORMULARIOS EN RADIOTERAPIA ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      } else {
        this.tratamientoPrevioRadioterapia.value.adyuvante.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_adyuvante.push({
              tipoRad: 362,
              regionTrat: el.region,
              fechIni: el.fecha_inicio,
              tipoDosis: el.tipo_dosis,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
              estado_trat: true,
            });
          }
        });
        this.tratamientoPrevioRadioterapia.value.neoAdyuvante.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_neoadyuvante.push({
              tipoRad: 363,
              regionTrat: el.region,
              tipoDosis: el.tipo_dosis,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
            });
          }
        });
        this.tratamientoPrevioRadioterapia.value.paliativa.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_paliativa.push({
              tipoRad: 364,
              regionTrat: el.region,
              fechIni: el.fecha_inicio,
              tipoDosis: el.tipo_dosis,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
            });
          }
        });
      }
    }

    if (this.tratamientoPrevioPaliativo.value.aplica) {
      if (
        this.revisarArrayVacio(this.tratamientoPrevioPaliativo.value.dolor) ||
        this.revisarArrayVacio(this.tratamientoPrevioPaliativo.value.compasivo)
      ) {
        this.mensaje = "LOS FORMULARIOS EN PALEATIVO ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    if (
      this.tratamientoPrevioRadioterapia.value.aplica &&
      this.tratamientoPrevioRadioterapia.value.adyuvante.filter(
        (el) => el.aplica == true
      ).length == 0 &&
      this.tratamientoPrevioRadioterapia.value.neoAdyuvante.filter(
        (el) => el.aplica == true
      ).length == 0 &&
      this.tratamientoPrevioRadioterapia.value.paliativa.filter(
        (el) => el.aplica == true
      ).length == 0
    ) {
      this.mensaje = "NO SE SELECCIONO NINGUN TRATAMIENTO EN RADIOTERAPIA";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      this.spinnerService.hide();
      return false;
    }
    if (this.tratamientoPrevioPaliativo.value.aplica) {
      if (
        this.tratamientoPrevioPaliativo.value.dolor.filter(
          (el) => el.aplica == true
        ).length == 0 &&
        this.tratamientoPrevioPaliativo.value.compasivo.filter(
          (el) => el.aplica == true
        ).length == 0
      ) {
        this.mensaje = "NO SE SELECCIONO NINGUN TRATAMIENTO EN PALIATIVO";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
        return false;
      } else {
        this.tratamientoPrevioPaliativo.value.dolor.forEach((el) => {
          if (el.aplica) {
            paleativaItems.trat_paliativo_dolor.push({
              tipPali: 365,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              tipo: el.tipo,
              dosis: el.dosis,
              observaciones: el.observaciones,
            });
          }
        });
        this.tratamientoPrevioPaliativo.value.compasivo.forEach((el) => {
          if (el.aplica) {
            paleativaItems.trat_paliativo_compasivo.push({
              tipPali: 366,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              tipo: el.tipo,
              dosis: el.dosis,
              observaciones: el.observaciones,
            });
          }
        });
      }
    }

    // radioterapia

    if (this.tratamientoPrevioAntineoplasica.value.aplica) {
      if (
        !this.tratamientoPrevioAntineoplasica.value.solido &&
        !this.tratamientoPrevioAntineoplasica.value.noSolido
      ) {
        this.mensaje = "NO SE SELECCIONÓ NINGÚN TIPO DE TUMOR";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }

      if (
        this.tratamientoPrevioAntineoplasica.value.solido &&
        !this.validarAplicas(
          this.tratamientoPrevioAntineoplasica.value.adyuvante
        ) &&
        !this.validarAplicas(
          this.tratamientoPrevioAntineoplasica.value.neoAdyuvante
        ) &&
        !this.validarAplicas(
          this.tratamientoPrevioAntineoplasica.value.metastasico
        )
      ) {
        this.mensaje =
          "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR SOLIDO)";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }

      if (
        this.revisarArrayVacio(
          this.tratamientoPrevioAntineoplasica.value.adyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioAntineoplasica.value.neoAdyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioAntineoplasica.value.metastasico
        )
      ) {
        this.mensaje = "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
      this.tratamientoPrevioAntineoplasica.value.adyuvante.forEach((el) => {
        if (el.aplica) {
          antineoplasicoItems.trat_ta_tum_solido.push({
            fechIni: el.fecha_inicio,
            fechFin: el.fecha_fin,
            terap_antineo_tipo_solido: "369",
            terap_antineo_tipo_tumor: "367",
            medicamento: el.medicamento,
            espc_otros: el.otros,
            num_cursos: el.n_cursos,
            lug_recu: el.lugar,
            mot_inac: el.mot_inac,
            med_trat: el.medico_tratante,
            observaciones: el.observaciones,
            resp_alc: el.resp_alc,
            estado_trat: true,
          });
        }
      });
      this.tratamientoPrevioAntineoplasica.value.neoAdyuvante.forEach((el) => {
        if (el.aplica) {
          antineoplasicoItems.trat_ta_tum_solido.push({
            fechIni: el.fecha_inicio,
            fechFin: el.fecha_fin,
            medicamento: el.medicamento,
            espc_otros: el.otros,
            terap_antineo_tipo_solido: "370",
            terap_antineo_tipo_tumor: "367",
            num_cursos: el.n_cursos,
            lug_recu: el.lugar,
            resp_alc: el.resp_alc,
            mot_inac: el.mot_inac,
            med_trat: el.medico_tratante,
            observaciones: el.observaciones,
            estado_trat: true,
          });
        }
      });
      this.tratamientoPrevioAntineoplasica.value.metastasico.forEach((el) => {
        if (el.aplica) {
          antineoplasicoItems.trat_ta_tum_solido.push({
            fechIni: el.fecha_inicio,
            fechFin: el.fecha_fin,
            medicamento: el.medicamento,
            lin_tratamiento: el.lineas_tratamiento + "",
            espc_otros: el.otros,
            num_cursos: el.n_cursos,
            lug_recu: el.lugar,
            terap_antineo_tipo_solido: "371",
            terap_antineo_tipo_tumor: "367",
            resp_alc: el.resp_alc,
            mot_inac: el.mot_inac,
            med_trat: el.medico_tratante,
            observaciones: el.observaciones,
            estado_trat: true,
          });
        }
      });

      if (
        this.tratamientoPrevioAntineoplasica.value.noSolido &&
        this.tratamientoPrevioAntineoplasica.value.tipo.length == 0
      ) {
        this.mensaje =
          "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }

      for (let i of this.tratamientoPrevioAntineoplasica.value.tipo.map(
        (el) => el + ""
      )) {
        switch (i) {
          case "372": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LINFOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttLinfoma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_liquido: "372",
                      terap_antineo_tipo_linfo: "377",
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,

                      espc_otros: el.otros,
                      espc_org: el.organo,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                    {
                      lin_tratamiento: el.lineas_tratamiento + "",
                      fechIni: el.fecha_inicio,
                      espc_org: el.organo,
                      terap_antineo_tipo_liquido: "372",
                      terap_antineo_tipo_linfo: "378",

                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            break;
          }
          case "373": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_org: el.organo,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "379",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_org: el.organo,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "380",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      espc_org: el.organo,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "381",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            break;
          }
          case "374": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.
                consolidacion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .consolidacion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LEUCEMIA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_org: el.organo,

                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "382",
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      terap_antineo_tipo_liquido: "374",
                      espc_org: el.organo,

                      terap_antineo_tipo_leuce: "383",
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.consolidacion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "384",
                      espc_org: el.organo,

                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "385",
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      espc_org: el.organo,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            break;
          }
          case "375": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELODISPLASICO ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.resp_alc,
                      terap_antineo_tipo_liquido: "375",
                      trat_ta_tl_sindmielodisplasico: "",
                      espc_otros: el.otros,
                      lug_recu: el.lugar,
                      num_cursos: el.n_cursos,
                      trans_leuc_aguda: el.transformacion_leucemia ? 1 : 0,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            break;
          }
          case "376": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOPROFILERATIVO-OTROS ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_mieloproliferativo:
                        this.tratamientoPrevioAntineoplasica.value
                          .ttMieloprofilerativo.tipo_terapia,
                      medicamento: el.medicamento,
                      terap_antineo_tipo_liquido: "376",
                      resp_alc: el.resp_alc,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      trans_leuc_aguda: el.transformacion_leucemia,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                      estado_trat: true,
                    }
                  );
                }
              }
            );
            break;
          }
        }
      }
    }

    // paliativa

    const datosCirugia = this.tpCirugiaArray.value.map((el) => {
      return {
        condicion: this.tratamientoPrevioCirugia.value.aplica5,
        fecha: el.fecha,
        tipo_cirugia: el.tipo_cirugia,
        hallazgos: el.hallazgos,
        modificado: this.tratamientoPrevioCirugia.value.aplica5,
      };
    });

    const dataS = {
      trat_ciru: datosCirugia,
      trat_radio: radioterapiaItems,
      trat_paliativo: paleativaItems,
      trat_terap_antineoplasica: antineoplasicoItems,
      codigo_usu_trat: {
        cod_evaluacion_trat: this.codSolEvaluacionFrmCtrl.value,
        cod_solben_trat: this.codScgSolbenFrmCtrl.value,
        cod_usuario_trat: this.userService.getCodUsuario,
        nombres_trat: this.userService.getNombres,
        apellido_paterno_trat: this.userService.getApelPaterno,
        apellido_materno_trat: this.userService.getApelMaterno,
        codigo_afiliado_trat:
          this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
        cod_tratamiento: this.codigoTratamiento,
        numDoc: this.infoSolben.numDoc,
      },
    };

    // agregar actual

    // (this.tratamientoActual.value.adyuvante || []).forEach((el) => {
    //   if (el.aplica) {
    //     dataS.trat_terap_antineoplasica.trat_ta_tum_solido.push({
    //       fechIni: el.fecha_inicio,
    //       fechFin: el.fecha_fin,
    //       terap_antineo_tipo_solido: "369",
    //       terap_antineo_tipo_tumor: "367",
    //       medicamento: el.medicamento,
    //       espc_otros: el.otros,
    //       num_cursos: el.n_cursos,
    //       lug_recu: el.lugar,
    //       mot_inac: el.mot_inac,
    //       med_trat: el.medico_tratante,
    //       observaciones: el.observaciones,
    //       resp_alc: el.resp_alc,
    //       estado_trat: false,
    //     });
    //   }
    // });
    // (this.tratamientoActual.value.neoAdyuvante || []).forEach((el) => {
    //   if (el.aplica) {
    //     dataS.trat_terap_antineoplasica.trat_ta_tum_solido.push({
    //       fechIni: el.fecha_inicio,
    //       fechFin: el.fecha_fin,
    //       medicamento: el.medicamento,
    //       espc_otros: el.otros,
    //       terap_antineo_tipo_solido: "370",
    //       terap_antineo_tipo_tumor: "367",
    //       num_cursos: el.n_cursos,
    //       lug_recu: el.lugar,
    //       resp_alc: el.resp_alc,
    //       mot_inac: el.mot_inac,
    //       med_trat: el.medico_tratante,
    //       observaciones: el.observaciones,
    //       estado_trat: false,
    //     });
    //   }
    // });
    // (this.tratamientoActual.value.metastasico || []).forEach((el) => {
    //   if (el.aplica) {
    //     dataS.trat_terap_antineoplasica.trat_ta_tum_solido.push({
    //       fechIni: el.fecha_inicio,
    //       fechFin: el.fecha_fin,
    //       medicamento: el.medicamento,
    //       espc_otros: el.otros,
    //       //@ts-ignore
    //       lin_tratamiento: el.lineas_tratamiento,
    //       num_cursos: el.n_cursos,
    //       lug_recu: el.lugar,
    //       terap_antineo_tipo_solido: "371",
    //       terap_antineo_tipo_tumor: "367",
    //       resp_alc: el.resp_alc,
    //       mot_inac: el.mot_inac,
    //       med_trat: el.medico_tratante,
    //       observaciones: el.observaciones,
    //       estado_trat: false,
    //     });
    //   }
    // });

    // if (this.tratamientoActual.value.tipo) {
    //   for (let i of this.tratamientoActual.value.tipo) {
    //     switch (i) {
    //       case "372": {
    //         if (
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLinfoma.mantenimiento
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLinfoma.lineas_tto
    //           )
    //         ) {
    //           this.mensaje =
    //             "LOS FORMULARIOS TRATAMIENTO DE LINFOMA ESTAN SIN DATOS";
    //           this.openDialogMensaje(this.mensaje, null, true, false, null);
    //           return false;
    //         }
    //         this.tratamientoActual.value.ttLinfoma.mantenimiento.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
    //                 {
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   terap_antineo_tipo_liquido: "372",
    //                   terap_antineo_tipo_linfo: "377",
    //                   medicamento: el.medicamento,
    //                   resp_alc: el.resp_alc,
    //                   espc_otros: el.otros,
    //                   espc_org: el.organo,
    //                   num_cursos: el.n_cursos,
    //                   lug_recu: el.lugar,
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         this.tratamientoActual.value.ttLinfoma.lineas_tto.forEach((el) => {
    //           if (el.aplica) {
    //             dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
    //               {
    //                 lin_tratamiento: el.lineas_tratamiento,
    //                 fechIni: el.fecha_inicio,
    //                 espc_org: el.organo,
    //                 terap_antineo_tipo_liquido: "372",
    //                 terap_antineo_tipo_linfo: "378",

    //                 fechFin: el.fecha_fin,
    //                 medicamento: el.medicamento,
    //                 resp_alc: el.resp_alc,
    //                 espc_otros: el.otros,
    //                 num_cursos: el.n_cursos,
    //                 lug_recu: el.lugar,
    //                 mot_inac: el.mot_inac,
    //                 med_trat: el.medico_tratante,
    //                 observaciones: el.observaciones,
    //                 estado_trat: false,
    //               }
    //             );
    //           }
    //         });
    //         break;
    //       }
    //       case "373": {
    //         if (
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttMieloma.induccion
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttMieloma.mantenimiento
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttMieloma.relapso
    //           )
    //         ) {
    //           this.mensaje =
    //             "LOS FORMULARIOS TRATAMIENTO DE MIELOMA ESTAN SIN DATOS";
    //           this.openDialogMensaje(this.mensaje, null, true, false, null);
    //           return false;
    //         }
    //         this.tratamientoActual.value.ttMieloma.induccion.forEach((el) => {
    //           if (el.aplica) {
    //             dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
    //               {
    //                 fechIni: el.fecha_inicio,
    //                 fechFin: el.fecha_fin,
    //                 medicamento: el.medicamento,
    //                 resp_alc: el.resp_alc,
    //                 espc_org: el.organo,
    //                 espc_otros: el.otros,
    //                 num_cursos: el.n_cursos,
    //                 terap_antineo_tipo_liquido: "373",
    //                 terap_antineo_tipo_mielo: "379",
    //                 lug_recu: el.lugar,
    //                 mot_inac: el.mot_inac,
    //                 med_trat: el.medico_tratante,
    //                 observaciones: el.observaciones,
    //                 estado_trat: false,
    //               }
    //             );
    //           }
    //         });
    //         this.tratamientoActual.value.ttMieloma.mantenimiento.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
    //                 {
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   medicamento: el.medicamento,
    //                   resp_alc: el.resp_alc,
    //                   espc_org: el.organo,
    //                   espc_otros: el.otros,
    //                   num_cursos: el.n_cursos,
    //                   terap_antineo_tipo_liquido: "373",
    //                   terap_antineo_tipo_mielo: "380",
    //                   lug_recu: el.lugar,
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         this.tratamientoActual.value.ttMieloma.relapso.forEach((el) => {
    //           if (el.aplica) {
    //             dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
    //               {
    //                 fechIni: el.fecha_inicio,
    //                 fechFin: el.fecha_fin,
    //                 medicamento: el.medicamento,
    //                 resp_alc: el.resp_alc,
    //                 espc_otros: el.otros,
    //                 num_cursos: el.n_cursos,
    //                 espc_org: el.organo,
    //                 terap_antineo_tipo_liquido: "373",
    //                 terap_antineo_tipo_mielo: "381",
    //                 lug_recu: el.lugar,
    //                 mot_inac: el.mot_inac,
    //                 med_trat: el.medico_tratante,
    //                 observaciones: el.observaciones,
    //                 estado_trat: false,
    //               }
    //             );
    //           }
    //         });
    //         break;
    //       }
    //       case "374": {
    //         if (
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLeucemia.induccion
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLeucemia.mantenimiento
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLeucemia.consolidacion
    //           ) ||
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttLeucemia.relapso
    //           )
    //         ) {
    //           this.mensaje =
    //             "LOS FORMULARIOS TRATAMIENTO DE LEUCEMIA ESTAN SIN DATOS";
    //           this.openDialogMensaje(this.mensaje, null, true, false, null);
    //           return false;
    //         }
    //         this.tratamientoActual.value.ttLeucemia.induccion.forEach((el) => {
    //           if (el.aplica) {
    //             dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
    //               {
    //                 fechIni: el.fecha_inicio,
    //                 fechFin: el.fecha_fin,
    //                 medicamento: el.medicamento,
    //                 resp_alc: el.resp_alc,
    //                 espc_otros: el.otros,
    //                 num_cursos: el.n_cursos,
    //                 lug_recu: el.lugar,
    //                 terap_antineo_tipo_liquido: "374",
    //                 terap_antineo_tipo_leuce: "382",
    //                 mot_inac: el.mot_inac,
    //                 med_trat: el.medico_tratante,
    //                 observaciones: el.observaciones,
    //                 estado_trat: false,
    //               }
    //             );
    //           }
    //         });
    //         this.tratamientoActual.value.ttLeucemia.mantenimiento.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
    //                 {
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   medicamento: el.medicamento,
    //                   resp_alc: el.resp_alc,
    //                   espc_otros: el.otros,
    //                   num_cursos: el.n_cursos,
    //                   lug_recu: el.lugar,
    //                   terap_antineo_tipo_liquido: "374",
    //                   terap_antineo_tipo_leuce: "383",
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         this.tratamientoActual.value.ttLeucemia.consolidacion.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
    //                 {
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   medicamento: el.medicamento,
    //                   resp_alc: el.resp_alc,
    //                   espc_otros: el.otros,
    //                   terap_antineo_tipo_liquido: "374",
    //                   terap_antineo_tipo_leuce: "384",
    //                   espc_org: el.organo,
    //                   num_cursos: el.n_cursos,
    //                   lug_recu: el.lugar,
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         this.tratamientoActual.value.ttLeucemia.relapso.forEach((el) => {
    //           if (el.aplica) {
    //             dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
    //               {
    //                 fechIni: el.fecha_inicio,
    //                 fechFin: el.fecha_fin,
    //                 medicamento: el.medicamento,
    //                 resp_alc: el.resp_alc,
    //                 espc_otros: el.otros,
    //                 terap_antineo_tipo_liquido: "374",
    //                 terap_antineo_tipo_leuce: "385",
    //                 num_cursos: el.n_cursos,
    //                 lug_recu: el.lugar,
    //                 espc_org: el.organo,
    //                 mot_inac: el.mot_inac,
    //                 med_trat: el.medico_tratante,
    //                 observaciones: el.observaciones,
    //                 estado_trat: false,
    //               }
    //             );
    //           }
    //         });
    //         break;
    //       }
    //       case "375": {
    //         if (
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttMielodisplasico.lineas_tto
    //           )
    //         ) {
    //           this.mensaje =
    //             "LOS FORMULARIOS TRATAMIENTO DE MIELODISPLASICO ESTAN SIN DATOS";
    //           this.openDialogMensaje(this.mensaje, null, true, false, null);
    //           return false;
    //         }
    //         this.tratamientoActual.value.ttMielodisplasico.lineas_tto.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico.push(
    //                 {
    //                   lin_tratamiento: el.n_lineas,
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   medicamento: el.medicamento,
    //                   resp_alc: el.resp_alc,
    //                   terap_antineo_tipo_liquido: "375",
    //                   trat_ta_tl_sindmielodisplasico: "",
    //                   espc_otros: el.otros,
    //                   lug_recu: el.lugar,
    //                   num_cursos: el.n_cursos,
    //                   trans_leuc_aguda: el.transformacion_leucemia ? 1 : 0,
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         break;
    //       }
    //       case "376": {
    //         if (
    //           this.revisarArrayVacio(
    //             this.tratamientoActual.value.ttMieloprofilerativo.lineas_tto
    //           )
    //         ) {
    //           this.mensaje =
    //             "LOS FORMULARIOS TRATAMIENTO DE MIELOPROFILERATIVO ESTAN SIN DATOS";
    //           this.openDialogMensaje(this.mensaje, null, true, false, null);
    //           return false;
    //         }
    //         this.tratamientoActual.value.ttMieloprofilerativo.lineas_tto.forEach(
    //           (el) => {
    //             if (el.aplica) {
    //               dataS.trat_terap_antineoplasica.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo.push(
    //                 {
    //                   lin_tratamiento: el.n_lineas,
    //                   fechIni: el.fecha_inicio,
    //                   fechFin: el.fecha_fin,
    //                   terap_antineo_tipo_mieloproliferativo: this
    //                     .tratamientoActual.value.ttMieloprofilerativo
    //                     .tipo_terapia,
    //                   medicamento: el.medicamento,
    //                   terap_antineo_tipo_liquido: "376",
    //                   resp_alc: el.resp_alc,
    //                   espc_otros: el.otros,
    //                   num_cursos: el.n_cursos,
    //                   lug_recu: el.lugar,
    //                   trans_leuc_aguda: el.transformacion_leucemia,
    //                   mot_inac: el.mot_inac,
    //                   med_trat: el.medico_tratante,
    //                   observaciones: el.observaciones,
    //                   estado_trat: false,
    //                 }
    //               );
    //             }
    //           }
    //         );
    //         break;
    //       }
    //     }
    //   }
    // }

    this.detalleServicioSolEva.editarTratamientosPacientes(dataS).subscribe(
      (data) => {
        this.mensaje = "Guardado exitosamente";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        // if (data.status === '0') {

        // } else {
        //   console.error(data);
        //   this.mensaje = 'No se logró obtener la información correctamente.';
        //   this.openDialogMensaje(this.mensaje, null, true, false, null);
        //   this.spinnerService.hide();
        // }
      },
      (error) => {
        console.error(error);

        this.mensaje = error;
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  objectsEqual = (o1, o2) =>
    Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every((p) => {
      if (typeof o1[p] != "object") {
        return o1[p] == o2[p];
      } else {
        return Date.parse(o1[p]) == Date.parse(o2[p]);
      }
    });

  arraysEqual = (a1, a2) =>
    a1.length === a2.length &&
    a1.every((o, idx) => this.objectsEqual(o, a2[idx]));

  onSubmit() {
    var aplica1 = this.antecedentesFrmGrp.get("aplica1").value;
    var aplica2 = this.antecedentesPatPersonalesFrmGrp.get("aplica2").value;
    var aplica3_ = this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value;
    var aplica4_ = this.antecedentesOncoFamFrmGrp.get("aplica4").value;

    if (
      aplica1 == false &&
      aplica2 == false &&
      aplica3_ == false &&
      aplica4_ == false
    ) {
      this.mensaje = "LOS FORMULARIOS ESTAN SIN DATOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      return false;
    }

    var data_extra = {
      cod_evaluacion: this.codSolEvaluacionFrmCtrl.value,
      cod_solben: this.codScgSolbenFrmCtrl.value,
      cod_usuario: this.userService.getCodUsuario,
      nombres: this.userService.getNombres,
      apellido_paterno: this.userService.getApelPaterno,
      apellido_materno: this.userService.getApelMaterno,
      codigo_afiliado: this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
      cod_antecedente: this.CodigoAntecedente,
    };

    this.dataGlobal["codigos"] = data_extra;

    // antecedentesFrmGrp
    var abortos = this.antecedentesFrmGrp.get("abortos").value;
    var anticoceptivo = this.antecedentesFrmGrp.get("anticoceptivo").value;
    var fur = this.antecedentesFrmGrp.get("fur").value;
    var gestaciones = this.antecedentesFrmGrp.get("gestaciones").value;
    var menarquia = this.antecedentesFrmGrp.get("menarquia").value;
    var nro_hijos = this.antecedentesFrmGrp.get("nro_hijos").value;
    var observaciones = this.antecedentesFrmGrp.get("observaciones").value;

    if (aplica1 == true) {
      if (
        abortos == null &&
        anticoceptivo == null &&
        fur == null &&
        gestaciones == null &&
        menarquia == null &&
        nro_hijos == null &&
        observaciones == null
      ) {
        this.mensaje =
          "NO HAY REGISTRO EN ANTECEDENTES PERSONALES GINECOLOGICOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var ant_per_gine = {};

    if (
      menarquia == this.InfoAntecPersGine.MENARQUIA &&
      abortos == this.InfoAntecPersGine.ABORTOS &&
      anticoceptivo == this.InfoAntecPersGine.MET_ANTICON &&
      fur == this.InfoAntecPersGine.FUR &&
      gestaciones == this.InfoAntecPersGine.GESTACIONES &&
      nro_hijos == this.InfoAntecPersGine.NUM_HIJOS &&
      observaciones == this.InfoAntecPersGine.OBSERVACIONES
    ) {
      ant_per_gine = {
        aplica: aplica1,
        abortos: abortos,
        anticoceptivo: anticoceptivo,
        fur: fur,
        gestaciones: gestaciones,
        menarquia: menarquia,
        nro_hijos: nro_hijos,
        observaciones: observaciones,
        fechaActualizacion: new Date(),
        modificado: false,
      };
    } else {
      ant_per_gine = {
        aplica: aplica1,
        abortos: abortos,
        anticoceptivo: anticoceptivo,
        fur: fur,
        gestaciones: gestaciones,
        menarquia: menarquia,
        nro_hijos: nro_hijos,
        observaciones: observaciones,
        fechaActualizacion: new Date(),
        modificado: true,
      };
    }
    this.dataGlobal["ant_per_gine"] = ant_per_gine;

    // antecedentesPatPersonalesFrmGrp
    var asma = this.antecedentesPatPersonalesFrmGrp.get("asma").value;
    var dim = this.antecedentesPatPersonalesFrmGrp.get("dim").value;
    var endocrinopatias =
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").value;
    var epoc_epid = this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").value;
    var habitos_nocivos =
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").value;
    var hta = this.antecedentesPatPersonalesFrmGrp.get("hta").value;
    var ima_icc = this.antecedentesPatPersonalesFrmGrp.get("ima_icc").value;
    var otros = this.antecedentesPatPersonalesFrmGrp.get("otros").value;
    var ram = this.antecedentesPatPersonalesFrmGrp.get("ram").value;
    var reumatologicas =
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").value;

    if (aplica2 == true) {
      if (
        asma == null &&
        dim == null &&
        endocrinopatias == null &&
        epoc_epid == null &&
        habitos_nocivos == null &&
        hta == null &&
        ima_icc == null &&
        otros == null &&
        ram == null &&
        reumatologicas == null
      ) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES PATOLÓGICOS PERSONALES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var ant_pat_per = {};

    if (
      asma == this.InfoAntecPatoPers.ASMA &&
      dim == this.InfoAntecPatoPers.DM &&
      endocrinopatias == this.InfoAntecPatoPers.ENDOCRINO &&
      epoc_epid == this.InfoAntecPatoPers.EPOC_EPID &&
      habitos_nocivos == this.InfoAntecPatoPers.HAB_NOCI &&
      hta == this.InfoAntecPatoPers.HTA &&
      ima_icc == this.InfoAntecPatoPers.IMA_ICC &&
      otros == this.InfoAntecPatoPers.OTROS &&
      ram == this.InfoAntecPatoPers.RMA &&
      reumatologicas == this.InfoAntecPatoPers.REUMATOLOGIA
    ) {
      ant_pat_per = {
        aplica: aplica2,
        asma: asma,
        dim: dim,
        endocrinopatias: endocrinopatias,
        epoc_epid: epoc_epid,
        habitos_nocivos: habitos_nocivos,
        hta: hta,
        ima_icc: ima_icc,
        otros: otros,
        ram: ram,
        reumatologicas: reumatologicas,
        modificado: false,
      };
    } else {
      ant_pat_per = {
        aplica: aplica2,
        asma: asma,
        dim: dim,
        endocrinopatias: endocrinopatias,
        epoc_epid: epoc_epid,
        habitos_nocivos: habitos_nocivos,
        hta: hta,
        ima_icc: ima_icc,
        otros: otros,
        ram: ram,
        reumatologicas: reumatologicas,
        modificado: true,
      };
    }

    //this.dataGlobal["ant_per_gine"] = ant_per_gine;
    this.dataGlobal["ant_pat_per"] = ant_pat_per;

    var ant_onc_per = this.fieldArray.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
        aplica: this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value,
      };
    });

    var array1 = [];
    var array2 = [];

    for (let index = 0; index < ant_onc_per.length; index++) {
      if (
        ant_onc_per[index]["diagnostico"] == null &&
        ant_onc_per[index]["fecha"] == null
      ) {
        array1.push(1);
      }
    }

    for (let index = 0; index < ant_onc_per.length; index++) {
      array2.push(index);
    }

    if (aplica3_ == true) {
      if (array1.length == array2.length) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES ONCOLOGICOS PERSONALES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var arrayAntoncoPers = [];
    for (let index = 0; index < this.arrayAntecOncoPers.length; index++) {
      arrayAntoncoPers.push({
        aplica: this.arrayAntecOncoPers[index].APLICA == 1 ? true : false,
        diagnostico: this.arrayAntecOncoPers[index].DIAGNOSTICO,
        fecha: new Date(this.arrayAntecOncoPers[index].FECHA_AOP),
      });
    }
    var result = this.arraysEqual(arrayAntoncoPers, ant_onc_per);

    for (let index = 0; index < ant_onc_per.length; index++) {
      ant_onc_per[index]["modificado"] = !result;
    }
    //ant_onc_per
    this.dataGlobal["ant_onc_per"] = ant_onc_per;

    var familiar_1er_grado = this.fieldFamiliar1erGrado.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
      };
    });

    var familiar_2do_grado = this.fieldFamiliar2doGrado.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
      };
    });

    var array3 = [];
    var array4 = [];
    var array5 = [];
    var array6 = [];

    for (let index = 0; index < familiar_1er_grado.length; index++) {
      if (
        familiar_1er_grado[index]["diagnostico"] == null &&
        familiar_1er_grado[index]["fecha"] == null
      ) {
        array3.push(1);
      }
    }

    for (let index = 0; index < familiar_1er_grado.length; index++) {
      array4.push(index);
    }

    for (let index = 0; index < familiar_2do_grado.length; index++) {
      if (
        familiar_2do_grado[index]["diagnostico"] == null &&
        familiar_2do_grado[index]["fecha"] == null
      ) {
        array5.push(1);
      }
    }

    for (let index = 0; index < familiar_2do_grado.length; index++) {
      array6.push(index);
    }

    if (aplica4_ == true) {
      if (array3.length == array4.length && array5.length == array6.length) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES ONCOLOGICOS FAMILIARES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var AntecOncoFam1ArrayFam1 = [];
    for (let index = 0; index < this.arrayAntecOncoFam1.length; index++) {
      AntecOncoFam1ArrayFam1.push({
        diagnostico: this.arrayAntecOncoFam1[index].DIAGNOSTICO,
        fecha: this.arrayAntecOncoFam1[index].FECHA_AOF,
      });
    }

    var result_fam_1 = this.arraysEqual(
      AntecOncoFam1ArrayFam1,
      familiar_1er_grado
    );

    var AntecOncoFam1ArrayFam2 = [];
    for (let index = 0; index < this.arrayAntecOncoFam2.length; index++) {
      AntecOncoFam1ArrayFam2.push({
        diagnostico: this.arrayAntecOncoFam2[index].DIAGNOSTICO,
        fecha: this.arrayAntecOncoFam2[index].FECHA_AOF,
      });
    }

    var result_fam_2 = this.arraysEqual(
      AntecOncoFam1ArrayFam2,
      familiar_2do_grado
    );
    // for (let index = 0; index < familiar_1er_grado.length; index++) {
    //   familiar_1er_grado[index]["modificado"] = result2
    // }

    var familiares = {};
    if (result_fam_1 == false || result_fam_2 == false) {
      familiares = {
        familiar_1er_grado: familiar_1er_grado,
        familiar_2do_grado: familiar_2do_grado,
        aplica: this.antecedentesOncoFamFrmGrp.get("aplica4").value,
        otros: this.antecedentesOtros.get("otros_onco_fami").value,
        modificado: true,
      };
    } else {
      familiares = {
        familiar_1er_grado: familiar_1er_grado,
        familiar_2do_grado: familiar_2do_grado,
        aplica: this.antecedentesOncoFamFrmGrp.get("aplica4").value,
        otros: this.antecedentesOtros.get("otros_onco_fami").value,
        modificado: false,
      };
    }

    this.dataGlobal["ant_onc_fam"] = familiares;

    this.detalleServicioSolEva
      .editarAntecedentesPacientes(this.dataGlobal)
      .subscribe(
        (data) => {
          this.mensaje = data["msgResultado"];
          this.openDialogMensaje(
            "Se Actualizo Correctamente",
            null,
            true,
            false,
            null
          );
        },
        (error) => {
          console.error(error);
          this.mensaje = "ERROR AL EDITAR EL ANTECEDENTE.";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }
  pushCirugia() {
    this.tpCirugiaArray.push(
      new FormGroup({
        fecha: new FormControl(""),
        tipo_cirugia: new FormControl(""),
        hallazgos: new FormControl(""),
      })
    );
  }

  deleteArr(arr, index) {
    arr.removeAt(index);
  }

  pushRadioAyuvante() {
    // @ts-ignore
    this.tratamientoPrevioRadioterapia.controls.adyuvante.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );

    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.adyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.adyuvante.controls.length -
          1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.adyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.adyuvante.controls.length - 1
    ].controls.aplica.enable();
  }
  pushRadioNeoadyuvante() {
    // @ts-ignore

    this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls.length -
        1
    ].controls.aplica.enable();
  }
  pushRadioPaliativa() {
    // @ts-ignore
    this.tratamientoPrevioRadioterapia.controls.paliativa.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.paliativa.controls[
        //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.paliativa.controls.length -
          1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.paliativa.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.paliativa.controls.length - 1
    ].controls.aplica.enable();
  }
  pushPalioDolor() {
    // @ts-ignore
    this.tratamientoPrevioPaliativo.controls.dolor.push(
      new FormGroup({
        dosis: new FormControl(""),
        tipo: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.dolor.controls[
        //@ts-ignore
        this.tratamientoPrevioPaliativo.controls.dolor.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioPaliativo.controls.dolor.controls[
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.dolor.controls.length - 1
    ].controls.aplica.enable();
  }
  pushPalioCompasivo() {
    // @ts-ignore
    this.tratamientoPrevioPaliativo.controls.compasivo.push(
      new FormGroup({
        tipo: new FormControl(""),
        fecha_inicio: new FormControl(""),
        dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.compasivo.controls[
        //@ts-ignore
        this.tratamientoPrevioPaliativo.controls.compasivo.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioPaliativo.controls.compasivo.controls[
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.compasivo.controls.length - 1
    ].controls.aplica.enable();
  }

  pushSolidoAdyuvante() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.adyuvante.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls.length -
        1
    ].controls.aplica.enable();
  }
  pushSolidoNeoadyuvante() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls
        .length - 1
    ].controls.aplica.enable();
  }
  pushSolidoMetastasico() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.metastasico.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        resp_alc: new FormControl(0),
        lineas_tratamiento: new FormControl(""),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.metastasico.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.metastasico.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.metastasico.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.metastasico.controls
        .length - 1
    ].controls.aplica.enable();
  }
  pushTtlinfomaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .mantenimiento.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }

  pushTtlinfomaLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto.push(
      new FormGroup({
        lineas_tratamiento: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .lineas_tto.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
          .lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaInduccion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        resp_alc: new FormControl(0),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion
        .controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
          .induccion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
        .mantenimiento.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaRelapso() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
        .controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
          .controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaInduccion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .induccion.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .induccion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .induccion.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .mantenimiento.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaConsolidacion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        resp_alc: new FormControl(0),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        organo: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .consolidacion.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .consolidacion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .consolidacion.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaRelapso() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        resp_alc: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso
        .controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .relapso.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielodisplasicoLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto.push(
      new FormGroup({
        n_lineas: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        lugar: new FormControl(""),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        transformacion_leucemia: new FormControl(false),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
        .lineas_tto.controls[
          //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
          .lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
        .lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMieloprofilerativoLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto.push(
      new FormGroup({
        n_lineas: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        lugar: new FormControl(""),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        resp_alc: new FormControl(0),
        transformacion_leucemia: new FormControl(false),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
      //@ts-ignore
        .controls.lineas_tto.controls[
        this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
        //@ts-ignore
          .controls.lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto.controls[
      this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
      //@ts-ignore
        .controls.lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }

  desactivarTratamientos() {
    this.desactivarArray(this.tpCirugiaArray);
    this.desactivarArray(this.tratamientoPrevioRadioterapia.controls.adyuvante);
    this.desactivarArray(
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
    );
    this.desactivarArray(this.tratamientoPrevioRadioterapia.controls.paliativa);
    this.desactivarArray(this.tratamientoPrevioPaliativo.controls.dolor);
    this.desactivarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.adyuvante
    );
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
    );
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.metastasico
    );

    this.tratamientoPrevioAntineoplasica.controls.solido.disable();
    this.tratamientoPrevioAntineoplasica.controls.noSolido.disable();
    this.tratamientoPrevioAntineoplasica.controls.tipo.disable();

    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
  }
  activarTratamientos2() {
    this.activarArray(this.tratamientoActual.controls.adyuvante);
    this.activarArray(this.tratamientoActual.controls.neoAdyuvante);
    this.activarArray(this.tratamientoActual.controls.metastasico);
    this.tratamientoActual.controls.solido.enable();
    this.tratamientoActual.controls.tipo.enable();
    this.tratamientoActual.controls.noSolido.enable();
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.activarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
  }
  desactivarTratamientos2() {
    this.desactivarArray(this.tratamientoActual.controls.adyuvante);
    this.desactivarArray(this.tratamientoActual.controls.neoAdyuvante);
    this.desactivarArray(this.tratamientoActual.controls.metastasico);
    this.tratamientoActual.controls.solido.disable();

    this.tratamientoActual.controls.tipo.disable();

    this.tratamientoActual.controls.noSolido.disable();
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLinfoma.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttMieloma.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.consolidacion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttLeucemia.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttMielodisplasico.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoActual.controls.ttMieloprofilerativo.controls.lineas_tto);
  }
  activarTratamientos() {
    if (this.tratamientoPrevioCirugia.value.aplica5) {
      this.tpCirugiaArray.controls.forEach((el) => {
        //@ts-ignore
        this.activarGrupo(el);
      });
    }

    if (this.tratamientoPrevioRadioterapia.value.aplica) {
      this.activarArray(this.tratamientoPrevioRadioterapia.controls.adyuvante);
      this.activarArray(
        this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
      );
      this.activarArray(this.tratamientoPrevioRadioterapia.controls.paliativa);
    }

    if (this.tratamientoPrevioPaliativo.value.aplica) {
      this.activarArray(this.tratamientoPrevioPaliativo.controls.dolor);
      this.activarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
    }

    if (this.tratamientoPrevioAntineoplasica.value.aplica) {
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.adyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.metastasico
      );

      this.tratamientoPrevioAntineoplasica.controls.solido.enable();
      this.tratamientoPrevioAntineoplasica.controls.noSolido.enable();
      this.tratamientoPrevioAntineoplasica.controls.tipo.enable();

      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
    }
  }

  public validarAplicas(arr) {
    const len = arr.filter((element) => {
      return element.aplica;
    });
    if (len.length > 0) return true;
    return false;
  }

  public validarFechaInicio() {}

  validarClaseEstadioClinico() {
    if (this.infoSolben.estadoClinico == "") {
      let idEstadioClinico = document.getElementById("idEstadioClinico");
      idEstadioClinico.classList.add("formPersonal");
    }
  }

  validarClaseTnm() {
    if (this.infoSolben.tnm == "") {
      let idTnm = document.getElementById("idTnm");
      idTnm.classList.add("formPersonal");
    }
  }

  public generarAntecedentes(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      cod_evaluacion: this.solicitud.codSolEvaluacion,
      cod_afiliado: this.solicitud.codAfiliado,
    };
    this.detalleServicioSolEva.generarAntecedentes(data).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          if (!vista) {
            this.mensaje += "\n*El reporte fue generado correctamente.";
            response.data.nomArchivo = `${response.data.nomArchivo}.pdf`;
            response.data.archivoFile = new File(
              [blob],
              `${response.data.nomArchivo}`,
              {
                type: response.data.contentType,
                lastModified: Date.now(),
              }
            );
            //this.subirArchivoFTP(response.data);
          } else {
            this.spinnerService.hide();
            const link = document.createElement("a");
            link.target = "_blank";
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", response.data.nomArchivo);
            link.click();
          }
        } else {
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        const mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          mensaje,
          "Error al generar el Informe Autorizador.",
          true,
          false,
          null
        );
      }
    );
  }
}
