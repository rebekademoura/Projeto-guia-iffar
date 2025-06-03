import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Text,
  Card,
  Badge,
  Divider,
  Button,
  useTheme,
  Modal,
  TextInput,
  Portal,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { inscreverUsuario } from '../servicos/inscreverUsuario';
import { cancelarInscricao } from '../servicos/cancelarinscricao';
import { enviarComentario } from '../servicos/enviarComentario';
import { curtirEvento } from '../servicos/curtirEvento';
import GaleriaImagensEvento from '../componentes/galeriaImagensEvento';

export default function DetalheEvento({ route }) {
  const { id, nome, data, local, descricao, vagas_disponiveis, total_vagas } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  const { perfil } = useUsuario();

  const [inscrito, setInscrito] = useState(false);
  const [comentarioVisivel, setComentarioVisivel] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [mostrarImagens, setMostrarImagens] = useState(false);

  useEffect(() => {
    async function checarInscricao() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Erro ao obter usuário:', userError);
        return;
      }

      const { data: rows, error } = await supabase
        .from('inscricoes')
        .select('*')
        .eq('evento_id', id)
        .eq('usuario_id', user.id)
        .eq('status', 'confirmada');

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

  const podeInscrever = !inscrito && agora <= dataEvento;

  const abrirModalComentario = () => setComentarioVisivel(true);
  const fecharModalComentario = () => {
    setComentarioTexto('');
    setComentarioVisivel(false);
  };

  const enviar = async () => {
    try {
      await enviarComentario({ eventoId: id, usuarioId: perfil.id, texto: comentarioTexto });
      alert('Comentário enviado!');
      fecharModalComentario();
    } catch (e) {
      alert(e.message);
    }
  };

  const curtir = async () => {
    try {
      await curtirEvento(id);
      alert('Você curtiu o evento!');
    } catch (e) {
      alert(e.message);
    }
  };

  const verImagens = () => {
    setMostrarImagens(!mostrarImagens);
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

          <Divider style={styles.divisor} />

          <View style={styles.info}>
            <IconButton icon="comment-processing-outline" size={24} onPress={abrirModalComentario} />
            <Text variant="bodyMedium" style={styles.infoText}>0</Text>

            <IconButton icon="cards-heart-outline" size={24} onPress={curtir} />
            <Text variant="bodyMedium" style={styles.infoText}>12</Text>

            <IconButton icon="image-outline" size={24} onPress={verImagens} />
          </View>

          {mostrarImagens && (
            <View style={{ marginTop: 10 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Imagens do Evento</Text>
              <GaleriaImagensEvento eventoId={id} />
            </View>
          )}
        </Card.Content>

        {podeInscrever && (
          <Button
            mode="contained"
            onPress={async () => {
              try {
                await inscreverUsuario({ eventoId: id, perfil });
                alert('Inscrição realizada com sucesso!');
                navigation.navigate('Eventos');
              } catch (e) {
                alert(e.message);
              }
            }}
            style={styles.botaoInscrever}
          >
            Quero me inscrever
          </Button>
        )}

        {inscrito && (
          <Button
            onPress={async () => {
              try {
                await cancelarInscricao(id);
                setInscrito(false);
                alert('Inscrição cancelada com sucesso!');
              } catch (e) {
                alert(e.message);
              }
            }}
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

      <Portal>
        <Modal visible={comentarioVisivel} onDismiss={fecharModalComentario} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium">Comentar evento</Text>
          <TextInput
            label="Digite seu comentário"
            value={comentarioTexto}
            onChangeText={setComentarioTexto}
            multiline
            mode="outlined"
            style={{ marginVertical: 10 }}
          />
          <Button mode="contained" onPress={enviar}>Enviar comentário</Button>
        </Modal>
      </Portal>
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
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'space-around',
  },
  infoText: {
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
