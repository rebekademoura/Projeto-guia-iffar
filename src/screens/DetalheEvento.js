import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Badge, Divider, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';


export default function DetalheEvento({ route }) {

  const { id, nome, data, local, descricao, vagas_disponiveis, total_vagas } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  const { perfil, usuario } = useUsuario(); /*para realizar inscrição no projeto*/ 
  

  const [inscrito, setInscrito] = useState(false);

  //verificar inscrição
  useEffect(() => {
    async function checarInscricao() {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
  
      if (userError || !user) { /* verificando se tem algum usuário logado */
        console.error('Erro ao obter usuário:', userError);
        return;
      }
  
      const { data: allRows, error: allError } = await supabase /*pegando todos os eventos no bando de dados*/
        .from('inscricoes')
        .select('*');
    
      const statusConfirmada = 'confirmada'; 

      const { data: rows, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', id)
        .eq('usuario_id', user.id)
        .eq('status',statusConfirmada);
    
      if (error) {
        console.error('Erro ao verificar inscrição:', error);
        return;
      }
  
      setInscrito(rows.length > 0);
    }
  
    checarInscricao();
    
  }, [id]);

  const agora = new Date();
  const dataEvento = new Date(data);

  // define badge
  let badgeText, badgeColor;
  if (inscrito) {
    badgeText = 'Você já está inscrito';
    badgeColor = theme.colors.primary;
  } else if (agora > dataEvento) {
    badgeText = 'Inscrições encerradas';
    badgeColor = theme.colors.disabled;
  } else {
    badgeText = 'Inscrições abertas';
    badgeColor = theme.colors.secondary;
  }

  // mostra botão apenas se não inscrito e evento futuro
  const podeInscrever = !inscrito && agora <= dataEvento;


 const cancelarInscricao = async () => {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Erro ao obter usuário:', userError);
    return;
  }

  const statusAtivo = 'confirmada';

  // 1. Buscar inscrição
  const { data: inscricao, error: buscaErro } = await supabase
    .from('inscricoes')
    .select('*')
    .eq('evento_id', id)
    .eq('usuario_id', user.id)
    .eq('status', statusAtivo)
    .maybeSingle();

  if (buscaErro) {
    console.error('Erro ao buscar inscrição:', buscaErro.message);
    return;
  }

  if (!inscricao) {
    console.warn('Nenhuma inscrição encontrada para cancelar.');
    return;
  }

  console.log('Inscrição encontrada:', inscricao);

  // 2. Excluir inscrição
  const { error: deleteErro } = await supabase
    .from('inscricoes')
    .delete()
    .eq('id', inscricao.id);

  if (deleteErro) {
    console.error('Erro ao excluir inscrição:', deleteErro.message);
    return;
  }

  setInscrito(false);

  // 3. Buscar evento
  const { data: evento, error: eventoErro } = await supabase
    .from('eventos')
    .select('vagas_disponiveis')
    .eq('id', id)
    .maybeSingle();

  if (eventoErro || !evento) {
    console.error('Erro ao buscar evento:', eventoErro);
    return;
  }

  // 4. Atualizar vagas_disponiveis (+1)
  const { error: atualizaErro } = await supabase
    .from('eventos')
    .update({ vagas_disponiveis: evento.vagas_disponiveis + 1 })
    .eq('id', id);

  if (atualizaErro) {
    alert('Inscrição cancelada, mas houve erro ao atualizar vagas.');
    console.log('Erro ao atualizar vagas_disponiveis:', atualizaErro);
  } else {
    alert('Inscrição cancelada com sucesso!');
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">{nome}</Text>
            <Badge style={[styles.badge, { backgroundColor: badgeColor }]}>
              {badgeText}
            </Badge>
          </View>

          <Divider style={styles.divisor} />
          <Text variant="bodyMedium">📅 Data: {format(dataEvento, 'dd/MM/yyyy')}</Text>
          <Text variant="bodyMedium" style={styles.infoLocal}>📍 Local: {local}</Text>
          <Text variant="bodyMedium" style={styles.infoLocal}>Vagas disponíveis: {vagas_disponiveis}</Text>
          <Text variant="bodyMedium" style={styles.infoLocal}>Total de vagas: {total_vagas}</Text>

          <Divider style={styles.divisor} />
          <Text variant="titleSmall" style={styles.subtitulo}>Descrição:</Text>
          <Text style={styles.descricao}>{descricao}</Text>
        </Card.Content>

        {podeInscrever && (
  <Button
    mode="contained"
    onPress={async () => {
  // 1. Buscar evento
  const { data: evento, error: eventoErro } = await supabase
    .from('eventos')
    .select('vagas_disponiveis, total_vagas')
    .eq('id', id)
    .maybeSingle();

  if (eventoErro) {
    alert('Erro ao verificar evento.');
    console.log('Erro ao buscar evento:', eventoErro);
    return;
  }

  if (!evento) {
    alert('Evento não encontrado.');
    return;
  }

  // 3. Verificar se ainda há vagas
  if (evento.vagas_disponiveis <= 0) {
    alert('Não é possível se inscrever. Vagas esgotadas.');
    return;
  }

  // 4. Inserir inscrição
  const { error: inscErro } = await supabase.from('inscricoes').insert([
    {
      usuario_id: perfil.id,
      evento_id: id,
      status: 'confirmada',
    },
  ]);

  if (inscErro) {
    alert('Erro', `Erro ao se inscrever no evento: ${inscErro.message}`);
    console.log('Erro ao inscrever:', inscErro);
    return;
  }


  // 5. Decrementar total_vagas em 1
  const { error: atualizaErro } = await supabase
    .from('eventos')
    .update({ vagas_disponiveis: evento.vagas_disponiveis - 1 })
    .eq('id', id);


  if (atualizaErro) {
    alert('Inscrição feita, mas houve erro ao atualizar total de vagas.');
    console.log('Erro ao atualizar total_vagas:', atualizaErro);
  } else {
    alert('Sucesso', 'Inscrição realizada com sucesso!');
  }

  navigation.navigate('Eventos');
}}



    style={styles.botaoInscrever}
  >
    Quero me inscrever
  </Button>
)}

        {inscrito && (
  <Button
    onPress={cancelarInscricao}
    style={{ marginTop: 10 }}
    mode="outlined"
  >
    Cancelar inscrição
  </Button>
)}


      </Card>

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Eventos')}
        style={styles.botaoVoltar}
      >
        Voltar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    color: '#fff',
    paddingHorizontal: 10,
    fontSize: 12,
  },
  divisor: {
    marginVertical: 12,
  },
  infoLocal: {
    marginTop: 4,
  },
  subtitulo: {
    marginBottom: 4,
  },
  descricao: {
    marginTop: 8,
    lineHeight: 20,
  },
  botaoInscrever: {
    marginTop: 10,
  },
  botaoVoltar: {
    marginTop: 10,
  },
});
