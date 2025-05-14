import type { GreenArea } from "@/types/map-types"

// Datos de áreas verdes reales de Puente Alto (coordenadas aproximadas)
export const greenAreas: GreenArea[] = [
  {
    id: 1,
    name: "Plaza de Puente Alto",
    coordinates: [
      { lat: -33.609284412283095, lng: -70.57592524032991 },
      { lat: -33.60984634865028, lng: -70.57583025376978 },
      { lat: -33.60972359587313, lng: -70.5750343319034 },
      { lat: -33.60918893729279, lng: -70.57515552165246 },
    ],
    lastVisited: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
    info: "Plaza principal de la comuna, ubicada frente a la Municipalidad",
  },
  {
    id: 2,
    name: "Parque Juan Pablo II",
    coordinates: [
      { lat: -33.6219470658146, lng: -70.61278424551158 },
      { lat: -33.62236584755271, lng: -70.61782663983854 },
      { lat: -33.6258592895883, lng: -70.6175884164846 },
      { lat: -33.6252642022165, lng: -70.61267836846571 },
    ],
    lastVisited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    info: "Parque urbano con áreas verdes, juegos infantiles y zonas deportivas",
  },
  {
    id: 3,
    name: "Parque Gabriela Mistral",
    coordinates: [
      { lat: -33.57972208763167, lng: -70.58430602093942 },
      { lat: -33.58110364109779, lng: -70.58397951473276 },
      { lat: -33.58073141125236, lng: -70.5818400398511 },
      { lat: -33.579485861250134, lng: -70.58207203110373 },
    ],
    lastVisited: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
    info: "Parque con áreas verdes y espacios recreativos",
  },
  {
    id: 4,
    name: "Plaza Arturo Prat",
    coordinates: [
      { lat: -33.61512334215031, lng: -70.57559421883539 },
      { lat: -33.61629416400609, lng: -70.57535224739506 },
      { lat: -33.61620383410243, lng: -70.57470559957974 },
      { lat: -33.61502606246734, lng: -70.5749058518066 },
    ],
    lastVisited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    info: "Plaza histórica de Puente Alto",
  },
  {
    id: 5,
    name: "Club de campo Las Vizcachas",
    coordinates: [
      { lat: -33.598676038579896, lng: -70.53081864388567 },
      { lat: -33.60565115473502, lng: -70.5304416571665 },
      { lat: -33.60562872761371, lng: -70.51447357685866 },
      { lat: -33.59840689095989, lng: -70.52101698919385 },
    ],
    lastVisited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    info: "Parque con áreas verdes y senderos para caminatas",
  },
  {
    id: 6,
    name: "Parque Europa",
    coordinates: [
      { lat: -33.595602766545866, lng: -70.58483666114523 },
      { lat: -33.595516010185776, lng: -70.58901769133645 },
      { lat: -33.59674298488212, lng: -70.59489494018283 },
      { lat: -33.596457931710475, lng: -70.58973188866463 },
    ],
    lastVisited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    info: "Plaza con juegos infantiles y áreas de descanso",
  },
  {
    id: 7,
    name: "Plaza de la Virgen",
    coordinates: [
      { lat: -33.61604750992402, lng: -70.56696962745991 },
      { lat: -33.61686467483711, lng: -70.56680608240296 },
      { lat: -33.616690649625, lng: -70.56574303953249 },
      { lat: -33.615790252700265, lng: -70.56592021334424 },
    ],
    lastVisited: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    info: "Parque con áreas verdes y espacios recreativos",
  },
  {
    id: 8,
    name: "Plaza Claudio Gay",
    coordinates: [
      { lat: -33.605036271604895, lng: -70.57461041853624 },
      { lat: -33.60563369356078, lng: -70.57449833956485 },
      { lat: -33.6055403466529, lng: -70.57392673680864 },
      { lat: -33.60496159356958, lng: -70.5740500236775 },
    ],
    lastVisited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    info: "Plaza con áreas verdes y juegos infantiles",
  },
  {
    id: 9,
    name: "Plaza de la Paz",
    coordinates: [
      { lat: -33.60342501790665, lng: -70.57685362512176 },
      { lat: -33.603821583712524, lng: -70.57675939018515 },
      { lat: -33.6036831989766, lng: -70.57584431935138 },
      { lat: -33.60329282889872, lng: -70.57591623548728 },
    ],
    lastVisited: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    info: "Plaza vecinal con áreas verdes",
  },
  {
    id: 10,
    name: "Las Dos Plazas",
    coordinates: [
      { lat: -33.599070773865144, lng: -70.56632295483911 },
      { lat: -33.599403939678005, lng: -70.566247484416 },
      { lat: -33.599278216880464, lng: -70.56528901004494 },
      { lat: -33.598945050581875, lng: -70.56535693342515 },
    ],
    lastVisited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    info: "Parque con áreas verdes y zonas de picnic",
  },
  {
    id: 11,
    name: "Plaza Elvira Matte",
    coordinates: [
      { lat: -33.585295526523915, lng: -70.57717862756893 },
      { lat: -33.58650124622865, lng: -70.57709037495545 },
      { lat: -33.586457134829445, lng: -70.57559596403216 },
      { lat: -33.58524161183411, lng: -70.57566656612276 },
    ],
    lastVisited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    info: "Plaza con juegos infantiles",
  },
  {
    id: 12,
    name: "Parque Madre Teresa de Calcuta",
    coordinates: [
      { lat: -33.61309078517109, lng: -70.5873696127716 },
      { lat: -33.61323957756731, lng: -70.58851903388248 },
      { lat: -33.614261278411654, lng: -70.59081787610434 },
      { lat: -33.61428111714249, lng: -70.58854285608159 },
    ],
    lastVisited: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
    info: "Parque natural con espacios recreativos",
  },
]
