import { useAuth } from '../../../app/auth/AuthContext'
import PageHeader from '../../../shared/components/PageHeader'

function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return <p>No hay información de usuario disponible.</p>
  }

  return (
    <>
      <PageHeader
        title="Perfil de usuario"
        subtitle={`Hola, ${user.name}`}
        rightAction={
          <button type='button'>Editar</button>
        }
      />

      <section className="profile-content">
        <h3>Datos básicos</h3>
        <p><strong>Nombre:</strong> {user.name}</p>
        <p><strong>Usuario:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        <p><strong>Bio:</strong> {user.bio}</p>
      </section>
    </>
  )
}

export default ProfilePage