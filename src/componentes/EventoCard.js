import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useUsuario } from '../contexto/UsuarioContexto';
import { supabase } from '../config/supabase';



export default function EventoCard({
  id,
  nome,
  data,
  local,
  onPress,
}) {
  const theme = useTheme();
  const [inscrito, setInscrito] = useState(false);

  // Verifica se o usuário já está inscrito no evento
  useEffect(() => {
  async function checarInscricao() {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    console.log('Usuário retornado pelo Supabase:', user);
    console.log('ID do evento recebido no EventoCard:', id);

    if (userError || !user) {
      console.error('Erro ao obter usuário:', userError);
      return;
    }

    const { data: allRows, error: allError } = await supabase
      .from('inscricoes')
      .select('*');

    console.log('Todas as inscrições no banco:', allRows);

    const { data: rows, error } = await supabase
      .from('inscricoes')
      .select('*')
      .eq('evento_id', id)
      .eq('usuario_id', user.id);

    console.log('Resultado da busca com filtros:', rows);

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

  // Define texto e cor do badge
  let textoBadge, corBadge;
  if (inscrito) {
    textoBadge = 'Você já está inscrito';
    corBadge = theme.colors.primary;
  } else if (agora > dataEvento) {
    textoBadge = 'Inscrições encerradas';
    corBadge = theme.colors.disabled;
  } else {
    textoBadge = 'Inscrições abertas';
    corBadge = theme.colors.secondary;
  }

  const podeInscrever = !inscrito && agora <= dataEvento;


  return (
    <Card style={styles.card} mode="outlined" onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.nome}>{nome}</Text>
          {textoBadge !== '' && (
            <Badge style={[styles.badge, { backgroundColor: corBadge }]}>
              {textoBadge}
            </Badge>
          )}
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
  botao: {
    marginTop: 8,
  },
});
