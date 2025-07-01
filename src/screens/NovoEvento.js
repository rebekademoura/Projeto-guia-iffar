import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, Platform } from 'react-native';
import { Text, TextInput, Card, Badge, Divider, Button, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import GaleriaImagensEvento from '../componentes/galeriaImagensEvento';
import { inscreverUsuario } from '../servicos/inscreverUsuario';
import { cancelarInscricao } from '../servicos/cancelarinscricao';

let MapView = () => null;
let Marker = () => null;
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView = RNMaps.default;
  Marker = RNMaps.Marker;
}

export default function DetalheEvento({ route }) {
  const {
    id,
    nome,
    data,
    local,
    descricao,
    vagas_disponiveis,
    total_vagas,
    latitude,
    longitude,
  } = route.params;

  const theme = useTheme();
  const navigation = useNavigation();
  const { perfil, userEmail } = useUsuario();

  const [inscrito, setInscrito] = useState(false);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [mostrarImagens, setMostrarImagens] = useState(false);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [curtido, setCurtido] = useState(false);
  const [qtdCurtidas, setQtdCurtidas] = useState(0);

  useEffect(() => {
    if (perfil?.id) {
      carregarInscricao();
      carregarComentarios();
      carregarCurtidas();
    }
  }, [perfil?.id, id]);

  async function carregarInscricao() {
    const { data } = await supabase
      .from('inscricoes')
      .select('id')
      .eq('evento_id', id)
      .eq('usuario_id', perfil.id)
      .eq('status', 'confirmada');
    setInscrito((data || []).length > 0);
  }

  async function carregarComentarios() {
    const { data } = await supabase
      .from('comentario')
      .select('id, comentario, usuario:usuarios(nome)')
      .eq('evento_id', id)
      .order('id', { ascending: false });
    setComentarios(data || []);
  }

  async function carregarCurtidas() {
    if (!perfil?.id) return;
    try {
      const { data: evData, error: evErr } = await supabase
        .from('eventos')
        .select('qtd_curtidas')
        .eq('id', id)
        .single();
      if (evErr) throw evErr;
      setQtdCurtidas(evData.qtd_curtidas);

      const { count, error: cntErr } = await supabase
        .from('curtidas')
        .select('id', { count: 'exact', head: true })
        .eq('evento_id', id)
        .eq('usuario_id', perfil.id);
      if (cntErr) throw cntErr;
      setCurtido(count > 0);
    } catch {
      setQtdCurtidas(0);
      setCurtido(false);
    }
  }

  async function alternarCurtida() {
    if (!perfil) return;
    try {
      if (curtido) {
        await supabase.from('curtidas').delete().match({ evento_id: id, usuario_id: perfil.id });
        await supabase.from('eventos').update({ qtd_curtidas: qtdCurtidas - 1 }).eq('id', id);
      } else {
        await supabase.from('curtidas').insert({ evento_id: id, usuario_id: perfil.id });
        await supabase.from('eventos').update({ qtd_curtidas: qtdCurtidas + 1 }).eq('id', id);
      }
      await carregarCurtidas();
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a curtida.');
    }
  }

  async function enviarComentario() {
    if (!comentarioTexto.trim()) return;
    const { error } = await supabase
      .from('comentario')
      .insert({ evento_id: id, usuario_id: perfil.id, comentario: comentarioTexto });
    if (!error) {
      setComentarioTexto('');
      carregarComentarios();
    }
  }

  async function enviarEmailConfirmacao(to, tituloEvento, dataEvento) {
    if (!to) return;

    const payload = {
      to,
      subject: `Confirmação de inscrição: ${tituloEvento}`,
      html: `<p>Você está inscrito no evento <strong>${tituloEvento}</strong> em ${new Date(dataEvento).toLocaleDateString()}.</p>`,
    };

    try {
      const { data, error } = await supabase.functions.invoke('envio-email', { body: JSON.stringify(payload) });
      if (error) return;
      return data;
    } catch {
      // erro ignorado
    }
  }

  const agora = new Date();
  const dataEvento = new Date(data);
  const badgeText = inscrito
    ? 'Você já está inscrito'
    : agora > dataEvento
    ? 'Inscrições encerradas'
    : 'Inscrições abertas';
  const badgeColor = inscrito
    ? theme.colors.primary
    : agora > dataEvento
    ? theme.colors.disabled
    : theme.colors.secondary;

  if (!perfil || perfil.tipo !== 'admin') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Usuário sem permissão</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>Voltar</Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Text variant="titleLarge">{nome}</Text>
            <Badge style={[styles.badge, { backgroundColor: badgeColor }]}>{badgeText}</Badge>
          </View>

          <Divider style={styles.divisor} />
          <Text>📅 Data: {format(dataEvento, 'dd/MM/yyyy')}</Text>
          <Text>📍 Local: {local}</Text>
          <Text>Vagas disponíveis: {vagas_disponiveis}</Text>
          <Text>Total de vagas: {total_vagas}</Text>

          <Divider style={styles.divisor} />
          <Text variant="titleSmall" style={styles.subtitulo}>Descrição:</Text>
          <Text style={styles.descricao}>{descricao}</Text>

          {latitude && longitude && (
            <View style={{ marginTop: 12 }}>
              {Platform.OS === 'web' ? (
                <Button
                  mode="outlined"
                  onPress={() => window.open(`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`, '_blank')}
                >
                  Ver mapa
                </Button>
              ) : (
                <View style={{ height: 200 }}>
                  <MapView
                    style={{ flex: 1, borderRadius: 8 }}
                    region={{ latitude: Number(latitude), longitude: Number(longitude), latitudeDelta: 0.005, longitudeDelta: 0.005 }}
                  >
                    <Marker coordinate={{ latitude: Number(latitude), longitude: Number(longitude) }} />
                  </MapView>
                </View>
              )}
            </View>
          )}

          <Divider style={styles.divisor} />

          <View style={styles.info}>
            <IconButton icon="comment-outline" onPress={() => setMostrarComentarios(!mostrarComentarios)} />
            <Text>{comentarios.length}</Text>
            <IconButton icon={curtido ? 'heart' : 'heart-outline'} iconColor={curtido ? theme.colors.primary : undefined} onPress={alternarCurtida} />
            <Text>{qtdCurtidas}</Text>
            <IconButton icon="image-outline" onPress={() => setMostrarImagens(!mostrarImagens)} />
          </View>

          {mostrarImagens && (
            <View style={{ marginTop: 10 }}>
              <Text variant="titleMedium" style={{ marginBottom: 8 }}>Imagens do Evento</Text>
              <GaleriaImagensEvento eventoId={id} />
            </View>
          )}

          {mostrarComentarios && (
            <View style={{ marginTop: 16 }}>
              <Text variant="titleMedium">Comentários</Text>
              {comentarios.map(item => (
                <View key={item.id} style={{ marginTop: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>{item.usuario?.nome}</Text>
                  <Text>{item.comentario}</Text>
                </View>
              ))}
              <TextInput label="Novo comentário" value={comentarioTexto} onChangeText={setComentarioTexto} multiline mode="outlined" style={{ marginTop: 12 }} />
              <Button mode="contained" onPress={enviarComentario} style={{ marginTop: 8 }}>Enviar</Button>
            </View>
          )}
        </Card.Content>

        {!inscrito && agora <= dataEvento && (
          <Button mode="contained" style={styles.botaoInscrever} onPress={async () => {
            await inscreverUsuario({ eventoId: id, perfil });
            setInscrito(true);
            await enviarEmailConfirmacao(userEmail, nome, data);
            Alert.alert('Inscrição confirmada', 'Verifique seu e-mail para detalhes.');
          }}>Quero me inscrever</Button>
        )}
        {inscrito && (
          <Button mode="outlined" style={{ marginTop: 10 }} onPress={async () => {
            await cancelarInscricao(id);
            setInscrito(false);
          }}>Cancelar inscrição</Button>
        )}
      </Card>
      <Button mode="outlined" onPress={() => navigation.navigate('Eventos')} style={styles.botaoVoltar}>Voltar</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { color: '#fff', paddingHorizontal: 10, fontSize: 12 },
  divisor: { marginVertical: 12 },
  subtitulo: { marginBottom: 4 },
  descricao: { marginTop: 8, lineHeight: 20 },
  botaoInscrever: { marginTop: 10 },
  botaoVoltar: { marginTop: 10 },
  info: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 8 },
});
