import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno: VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface TestUser {
  email: string
  password: string
  username: string
  role: 'admin' | 'editor' | 'user'
  name: string
  profile_type?: 'dj' | 'promoter' | 'clubber' | 'label' | 'agency'
}

const testUsers: TestUser[] = [
  {
    email: 'admin@technoexperience.com',
    password: 'Admin123!',
    username: 'admin_te',
    role: 'admin',
    name: 'Administrador',
  },
  {
    email: 'editor@technoexperience.com',
    password: 'Editor123!',
    username: 'editor_te',
    role: 'editor',
    name: 'Redactor',
  },
  {
    email: 'user@technoexperience.com',
    password: 'User123!',
    username: 'usuario_te',
    role: 'user',
    name: 'Usuario',
    profile_type: 'clubber',
  },
]

async function createTestUsers() {
  console.log('🚀 Creando usuarios de prueba...\n')

  for (const user of testUsers) {
    try {
      console.log(`📝 Creando usuario: ${user.username} (${user.role})...`)

      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirmar email automáticamente
      })

      if (authError) {
        console.error(`❌ Error creando usuario en auth:`, authError.message)
        continue
      }

      if (!authData.user) {
        console.error(`❌ No se pudo crear el usuario en auth`)
        continue
      }

      console.log(`✅ Usuario creado en auth: ${authData.user.id}`)

      // 2. Crear perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          name: user.name,
          profile_type: user.profile_type || null,
          is_active: true,
          is_verified: user.role !== 'user', // Admin y editor verificados por defecto
        })

      if (profileError) {
        console.error(`❌ Error creando perfil:`, profileError.message)
        // Intentar actualizar si ya existe
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            username: user.username,
            role: user.role,
            name: user.name,
            profile_type: user.profile_type || null,
          })
          .eq('id', authData.user.id)

        if (updateError) {
          console.error(`❌ Error actualizando perfil:`, updateError.message)
        } else {
          console.log(`✅ Perfil actualizado`)
        }
      } else {
        console.log(`✅ Perfil creado`)
      }

      console.log(`\n✅ Usuario ${user.username} creado exitosamente`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Role: ${user.role}\n`)

    } catch (error: any) {
      console.error(`❌ Error inesperado creando ${user.username}:`, error.message)
    }
  }

  console.log('\n✨ Proceso completado!')
  console.log('\n📋 CREDENCIALES DE USUARIOS DE PRUEBA:')
  console.log('═'.repeat(60))
  testUsers.forEach(user => {
    console.log(`\n👤 ${user.role.toUpperCase()}:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Username: ${user.username}`)
    console.log(`   Password: ${user.password}`)
  })
  console.log('\n' + '═'.repeat(60))
}

createTestUsers()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })

