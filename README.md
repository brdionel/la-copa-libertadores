# Simulador Sorteo Copa Libertadores

Web app en React + Vite para simular el sorteo de la Copa Libertadores: 4 bolilleros, 8 grupos (A–H), drag & drop y simulación automática.

## Reglas del sorteo (en la app)

| Regla | Descripción |
|--------|-------------|
| **Bombos** | 4 bolilleros; cada grupo tiene 1 equipo de cada uno. |
| **Campeón** | Cabeza de serie fija en **Grupo A** (bolillero 1). |
| **Cabezas B–H** | Los otros 7 del bolillero 1 van a los grupos B–H. |
| **Orden** | Se completa bolillero 1 → 2 → 3 → 4. |
| **País** | No puede haber dos clubes del mismo país en el mismo grupo. Si al sortear cae en un grupo con mismo país, pasa al siguiente grupo válido. |
| **Excepción Fase 3** | Los clasificados por **repechaje** (Fase 3) sí pueden compartir grupo con otro equipo de su país. En datos: Deportivo Medellín, Tolima FC, Sporting Cristal, Barcelona SC. |
| **Bombo 4** | Integrado por esos 4 de Fase 3 + equipos de menor ranking: los **no** repechaje siguen la restricción de país igual que en bombos 1–3. |

## Favoritos (Brasil, Colombia, Venezuela, Ecuador)

En el bolillero activo (cuando Boca ya tiene grupo) se muestra la **probabilidad de que el próximo rival de ese bombo sea “favorito”** frente al resto: entre los equipos que **aún pueden** caer en el grupo de Boca, si hay 5 brasileños/colombianos/venezolanos/ecuatorianos y 3 de otros países, P(favorito) = 5/8. Eso es exacto bajo el modelo “sorteo uniforme entre válidos”. Esos equipos llevan **borde verde/dorado** en la lista y en el grupo.

## Rivales de Boca (panel en la app)

Mientras armás el sorteo, si **Boca** ya está en un grupo, el panel resume **rivales**: ciudad, **km en línea recta** desde Buenos Aires y desde Bogotá, y un **enlace a Skyscanner** (EZE → aeropuerto del rival). Eso no es “precio de vuelo” en vivo.

### ¿Se puede sacar precio de vuelo desde internet?

| Dato | ¿Automático en la app? |
|------|-------------------------|
| Ciudad | Sí (ya está en cada equipo). |
| Distancia | Sí, con coordenadas + fórmula (Haversine); es **recta**, no millas de ruta aérea. |
| **Precio de vuelo** | **No gratis y estable**: Google Flights no ofrece API pública. Opciones reales: **Amadeus Self-Service** (cuenta + token, límite de llamadas), **Duffel**, **Kiwi Tequila**, etc. (suelen ser de pago o registro). Scraping de sitios de viajes suele violar términos de uso y se rompe a menudo. |

Lo razonable sin backend ni API: **enlace al buscador** (como hace el panel) o, si más adelante querés precios, un **proxy con Amadeus** y variable de entorno con la API key.

## Móvil (Android / iPhone)

En muchos Android el navegador **prioriza el scroll** al gesto de arrastre. La app usa **mantener pulsado ~0,2 s** y luego arrastrar. Si un equipo no “engancha”, probá **Chrome** en lugar del navegador del fabricante. Como alternativa siempre podés usar **Simular sorteo** / **Sortear siguiente**.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

La carpeta `dist/` queda lista para servir en cualquier hosting estático.

## Deploy

### Opción 1: Vercel (recomendado)

1. Subí el repo a [GitHub](https://github.com) (creá un repo y hacé `git remote add origin ...` y `git push -u origin master`).
2. Entrá a [vercel.com](https://vercel.com), iniciá sesión con GitHub.
3. **Add New** → **Project** → elegí el repo `la-copa-libertadores`.
4. Vercel detecta Vite solo: **Build Command** `npm run build`, **Output Directory** `dist`. Dejá el resto por defecto y **Deploy**.
5. En unos segundos tenés la URL pública (ej. `https://la-copa-libertadores.vercel.app`).

### Opción 2: Netlify

1. Subí el repo a GitHub (igual que arriba).
2. Entrá a [netlify.com](https://netlify.com), **Add new site** → **Import an existing project** → GitHub → elegí el repo.
3. **Build command:** `npm run build`  
   **Publish directory:** `dist`
4. **Deploy site**. Te dan una URL tipo `https://random-name.netlify.app` (podés cambiarla en Site settings).

### Opción 3: Deploy manual

Después de `npm run build`, subí todo el contenido de la carpeta `dist/` a cualquier hosting estático (Firebase Hosting, GitHub Pages, S3 + CloudFront, etc.).

---

**Nota:** Si usás **GitHub Pages** con una URL tipo `https://usuario.github.io/la-copa-libertadores/`, en `vite.config.js` hay que definir `base: '/la-copa-libertadores/'` para que las rutas y assets carguen bien.
