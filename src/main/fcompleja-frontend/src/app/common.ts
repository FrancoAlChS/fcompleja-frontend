// AMBIENTE LOCAL;
// export const oauthServerEndpoint: string = 'http://10.41.190.223:8080/oauth2-server/oauth/token';
// export const webServiceEndpoint: string = 'http://10.41.190.223:8080/fcompleja-backend/';

//export const oauthServerEndpoint: string ="https://qasservicios.auna.pe/oauth2-server/oauth/token";
//export const webServiceEndpoint: string = 'http://localhost:2019/fcompleja-backend/';

// AMBIENTE DESARROLLO - QAS AUNA  IP
// export const oauthServerEndpoint: string = 'http://10.41.190.223:8080/oauth2-server/oauth/token';
// export const webServiceEndpoint: string = 'http://10.41.190.223:8080/fcompleja-backend/';

// DESPLIEGUE QA AUNA - CON DOMINIO
export const oauthServerEndpoint: string = "https://qasservicios.auna.pe/oauth2-server/oauth/token";
export const webServiceEndpoint: string =
  "https://qasontfarmacia.auna.pe/fcompleja-backend/";

// AMBIENTE PRD (SERVIDOR ANTERIOR)
// export const oauthServerEndpoint: string =
//   "https://servicios.auna.pe/oauth2-server/oauth/token";
// export const webServiceEndpoint: string = 'https://ontfarmacia.auna.pe/fcompleja-backend/';

// AMBIENTE DESARROLLO - PRD (SERVIDOR NUEVO)
// export const oauthServerEndpoint: string =
//   "https://servicios.auna.pe/oauth2-server/oauth/token";
// export const webServiceEndpoint: string = 'http://10.41.190.73:8080/fcompleja-backend/';

// AMBIENTE DESARROLLO - PRD
// export const oauthServerEndpoint: string =
//   "https://qasservicios.auna.pe/oauth2-server/oauth/token";
// export const webServiceEndpoint: string = "http://localhost:4200/api/";

export const OAUTH_REVOKETOKEN = oauthServerEndpoint + "/revokeById/";
export var LOGOUT_OAUTH = (tokenId) => OAUTH_REVOKETOKEN + tokenId;

export const CAPCHA_KEY = "6Lde8pwUAAAAAK5zmwBgB2ziAdomvoyesGC8cBhA";
export const AES_KEY: string = "AUNAPFC987654321";

export const TIPOSCGSOLBEN = {
  farmaciaCompleja: 1,
  quimioAmbulatoria: 2,
  hospitalizacion: 3,
  mostrarCampoDetalle: 1,
  ocultarCampoDetalle: 0,
};

export const ESTADOPRELIMINAR = {
  estadoRechazado: 7,
  estadoAtendido: 5,
  estadoPendiente: 4,
  estadoPendienteInscMac: 6,
};

export const ESTADOMONITOREOMED = {
  estadoActivo: 45,
  estadoInactivo: 46,
};

export const ESTADO_LINEA_TRAT = {
  estadoActivo: 45,
  estadoInactivo: 46,
};

// codAplicacion = 1 | Aplicacion = FARMACIA COMPLEJA
export const codAplicacion: number = 1;

export const dominio: string = "AUNA";

export const rolRespMantMac: number = 1;

export const clientId: string = "ppa-farmacia-compleja-app";
export const clientSecret: string =
  "B95B75295F3D3E2296A3DA02AC8EF932ED33B7CC47727D74F0B02004330AAA87";
export const ESTADO_SOL_EVA = {
  PENDIENTE: "PENDIENTE",
  RECHAZADO: "RECHAZADO",
};

// MENSAJES DE EXCEPCIONES
export const MENSAJES = {
  ANTECEDENTES: {
    TITULO: "ANTECEDENTES",
  },
  FCOMPLEJA: {
    TITULO: "FARMACIA COMPLEJA",
    NO_AUTORIZADO: "Se ha cerrado la sesión",
  },
  LOGIN: {
    INICIO_SESION: "INICIO DE SESIÓN",
    BLOQUEO_TEMPORAL: "BLOQUEO TEMPORAL",
    BLOQUEO_TEMPORAL_DETALLE:
      "Usuario con bloqueo temporal por exceso de intentos permitidos",
    BLOQUEO_DEFINITIVO: "BLOQUEO DEFINITIVO",
    BLOQUEO_DEFINITIVO_DETALLE:
      "Usuario con bloqueo definitivo por exceso de intentos permitidos",
    ERROR_INESPERADO:
      "Ocurrió un inconveniente. Por favor vuelva a intentar en unos minutos o contacte a Mesa de Ayuda",
    USUARIO_NO_AUTORIZADO: "Usuario No Autorizado",
    ACCESO_DENEGADO: "Acceso Denegado",
  },
  PRELIMINAR: {
    EXCEL: "EXPORTAR A EXCEL",
    TITLE: "BANDEJA SOLICITUD PRELIMINAR",
    DETALLE: "DETALLE SOLICITUD PRELIMINAR",
    FALTA_MAC: "Falta seleccionar la MAC.",
    OK_PRELIMINAR: "El estado de la solicitud preliminar fue modificado.",
    RECHAZAR_PRELIMINAR: "El estado de la solicitud preliminar fue modificado.",
    ERROR_DETALLE_MODIFICADO:
      "Ya no se puede modificar el estado de solicitud preliminar.",
    ERROR_SIN_DATA: "No se encontraron resultado",
    ERROR_CARGA_ARCHIVO: "Ocurrio un error al cargar el archivo",
    ERROR_ENVIAR_CORREO: "Ocurrio un error al enviar correo a lider tumor",
    EXITO_ENVIAR_CORREO: "Se envio un correo al Responsable de Inscripcion MAC",
    EXITO_ENVIAR_CORREO_LT: "Se envio un correo al Lider Tumor",
  },
  CONF: {
    BUSCAR_MAC: "LISTAR MEDICAMENTOS MAC",
    NUEVO_MAC: "REGISTRAR MEDICAMENTO DE ALTA COMPLEJIDAD",
    EDITAR_MAC: "EDITAR MEDICAMENTO DE ALTA COMPLEJIDAD",
    CHECKLIST: "CONFIGURACIÓN DE CHECKLIST",
    NUEVO_INDICADOR: "REGISTRAR INDICACIÓN",
    EDITAR_INDICADOR: "ACTUALIZAR INDICACIÓN",
    CRITERIOS_INCLUSION: "CRITERIOS DE INCLUSIÓN",
    CRITERIOS_EXCLUSION: "CRITERIOS DE EXPCLUSIÓN",
    FICHA_TECNICA: "FICHA TÉCNICA",
    MARCADORES: "CONFIGURACIÓN DE MARCADORES",
    PRODUCTO_ASOCIADO: "PRODUCTO ASOCIADO",
    COMPLICACION_MEDICA: "ARCHIVO DE COMPLICACIONES",
    EXAMEN_MEDICO: "EXÁMEN MÉDICO",
    PARTICIPANTE_SISTEMA: "PARTICIPANTES DEL SISTEMA",
    USUARIO: "MANTENIMIENTO USUARIO",
  },
  EVALUACION: {
    TITLE: "BANDEJA DE SOLICITUDES EVALUACIÓN",
    DETALLE: "DETALLE SOLICITUD EVALUACION",
    CORREO_ENVIADO: "El correo ha sido enviado correctamente",
    CORREO_NO_ENVIADO: "El correo sigue en proceso de envio",
    TITLE_MAIL_LIDER_TUMOR: "EMAIL LIDER TUMOR",
    ERROR_ENVIAR_CORREO: "Ocurrio un error al enviar correo",
    EXITO_ENVIAR_CORREO: "El correo se envió correctamente",
    ERROR_VERIFICAR_CORREO: "Error al verificar estado de envio de correo",
  },
  seguiEva: {
    TITLE: "SEGUIMIENTO DE LA EVALUACION",
    INFO_SALIR: "Regresará a la Bandeja de Evaluación",
  },
  CMAC: {
    TITLE1: "PROGRAMAR COMITÉ",
    TITLE2: "EVALUACION COMITÉ",
    ERROR_SOLICITUDES:
      "El registro no cuenta con evaluaciones COMITÉ para Imprimir",
    ERROR_SELEC_SOLIC:
      "Falta seleccionar de la tabla las solicitudes para generar la Programación COMITÉ",
    ERROR_VALID_SOLIC:
      "La(s) solicitud(es) seleccionadas no pueden ser programadas.",
    ERROR_FECHA_SOLIC: "La(s) solictud(es) ya cuenta con fecha programada.",
    ERROR_PARTICIPANTES: "Falta seleccionar los participantes de la reunión.",
    ERROR_RESULTADOS:
      "Falta seleccionar el(los) resultados de las solicitudes evaluadas.",
    ERROR_OBSERVACIONES:
      "Falta ingresar la(s) observacion(es) de la(s) siguiente(s) solicitud(es).",
    ERROR_EVALUACION: "La solicitud ya se encuentra en la lista",
    ERROR_EVALUACION_ESTADO: "La solicitud no puede ser evaluada.",
    ERROR_GENERAR_REPORTE: "Ocurrio un error al generar reporte",
  },
  MONITOREO: {
    TITLE: "BANDEJA DE MONITOREO",
    LINEA: {
      TITLE: "HISTORIAL DE LINEAS DE TRATAMIENTO",
    },
    EVOLUCION: {
      TITLE_DATOS: "VER MARCADORES",
      TITLE_RES_EVOL: "REGISTRAR RESULTADOS DE LA EVOLUCIÓN",
      TITLE_EDIT_DATOS: "MODIFICAR DATOS DE LA EVOLUCIÓN",
      TITLE_VER_COMENTARIO: "COMENTARIO DEL RESULTADO DE LA EVOLUCIÓN",
      TITLE_VER_DATOS: "DATOS DE LA EVOLUCIÓN",
      TITLE_VER_MARCADORES: "MARCADORES",
    },
    SEGUIMIENTO: {
      TITLE_SEG_EJECUTIVO: "SEGUIMIENTO DEL EJECUTIVO",
    },
    DETALLE: {
      TITLE: "DETALLE PACIENTE",
    },
    LINEA_TRATAMIENTO: {
      TITLE: "DETALLE LINEA TRATAMIENTO",
    },
  },

  CONSUMO: {
    TITLE: "CARGA DE MARCADORES",
    SUBTITULO_ERROR: "Lista de Errores",
    SUBTITULO_OK: "El archivo se cargó satisfactoriamente",
    CONFIRMACION: "¿Desea cargar el archivo de Marcadores?",
    CONFIRMACION_MARCADORES:
      "¿Desea cargar el archivo de Marcadores al sistema?",
    VALIDA_EXCEL: "Debe adjuntar un archivo con extensión .xlsx o .xls",
    VALIDA_50MB: "El tamaño del archivo debe ser menor o igual a 50mb",
    VALIDA_MES:
      "La fecha de carga debe ser mayor al último día del mes de carga y menor al día limite de carga",
  },

  GASTOS: {
    TITLE: "CARGA CONTROL DE GASTO",
    SUBTITULO_ERROR: "Lista de Errores",
    SUBTITULO_OK: "El archivo se cargó satisfactoriamente",
    CONFIRMACION: "¿Desea cargar el archivo de Control de Gasto?",
    CONFIRMACION_MARCADORES:
      "¿Desea cargar el archivo de Control de Gasto al sistema?",
    VALIDA_EXCEL: "Debe adjuntar un archivo con extensión .xlsx o .xls",
    VALIDA_50MB: "El tamaño del archivo debe ser menor o igual a 50mb",
    VALIDA_MES:
      "La fecha de carga debe ser mayor al último día del mes de carga y menor al día limite de carga",
  },

  RecAccount: {
    title: "RECUPERA TU CUENTA",
    validate: "Validación de datos",
    error404: "Ups hubo un error inténtalo más tarde",
    notSend: "NO SE PUDO ENVIAR EL MENSAJE A LA CUENTA",
  },

  liderTumor: {
    TITLE: "EVALUACIÓN LIDER TUMOR",
  },
  medicNuevo: {
    TITLE: "MEDICAMENTO NUEVO",
    lineTrataPrefInst: {
      TITLE: "CONDICION BASAL - PASO 1",
    },
    chkListRequisito: {
      TITLE: "CHECKLIST REQUISITOS - PASO 2",
    },
    condBasalPcte: {
      TITLE: "PREFERENCIAS INSTITUCIONALES - PASO 3",
    },
    chkListPaciente: {
      TITLE: "CHECKLIST DEL PACIENTE - PASO 4",
    },
    analiConclusion: {
      TITLE: "ANÁLISIS Y CONCLUSIÓN - PASO 5",
    },
    levantamientoObservaciones: {
      TITLE: "CANALIZACIÓN - PASO 6",
    },
  },
  MEDICONTINUADOR: {
    TITLE: "EVALUACIÓN DEL AUTORIZADOR - MEDICAMENTO CONTINUADOR",
    salidaMedicamentoContinuador: {
      TITLE: "MEDICAMENTO CONTINUADOR",
    },
  },

  TITLE_NUEVA_LINEA: "REGISTRAR LINEA TRATAMIENTO",
  WARNING_CAPTCHA: "No ha sido posible obtener captcha",
  WARNIG_USER_PASSWOR_LOGIN: "El usuario o contraseña son incorrectos",
  ERROR_LOGIN: "Error de autentificación del usuario",
  ERROR_CARGA_SERVICIO: "Error en el Servidor.",
  ERROR_CAPTCHA: "Error al obtener captcha",
  ERROR_FORGOTPASSWORD: "Error al enviar solicitud de nueva contraseña",
  ERROR_DOCREQUERIDO: "Error - No hay documentos requeridos",
  ERROR_CAMPOS: "Validar los campos requeridos",
  ERROR_VALIDA_DOC: "Validar documentos requeridos",
  ERROR_SERVICIO: "Error al obtener los datos del Servidor.",
  ERROR_NOFUNCION: "Ocurrio un error",
  INFO_FORGOTPASSWORD: "Se envio un enlace a tu correo...",
  INFO_SUCCESS: "Consulta Exitosa.",
  INFO_SUCCESS2: "Se guardo Exitosamente",
  INFO_SALIR: "¿Desea salir?",
  INFO_COMITE: "¿Estas seguro de registrar un Comite?",
  INFO_ACTUALIZAR_COMITE: "¿Estas seguro de actualizar el comite?",
  INFO_SALIR2: "Se perderan los cambios.",
  INFO_ATRAS: "¿Esta seguro de regresar atras?",
  INFO_ACEPTAR: "Se registro Correctamente",
  INFO_ACEPTAR_REGISTRAR_LINEA:
    "Se registro correctamente, se procederá agregar otra linea de tratamiento",
  INFO_MEDICAMENTO: "Por favor, ingresar el medicamento antes de grabar",
  INFO_FECHA_INICIO: "Por favor, ingresar la fecha de inicio antes de grabar",
  INFO_FECHA_FIN: "Por favor, ingresar la fecha fin antes de grabar",
  INFO_NO_DATA: "No se encontraron resultados",
  INFO_ARCHIVO: "CARGA DE ARCHIVOS",
};

// FORMATO FECHA MEDICAMENTO NUEVO
export const MY_FORMATS_AUNA = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

export const MY_FORMATS_MONTH = {
  parse: {
    dateInput: "MM/YYYY",
  },
  display: {
    dateInput: "MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

export const GRUPO_PARAMETRO = {
  estadoSolEva: "6",
  condicionCancer: "26",
  nroCursos: "33",
  codGrupoTipoTumor: "34",
  lugarProgresion: "35",
  respuestaAlcanzada: "36",
  lineaMetastasis: "13",
  lugarMetastasis: "14",
  ecog: "15",
  existeToxicidad: "16",
  tipoToxicidad: "57",
  condicionPac: "39",
  tiempoUso: "40",
  resulReglaSis: "41",
  estadoMonitoreo: "45",
  tolerancia: "56",
  toxicidad: "57",
  grado: "58",
  respuestaClinica: "59",
  atencionAlertas: "60",
  estadoSeguimiento: "65",
  // MAESTRO - MAC
  estadoMac: "03",
  tipoMac: "04",
  // CONFIGURACION - MARCADOR
  estadoMarcador: "21",
  tipoMarcador: "22",
  periodoMin: "23",
  periodoMax: "24",
  // CONFIGURACION - PRODUCTO ASOCIADO
  laboratorio: "67",
  estadoProductoAsociado: "49",
  // CONFIGURACION - COMPLICACIONES
  estadoComplicacion: "48",
  // CONFIGURACION - EXAMEN MEDICO
  tipoExamen: "19",
  tipoIngreso: "46",
  estadoExamen: "18",
  // CONFIGURACION - PARTICIPANTE
  rangoEdad: "66",
  tipoDocumento: "100",
  estadoUsuario: "191",
  guias: "70",
  tipoTumor: "91",
};

export const VALIDACION_PARAMETRO = {
  perfilAutorPertenencia: "1",
  perfilLiderTumor: "2",
};

export const CODIGO_PERFIL = {
  AP: 2,
  LT: 8,
  RM: 5,
  MC: 9,
  RIM: 1,
  CAP: 7,
  AC: 11,
  ES: 6,
  AS: 10,
};

export const PARAMETRO = {
  equivalenteSCGSolbenAprobado: "6",
  equivalenteSCGSolbenRechazado: "8",
  aprobadoEstado: "20",
  rechazadoEstado: "21",
  observadorPorAutorizador: "22",
  aprobadoTumorEstado: "23",
  rechazadoTumorEstado: "24",
  observadorPorLiderTumor: "25",
  aprobadoCMACEstado: "26",
  rechazadoCMACEstado: "27",
  nroFilaCheckListReq: 116,
  recetaMedica: 84,
  nroFilaLineaMetastasis: 117,
  documentoOtros: 87,
  documentoOtrosPaso5: 517,
  resulReglaSisAprobado: 110,
  ResulReglaSisRechazado: 111,
  estadoCorreoEnviadoSI: 30,
  estadoCorreoEnviadoNO: 31,
  liderTumorMedicoTrata: "0",
  estadoMarcadorVigente: 64,
  estadoMarcadorNoVigente: 65,
  estadoComplicacionVigente: 130,
  estadoMacVigente: 8,
  estadoExamenVigente: 58,
  tipoIngresoNumerico: 122,
  tipoIngresoFijo: 123,
  tipoIngresoTexto: 124,
  rangoEdadTodos: 247,
};

export const PATTERN = {
  fecha_DD_MM_YYYY: /^[0-9]{4}[\/][0-9]{2}[\/][0-9]{2}$/,
};

export const TIPO_FORM = {
  formNumero: 122,
  formCombo: 123,
  formTexto: 124,
};

export const ESTADOEVALUACION = {
  penEva: 13,
  pendRespMonitoreo: 14,
  paso1: 15,
  paso2: 16,
  paso3: 17,
  paso4: 18,
  paso5: 19,
  estadoAprobadoAutorizador: 20,
  estadoRechazadoAutorizador: 21,
  estadoObservadoAutorizador: 22,
  estadoAprobadoLiderTumor: 23,
  estadoRechazadoLiderTumor: 24,
  estadoObservadoLiderTumor: 25,
  estadoAprobadoCMAC: 26,
  estadoRechazadoCMAC: 27,
  estadoLiderTumor: 35,
};

export const LINEATRATAMIENTO = {
  primeraLinea: 75,
  segundaLinea: 76,
  terceraLinea: 77,
  primeraLineaTxt: "PRIMERA LINEA",
  segundaLineaTxt: "SEGUNDA LINEA",
  terceraLineaTxt: "TERCERA LINEA",
};

export const RESULTADOEVALUACIONAUTO = {
  resultadoAprobado: "APROBADO",
  resultadoRechazado: "RECHAZADO",
};

export const CONFIGURACION = {
  macVigencia: 8,
  macInactivo: 9,
};

export const TIPOBUSQUEDA = {
  Afiliado: {
    apelNombre: 1,
    nroDocumento: 2,
    codigoAfiliado: 3,
    inicial: 1,
    final: 1000,
  },
  Clinica: {
    Todos: 1,
    codClinica: 2,
    descripcion: 3,
  },
};

export const FILEFTP = {
  //codiGuias: 52,
  codiGuias: 1112,
  usrApp: "ONTPFC",
  rutaVacia: "/",
  rutaPreliminar: "/PRELIMINAR/",
  rutaEvaluacionRequisitos: "/EVALUACION/",
  rutaInformeAutorizador: "/EVALUACION/REPORTE/AUTORIZADOR/",
  rutaInformeCMAC: "/EVALUACION/REPORTE/CMAC/",
  rutaConfiguracion: "/CONFIGURACION/",
  rutaConfiguracionComplicaciones: "/CONFIGURACION/COMPLICACIONES_MEDICAS/",
  rutaConfiguracionFicha: "/CONFIGURACION/FICHA_TECNICA/",
  rutaConfiguracionFirma: "/CONFIGURACION/FIRMA/",
  tamanioMax: 5097152,
  tamMaxFirma: 51200,
  filePdf: "application/pdf",
  fileExcel:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  fileJpeg: "image/jpeg",
  filePng: "image/png",
};

export const EMAIL = {
  usrApp: "ONTPFC",
  PRELIMINAR: {
    tipoEnvio: 1,
    flagAdjunto: 1,
    codigoPlantilla: "6",
    asunto: "SOLICITUD DE INSCRIPCIÓN _ ",
  },
  EVALUACION_MONITOREO: {
    tipoEnvio: 1,
    flagAdjunto: 0,
    codigoPlantilla: "9",
    asunto: "PENDIENTE RESULTADO DE EVOLUCIÓN DE MONITOREO _ ",
  },
  EVALUACION_LIDER_TUMOR: {
    tipoEnvio: 1,
    flagAdjunto: 0,
    codigoPlantilla: "10",
    asunto: "PENDIENTE DE EVALUACIÓN LIDER DE TUMOR _ ",
  },
  EVALUACION_PROGRAMAR_CMAC: {
    tipoEnvio: 1,
    flagAdjunto: 0,
    codigoPlantilla: "11",
    asunto: "CASOS A EVALUAR EN CÓMITE MÉDICO DE ALTA COMPLEJIDAD CMAC",
  },
  EVALUACION_PROGRAMAR_REUNION_CMAC: {
    tipoEnvio: 1,
    flagAdjunto: 1,
    codigoPlantilla: "12",
    asunto: "ACTA COMITE MEDICO DE ALTA COMPLEJIDAD (CMAC) _ ",
  },
  EVALUACION_CONFIGURACION_MARCADORES: {
    tipoEnvio: 1,
    flagAdjunto: 0,
    codigoPlantilla: "16",
    asunto: "CONFIGURACION DE MARCADORES",
  },
};

export const ACCESO = {
  mostrarOpcion: 1,
  nroSolPreCol: 55,
  fecRegPreCol: 56,
  horRegPreCol: 57,
  clinicaCol: 58,
  pacienteCol: 59,
  nroScgSolbenCol: 60,
  fecScgSolbenCol: 61,
  horScgSolbenCol: 62,
  tipScgSolbenCol: 63,
  estadoSolPreCol: 64,
  autorizPertenCol: 65,
  botonVerDetalleCol: 66,
  nombreMacTxt: 33,
  nombreComercialTxt: 34,
  botonBusquedMacBtn: 35,
  itemMacCol: 36,
  codigoMacCol: 37,
  descripcionMacCol: 38,
  botonAceptarBtn: 39,
  botonCancelarBtn: 40,
};

export const PREFERENCIAINSTI = {
  noRegistrado: "NO REGISTRADO",
  tratamiento: "TRATAMIENTO",
  tipoTratamiento: "TIPO TRATAMIENTO",
  cumplePrefe: "CUMPLE PREFERENCIA INSTITUCIONAL",
  tratamientoGuia: "TRATAMIENTO SEGÚN GUÍA",
  tipoTratamientoGuia: "TIPO DE TRATAMIENTO SEGÚN GUÍA",
  cumplePrefeGuia: "CUMPLE",
  codDesaprobacion: 238,
  codPreferencia: 239,
  codCondicion: 292,
};

export const ROLES = {
  respInscripMAC: 1,
  autoriPertenencia: 2,
  responsableMonitoreo: 5,
  ejecutivoSeguimiento: 6,
  coordiPertenencia: 7,
  liderTumor: 8,
  miembroMac: 9,
  adminSistema: 10,
  autorizadorCmac: 11,
};

export const RESULT_EVOLUCION = {
  estadoActivo: 225,
  estadoInactivo: 226,
};

export const ESTADO_MONITOREO = {
  pendienteMonitoreo: 118,
  Atendido: 119,
  pendienteRegResultado: 120,
  pendienteInformacion: 121,
};

export const TOLERANCIA_EVOLUCION = {
  favorable: 155,
  desfavorable: 156,
};

export const ESTADO_SEGUIMIENTO = {
  pendiente: 242,
  atendido: 243,
};

export const TIPO_SOL_EVA = {
  continuador: 32,
  medicamentoNuevo: 33,
};

export const FLAG_REGLAS_EVALUACION = false; // true APAGAR OPCIONES POR ROL; false ENCENDER OPCIONES POR ROL

export const ACCESO_EVALUACION = {
  mostrarOpcion: 1,
  busqueda: {
    numeroSolEvaluacion: 1022,
    codigoSolPre: 1023,
    tipoComite: 10001,

    estadoCorreoEnvCmac: 10002,
    numeroScgSolben: 1024,
    tipoScgSolben: 1025,
    descEstadoSCGSolben: 1026,
    numeroCartaGarantia: 1027,
    descClinica: 1028,
    nombrePaciente: 1029,
    nombreDiagnostico: 1030,
    descripcionCmac: 1031,
    fechaRegistroEvaluacion: 1032,
    tipoEvaluacion: 1033,
    estadoProceso: 1034,
    estadoEvaluacion: 1035,
    rolResponsableEvaluacion: 1036,
    auditorPertenencia: 1037,
    liderTumor: 1038,
    fechaCmac: 1039,
    correoLiderTumor: 1040,
    correoCmac: 1041,
    verDetalle: 1042,
    verSeguimiento: 1043,
    vistaPreliminarDelInforme: 1044,
    numeroCodPre: 1045,
  },
  detalle: {
    lineaTratamiento: 1075,
    medicamentoSolicitado: 1076,
    numeroSolicitud: 1077,
    fechaAprobacion: 1078,
    fechaInicio: 1079,
    fechaFin: 1080,
    numeroCursos: 1081,
    tipoTumor: 1082,
    respuestaAlcanzada: 1083,
    estado: 1084,
    motivoInactivacion: 1085,
    medicoTratante: 1086,
    montoAutorizado: 1087,
  },
  paso2: {
    recetaMedica: 1123,
    informeMedico: 1124,
    evaluacionGeriatrica: 1125,
    otro: 1126,
    item: 1131,
    lineaTratamiento: 1132,
    medicamento: 1133,
    tipoDocumento: 1134,
    descripcionDocumento: 1135,
    fechaCarga: 1136,
    descargar: 1137,
    codigoRecetaParametro: 84,
    codigoInformeParametro: 85,
    codigoEvaluacionParametro: 86,
    codigoOtroParametro: 87,
    codigoOtroParametroPaso5: 517,
  },
  paso3: {
    lineaMetastasis: 1145,
    lugarMetastasis: 1146,
    eliminar: 1147,
    colMarcador: 1153,
    colRango: 1154,
    colResultado: 1155,
    colFechaResultado: 1156,
  },
  tablaProgramacionCmac: {
    nroSolicitudEva: 1211,
    paciente: 1212,
    diagnostico: 1213,
    codigoMedicamento: 1214,
    medicamentoSolicitado: 1215,
    eliminar: 1216,
  },
  resultadoCMAC: {
    asistio: 1225,
    nombres: 1226,
    numeroSolicitud: 1227,
    paciente: 1228,
    diagnostico: 1229,
    codigoMedicamento: 1230,
    medicamentoSolicitado: 1231,
    resultadoEvaluacion: 1232,
    observaciones: 1233,
    eliminar: 1234,
  },
  continuador: {
    recetaMedica: 1123,
    informeMedico: 1124,
    evaluacionGeriatrica: 1125,
    otro: 1126,
    item: 1131,
    lineaTratamiento: 1132,
    medicamento: 1133,
    tipoDocumento: 580,
    descripcionDocumento: 1135,
    fechaCarga: 1136,
    descargar: 1137,
    codigoRecetaParametro: 84,
    codigoInformeParametro: 85,
    codigoEvaluacionParametro: 86,
    codigoOtroParametro: 87,
    codigoOtroParametroPaso5: 517,
  },
  estSolEvalSeguimiento: 1245,
  fecHorEstSeguimiento: 1246,
  rolResEstSeguimiento: 1247,
  usrResEstSeguimiento: 1248,
  rolResRegEstSeguimiento: 1249,
  usrResRegEstSeguimiento: 1250,
};

export const PAG_SIZ_SMALL: number = 5;
export const PAG_OBT_SMALL: number[] = [5, 10, 15];
export const PAG_SIZ_BIG: number = 10;
export const PAG_OBT_BIG: number[] = [10, 20, 50, 100];

export const FLAG_REGLAS_MONITOREO = false; // true APAGAR OPCIONES POR ROL; false ENCENDER OPCIONES POR ROL

export const ACCESO_MONITOREO = {
  mostrarOpcion: 1,
  bandeja: {
    codigoTarea: 1294,
    numeroSolicitud: 1295,
    fechaAprobacion: 1296,
    numeroSGC: 1297,
    medicamentoSolicitado: 1298,
    lineaTratamiento: 1299,
    paciente: 1300,
    estado: 1301,
    fechaProgramada: 1302,
    responsable: 1303,
    revisarDetalle: 1304,
    resultado: 13001,
    nomEstSeguimiento: 13002,
  },
  lineaTratamiento: {
    lineaTratamiento: 1305,
    numeroSolicitud: 1306,
    fechaAprobacion: 1307,
    numeroSGC: 1308,
    fechaSGC: 1309,
    numeroInforme: 1310,
    fechaEmision: 1311,
    auditorEvaluacion: 1312,
    numeroCG: 1313,
    fechaCG: 1314,
    medicamento: 1315,
    medicoTratante: 1316,
    montoAutorizado: 1317,
  },
  detalle: {
    numeroEvolucion: 1335,
    codigoTarea: 1336,
    fechaProgramada: 1337,
    fechaReal: 1338,
    tolerancia: 1339,
    toxicidad: 1340,
    grado: 1341,
    respuestaClinica: 1342,
    atencionAlertas: 1343,
    fechaUltimo: 1344,
    ultimaCantidad: 1345,
  },
  tablaVerMarcadores: {
    marcador: 1356,
    periodicidadMin: 1357,
    periodicidadMax: 1358,
    evolucion: 1359,
    resultado: 1360,
    fecha: 1361,
  },
  tablaRegMarcadores: {
    indice: 1373,
    marcador: 1374,
    periodicidadMin: 1375,
    periodicidadMax: 1376,
    sinRegHC: 1377,
    resultado: 1378,
    fechaResultado: 1379,
  },
  tablaSegEjecutivo: {
    indice: 1383,
    ejecutivoMonitoreo: 1384,
    detalleEvento: 1385,
    fechaRegistro: 1386,
    horaRegistro: 1387,
    estadoCaso: 1388,
  },
};

export const REGEX_SIN_ESPACIO = "^[S]+$";
export const SOLO_NUMEROS = "^[0-9]+$";
export const SOLO_LETRAS = "^[A-ZÁÉÍÓÚ\u00d1]+$";
export const SOLO_LETRAS_ESPACIOS = "^[ A-ZÁÉÍÓÚ\u00d1]+$";
export const SOLO_NUMEROS_LETRAS = "^[A-Z0-9ÁÉÍÓÚ\u00d1]+$";
export const SOLO_NUMEROS_LETRAS_USUARIO = "^[A-Z0-9]+$";
export const REGEX_CLAVE =
  "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}";
export const keyCodeEnter: number = 13;

export const CRITERIO_INCLUSION: string = "I";
export const CRITERIO_EXCLUSION: string = "E";

export const NUM_MAX_INTENTOS = 3;
export const COD_APLICACION = 1;

export const COD_APLICACION_FC: number = 1;

export const TIPO_DOCUMENTO = {
  COD_DNI: 10,
  DNI: "DNI",
  COD_CE: 122,
  CE: "CE",
  COD_PAS: 121,
  PAS: "PAS",
  COD_PN: 123,
  PN: "PN",
};

export const SESION_IDELTIME: number = 2700;
export const SESION_TIMEOUT: number = 30;
export const CONTENT_TYPE = {
  JSON: "application/json",
  JSON_UTF8: "application/json; charset=utf-8",
};
