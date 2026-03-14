// Imágenes locales: public/country (banderas) y public/team (escudos)
// Banderas: public/country/{countryCode}.png  → ar.png, br.png, uy.png, etc.
// Escudos: public/team/{badgeFile}.png        → river-plate.png, flamengo.png, etc.

// Fase 3 (repechaje): solo estos pueden compartir grupo con otro club del mismo país
/** Solo referencia / datos; ya no hay cupo fijo en Grupo A */
export const CAMPEON_ID = 'a1'
export const PRELIMINAR_IDS = ['d5', 'd6', 'd7', 'd8'] // DIM, Tolima, Sporting Cristal, Barcelona SC
/** Equipo para el cual se calculan probabilidades de rivales (ej. Boca) */
export const TARGET_TEAM_ID_PROB = 'a3' // Boca Juniors
/** Países que más te gustan enfrentar (resaltado + prob. conjunta vs resto) */
export const FAVORITE_RIVAL_COUNTRIES = ['Brasil', 'Colombia', 'Venezuela', 'Ecuador']
/** @deprecated usar FAVORITE_RIVAL_COUNTRIES; se mantiene por compatibilidad */
export const DESIRED_RIVAL_COUNTRIES = FAVORITE_RIVAL_COUNTRIES

export const pots = {
  A: [
    { id: 'a1', name: 'Flamengo', city: 'Río de Janeiro', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/fla.png', pot: 'A' },
    { id: 'a2', name: 'Palmeiras', city: 'São Paulo', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/palmeiras.png', pot: 'A' },
    { id: 'a3', name: 'Boca Juniors', city: 'Buenos Aires', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/boca.png', pot: 'A' },
    { id: 'a4', name: 'Peñarol', city: 'Montevideo', country: 'Uruguay', countryCode: 'uy', flag: '/country/uy.png', badge: '/team/penarol.png', pot: 'A' },
    { id: 'a5', name: 'Nacional', city: 'Montevideo', country: 'Uruguay', countryCode: 'uy', flag: '/country/uy.png', badge: '/team/nacional.png', pot: 'A' },
    { id: 'a6', name: 'LDU', city: 'Quito', country: 'Ecuador', countryCode: 'ec', flag: '/country/ec.png', badge: '/team/ldu.png', pot: 'A' },
    { id: 'a7', name: 'Fluminense', city: 'Río de Janeiro', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/flu.png', pot: 'A' },
    { id: 'a8', name: 'IDV', city: 'Quito', country: 'Ecuador', countryCode: 'ec', flag: '/country/ec.png', badge: '/team/idv.png', pot: 'A' },
  ],
  B: [
    { id: 'b1', name: 'Libertad', city: 'Asunción', country: 'Paraguay', countryCode: 'py', flag: '/country/py.png', badge: '/team/libertad.png', pot: 'B' },
    { id: 'b2', name: 'Estudiantes', city: 'La Plata', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/estudiantes.png', pot: 'B' },
    { id: 'b3', name: 'Cerro Porteño', city: 'Asunción', country: 'Paraguay', countryCode: 'py', flag: '/country/py.png', badge: '/team/cerro-porteno.png', pot: 'B' },
    { id: 'b4', name: 'Lanus', city: 'Lanús', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/lanus.png', pot: 'B' },
    { id: 'b5', name: 'Corinthians', city: 'São Paulo', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/corinthians.png', pot: 'B' },
    { id: 'b6', name: 'Bolivar', city: 'La Paz', country: 'Bolivia', countryCode: 'bo', flag: '/country/bo.png', badge: '/team/bolivar.png', pot: 'B' },
    { id: 'b7', name: 'Cruzeiro', city: 'Belo Horizonte', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/cruzeiro.png', pot: 'B' },
    { id: 'b8', name: 'Universitario', city: 'Lima', country: 'Perú', countryCode: 'pe', flag: '/country/pe.png', badge: '/team/universitario.png', pot: 'B' },
  ],
  C: [
    { id: 'c1', name: 'Junior', city: 'Barranquilla', country: 'Colombia', countryCode: 'co', flag: '/country/co.png', badge: '/team/junior.png', pot: 'C' },
    { id: 'c2', name: 'U. Católica', city: 'Santiago', country: 'Chile', countryCode: 'cl', flag: '/country/cl.png', badge: '/team/catolica.png', pot: 'C' },
    { id: 'c3', name: 'Central', city: 'Rosario', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/central.png', pot: 'C' },
    { id: 'c4', name: 'Santa Fe', city: 'Bogotá', country: 'Colombia', countryCode: 'co', flag: '/country/co.png', badge: '/team/santa-fe.png', pot: 'C' },
    { id: 'c5', name: 'Always Ready', city: 'El Alto', country: 'Bolivia', countryCode: 'bo', flag: '/country/bo.png', badge: '/team/always-ready.png', pot: 'C' },
    { id: 'c6', name: 'Coquimbo', city: 'Coquimbo', country: 'Chile', countryCode: 'cl', flag: '/country/cl.png', badge: '/team/coquimbo.png', pot: 'C' },
    { id: 'c7', name: 'La Guaira', city: 'Caracas', country: 'Venezuela', countryCode: 've', flag: '/country/ve.png', badge: '/team/la-guaira.png', pot: 'C' },
    { id: 'c8', name: 'Cusco FC', city: 'Cusco', country: 'Perú', countryCode: 'pe', flag: '/country/pe.png', badge: '/team/cusco-fc.png', pot: 'C' },
  ],
  D: [
    { id: 'd1', name: 'UCV FC', city: 'Caracas', country: 'Venezuela', countryCode: 've', flag: '/country/ve.png', badge: '/team/ucv-fc.png', pot: 'D' },
    { id: 'd2', name: 'Platense', city: 'Buenos Aires', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/platense.png', pot: 'D' },
    { id: 'd3', name: 'Ind. Rivadavia', city: 'Mendoza', country: 'Argentina', countryCode: 'ar', flag: '/country/ar.png', badge: '/team/ind-rivadavia.png', pot: 'D' },
    { id: 'd4', name: 'Mirassol', city: 'Mirassol', country: 'Brasil', countryCode: 'br', flag: '/country/br.png', badge: '/team/mirassol.png', pot: 'D' },
    { id: 'd5', name: 'Deportivo Medellín', city: 'Medellín', country: 'Colombia', countryCode: 'co', flag: '/country/co.png', badge: '/team/dim.png', pot: 'D', fromPreliminar: true },
    { id: 'd6', name: 'Tolima FC', city: 'Ibagué', country: 'Colombia', countryCode: 'co', flag: '/country/co.png', badge: '/team/tolima.png', pot: 'D', fromPreliminar: true },
    { id: 'd7', name: 'Sporting Cristal', city: 'Lima', country: 'Perú', countryCode: 'pe', flag: '/country/pe.png', badge: '/team/sporting-cristal.png', pot: 'D', fromPreliminar: true },
    { id: 'd8', name: 'Barcelona SC', city: 'Guayaquil', country: 'Ecuador', countryCode: 'ec', flag: '/country/ec.png', badge: '/team/barcelona-sc.png', pot: 'D', fromPreliminar: true },
  ],
}

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
export const POT_ORDER = ['A', 'B', 'C', 'D']
export const POT_LABEL = { A: 'Bolillero 1', B: 'Bolillero 2', C: 'Bolillero 3', D: 'Bolillero 4' }
