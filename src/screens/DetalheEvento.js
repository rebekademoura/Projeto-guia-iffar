import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Badge, Divider, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';

export default function DetalheEvento({ route }) {
  const { id, nome, data, local, descricao } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();

  const [inscrito, setInscrito] = useState(false);

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

          <Divider style={styles.divisor} />
          <Text variant="titleSmall" style={styles.subtitulo}>Descrição:</Text>
          <Text style={styles.descricao}>{descricao}</Text>
        </Card.Content>

        {podeInscrever && (
          <Button
            mode="contained"
            onPress={() => navigation.navigate('InscricaoEvento', { evento_id: id })}
            style={styles.botaoInscrever}
          >
            Quero me inscrever
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
