import { supabase } from '../config/supabase';

export async function cancelarInscricao(eventoId) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Erro ao obter usuário.');
  }

  const statusAtivo = 'confirmada';

  const { data: inscricao, error: buscaErro } = await supabase
    .from('inscricoes')
    .select('*')
    .eq('evento_id', eventoId)
    .eq('usuario_id', user.id)
    .eq('status', statusAtivo)
    .maybeSingle();

  if (buscaErro || !inscricao) {
    throw new Error('Inscrição não encontrada.');
  }

  const { error: deleteErro } = await supabase
    .from('inscricoes')
    .delete()
    .eq('id', inscricao.id);

  if (deleteErro) {
    throw new Error('Erro ao excluir inscrição.');
  }

  const { data: evento, error: eventoErro } = await supabase
    .from('eventos')
    .select('vagas_disponiveis')
    .eq('id', eventoId)
    .maybeSingle();

  if (eventoErro || !evento) {
    throw new Error('Erro ao buscar evento.');
  }

  const { error: atualizaErro } = await supabase
    .from('eventos')
    .update({ vagas_disponiveis: evento.vagas_disponiveis + 1 })
    .eq('id', eventoId);

  if (atualizaErro) {
    throw new Error('Inscrição cancelada, mas erro ao atualizar vagas.');
  }

  return true;
}
