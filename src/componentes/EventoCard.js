import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';


export default function EventoCard({id,nome,data,local,onPress }) {

  const theme = useTheme(); //tema de cores
  const [inscrito, setInscrito] = useState(false); //pega user

  // Verifica se o usuário já está inscrito no evento
  useEffect(() => {
  async function checarInscricao() {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    console.log('Usuário retornado pelo Supabase:', user);
    console.log('ID do evento recebido no EventoCard:', id);

    if (userError || !user) { //verificando se tem usuario logado
      console.error('Erro ao obter usuário:', userError);
      return;
    }
      const statusConfirmada = 'confirmada'; 

    const { data: rows, error } = await supabase //pegando no DB todos os eventos
      .from('inscricoes')
      .select('*')
      .eq('evento_id', id)
      .eq('usuario_id', user.id)
      .eq('status',statusConfirmada);


    if (error) { //nao encontrou nada
      console.error('Erro ao verificar inscrição:', error);
      return;
    }

    setInscrito(rows.length > 0); //se tiver mais de uma linha OK com user = evento_id 
  }

  checarInscricao(); //retorna os dados

  
}, [id]);


  const agora = new Date(); //data atual
  const dataEvento = new Date(data); //data que vai acontecer o evento

  // Define texto e cor do badge
  let textoBadge, corBadge;
  if (inscrito) { //se resultado > 0 = tem inscrito
    textoBadge = 'Você já está inscrito';
    corBadge = theme.colors.primary;
  } else if (agora > dataEvento) { //senão data de hoje maior que a data evento = inscrições encerradas
    textoBadge = 'Inscrições encerradas';
    corBadge = theme.colors.disabled;
  } else { //senao = inscrições abertas
    textoBadge = 'Inscrições abertas';
    corBadge = theme.colors.secondary;
  }

  const podeInscrever = !inscrito && agora <= dataEvento; //se usuário não está inscrito, nem data < evento = inscrição liberada


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
        <View style={styles.info}>
          <MaterialCommunityIcons name="comment-processing-outline" size={20} />
          <Text variant="bodyMedium" style={styles.infoText}>
            0
          </Text>
          <MaterialCommunityIcons name="cards-heart-outline" size={20} />
          <Text variant="bodyMedium" style={styles.infoText}>
            12
          </Text>
          <MaterialCommunityIcons name="image-outline" size={20} />
          <Text variant="bodyMedium" style={styles.infoText}>
            2
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
