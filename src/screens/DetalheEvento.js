import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Platform, Linking } from 'react-native';
import {
  Text, Card, Badge, Divider, Button, useTheme,
  TextInput, IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import GaleriaImagensEvento from '../componentes/galeriaImagensEvento';
import { inscreverUsuario } from '../servicos/inscreverUsuario';
import { cancelarInscricao } from '../servicos/cancelarinscricao';

/* ─── MapView / Marker carregados somente no mobile ─── */
let MapView = () => null;
let Marker  = () => null;
if (Platform.OS !== 'web') {
  const RNMaps = require('react-native-maps');
  MapView      = RNMaps.default;
  Marker       = RNMaps.Marker;
}

export default function DetalheEvento({ route }) {
  const {
    id, nome, data, local,
    descricao, vagas_disponiveis, total_vagas,
    latitude, longitude,
  } = route.params;

  const theme      = useTheme();
  const navigation = useNavigation();
  const { perfil } = useUsuario();

  /* -------- estados -------- */
  const [inscrito, setInscrito]               = useState(false);
  const [mostrarComentarios, setMostrarComentarios] = useState(false);
  const [mostrarImagens,     setMostrarImagens]     = useState(false);
  const [comentarioTexto,    setComentarioTexto]    = useState('');
  const [comentarios,        setComentarios]        = useState([]);
  const [curtido, setCurtido]                       = useState(false);
  const [qtdCurtidas, setQtdCurtidas]               = useState(0);

  /* -------- efeitos -------- */
  useEffect(() => {
    carregarInscricao();
    carregarComentarios();
    carregarCurtidas();
  }, []);

  /* -------- funções de carga (iguais) -------- */
  const carregarInscricao = async () => {
    const { data: user } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('evento_id', id)
      .eq('usuario_id', user.user.id)
      .eq('status', 'confirmada');
    setInscrito((data || []).length > 0);
  };

  const carregarComentarios = async () => {
    const { data } = await supabase
      .from('comentario')
      .select('id, comentario, usuario:usuarios(nome)')
      .eq('evento_id', id)
      .order('id', { ascending: false });
    setComentarios(data || []);
  };

  const enviarComentario = async () => {
    if (!comentarioTexto.trim()) return;
    const { error } = await supabase
      .from('comentario')
      .insert({ evento_id: id, usuario_id: perfil.id, comentario: comentarioTexto });
    if (!error) { setComentarioTexto(''); carregarComentarios(); }
  };

  const carregarCurtidas = async () => {
    const { data: ev } = await supabase
      .from('eventos')
      .select('qtd_curtidas')
      .eq('id', id)
      .single();
    setQtdCurtidas(ev?.qtd_curtidas || 0);

    const { data } = await supabase
      .from('curtidas')
      .select('*')
      .eq('evento_id', id)
      .eq('usuario_id', perfil.id)
      .maybeSingle();
    setCurtido(!!data);
  };

  const alternarCurtida = async () => {
    if (curtido) {
      await supabase.from('curtidas').delete().match({ evento_id: id, usuario_id: perfil.id });
      await supabase.from('eventos').update({ qtd_curtidas: qtdCurtidas - 1 }).eq('id', id);
      setQtdCurtidas(qtdCurtidas - 1);
    } else {
      await supabase.from('curtidas').insert({ evento_id: id, usuario_id: perfil.id });
      await supabase.from('eventos').update({ qtd_curtidas: qtdCurtidas + 1 }).eq('id', id);
      setQtdCurtidas(qtdCurtidas + 1);
    }
    setCurtido(!curtido);
  };

  /* -------- badge -------- */
  const agora      = new Date();
  const dataEvento = new Date(data);

  const badgeText  = inscrito
    ? 'Você já está inscrito'
    : agora > dataEvento
    ? 'Inscrições encerradas'
    : 'Inscrições abertas';

  const badgeColor = inscrito
    ? theme.colors.primary
    : agora > dataEvento
    ? theme.colors.disabled
    : theme.colors.secondary;

  /* -------- render -------- */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card mode="outlined" style={styles.card}>
        <Card.Content>

          {/* cabeçalho */}
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

          {/* mapa ou botão */}
          {latitude && longitude && (
            <View style={{ marginTop: 12 }}>
              {Platform.OS === 'web' ? (
                <Button
                  mode="outlined"
                  onPress={() =>
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
                      '_blank'
                    )
                  }
                >
                  Ver mapa
                </Button>
              ) : (
                <View style={{ height: 200 }}>
                  <MapView
                    style={{ flex: 1, borderRadius: 8 }}
                    region={{
                      latitude:  Number(latitude),
                      longitude: Number(longitude),
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}
                  >
                    <Marker coordinate={{ latitude: Number(latitude), longitude: Number(longitude) }} />
                  </MapView>
                </View>
              )}
            </View>
          )}

          <Divider style={styles.divisor} />

          {/* contadores */}
          <View style={styles.info}>
            <IconButton icon="comment-outline" onPress={() => setMostrarComentarios(!mostrarComentarios)} />
            <Text>{comentarios.length}</Text>

            <IconButton
              icon={curtido ? 'heart' : 'heart-outline'}
              iconColor={curtido ? theme.colors.primary : undefined}
              onPress={alternarCurtida}
            />
            <Text>{qtdCurtidas}</Text>

            <IconButton icon="image-outline" onPress={() => setMostrarImagens(!mostrarImagens)} />
          </View>

          {/* galeria e comentários (sem mudanças) */}
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
              <TextInput
                label="Novo comentário"
                value={comentarioTexto}
                onChangeText={setComentarioTexto}
                multiline
                mode="outlined"
                style={{ marginTop: 12 }}
              />
              <Button mode="contained" onPress={enviarComentario} style={{ marginTop: 8 }}>
                Enviar
              </Button>
            </View>
          )}
        </Card.Content>

        {/* inscrição / cancelamento */}
        {agora <= dataEvento && !inscrito && (
          <Button
            mode="contained"
            onPress={async () => { await inscreverUsuario({ eventoId: id, perfil }); setInscrito(true); }}
            style={styles.botaoInscrever}
          >
            Quero me inscrever
          </Button>
        )}
        {inscrito && (
          <Button
            mode="outlined"
            onPress={async () => { await cancelarInscricao(id); setInscrito(false); }}
            style={{ marginTop: 10 }}
          >
            Cancelar inscrição
          </Button>
        )}
      </Card>

      <Button mode="outlined" onPress={() => navigation.navigate('Eventos')} style={styles.botaoVoltar}>
        Voltar
      </Button>
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
  info: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'space-around' },
});
