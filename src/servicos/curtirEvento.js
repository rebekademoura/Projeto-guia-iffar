const curtirEvento = async (eventoId) => {
  try {
    const { error } = await supabase
      .from('eventos')
      .update({ qtd_curtidas: supabase.rpc('incrementar_curtida', { evento_id_input: eventoId }) })
      .eq('id', eventoId);

    if (error) {
      Alert.alert('Erro ao curtir evento', error.message);
    } else {
      carregarEventosInscritos(); // recarrega lista com novas curtidas
    }
  } catch (e) {
    Alert.alert('Erro inesperado', e.message);
  }
};
