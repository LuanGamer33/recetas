const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pwlscfffczfkdzapekto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3bHNjZmZmY3pma2R6YXBla3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNjcwMTgsImV4cCI6MjA5OTc0MzAxOH0.We--QMux31kf5ug2yamKHKTsDzQlWyYJOqG-CJB2RLE';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  try {
    console.log('Consultando recetas...');
    const { data, error } = await supabase.from('recipes').select('*');
    if (error) {
      console.error('Error al guardar la receta:', error.message);
    } else {
      console.log('Recetas guardadas exitosamente:', data.length);
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Error general:', err.message);
  }
}

test();
