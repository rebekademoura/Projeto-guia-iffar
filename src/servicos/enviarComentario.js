import { supabase } from '../config/supabase';

export async function enviarComentario({ eventoId, usuarioId, texto }) {
  const { error: comentarioErro } = await supabase.from('comentario').insert([
    {
      evento_id: eventoId,
      usuario_id: usuarioId,
      comentario: texto,
    },
  ]);

  if (comentarioErro) {
    throw new Error('Erro ao salvar comentário: ' + comentarioErro.message);
  }

  const { data: evento, error: eventoErro } = await supabase
    .from('eventos')
    .select('qtd_comentarios')
    .eq('id', eventoId)
    .maybeSingle();

  if (eventoErro || !evento) {
    throw new Error('Comentário salvo, mas erro ao atualizar contador.');
  }

  const { error: atualizaErro } = await supabase
    .from('eventos')
    .update({ qtd_comentarios: (evento.qtd_comentarios || 0) + 1 })
    .eq('id', eventoId);

  if (atualizaErro) {
    throw new Error('Comentário salvo, mas erro ao contar comentários.');
  }
}
