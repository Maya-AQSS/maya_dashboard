// react-draggable@4.6.0 (transitiva vía react-grid-layout) lee
// process.env.DRAGGABLE_DEBUG sin guarda; en el navegador `process` no
// existe y lanza "process is not defined" al arrastrar/redimensionar los
// widgets del dashboard. Shim mínimo cargado desde index.html antes que
// cualquier módulo. En fichero y no en línea: la CSP de producción es
// script-src 'self' y bloquearía un <script> en línea.
window.process = window.process || { env: {} };
