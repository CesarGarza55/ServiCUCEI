import { supabase } from './supabase'
// Registra un nuevo usuario y crea su apiKey
export const signUp = async (email, password, name, code) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: 'student', code }, // Datos adicionales del usuario
    },
  });

  if (signUpError) throw signUpError;

  // Inserta el perfil del usuario en la tabla user_profiles
  const { user } = signUpData;
  if (user) {
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: user.id, // ID del usuario generado por Supabase
      full_name: name,
      role: 'student', // Rol por defecto
    });

    if (profileError) throw profileError;
  }

  return signUpData;
};
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) throw error
  console.log('data', data)
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session || null; // Devuelve `null` si no hay sesión
}