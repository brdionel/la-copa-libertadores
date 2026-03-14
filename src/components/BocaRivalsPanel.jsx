import { TARGET_TEAM_ID_PROB } from '../data/teams'
import { TEAM_GEO, REF_BUENOS_AIRES, REF_BOGOTA } from '../data/cityAirports'
import { haversineKm, skyscannerFlightsUrl } from '../utils/geo'

export function BocaRivalsPanel({ groups, groupNames }) {
  let bocaGroupId = null
  for (const gid of groupNames) {
    const row = groups[gid] || []
    if (row.some((t) => t && t.id === TARGET_TEAM_ID_PROB)) {
      bocaGroupId = gid
      break
    }
  }

  const rivals = []
  if (bocaGroupId) {
    for (const t of groups[bocaGroupId] || []) {
      if (t && t.id !== TARGET_TEAM_ID_PROB) rivals.push(t)
    }
  }

  if (!bocaGroupId) {
    return (
      <aside className="boca-panel boca-panel--empty">
        <h2 className="boca-panel__title">Rivales de Boca</h2>
        <p className="boca-panel__muted">Cuando Boca esté en un grupo, acá verás ciudad, distancias y enlace para buscar vuelos.</p>
      </aside>
    )
  }

  return (
    <aside className="boca-panel">
      <h2 className="boca-panel__title">
        Rivales de Boca <span className="boca-panel__group">Grupo {bocaGroupId}</span>
      </h2>
      <p className="boca-panel__note">
        Distancias en línea recta desde Buenos Aires y Bogotá. Precio de vuelo no está en la app (cambia todo el tiempo); usá el enlace.
      </p>
      <ul className="boca-panel__list">
        {rivals.map((t) => {
          const geo = TEAM_GEO[t.id]
          const kmBA = geo
            ? haversineKm(REF_BUENOS_AIRES.lat, REF_BUENOS_AIRES.lng, geo.lat, geo.lng)
            : null
          const kmBOG = geo
            ? haversineKm(REF_BOGOTA.lat, REF_BOGOTA.lng, geo.lat, geo.lng)
            : null
          const flights = geo ? skyscannerFlightsUrl('EZE', geo.iata) : null
          return (
            <li key={t.id} className="boca-panel__row">
              <div className="boca-panel__club">
                <img src={t.badge} alt="" className="boca-panel__badge" width={28} height={28} />
                <div>
                  <div className="boca-panel__name">{t.name}</div>
                  <div className="boca-panel__city">
                    {t.city}, {t.country}
                  </div>
                </div>
              </div>
              <div className="boca-panel__metrics">
                {kmBA != null && (
                  <span title="Desde Buenos Aires (aprox.)">{kmBA.toLocaleString()} km desde Arg. (BA)</span>
                )}
                {kmBOG != null && (
                  <span title="Desde Bogotá (aprox.)">{kmBOG.toLocaleString()} km desde Bogotá</span>
                )}
                {flights && (
                  <a className="boca-panel__link" href={flights} target="_blank" rel="noopener noreferrer">
                    Buscar vuelos (EZE → {geo.iata})
                  </a>
                )}
              </div>
            </li>
          )
        })}
      </ul>
      {rivals.length === 0 && (
        <p className="boca-panel__muted">Todavía no hay otros equipos en el grupo de Boca.</p>
      )}
    </aside>
  )
}
