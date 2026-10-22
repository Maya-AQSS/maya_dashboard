// Configuración en ejecución (D26 R6): solo para Vite (npm run dev / vite preview).
//
// En la imagen del frontend (maya/web-base), nginx sirve en /config.js el fichero que
// genera el entrypoint al arrancar, con window.__MAYA_CONFIG__ a partir de las variables
// MAYA_PUBLIC_* del chart (frontend.env); esa location tapa este fichero.
//
// Aquí no se define window.__MAYA_CONFIG__: publicConfig() de @ceedcv-maya/shared-auth-react
// usa entonces los VITE_* de frontend/.env.
