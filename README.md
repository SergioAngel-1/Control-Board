# Control

**Tablero personal para organizar proyectos, tareas y objetivos.** Todo corre en el navegador, sin servidores, sin cuentas, sin internet. Tus datos nunca salen de tu máquina.

![captura](https://img.shields.io/badge/estado-activo-brightgreen)

---

## ¿Qué puedo hacer con Control?

- **Agrupar proyectos por categorías:** Clientes, Activos Estratégicos, Negocios, Proyectos Futuros, Personal — o las que tú definas.
- **Organizar cada proyecto en secciones:** listas de tareas (*checklist*), notas, pasos de *pipeline* comercial, o simples bloques de texto.
- **Marcar tareas, asignarles energía, etiquetas, fechas y recurrencia.** Ideal para metodologías como GTD o para el día a día.
- **Ver métricas rápidas** del total de proyectos y tareas completadas.
- **Dashboard principal** con los proyectos más urgentes.
- **Exportar e importar** toda tu base de datos para hacer copias de seguridad o moverte de navegador.
- **Todo oscuro, limpio y responsive.** Inspirado en Linear, funciona en escritorio y móvil.

---

## ¿Cómo está hecho?

| Capa | Tecnología |
|------|-----------|
| Interfaz | React 19 |
| Estilos | Tailwind CSS 3 (tema oscuro personalizado) |
| Base de datos | SQLite corriendo en WebAssembly (`sql.js`) |
| Persistencia | IndexedDB mediante `localforage` |
| Build | Vite 7 |

No hay backend, no hay API, no hay registro de usuarios. La base de datos vive entera en tu navegador y se sincroniza automáticamente con el almacenamiento local.

---

## Primeros pasos

```bash
npm install
npm run dev
```

Abre `http://localhost:5173` y empieza a usar Control. Los datos de ejemplo se cargan solos la primera vez.

Para construir una versión estática que puedas servir desde cualquier sitio:

```bash
npm run build
```

El contenido se genera en `dist/` y funciona sin conexión.

---

## Licencia

MIT
