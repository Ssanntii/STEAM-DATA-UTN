# Steam Data UTN

##API
- Se creó el archivo apiConfig.js donde se utilizan las URLs de Steam Web API más variables de entorno para establecer conexión.
- En axiosClient.js se hace un fetch general para todas las demás rutas GET.
- En steamApi.js se llama a la API por medio de todas las rutas, obteniendo así, los datos de los juegos.

##Estructura
- La estructura general está bastante definida.
- Hay que ir jugando un poco con los componentes para adaptarlos mejor. No se comprobó si son responsive.
- Seguramente faltan componentes como un Modal para ver las capturas, todos los componentes que se necesiten se pueden agregar.

##Rutas
- Existen 5 rutas, una de inicio, detalle de un juego específico, más vendidos, juegos en oferta y una ruta que envuelva todas las otras que no existen y arroje un 404 no encontrado.
- La ruta de más vendidos y ofertas(deals, mal llamado) podría ser una sola ruta, en donde se pueda filtrar por más vendidos en oferta por ejemplo.
- Las rutas no están 100% definidas, están sujetas a cambio así que pueden eliminarse como añadirse alguna que otra.

##Páginas
- Con las páginas sucede lo mismo que con las rutas, la idea es que por cada ruta exista un componente página y viceversa, donde dentro de cada una se consumen los componentes para formar esa misma.

##Estilos
- El estilado se realizó bastante básico para probar la aplicación y las llamadas a la API.
- Necesitamos verificar algunos estilos. Y cómo se adaptan las imágenes, por ejemplo en el HeroSlide.jsx.
- Se pensó usar tailwind puro y css SOLAMENTE para alguna que otra animación personalizada, si se puede evitar, mejor.

##Charts
- Los charts solo se ha podido ver el de jugadores activos, pero es un chart representativo, no fiel a la cantidad de jugadores.
- Hay q adaptar los gráficos para que se realicen con datos reales y no ficticios.
- Creo que no está creado un chart de precio, dependiendo si el juego tiene o es gratis.

##Hooks
- Hay varios hooks personalizados que hay que revisar exactamente qué hacen y si son del todo necesarios.

##Contextos
- Por el momento hay creados 2 context, uno para el tema claro/oscuro y otro para el lenguaje dentro de la página, la idea es solo ES/EN.
- El segundo contexto es opcional, puede estar como no. Si genera mucho problema se lo puede sacar.
- Los contextos deberían dejarse para lo último de igual manera.

##UI
- Existe una carpeta de UI donde están guardados dos componentes, un botón y un input, para usarlos en los demás componentes.
- El problema es que creo que no se usan, hay que verificar.
- También hay que verificar si están correctamente estilados o si falta añadir o quitar algo de estos componentes.
