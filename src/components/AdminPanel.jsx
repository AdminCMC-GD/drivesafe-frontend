import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants.js';
import '../styles/admin.css';

// ─── Constantes ───────────────────────────────────────────────────────────────
const QUESTIONS_TEXT = [
  "Excedo el límite de velocidad.",
  "Manejo o viajo en un vehículo sin usar cinturón de seguridad.",
  "Manejo aunque mis pasajeros no utilicen el cinturón de seguridad.",
  "Manejo muy pegado a otros conductores.",
  "Hablo por teléfono mientras manejo.",
  "Envío mensajes de texto mientras manejo.",
  "Le grito o le hago señas negativas a otros conductores.",
  "Realizo giros o cambios de carril sin usar la luz de giro.",
  "Cruzo las señales de alto sin detenerme.",
  "Le hago señas de luces a los vehículos que circulan a menor velocidad.",
  "Manejo cuando estoy cansado.",
  "Manejo aunque haya bebido alcohol.",
  "Manejo aunque haya consumido drogas recreativas.",
  "Manejo aunque haya consumido medicamentos recetados.",
  "Manejo aunque haya consumido medicamentos de venta libre.",
  "Freno de golpe cuando otros conductores conducen muy pegado a mí.",
  "Mantengo la velocidad regular independientemente de las condiciones.",
  "Programo el GPS mientras estoy manejando.",
  "Cambio la música o los controles mientras estoy manejando.",
  "Puedo controlar lo que otros conductores hacen alrededor mío.",
];
const FREQ_LABELS = ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'];
const RISK_CONFIG = {
  SEGURO:      { label: 'Conductor Seguro',    color: '#1b7f3e', bg: '#e8f5ee', dot: '🟢' },
  PRECAUCION:  { label: 'Precaución Moderada', color: '#c67c00', bg: '#fff3e0', dot: '🟡' },
  RIESGO:      { label: 'Perfil de Riesgo',    color: '#c84200', bg: '#fdecea', dot: '🟠' },
  ALTO_RIESGO: { label: 'Alto Riesgo',         color: '#a81010', bg: '#fce4e4', dot: '🔴' },
};
const REC_CONFIG = {
  EVALUARSE:  { label: 'Listo para evaluarse', color: '#065f46', bg: '#ecfdf5', dot: '✅' },
  ASESORARSE: { label: 'Requiere asesoría',     color: '#92400e', bg: '#fef3e2', dot: '📚' },
};
const PER_PAGE = 15;
const fmtDate  = (d) => new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
const fmtDate2 = (d) => new Date(d).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });

// ─── Mapas de textos de preguntas (embebidos para evitar imports dinámicos) ───
const EC0217_TEXTOS = {"e1_d1":"Previo a su inicio","e1_d2":"De acuerdo con lo especificado en la lista de verificación de requerimientos del curso","e1_d3":"Realizando pruebas de funcionamiento del equipo","e1_d4":"Corroborando la suficiencia y disposición de: mobiliario, equipo, instalaciones, materiales y servicios necesarios conforme a la lista de verificación","e1_d5":"Verificando la disponibilidad de los recursos/materiales didácticos de acuerdo con el número de participantes/capacitandos y condiciones de interacción","e1_p1":"Contiene nombre del curso y del facilitador / instructor / capacitador / formador","e1_p2":"Enuncia fecha / período y lugar(es) en que se lleva a cabo","e1_p3":"Indica la existencia de: mobiliario, equipo, instalaciones, materiales y servicios, en congruencia con el número de participantes/capacitandos y a sus condiciones de interacción","e1_p4":"Corresponde con las actividades descritas en el documento de planeación del curso","e1_p5":"Corresponde con el número de participantes / capacitandos","e1_p6":"Corresponde con los recursos/materiales didácticos mencionados en el documento de planeación del curso","e1_p7":"Incluye el apartado de comprobación de medidas de salud / seguridad / higiene / protección civil vigentes aplicables al espacio en donde se realiza el curso","e1_p8":"Describe el propósito / beneficio del curso / sesión","e1_p9":"Describe el perfil de los participantes / capacitandos","e1_p10":"Indica los conocimientos y habilidades que requiere el participante/capacitando para ingresar al curso","e1_p11":"Contiene el objetivo general / resultado de aprendizaje esperado","e1_p12":"Incluye los objetivos particulares/resultados parciales de aprendizaje esperados","e1_p13":"Incluye el nombre del curso","e1_p14":"Incluye el contenido temático","e1_p15":"Considera los momentos de la capacitación / formación: inicio / encuadre / apertura, desarrollo y cierre / clausura","e1_p16":"Indica la duración parcial por módulos / temas / apartados / unidades / etapas y la duración total del curso / sesión","e1_p17":"Indica la duración de cada una de las actividades de enseñanza y de aprendizaje","e1_p18":"Indica las técnicas instruccionales","e1_p19":"Describe las técnicas grupales","e1_p20":"Especifica los recursos / materiales didácticos y equipo de apoyo a utilizar, en congruencia con las condiciones de interacción establecidas","e1_p21":"Describe las actividades a desarrollar por el facilitador / instructor / capacitador / formador y participantes / capacitandos","e1_p22":"Indica la forma de evaluar / verificar el aprendizaje","e1_p23":"Incluye la(s) referencia(s) bibliográfica(s) / fuente(s) de información en la que se sustenta el curso","e1_p24":"Se presenta sin errores ortográficos","e1_p25":"Hace mención del sujeto del aprendizaje: a quién","e1_p26":"Contiene un verbo que hace referencia a la acción que se espera alcanzar como resultado del dominio de aprendizaje cognitivo / psicomotriz / afectivo / relacional-social del curso: qué","e1_p27":"Contiene el objeto sobre el que recae la acción que se espera alcanzar como resultado del aprendizaje en términos de conocimiento / desempeño / producto / actitud-hábito-valor","e1_p28":"Expresa la condición bajo la cual debe darse la acción que se espera alcanzar como resultado del aprendizaje del curso: cómo","e1_p29":"Describe la finalidad / utilidad / beneficio que tiene el aprendizaje esperado (para qué)","e1_p30":"Hace mención del sujeto del aprendizaje: quién","e1_p31":"Contiene un verbo que hace referencia a la acción que se espera alcanzar como resultado del dominio de aprendizaje cognitivo / psicomotriz / afectivo / relacional-social del módulo / tema / apartado / unidad / etapa (qué)","e1_p32":"Contiene el objeto sobre el que recae la acción que se espera alcanzar como resultado del aprendizaje del módulo / tema / apartado / unidad / etapa en términos de conocimiento / desempeño / producto / actitud-hábito-valor","e1_p33":"Expresa la condición bajo la cual debe darse la acción que se espera alcanzar como resultado del aprendizaje del módulo / tema / apartado / unidad / etapa (cómo)","e1_p34":"Son congruentes con el objetivo / resultado general de aprendizaje","e1_p35":"Corresponde con los objetivos / resultados de aprendizaje del curso","e1_p36":"Presenta una secuencia de lo simple a lo complejo","e1_p37":"Está organizado en formato de tablas","e1_p38":"Corresponden con los objetivos / resultados de aprendizaje","e1_p39":"Corresponden con el contenido temático","e1_p40":"Contienen al menos tres técnicas distintas","e1_p41":"Corresponden con los objetivos / resultados de aprendizaje","e1_p42":"Corresponden con el contenido temático","e1_p43":"Contienen al menos tres técnicas distintas que promuevan el aprendizaje social / colaborativo","e1_p44":"Corresponden con los objetivos/resultados de aprendizaje","e1_p45":"Corresponden con las técnicas instruccionales y grupales establecidas","e1_p46":"Describen lo que debe hacer el participante / capacitando","e1_p47":"Describen la manera de organizar al grupo y su forma de interacción","e1_p48":"Corresponden con los objetivos/resultados de aprendizaje","e1_p49":"Corresponden con los contenidos","e1_p50":"Indica el momento de la aplicación","e1_p51":"Indica la técnica e instrumento a emplear","e1_p52":"Está distribuida acorde con los requerimientos de aprendizaje planteados en el curso en las etapas de inicio, desarrollo y cierre","e1_p53":"Considera el tiempo parcial a emplear en cada actividad descrita en el documento de planeación del curso","e1_p54":"Incluye la sumatoria de los tiempos parciales de acuerdo con el total de horas establecidas en el curso / sesión","e1_p55":"Considera el número total de horas para impartir el curso / sesión","e1_p56":"Corresponden con lo estipulado en el documento de planeación del curso y el contenido temático del curso","e1_p57":"Están diseñados tomando en cuenta el perfil de los participantes / capacitandos","e1_c1":"Dominios de aprendizaje: Conductas y acciones de los tipos de dominios de aprendizaje de acuerdo con Benjamín Bloom y la UNESCO (cognitivo/cognoscitivo, psicomotriz, afectivo y relacional-social)","e1_c2":"Elementos básicos de los enfoques de las Teorías del Aprendizaje en la planeación didáctica: Casos de aplicación de los enfoques de las teorías: constructivista, conductista, cognitivista y humanista","e1_c3":"Estilos de aprendizaje en la planeación didáctica de acuerdo con Ned Herrmann, David Kolb, Paul MacLean, Roger Sperry, Howard Gardner y VAK de Richard Bandler y John Grinder","e1_a1":"Responsabilidad: Revisa la suficiencia y disposición de los materiales y equipo de acuerdo al espacio y número de participantes/capacitandos y condiciones de interacción establecidas","e1_a2":"Orden: La manera en que integra la información contenida en el documento de planeación del curso de acuerdo a una secuencia de lo general a lo particular","e2_d1":"De acuerdo con lo establecido en el documento de planeación del curso","e2_d2":"Presentándose ante el grupo","e2_d3":"Presentando los objetivos a los participantes / capacitandos","e2_d4":"Mencionando la descripción general del desarrollo del curso","e2_d5":"Mencionando el temario del curso","e2_d6":"Creando un ambiente participativo a través de preguntas al grupo","e2_d7":"Haciendo preguntas relacionadas con el contexto / experiencia laboral / personal de los participantes/capacitandos","e2_d8":"Clarificando el alcance del curso de acuerdo con las expectativas planteadas por los participantes/capacitandos","e2_d9":"Comentando los beneficios del curso y su relación con la experiencia personal / laboral","e2_d10":"Acordando las reglas de operación, participación y convivencia del curso, acordes a las condiciones de interacción","e2_d11":"Realizando el contrato de aprendizaje de acuerdo con los objetivos / resultados de aprendizaje","e2_d12":"En el momento definido en el documento de planeación del curso","e2_d13":"Explicando el objetivo de la técnica","e2_d14":"Mencionando el tiempo para realizar la técnica","e2_d15":"Explicando las instrucciones de la técnica","e2_d16":"Incluyendo la actividad de integración con la presentación de los participantes / capacitandos","e2_d17":"Promoviendo la integración de todos los participantes/capacitandos de acuerdo con las condiciones de interacción","e2_d18":"Participando junto con el grupo de acuerdo con las condiciones de interacción","e2_d19":"Controlando el tiempo para realizar la técnica","e2_d20":"Presentando el objetivo / resultados de aprendizaje del contenido temático a exponer","e2_d21":"Realizando una introducción general del contenido temático que promueva el interés de los participantes/capacitandos","e2_d22":"Preguntando a los participantes/capacitandos sobre sus conocimientos previos del contenido temático por abordar","e2_d23":"Desarrollando el contenido de acuerdo con el documento de planeación del curso","e2_d24":"Mencionando las citas / referencias de contenido que provenga de otros autores","e2_d25":"Planteando preguntas dirigidas que verifiquen la comprensión del tema","e2_d26":"Resolviendo dudas de los participantes/capacitandos acerca de los temas expuestos","e2_d27":"Promoviendo que los participantes/capacitandos realicen la síntesis de la exposición, haciendo énfasis en los aspectos sobresalientes del mensaje","e2_d28":"Invitando a los participantes/capacitandos a expresar la utilidad de lo aprendido durante la exposición","e2_d29":"Presentando la actividad a desarrollar / propósito / beneficios para despertar el interés en los participantes/capacitandos","e2_d30":"Explicando el grado de dominio de lo que se desea lograr al terminar la actividad en términos de procedimiento / desempeño / producto","e2_d31":"Invitando a la participación de todos los miembros del grupo, acorde a las condiciones de interacción","e2_d32":"Ejemplificando la actividad a desarrollar","e2_d33":"Resolviendo dudas sobre la demostración realizada","e2_d34":"Permitiendo que los participantes/capacitandos realicen la práctica","e2_d35":"Supervisando la realización de la actividad","e2_d36":"Atendiendo las dudas que se presentan durante su práctica","e2_d37":"Retroalimentando sobre la práctica","e2_d38":"Recuperando / Preguntando a los participantes/capacitandos acerca de la utilidad de lo aprendido durante la actividad","e2_d39":"Presentando la actividad a desarrollar, el propósito / beneficios para despertar el interés en los participantes/capacitandos","e2_d40":"Mencionando el tema / planteamiento/reto a dialogar / discutir / debatir","e2_d41":"Indicando las instrucciones y tiempos de la actividad, así como las reglas de participación","e2_d42":"Invitando a la participación de todos los miembros del grupo, acorde a las condiciones de interacción","e2_d43":"Resolviendo dudas acerca de la actividad a realizar","e2_d44":"Organizando al grupo en subgrupos","e2_d45":"Abriendo la discusión recordando el tema/planteamiento a dialogar / discutir / debatir","e2_d46":"Propiciando la participación de los equipos","e2_d47":"Moderando la discusión","e2_d48":"Vigilando el cumplimiento de las reglas y tiempos y participación de los miembros del grupo","e2_d49":"Recuperando / Preguntando a los participantes/capacitandos acerca de las conclusiones del diálogo-discusión / debate y utilidad de la actividad","e2_d50":"Recuperando la experiencia previa de los participantes/capacitandos sobre el tema","e2_d51":"Utilizando ejemplos relacionados con los temas tratados","e2_d52":"Utilizando ejemplos relacionados con el contexto de los participantes/capacitandos","e2_d53":"Aclarando los tecnicismos utilizados","e2_d54":"Realizando en conjunto con el grupo al menos una actividad que fomente el aprendizaje a través de la investigación / solución de problemas / descubrimiento / logros / casos","e2_d55":"Dirigiendo la mirada a todos los participantes/capacitandos durante el desarrollo de la sesión / curso, acorde a las condiciones de interacción","e2_d56":"Empleando expresiones faciales/gestos, ademanes, posturas, congruentes con el contenido que se está transmitiendo","e2_d57":"Manteniendo una postura dinámica dentro del espacio de capacitación","e2_d58":"Realizando cambios en el volumen y entonación durante la interacción con el grupo","e2_d59":"Utilizando variantes de tono / modulación lingüística en la comunicación que facilite la comprensión del / de los mensaje(s) a todos los participantes/capacitandos","e2_d60":"Empleando alguna técnica grupal energizante","e2_d61":"Empleando alguna técnica/estrategia para promover emociones positivas vinculadas al aprendizaje","e2_d62":"Brindando retroalimentación positiva en respuesta a las intervenciones de los participantes/capacitandos","e2_d63":"Mencionando a los participantes/capacitandos que los errores / fallas / omisiones que se presentan durante el desarrollo del curso, son oportunidades para fortalecer el aprendizaje","e2_d64":"Recordando al grupo las reglas de operación, participación y convivencia acordadas","e2_d65":"Empleando técnicas para verificar la comprensión de los contenidos","e2_d66":"Preguntando acerca de los conocimientos adquiridos durante los temas tratados","e2_d67":"Promoviendo comentarios / participación acerca de la utilidad de los temas en su vida profesional/laboral y personal","e2_d68":"Preguntando sobre la aplicación de los temas expuestos al contexto de los participantes/capacitandos","e2_d69":"Mencionando los logros alcanzados y lo que falta por abordar","e2_d70":"De acuerdo con lo especificado en el documento de planeación del curso","e2_d71":"Conforme a lo indicado en los manuales / guías de usuario del proveedor / recomendaciones de uso del equipo","e2_d72":"Expresando al grupo que hagan el mejor aprovechamiento de los materiales en aras de promover su uso sustentable","e2_d73":"Permitiendo la visibilidad de los apoyos didácticos a todos los participantes/capacitandos de acuerdo con las características del aula/condiciones de interacción","e2_d74":"Invitando a los participantes/capacitandos a resumir los contenidos del curso","e2_d75":"Preguntando acerca del logro de las expectativas planteadas por los participantes/capacitandos al inicio del curso","e2_d76":"Preguntando a los participantes/capacitandos acerca de los objetivos/resultados de aprendizaje del curso alcanzados","e2_d77":"Sugiriendo acciones que promuevan la continuidad en el aprendizaje","e2_d78":"Invitando al grupo a formular compromisos de aplicación de lo aprendido","e2_d79":"Empleando alguna técnica grupal de cierre","e2_c1":"Dinámica de grupos: Principales características y comportamientos en la dinámica de grupos. Tipos de grupos (silencioso, participativo, indiferente, agresivo). Roles de los participantes/capacitandos (el contreras, el experto, el aliado, el novato)","e2_a1":"Responsabilidad: La manera en que mantiene el interés y brinda apoyo a los participantes/capacitandos en el logro de los resultados de aprendizaje","e2_a2":"Tolerancia: La manera en que respeta el ritmo de aprendizaje de cada participante/capacitando y acepta los comentarios del grupo para la mejora continua del curso","e3_d1":"Durante el encuadre","e3_d2":"Especificando el momento de aplicación","e3_d3":"Indicando los criterios que se utilizarán","e3_d4":"Mencionando sus beneficios / finalidad / ventaja","e3_d5":"Indicando el tipo y forma de evaluación a realizar, así como el seguimiento en la aplicación de lo aprendido","e3_d6":"Indicando los instrumentos de evaluación a utilizar","e3_d7":"Durante el encuadre","e3_d8":"De acuerdo con lo establecido en el documento de planeación del curso","e3_d9":"Mencionando los alcances/propósito/finalidad de la evaluación","e3_d10":"Indicando las instrucciones y el tiempo para realizarla","e3_d11":"Aclarando las dudas que se presentan","e3_d12":"De acuerdo con lo establecido en el documento de planeación del curso","e3_d13":"Mencionando los alcances / propósito / finalidad de la evaluación","e3_d14":"Indicando las instrucciones y el tiempo para realizarla","e3_d15":"Aclarando las dudas que se presenten","e3_d16":"Mencionando los alcances / propósito / finalidad de la evaluación","e3_d17":"Aclarando las dudas que se presenten","e3_d18":"Indicando las instrucciones de su aplicación","e3_p1":"Contienen el nombre del curso","e3_p2":"Contienen la fecha de aplicación","e3_p3":"Contienen el nombre del participante / capacitando","e3_p4":"Contienen las instrucciones para su resolución","e3_p5":"Presenta los reactivos de acuerdo con los objetivos / resultados de aprendizaje del curso","e3_p6":"Incluye nombre del instructor y del curso","e3_p7":"Incluye fecha de desarrollo del curso","e3_p8":"Incluye los comentarios del instructor acerca del proceso de aprendizaje y del grupo","e3_p9":"Especifica de manera descriptiva el nivel de cumplimiento de los objetivos / resultados de aprendizaje y de las expectativas del curso","e3_p10":"Incluye el apartado del plan de seguimiento a los participantes/capacitandos en la aplicación de lo aprendido","e3_p11":"Describe las contingencias / ajustes al plan de sesión que se presentaron y su resolución","e3_p12":"Contiene el resumen de las recomendaciones vertidas por los participantes/capacitandos en la encuesta de satisfacción para la mejora del curso","e3_p13":"Incluye el resultado de las evaluaciones de aprendizaje","e3_p14":"Contiene como anexo el registro de asistencia al curso","e3_p15":"Especifica los avances logrados con relación a los resultados de aprendizaje planeados","e3_p16":"Se presenta sin errores ortográficos","e3_p17":"Elaborado en formato impreso y/o digital, e incluye los gráficos de las evaluaciones de aprendizaje","e3_a1":"Responsabilidad: Presenta el informe final del curso dentro del tiempo establecido en el plan de evaluación"};

const EC0301_TEXTOS = {"e1_p1":"Se presenta en formato digital y/o impreso","e1_p2":"Indica el nombre del curso","e1_p3":"Contiene el campo para registrar el nombre de la persona que diseñó el curso","e1_p4":"Contiene el campo para registrar la(s) fecha(s) de impartición del curso","e1_p5":"Describe los requisitos de ingreso de los participantes","e1_p6":"Indica el número de participantes","e1_p7":"Contiene los objetivos de aprendizaje","e1_p8":"Especifica los momentos de capacitación","e1_p9":"Describe el contenido del curso","e1_p10":"Especifica las técnicas de instrucción","e1_p11":"Especifica las técnicas grupales","e1_p12":"Describe las actividades del proceso de instrucción-aprendizaje","e1_p13":"Describe las estrategias de evaluación de los aprendizajes","e1_p14":"Refiere los materiales didácticos a utilizar","e1_p15":"Establece los tiempos programados para el desarrollo de las actividades","e1_p16":"Se presenta sin errores ortográficos","e1_p17":"Determina el sujeto de aprendizaje","e1_p18":"Indica la conducta, producto, y/o actitud de aprendizaje a alcanzar por el participante","e1_p19":"Especifica las condiciones de operación","e1_p20":"Especifica los límites de tiempo, calidad, exactitud y/o criterio aceptable","e1_p21":"Determinan el sujeto de aprendizaje","e1_p22":"Indican la conducta, producto, y/o actitud de aprendizaje a alcanzar por el participante","e1_p23":"Especifican las condiciones de operación","e1_p24":"Especifican los límites de tiempo, calidad, exactitud y/o criterio aceptable","e1_p25":"Son congruentes con los temas del curso","e1_p26":"Son congruentes con las características de los participantes","e1_p27":"Son congruentes entre sí","e1_p28":"Corresponden con los objetivos de aprendizaje","e1_p29":"Se desarrollan en una secuencia de lo simple a lo complejo","e1_p30":"Corresponden con los objetivos de aprendizaje","e1_p31":"Corresponden con los requisitos de ingreso de los participantes","e1_p32":"Corresponden con el número de participantes","e1_p33":"Están planeadas para favorecer la dinámica secuencial del proceso instrucción-aprendizaje","e1_p34":"Corresponden con el perfil del grupo","e1_p35":"Corresponden con el número de participantes","e1_p36":"Corresponden con el nivel de ejecución de los objetivos","e1_p37":"Son congruentes con los temas del curso","e1_p38":"Corresponden con el perfil del grupo","e1_p39":"Especifican el desarrollo de las técnicas empleadas","e1_p40":"Corresponden con los objetivos de aprendizaje","e1_p41":"Contienen los criterios de evaluación a utilizar","e1_p42":"Contienen los instrumentos que se aplicarán en los tres momentos de la evaluación: Diagnóstica, formativa y sumativa","e1_p43":"Menciona los instrumentos a utilizar","e1_p44":"Describen las evidencias que el participante deberá demostrar como resultado del aprendizaje","e1_p45":"Corresponden con las actividades de la carta descriptiva","e1_p46":"Son congruentes con las características de los participantes","e1_p47":"Corresponden con los temas del curso","e1_c1":"Principios de las siguientes teorías del aprendizaje: Conductismo, Cognitivismo, Constructivismo, Humanismo","e1_c2":"Principios de educación de adultos: Necesidad de saber, Disposición para aprender, Motivación para aprender, Recuperación de la experiencia, Desaprendizaje, Aplicación práctica en la vida real","e1_c3":"Descripción de las siguientes técnicas instruccionales: Expositiva, Diálogo/discusión, Demostración/ejecución","e1_c4":"Descripción de las siguientes técnicas grupales: Rompehielo, Energetizante, Cierre","e1_a1":"Orden: La manera en que se presentan los temas y subtemas de lo simple a lo complejo","e2_p1":"Indican el nombre del curso","e2_p2":"Contienen espacio para registrar el nombre del instructor","e2_p3":"Contienen espacio para registrar el nombre del participante","e2_p4":"Contienen espacio para registrar la fecha de aplicación","e2_p5":"Detallan las instrucciones de aplicación","e2_p6":"Contienen los reactivos de evaluación","e2_p7":"Incluyen las claves de respuestas para el evaluador y/o instructor","e2_p8":"Corresponden con las estrategias de evaluación mencionadas en la carta descriptiva","e2_p9":"Se presenta en formato digital y/o impreso","e2_p10":"Se presentan sin errores ortográficos","e2_p11":"Establecen las condiciones de aplicación","e2_p12":"Establecen los tiempos para la evaluación","e2_p13":"Contienen las indicaciones para el participante","e2_p14":"Contienen las indicaciones para el evaluador","e2_p15":"Corresponden con los objetivos de aprendizaje","e2_p16":"Son congruentes con el tipo de instrumento","e2_p17":"Verifican una sola evidencia y/o característica","e2_p18":"Son medibles","e2_p19":"Indican su valor","e2_p20":"Contienen las respuestas definidas como correctas","e2_p21":"Indican la ponderación de cada reactivo","e2_p22":"Señalan el puntaje total esperado","e2_p23":"Contiene el espacio para registrar el nombre del curso","e2_p24":"Contiene espacio para registrar el nombre de instructor","e2_p25":"Enuncia las instrucciones generales de aplicación","e2_p26":"Señala la escala de estimación del nivel de satisfacción del curso","e2_p27":"Incluye los reactivos sobre las características del evento","e2_p28":"Incluye los reactivos sobre el contenido del curso","e2_p29":"Incluye los reactivos sobre los materiales didácticos empleados","e2_p30":"Incluye los reactivos sobre el desempeño del instructor","e2_p31":"Contiene espacios para el registro de comentarios","e2_c1":"Definición de validez y confiabilidad de los instrumentos de evaluación","e2_c2":"Características de los siguientes tipos de instrumentos de evaluación: De habilidades y destrezas, De conocimiento","e3_p1":"Incluye nombre del curso","e3_p2":"Menciona el nombre de la persona que diseñó el curso","e3_p3":"Contiene el índice del curso","e3_p4":"Contiene la presentación del manual","e3_p5":"Contiene la introducción","e3_p6":"Señala el objetivo general del curso acorde a la carta descriptiva","e3_p7":"Señala los objetivos particulares y/o específicos del curso acordes a la carta descriptiva","e3_p8":"Desglosa los temas","e3_p9":"Indica las fuentes de información documental o tomadas de la internet","e3_p10":"Se presenta en formato digital y/o impreso","e3_p11":"Se presenta sin errores ortográficos","e3_p12":"Contiene la bienvenida al participante","e3_p13":"Ofrece recomendaciones acerca de la forma de utilizar el manual","e3_p14":"Describe la organización del manual","e3_p15":"Contiene un resumen de los temas","e3_p16":"Señala el beneficio que el curso aportará a los participantes","e3_p17":"Establece el enfoque didáctico del curso","e3_p18":"Es congruente con el objetivo de aprendizaje","e3_p19":"Corresponden con la carta descriptiva","e3_p20":"Son congruentes con los objetivos de aprendizaje","e3_p21":"Mencionan los objetivos particulares y/o específicos","e3_p22":"Están desarrollados de lo simple a lo complejo","e3_p23":"Describen las actividades necesarias para el desarrollo del tema","e3_p24":"Contienen las síntesis y/o conclusiones del contenido de los temas","e3_p25":"Incluyen una forma de evaluación por tema","e3_p26":"Corresponden con los objetivos del curso","e3_p27":"Especifican el nombre del autor","e3_p28":"Señalan el año de publicación y/o la fecha de acceso al documento","e3_p29":"Indican el título de la obra","e3_p30":"Refieren la editorial y/o la URL","e3_p31":"Señalan el país de origen de la obra","e3_p32":"Incluye el nombre del curso","e3_p33":"Incluye el nombre de la persona que diseñó el curso","e3_p34":"Contiene el índice","e3_p35":"Cuenta con una introducción","e3_p36":"Incluye la carta descriptiva","e3_p37":"Describe los requerimientos del lugar de capacitación","e3_p38":"Contiene las sugerencias para desarrollar los temas","e3_p39":"Incluye los instrumentos de evaluación","e3_p40":"Incluye la clave de respuestas de los cuestionarios","e3_p41":"Señala las fuentes de información documental y/o tomadas de la internet","e3_p42":"Se presenta digitalizado y/o impreso","e3_p43":"Se presenta sin errores ortográficos","e3_p44":"Explica el propósito del manual","e3_p45":"Expone la estructura del curso","e3_p46":"Expone la modalidad del curso: Presencial, en línea, tutorado, autodidacta, mixto","e3_p47":"Señalan las características del lugar de capacitación","e3_p48":"Mencionan el material de apoyo a utilizar","e3_p49":"Especifican el equipo necesario para desarrollar el curso","e3_p50":"Proporcionan las recomendaciones de uso del material de apoyo","e3_p51":"Corresponden con los mencionados en la carta descriptiva","e3_p52":"Ofrecen sugerencias de los apoyos necesarios para la explicación de cada tema","e3_p53":"Describen las técnicas, actividades y/o ejemplos para el desarrollo de cada tema","e3_p54":"Describen formas, criterios y tiempos de evaluación para cada tema","e3_p55":"Corresponden con los objetivos del curso","e3_p56":"Especifican el nombre del autor","e3_p57":"Señalan el año de publicación y/o la fecha de acceso al documento","e3_p58":"Indican el título de la obra","e3_p59":"Refieren la editorial y/o la URL","e3_p60":"Señalan el país de origen de la obra"};

// ─── Info de elementos ────────────────────────────────────────────────────────
const EC0217_ELEMS = {
  1: { nombre: 'Preparar la sesión / curso de capacitación / formación',   total: 67 },
  2: { nombre: 'Conducir la sesión / curso de capacitación / formación',   total: 82 },
  3: { nombre: 'Evaluar la sesión / curso de capacitación / formación',    total: 36 },
};
const EC0301_ELEMS = {
  1: { nombre: 'Diseñar cursos de formación del capital humano',           total: 52 },
  2: { nombre: 'Diseñar instrumentos para la evaluación de cursos',        total: 33 },
  3: { nombre: 'Diseñar manuales del curso de formación',                  total: 60 },
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const target = { mx:.5, my:.5, rx:0, ry:0, tx:0, ty:0 };
    const curr   = { ...target };
    let rafId;
    const lerp = (a,b,t) => a + (b-a)*t;
    function tick() {
      curr.mx=lerp(curr.mx,target.mx,.12); curr.my=lerp(curr.my,target.my,.12);
      curr.rx=lerp(curr.rx,target.rx,.10); curr.ry=lerp(curr.ry,target.ry,.10);
      curr.tx=lerp(curr.tx,target.tx,.10); curr.ty=lerp(curr.ty,target.ty,.10);
      const r=document.documentElement;
      r.style.setProperty('--mx',(curr.mx*100).toFixed(2)+'%');
      r.style.setProperty('--my',(curr.my*100).toFixed(2)+'%');
      r.style.setProperty('--rx',curr.rx.toFixed(2)+'deg');
      r.style.setProperty('--ry',curr.ry.toFixed(2)+'deg');
      r.style.setProperty('--tx',curr.tx.toFixed(1)+'px');
      r.style.setProperty('--ty',curr.ty.toFixed(1)+'px');
      rafId=requestAnimationFrame(tick);
    }
    rafId=requestAnimationFrame(tick);
    const onMove=(e)=>{
      const w=wrapRef.current; if(!w) return;
      const rc=w.getBoundingClientRect();
      const x=(e.clientX-rc.left)/rc.width, y=(e.clientY-rc.top)/rc.height;
      target.mx=e.clientX/window.innerWidth; target.my=e.clientY/window.innerHeight;
      target.ry=(x-.5)*10; target.rx=-(y-.5)*10;
      target.tx=(x-.5)*10; target.ty=(y-.5)*10;
    };
    const onLeave=()=>{target.mx=.5;target.my=.5;target.rx=0;target.ry=0;target.tx=0;target.ty=0;};
    window.addEventListener('pointermove',onMove);
    wrapRef.current?.addEventListener('pointerleave',onLeave);
    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener('pointermove',onMove);};
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password}) });
      if (!res.ok) throw new Error('Contraseña incorrecta');
      const { token } = await res.json();
      onLogin(token);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-bg" />
      <div className="login-wrap" ref={wrapRef}>
        <div className="admin-login-card">
          <div className="login-header">
            <img src="/logo2.png" alt="Consultores CMC" className="login-logo" />
            <div className="login-divider" />
            <h1 className="login-title">Panel Administrativo</h1>
            <p className="login-subtitle">Consultores CMC · Centro de Diagnósticos</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Contraseña de acceso</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="login-input" placeholder="••••••••••••" autoFocus required />
            </div>
            {error && <p className="login-error">⚠ {error}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar al Panel →'}
            </button>
          </form>
          <p className="login-footer">© {new Date().getFullYear()} Consultores CMC · Seguridad e Higiene</p>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ token, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const authH = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/admin/stats`,       { headers: authH }).then(r=>r.json()),
      fetch(`${API_URL}/api/admin/stats/global`, { headers: authH }).then(r=>r.json()),
    ]).then(([ds, global]) => { setStats({ ds, global }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;
  if (!stats)  return <div className="admin-loading">Error al cargar.</div>;

  const { ds, global } = stats;
  const totalGlobal = (global?.drivesafe?.total||0) + (global?.ec0217?.total||0) + (global?.ec0301?.total||0);

  const cards = [
    { icon:'🚗', label:'DriveSafe IQ',        color:'#1a2e4a', bg:'#e8f0fe', total:global?.drivesafe?.total||0, extra:`Puntaje promedio: ${global?.drivesafe?.avgScore||0}/80`, tab:'drivesafe' },
    { icon:'📋', label:'EC0217 · Impartición', color:'#065f46', bg:'#ecfdf5', total:global?.ec0217?.total||0,   extra:`Aptos: ${global?.ec0217?.aptos||0} · Promedio: ${global?.ec0217?.avgPct||0}%`, tab:'ec0217' },
    { icon:'📐', label:'EC0301 · Diseño',      color:'#7c3aed', bg:'#f5f3ff', total:global?.ec0301?.total||0,   extra:`Aptos: ${global?.ec0301?.aptos||0} · Promedio: ${global?.ec0301?.avgPct||0}%`, tab:'ec0301' },
  ];

  return (
    <div className="dash-root">
      <div className="dash-hero">
        <div className="dash-hero-num">{totalGlobal}</div>
        <div className="dash-hero-label">diagnósticos totales registrados</div>
      </div>
      <div className="dash-cards">
        {cards.map(c => (
          <div key={c.tab} className="dash-card" style={{'--dc':c.color,'--dbg':c.bg}} onClick={()=>onNavigate(c.tab)}>
            <div className="dash-card-icon">{c.icon}</div>
            <div className="dash-card-num">{c.total}</div>
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-extra">{c.extra}</div>
            <div className="dash-card-link">Ver registros →</div>
          </div>
        ))}
      </div>
      {ds?.recent?.length > 0 && (
        <div className="dash-recent">
          <h3 className="dash-recent-title">🕐 Últimas evaluaciones DriveSafe</h3>
          <div className="dash-recent-list">
            {ds.recent.map((r,i) => {
              const risk = RISK_CONFIG[r.risk_level] || RISK_CONFIG.PRECAUCION;
              return (
                <div key={i} className="dash-recent-row">
                  <span className="dash-recent-name">{r.nombre}</span>
                  <span className="dash-recent-date">{fmtDate(r.fecha)}</span>
                  <span className="dash-recent-badge" style={{background:risk.bg,color:risk.color}}>{risk.dot} {risk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabla DriveSafe ──────────────────────────────────────────────────────────
function TablaDriveSafe({ token, onLogout }) {
  const [rows,setRows]=useState([]); const [stats,setStats]=useState({});
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const [filterRisk,setFilterRisk]=useState('ALL'); const [sortBy,setSortBy]=useState('fecha');
  const [sortDir,setSortDir]=useState('desc'); const [page,setPage]=useState(1);
  const [selectedId,setSelectedId]=useState(null);
  const authH={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try {
      const [evRes,stRes]=await Promise.all([
        fetch(`${API_URL}/api/admin/evaluaciones`,{headers:authH}),
        fetch(`${API_URL}/api/admin/stats`,{headers:authH}),
      ]);
      if(evRes.status===401){onLogout();return;}
      setRows(await evRes.json()); setStats(await stRes.json());
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  },[token]);

  useEffect(()=>{fetchAll();},[fetchAll]);

  const handleDelete=async(id,name)=>{
    if(!window.confirm(`¿Eliminar la evaluación de "${name}"?`))return;
    await fetch(`${API_URL}/api/admin/evaluaciones/${id}`,{method:'DELETE',headers:authH});
    fetchAll();
  };
  const handleExport=()=>{
    fetch(`${API_URL}/api/admin/export/csv`,{headers:authH}).then(r=>r.blob()).then(blob=>{
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='drivesafe.csv'; a.click();
    });
  };

  let filtered=rows.filter(e=>{
    const ms=!search||e.nombre.toLowerCase().includes(search.toLowerCase());
    const mr=filterRisk==='ALL'||e.risk_level===filterRisk;
    return ms&&mr;
  }).sort((a,b)=>{
    let va=a[sortBy],vb=b[sortBy];
    if(sortBy==='fecha'){va=new Date(va);vb=new Date(vb);}
    return sortDir==='asc'?(va>vb?1:-1):(va<vb?1:-1);
  });
  const totalPages=Math.ceil(filtered.length/PER_PAGE);
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('desc');}};
  const SortIcon=({col})=>sortBy===col?<span className="sort-icon-active">{sortDir==='asc'?'↑':'↓'}</span>:<span className="sort-icon-neutral">↕</span>;
  const byRiskMap={};(stats.byRisk||[]).forEach(r=>{byRiskMap[r.risk_level]=parseInt(r.count);});

  return (
    <div className="tab-content">
      <div className="stats-row">
        <div className="stat-card stat-total"><div className="stat-icon">📋</div><div className="stat-value">{stats.total??'—'}</div><div className="stat-label">Total evaluaciones</div></div>
        <div className="stat-card stat-avg"><div className="stat-icon">📊</div><div className="stat-value">{stats.avgScore??'—'}<span className="stat-unit">/80</span></div><div className="stat-label">Puntuación promedio</div></div>
        {['SEGURO','PRECAUCION','RIESGO','ALTO_RIESGO'].map(key=>{
          const cfg=RISK_CONFIG[key]; const count=byRiskMap[key]||0; const pct=stats.total?Math.round((count/stats.total)*100):0;
          return(<div className="stat-card" key={key} style={{'--stat-color':cfg.color,'--stat-bg':cfg.bg}}><div className="stat-icon">{cfg.dot}</div><div className="stat-value" style={{color:cfg.color}}>{count}</div><div className="stat-label">{cfg.label}</div><div className="stat-pct">{pct}%</div></div>);
        })}
      </div>
      <div className="admin-filters">
        <input type="text" placeholder="🔍 Buscar por nombre..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="filter-search"/>
        <select value={filterRisk} onChange={e=>{setFilterRisk(e.target.value);setPage(1);}} className="filter-select">
          <option value="ALL">Todos los niveles</option>
          {Object.entries(RISK_CONFIG).map(([k,v])=><option key={k} value={k}>{v.dot} {v.label}</option>)}
        </select>
        <button className="admin-btn-csv" onClick={handleExport}>📥 CSV</button>
        <button className="admin-btn-outline" onClick={fetchAll} disabled={loading}>⟳ Actualizar</button>
        <span className="filter-count">{filtered.length} resultados</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>
            <th onClick={()=>toggleSort('id')}># <SortIcon col="id"/></th>
            <th onClick={()=>toggleSort('nombre')}>Nombre <SortIcon col="nombre"/></th>
            <th onClick={()=>toggleSort('fecha')}>Fecha <SortIcon col="fecha"/></th>
            <th onClick={()=>toggleSort('total_score')}>Puntuación <SortIcon col="total_score"/></th>
            <th onClick={()=>toggleSort('risk_level')}>Nivel <SortIcon col="risk_level"/></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            {paginated.length===0&&<tr><td colSpan="6" className="td-empty">{loading?'Cargando...':'Sin resultados'}</td></tr>}
            {paginated.map(ev=>{
              const risk=RISK_CONFIG[ev.risk_level]||RISK_CONFIG.PRECAUCION;
              const pct=Math.round((ev.total_score/ev.max_score)*100);
              return(<tr key={ev.id} className="admin-row">
                <td className="td-id">{ev.id}</td>
                <td className="td-name">{ev.nombre}</td>
                <td className="td-date">{fmtDate(ev.fecha)}</td>
                <td className="td-score"><div className="score-pill"><span className="score-pill-num">{ev.total_score}<span className="score-pill-max">/80</span></span><div className="score-mini-bar"><div className="score-mini-fill" style={{width:`${pct}%`,background:risk.color}}/></div></div></td>
                <td><span className="risk-badge" style={{background:risk.bg,color:risk.color,borderColor:risk.color}}>{risk.dot} {risk.label}</span></td>
                <td className="td-actions">
                  <button className="action-btn action-view" onClick={()=>setSelectedId(ev.id)}>👁 Ver</button>
                  <button className="action-btn action-delete" onClick={()=>handleDelete(ev.id,ev.nombre)}>🗑</button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(<div className="admin-pagination">
        <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Anterior</button>
        <span className="page-info">Página {page} de {totalPages}</span>
        <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente →</button>
      </div>)}
      {selectedId&&<DetailModalDS evalId={selectedId} token={token} onClose={()=>setSelectedId(null)}/>}
    </div>
  );
}

// ─── Tabla EC ─────────────────────────────────────────────────────────────────
function TablaEC({ token, tipo, onLogout }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [filterRec,setFilterRec]=useState('ALL');
  const [sortBy,setSortBy]=useState('fecha'); const [sortDir,setSortDir]=useState('desc');
  const [page,setPage]=useState(1); const [selectedId,setSelectedId]=useState(null);
  const authH={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const ep=tipo==='ec0217'?'ec0217':'ec0301';

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch(`${API_URL}/api/admin/${ep}`,{headers:authH});
      if(res.status===401){onLogout();return;} setRows(await res.json());
    }catch(e){console.error(e);}finally{setLoading(false);}
  },[token,tipo]);

  useEffect(()=>{fetchAll();setPage(1);setSearch('');setFilterRec('ALL');},[tipo]);

  const handleDelete=async(id,name)=>{
    if(!window.confirm(`¿Eliminar el diagnóstico de "${name}"?`))return;
    await fetch(`${API_URL}/api/admin/${ep}/${id}`,{method:'DELETE',headers:authH}); fetchAll();
  };
  const handleExport=()=>{
    fetch(`${API_URL}/api/admin/${ep}/export/csv`,{headers:authH}).then(r=>r.blob()).then(blob=>{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${ep}.csv`;a.click();
    });
  };

  const total=rows.length, aptos=rows.filter(r=>r.recomendacion==='EVALUARSE').length;
  const avgPct=total?(rows.reduce((s,r)=>s+parseFloat(r.porcentaje),0)/total).toFixed(1):0;

  let filtered=rows.filter(r=>{
    const ms=!search||r.nombre.toLowerCase().includes(search.toLowerCase())||(r.empresa||'').toLowerCase().includes(search.toLowerCase());
    const mr=filterRec==='ALL'||r.recomendacion===filterRec;
    return ms&&mr;
  }).sort((a,b)=>{
    let va=a[sortBy],vb=b[sortBy];
    if(sortBy==='fecha'){va=new Date(va);vb=new Date(vb);}
    if(sortBy==='porcentaje'){va=parseFloat(va);vb=parseFloat(vb);}
    return sortDir==='asc'?(va>vb?1:-1):(va<vb?1:-1);
  });
  const totalPages=Math.ceil(filtered.length/PER_PAGE);
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('desc');}};
  const SortIcon=({col})=>sortBy===col?<span className="sort-icon-active">{sortDir==='asc'?'↑':'↓'}</span>:<span className="sort-icon-neutral">↕</span>;

  return (
    <div className="tab-content">
      <div className="stats-row">
        <div className="stat-card stat-total"><div className="stat-icon">📋</div><div className="stat-value">{total}</div><div className="stat-label">Total diagnósticos</div></div>
        <div className="stat-card" style={{'--stat-color':'#065f46','--stat-bg':'#ecfdf5'}}><div className="stat-icon">✅</div><div className="stat-value" style={{color:'#065f46'}}>{aptos}</div><div className="stat-label">Listos para evaluarse</div><div className="stat-pct">{total?Math.round((aptos/total)*100):0}%</div></div>
        <div className="stat-card" style={{'--stat-color':'#92400e','--stat-bg':'#fef3e2'}}><div className="stat-icon">📚</div><div className="stat-value" style={{color:'#92400e'}}>{total-aptos}</div><div className="stat-label">Requieren asesoría</div><div className="stat-pct">{total?Math.round(((total-aptos)/total)*100):0}%</div></div>
        <div className="stat-card stat-avg"><div className="stat-icon">📊</div><div className="stat-value">{avgPct}<span className="stat-unit">%</span></div><div className="stat-label">Porcentaje promedio</div></div>
      </div>
      <div className="admin-filters">
        <input type="text" placeholder="🔍 Buscar por nombre o empresa..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="filter-search"/>
        <select value={filterRec} onChange={e=>{setFilterRec(e.target.value);setPage(1);}} className="filter-select">
          <option value="ALL">Todas las recomendaciones</option>
          <option value="EVALUARSE">✅ Listos para evaluarse</option>
          <option value="ASESORARSE">📚 Requieren asesoría</option>
        </select>
        <button className="admin-btn-csv" onClick={handleExport}>📥 CSV</button>
        <button className="admin-btn-outline" onClick={fetchAll} disabled={loading}>⟳ Actualizar</button>
        <span className="filter-count">{filtered.length} resultados</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>
            <th onClick={()=>toggleSort('id')}># <SortIcon col="id"/></th>
            <th onClick={()=>toggleSort('nombre')}>Nombre <SortIcon col="nombre"/></th>
            <th>Empresa / Sector</th>
            <th>Ubicación</th>
            <th onClick={()=>toggleSort('fecha')}>Fecha <SortIcon col="fecha"/></th>
            <th onClick={()=>toggleSort('porcentaje')}>% <SortIcon col="porcentaje"/></th>
            <th onClick={()=>toggleSort('recomendacion')}>Recomendación <SortIcon col="recomendacion"/></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            {paginated.length===0&&<tr><td colSpan="8" className="td-empty">{loading?'Cargando...':'Sin resultados'}</td></tr>}
            {paginated.map(ev=>{
              const rec=REC_CONFIG[ev.recomendacion]||REC_CONFIG.ASESORARSE;
              const pct=parseFloat(ev.porcentaje);
              return(<tr key={ev.id} className="admin-row">
                <td className="td-id">{ev.id}</td>
                <td className="td-name"><div>{ev.nombre}</div><div style={{fontSize:'12px',color:'#94a3b8'}}>{ev.correo}</div></td>
                <td className="td-date"><div>{ev.empresa||<span style={{color:'#94a3b8'}}>Independiente</span>}</div>{ev.sector&&<div style={{fontSize:'12px',color:'#94a3b8'}}>{ev.sector}</div>}</td>
                <td className="td-date">{ev.ciudad}, {ev.estado}</td>
                <td className="td-date">{fmtDate(ev.fecha)}</td>
                <td className="td-score"><div className="score-pill"><span className="score-pill-num">{pct}<span className="score-pill-max">%</span></span><div className="score-mini-bar"><div className="score-mini-fill" style={{width:`${pct}%`,background:pct>=90?'#059669':pct>=70?'#d97706':'#dc2626'}}/></div></div></td>
                <td><span className="risk-badge" style={{background:rec.bg,color:rec.color,borderColor:rec.color}}>{rec.dot} {rec.label}</span></td>
                <td className="td-actions">
                  <button className="action-btn action-view" onClick={()=>setSelectedId(ev.id)}>👁 Ver</button>
                  <button className="action-btn action-delete" onClick={()=>handleDelete(ev.id,ev.nombre)}>🗑</button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(<div className="admin-pagination">
        <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Anterior</button>
        <span className="page-info">Página {page} de {totalPages}</span>
        <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente →</button>
      </div>)}
      {selectedId&&<DetailModalEC evalId={selectedId} token={token} tipo={tipo} onClose={()=>setSelectedId(null)}/>}
    </div>
  );
}

// ─── Modal DriveSafe ──────────────────────────────────────────────────────────
function DetailModalDS({ evalId, token, onClose }) {
  const [data,setData]=useState(null);
  const authH={Authorization:`Bearer ${token}`};
  useEffect(()=>{ fetch(`${API_URL}/api/admin/evaluaciones/${evalId}`,{headers:authH}).then(r=>r.json()).then(setData); },[evalId]);

  if(!data) return <div className="modal-overlay" onClick={onClose}><div className="modal-card"><div className="modal-loading">Cargando...</div></div></div>;

  const risk=RISK_CONFIG[data.risk_level]||RISK_CONFIG.PRECAUCION;
  const answers=Array.isArray(data.answers)?data.answers:[];
  const pct=Math.round((data.total_score/data.max_score)*100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">{data.nombre}</h2><p className="modal-subtitle">DriveSafe IQ · {fmtDate2(data.fecha)}</p></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-hero" style={{background:risk.bg,borderColor:risk.color}}>
          <div className="modal-score" style={{background:risk.color}}><span>{data.total_score}</span><small>/{data.max_score}</small></div>
          <div><div className="modal-risk-label" style={{color:risk.color}}>{risk.dot} {risk.label}</div><div className="modal-risk-pct">{pct}% de la puntuación máxima</div></div>
        </div>
        <div className="modal-answers">
          <h3 className="modal-section-title">📋 Respuestas detalladas</h3>
          {answers.map((ans,i)=>{
            const val=ans.value??0; const color=val>=3?'#c01515':val===2?'#c67c00':'#1b7f3e';
            return(<div key={i} className="modal-answer-row">
              <span className="modal-q-num">{i+1}.</span>
              <span className="modal-q-text">{QUESTIONS_TEXT[i]||`Pregunta ${i+1}`}</span>
              <span className="modal-q-ans" style={{color}}>{FREQ_LABELS[val]}</span>
              <span className="modal-q-val" style={{color}}>{val}/4</span>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Modal EC con respuestas colapsables por elemento ─────────────────────────
function ElementoRespuestas({ elementoId, elemInfo, answers, tipo }) {
  const [abierto, setAbierto] = useState(false);

  // Filtrar respuestas de este elemento
  const answersElem = answers.filter(a => a.elementoId === elementoId);
  const si  = answersElem.filter(a => a.value === true).length;
  const no  = answersElem.filter(a => a.value === false).length;
  const pct = answersElem.length ? Math.round((si / answersElem.length) * 100) : 0;
  const color = pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626';

  // Construir mapa id->texto usando constants importados dinámicamente
  // Como no podemos importar en runtime fácilmente, usamos los datos del answer
  // que ya tienen el questionId — necesitamos cruzar con los textos

  return (
    <div className="elem-resp-block">
      <button className="elem-resp-header" onClick={() => setAbierto(a => !a)} type="button">
        <div className="elem-resp-left">
          <span className="elem-resp-num">Elemento {elementoId}</span>
          <span className="elem-resp-nombre">{elemInfo.nombre}</span>
        </div>
        <div className="elem-resp-right">
          <div className="elem-resp-bar-wrap">
            <div className="elem-resp-bar-fill" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="elem-resp-pct" style={{ color }}>
            {si}/{answersElem.length} · {pct}%
          </span>
          <span className="elem-resp-toggle">{abierto ? '▲' : '▼'}</span>
        </div>
      </button>

      {abierto && (
        <div className="elem-resp-body">
          <div className="elem-resp-legend">
            <span className="legend-si">✓ SÍ ({si})</span>
            <span className="legend-no">✗ NO ({no})</span>
          </div>
          {answersElem.map((ans, i) => (
            <div key={ans.questionId} className={`resp-row ${ans.value ? 'resp-row--si' : 'resp-row--no'}`}>
              <span className={`resp-icon ${ans.value ? 'resp-icon--si' : 'resp-icon--no'}`}>
                {ans.value ? '✓' : '✗'}
              </span>
              <span className="resp-texto">{ans.questionText || ans.questionId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailModalEC({ evalId, token, tipo, onClose }) {
  const [data, setData] = useState(null);
  const authH = { Authorization: `Bearer ${token}` };
  const ep = tipo === 'ec0217' ? 'ec0217' : 'ec0301';
  const elemsInfo = tipo === 'ec0217' ? EC0217_ELEMS : EC0301_ELEMS;
  const codigo = tipo === 'ec0217' ? 'EC0217.01' : 'EC0301';

  // Usar mapas embebidos directamente (sin imports dinámicos)
  const preguntasMap = tipo === 'ec0217' ? EC0217_TEXTOS : EC0301_TEXTOS;

  useEffect(() => {
    fetch(`${API_URL}/api/admin/${ep}/${evalId}`, { headers: authH })
      .then(r => r.json()).then(setData);
  }, [evalId]);

  if (!data) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-loading">Cargando...</div>
      </div>
    </div>
  );

  const rec = REC_CONFIG[data.recomendacion] || REC_CONFIG.ASESORARSE;
  const pct = parseFloat(data.porcentaje);

  // Enriquecer answers con texto de pregunta y elementoId
  const answers = (Array.isArray(data.answers) ? data.answers : []).map(a => ({
    ...a,
    questionText: preguntasMap[a.questionId] || a.questionId,
  }));

  const desglose = [
    { si: data.elem1_si, total: data.elem1_total },
    { si: data.elem2_si, total: data.elem2_total },
    { si: data.elem3_si, total: data.elem3_total },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{data.nombre}</h2>
            <p className="modal-subtitle">{codigo} · {fmtDate2(data.fecha)}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Info candidato */}
        <div className="modal-info-grid">
          <div><label>Correo</label><span>{data.correo}</span></div>
          {data.empresa && <div><label>Empresa</label><span>{data.empresa}</span></div>}
          {data.sector  && <div><label>Sector</label><span>{data.sector}</span></div>}
          <div><label>Ubicación</label><span>{data.ciudad}, {data.estado}</span></div>
        </div>

        {/* Hero */}
        <div className="modal-hero" style={{ background: rec.bg, borderColor: rec.color }}>
          <div className="modal-score" style={{ background: rec.color }}>
            <span>{pct}%</span><small>{data.total_si}/{data.total_reactivos}</small>
          </div>
          <div>
            <div className="modal-risk-label" style={{ color: rec.color }}>{rec.dot} Se recomienda: {data.recomendacion}</div>
            <div className="modal-risk-pct">Umbral de aprobación: 90%</div>
          </div>
        </div>

        {/* Respuestas por elemento colapsables */}
        <div className="modal-answers">
          <h3 className="modal-section-title">📋 Respuestas por elemento</h3>
          <p className="modal-section-hint">Haz clic en cada elemento para ver las respuestas individuales</p>
          {[1, 2, 3].map(elemId => (
            <ElementoRespuestas
              key={elemId}
              elementoId={elemId}
              elemInfo={elemsInfo[elemId]}
              answers={answers}
              tipo={tipo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel Principal ────────────────────────────────────────────────────
export default function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [tab, setTab]     = useState('dashboard');

  const handleLogin  = (t) => { sessionStorage.setItem('admin_token', t); setToken(t); };
  const handleLogout = ()  => { sessionStorage.removeItem('admin_token'); setToken(''); };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const TABS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'drivesafe', icon: '🚗', label: 'DriveSafe IQ' },
    { id: 'ec0217',    icon: '📋', label: 'EC0217' },
    { id: 'ec0301',    icon: '📐', label: 'EC0301' },
  ];

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <img src="/logo2.png" alt="CMC" className="admin-logo" />
            <div>
              <h1 className="admin-title">Panel Administrativo</h1>
              <p className="admin-subtitle">Consultores CMC · Centro de Diagnósticos</p>
            </div>
          </div>
          <button className="admin-btn-logout" onClick={handleLogout}>Salir →</button>
        </div>
        <nav className="admin-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab===t.id?'admin-tab--active':''}`} onClick={()=>setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="admin-content">
        {tab==='dashboard' && <Dashboard token={token} onNavigate={setTab} />}
        {tab==='drivesafe' && <TablaDriveSafe token={token} onLogout={handleLogout} />}
        {tab==='ec0217'    && <TablaEC token={token} tipo="ec0217" onLogout={handleLogout} />}
        {tab==='ec0301'    && <TablaEC token={token} tipo="ec0301" onLogout={handleLogout} />}
      </div>
    </div>
  );
}