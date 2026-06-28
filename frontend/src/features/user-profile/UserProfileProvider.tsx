/**
 * Provider del perfil de usuario — delegado a `StandardUserProfileProvider`
 * (createStandardProfileApi de @ceedcv-maya/shared-profile-react 0.16.0),
 * que ya viene cableado con el `fetchMe` del cliente HTTP de la app.
 */
export { StandardUserProfileProvider as UserProfileProvider } from '../../api/auth'
