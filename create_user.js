require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function signUpUser() {
  const { data, error } = await supabase.auth.signUp({
    email: 'hackthon@demo.in',
    password: 'Demo@123',
  });
  
  if (error) {
    console.error('Error creating user:', error.message);
  } else {
    console.log('User created successfully:', data.user?.email);
  }
}

signUpUser();
