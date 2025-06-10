import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';

export default function EventoCard({ id, nome, data, local, onPress }) {
  const theme = useTheme();

  const [inscrito, setInscrito] = useState(false);
  const [qtdComentarios, setQtdComentarios] = useState(0);
  const [qtdCurtidas, setQtdCurtidas] = useState(0);
  const [qtdImagens, setQtdImagens] = useState(0);

  useEffect(() => {
    checarInscricao();
    carregarContadores();
  }, [id]);

  const checarInscricao = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('evento_id', id)
      .eq('usuario_id', user.id)
      .eq('status', 'confirmada');

    if (!error) setInscrito(data.length > 0);
  };

  const carregarContadores = async () => {
    const [{ count: comentarios }, { count: curtidas }, { count: imagens }] = await Promise.all([
      supabase.from('comentario').select('*', { count: 'exact', head: true }).eq('evento_id', id),
      supabase.from('curtidas').select('*', { count: 'exact', head: true }).eq('evento_id', id),
      supabase.from('imagens_evento').select('*', { count: 'exact', head: true }).eq('evento_id', id),
    ]);

    setQtdComentarios(comentarios || 0);
    setQtdCurtidas(curtidas || 0);
    setQtdImagens(imagens || 0);
  };

  const agora = new Date();
  const dataEvento = new Date(data);

  const textoBadge = inscrito
    ? 'Você já está inscrito'
    : agora > dataEvento
    ? 'Inscrições encerradas'
    : 'Inscrições abertas';

  const corBadge = inscrito
    ? theme.colors.primary
    : agora > dataEvento
    ? theme.colors.disabled
    : theme.colors.secondary;

  return (
    <Card style={styles.card} mode="outlined" onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.nome}>{nome}</Text>
          <Badge style={[styles.badge, { backgroundColor: corBadge }]}>{textoBadge}</Badge>
        </View>

        <View style={styles.info}>
          <MaterialCommunityIcons name="clock-outline" size={16} />
          <Text variant="bodyMedium" style={styles.infoText}>
            Data: {format(dataEvento, 'dd/MM/yyyy')}
          </Text>
        </View>

        <View style={styles.info}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} />
          <Text variant="bodyMedium" style={styles.infoText}>
            Local: {local}
          </Text>
        </View>

        <View style={styles.info}>
          <MaterialCommunityIcons name="comment-processing-outline" size={20} />
          <Text variant="bodyMedium" style={styles.infoText}>{qtdComentarios}</Text>
          <MaterialCommunityIcons name="cards-heart-outline" size={20} style={{ marginLeft: 16 }} />
          <Text variant="bodyMedium" style={styles.infoText}>{qtdCurtidas}</Text>
          <MaterialCommunityIcons name="image-outline" size={20} style={{ marginLeft: 16 }} />
          <Text variant="bodyMedium" style={styles.infoText}>{qtdImagens}</Text>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nome: {
    marginBottom: 10,
  },
  badge: {
    color: '#fff',
    paddingHorizontal: 10,
    fontSize: 12,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 4,
  },
});
