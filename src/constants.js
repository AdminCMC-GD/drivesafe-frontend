export const QUESTIONS = [
  { id: 1, text: "Excedo el límite de velocidad." },
  { id: 2, text: "Manejo o viajo en un vehículo sin usar cinturón de seguridad." },
  { id: 3, text: "Manejo aunque mis pasajeros no utilicen el cinturón de seguridad." },
  { id: 4, text: "Manejo muy pegado a otros conductores." },
  { id: 5, text: "Hablo por teléfono mientras manejo." },
  { id: 6, text: "Envío mensajes de texto mientras manejo." },
  { id: 7, text: "Le grito o le hago señas negativas a otros conductores." },
  { id: 8, text: "Realizo giros o cambios de carril sin usar la luz de giro." },
  { id: 9, text: "Cruzo las señales de alto sin detenerme." },
  { id: 10, text: "Le hago señas de luces a los vehículos que circulan a menor velocidad adelante de mí." },
  { id: 11, text: "Manejo cuando estoy cansado." },
  { id: 12, text: "Manejo aunque haya bebido alcohol (independientemente de la cantidad)." },
  { id: 13, text: "Manejo aunque haya consumido drogas recreativas." },
  { id: 14, text: "Manejo aunque haya consumido medicamentos recetados." },
  { id: 15, text: "Manejo aunque haya consumido medicamentos de venta libre." },
  { id: 16, text: "Freno de golpe cuando otros conductores conducen muy pegado a mí." },
  { id: 17, text: "Mantengo la velocidad regular, independientemente de las condiciones climáticas o de la carretera." },
  { id: 18, text: "Programo el GPS mientras estoy manejando." },
  { id: 19, text: "Cambio la música o los controles de climatización del vehículo mientras estoy manejando." },
  { id: 20, text: "Puedo controlar lo que otros conductores o usuarios de la carretera hacen alrededor mío." }
];

export const FREQUENCY_OPTIONS = [
  { value: 0, label: "Nunca" },
  { value: 1, label: "Rara vez" },
  { value: 2, label: "A veces" },
  { value: 3, label: "Frecuentemente" },
  { value: 4, label: "Siempre" }
];

export const RISK_LEVELS = {
  SEGURO:       { label: "Conductor Seguro",    color: "#1b7f3e", bg: "#e8f5ee", icon: "🛡️", bar: "#1b7f3e" },
  PRECAUCION:   { label: "Precaución Moderada", color: "#c67c00", bg: "#fff3e0", icon: "⚠️", bar: "#f5a623" },
  RIESGO:       { label: "Perfil de Riesgo",    color: "#c84200", bg: "#fdecea", icon: "🔶", bar: "#f56300" },
  ALTO_RIESGO:  { label: "Alto Riesgo",         color: "#a81010", bg: "#fce4e4", icon: "🚨", bar: "#c01515" }
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
