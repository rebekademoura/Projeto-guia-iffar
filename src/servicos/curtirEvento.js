import { supabase } from '../config/supabase';

export async function curtirEvento(eventoId) {
  const { data: evento, error } = await supabase
    .from('eventos')
    .select('curtidas')
    .eq('id', eventoId)
    .maybeSingle();

  if (error || !evento) {
    throw new Error('Erro ao buscar evento');
  }

  const { error: updateError } = await supabase
    .from('eventos')
    .update({ curtidas: (evento.curtidas || 0) + 1 })
    .eq('id', eventoId);

  if (updateError) {
    throw new Error('Erro ao curtir evento');
  }
}
