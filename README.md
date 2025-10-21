# Steam Data UTN

## Pendientes

- Implementar los charts de cada juego con históricos reales.
- Arreglar los fetch de juegos en todas las rutas.

## Avances

### API
- Se creó el archivo apiConfig.js donde se utilizan las URLs de Steam Web API, más variables de entorno para establecer conexión.
- En axiosClient.js se hace un fetch general para todas las demás rutas GET.
- En steamApi.js se llama a la API por medio de todas las rutas, obteniendo así, los datos de los juegos.
- Se borraron las rutas hacia datos de perfiles de Steam, lo cual no está contemplado como un objetivo.
- Se añadieron rutas para la barra de búsqueda y demás rutas.

### Estructura
- La estructura general está bastante definida.
- Se agregó un ViewToggle para cambiar entre List y Grid en Home.
- Se agregó GameList para mostrar los juegos por lista.
- La barra de búsqueda ya es funcional.

### Rutas
- Existen 7 rutas, Inicio, Game Detail, Más Jugados, Más Vendidos, Ofertas, Resultados de búsqueda y una ruta que envuelve todas las otras que no existen.
- Se agregó la ruta 404 que envuelve todas las rutas inexistentes.

### Páginas
- Con las páginas sucede lo mismo que con las rutas, por cada ruta existe un componente página y viceversa. Dentro de cada una se consumen otros componentes.
- Página Más Vendidos creada.
- Página Resultados creada (Aquí se muestran los resultados de búsqueda de la barra de búsqueda).

### Estilos
- El los primeros estilos se realizaron para probar la aplicación y las llamadas a la API.
- Se usa Tailwind para estilos y CSS para animaciones o clases personalizadas.

### Charts
- Los charts solo se ha podido ver el de jugadores activos, pero es un chart representativo, no fiel a la cantidad de jugadores.
- Hay q adaptar los gráficos para que se realicen con datos reales y no ficticios.
- No está contemplado un chart de precio.

### Hooks
- Hay 2 hooks personalizados.

### Contextos
- Queda solo ThemeContext, ya implementado en varios componentes.

### UI
- En la carpeta UI se guardan: un Botón, un Input y ViewToggle, para usarlos en los demás componentes.
- Botón de volver al inicio implementado en GameDetails y 404, estilado para modo claro/oscuro.
- Componente modal creado. Para ver las capturas de pantalla en la misma página GameDetails.
