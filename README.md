# Donuts & Code

Landing del grupo **Donuts & Code**, con tematica de Los Simpsons: la portada es la casa de la familia, cada ventana es la tarjeta de un integrante y lleva a su perfil, y la central nuclear del fondo lleva a la bitacora del proyecto.

**Link Vercel:** https://frontend-grupo-16-pi.vercel.app/

## Integrantes

| Nombre | Perfil en el sitio | GitHub |
|---|---|---|
| Ignacio Miguel Penovi | [bart.html](bart.html) | https://github.com/IgnacioMiguelPenovi |
| Ester | [lisa.html](lisa.html) | https://github.com/Kira-Blan |
| Eliana Moguilevsky | [marge.html](marge.html) | https://github.com/ElianaMoguilevsky |
| Celeste | [maggie.html](maggie.html) | https://github.com/mcdileonardo-alt |

## Estructura del proyecto

```
.
├── index.html        Portada (la casa)
├── bitacora.html      Bitacora del proyecto
├── bart.html          Perfil de Ignacio
├── lisa.html          Perfil de Ester
├── marge.html         Perfil de Eliana
├── maggie.html        Perfil de Celeste
├── css/                Una hoja de estilos por pantalla/seccion
├── js/                 JavaScript del sitio (index.js)
└── img/                Imagenes, avatares e iconos
```

Cada pagina HTML vive en la raiz del repositorio. El CSS, el JavaScript y las imagenes estan separados en sus propias carpetas y son compartidos por todas las paginas.

## Navegacion

Todas las paginas tienen, en la barra superior, un link a la portada ("La casa") y uno a la bitacora. Ademas, cada perfil tiene una seccion "Visita otras habitaciones" con enlaces directos a los perfiles del resto del equipo. Nadie necesita usar el boton Atras del navegador para recorrer el sitio.

## Interacciones dinamicas (JavaScript)

Todo el JavaScript del sitio esta centralizado en `js/index.js`. Cada funcion se activa solo cuando encuentra en la pagina los elementos que le corresponden, asi un mismo archivo sirve para todas las paginas sin que se pisen entre si.

- **Portada:** pendiente de agregar una interaccion propia.
- **Perfil de Ignacio (`bart.html`):** la pizarra de Bart. Se escribe un mensaje de commit en un input y, al confirmarlo, Bart lo escribe letra por letra en el pizarron del salon, con un hash corto adelante como si fuera un commit real. El pizarron guarda hasta 6 mensajes y los recuerda entre visitas (`localStorage`).
- **Perfil de Ester (`lisa.html`):** un boton que muestra un dato curioso de programacion al azar, elegido de una lista fija.
- **Perfil de Eliana (`marge.html`):** el peinado interactivo de Marge. Un slider controla la altura del peinado y va revelando objetos escondidos adentro a medida que sube.
- **Perfil de Celeste (`maggie.html`):**

## Diseno responsive

El sitio usa tres breakpoints en todas las paginas:

- `400px`: ajustes para telefonos chicos.
- `900px`: la casa y las tarjetas pasan de una grilla a una columna.
- `1200px`: en pantallas de notebook, el contenido se angosta un poco respecto del ancho maximo de escritorio.

## Como verlo en local

El sitio es HTML, CSS y JavaScript sin build. Alcanza con levantar un servidor estatico en la raiz del proyecto, por ejemplo:

```
python -m http.server 8000
```

y abrir `http://localhost:8000/index.html`. Abrir los archivos `.html` directo desde el explorador de archivos no funciona del todo bien, porque algunas rutas relativas necesitan que el sitio se sirva por http.

## Bitacora

Las decisiones, dificultades y cambios del proyecto se fueron registrando en [bitacora.html](bitacora.html), accesible desde el menu principal de cualquier pagina.

## Evolución del proyecto

En futuros trabajos se continuara ampliando y mejorando el proyecto mediante:

- Incorporacion de nuevas funcionalidades.
- Mejoras en el diseño y la experiencia de usuario.
- Adaptacion y optimizacion para diferentes dispositivos.
- Incorporacion de nuevas secciones y perfiles de personajes.
- Implementacion de funcionalidades dinámicas mediante JavaScript.
- Integracion con una base de datos para almacenar y gestionar informacion.

## Uso de IA

Para este proyecto usamos Claude (plan premium) como herramienta de apoyo para escribir codigo y acelerar el proceso de produccion. La idea de la pagina, el diseno y la estructura fueron pensados enteramente por nosotros; tambien fuimos nosotros quienes revisamos que lo pedido en la consigna se cumpliera, tanto en el HTML como en el CSS y el JavaScript.

Para la generacion del avatar de Ester en lisa.html se usó Meta AI en su versión gratuita. Prompt usado: "Convierte esta imagen en un divertido personaje de los simpson, con un vestido rojo infantil sin mangas" (a esto se le agrego una foto real de Ester para que se base en ella).
