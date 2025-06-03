import { supabase } from '../config/supabase';

export async function inscreverUsuario({ eventoId, perfil }) {
  // Buscar evento
  const { data: evento, error: eventoErro } = await supabase
    .from('eventos')
    .select('vagas_disponiveis, total_vagas')
    .eq('id', eventoId)
    .maybeSingle();

  if (eventoErro || !evento) {
    throw new Error('Erro ao verificar evento ou evento não encontrado.');
  }

  if (evento.vagas_disponiveis <= 0) {
    throw new Error('Não há vagas disponíveis.');
  }

  // Inserir inscrição
  const { error: inscErro } = await supabase.from('inscricoes').insert([
    {
      usuario_id: perfil.id,
      evento_id: eventoId,
      status: 'confirmada',
    },
  ]);

  if (inscErro) {
    throw new Error(`Erro ao inscrever: ${inscErro.message}`);
  }

  // Atualizar vagas
  const { error: atualizaErro } = await supabase
    .from('eventos')
    .update({ vagas_disponiveis: evento.vagas_disponiveis - 1 })
    .eq('id', eventoId);

  if (atualizaErro) {
    throw new Error('Inscrição feita, mas erro ao atualizar vagas.');
  }

  return true;
}
