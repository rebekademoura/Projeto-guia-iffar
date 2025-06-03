import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import EventoCard from '../componentes/EventoCard';
import { supabase } from '../config/supabase';

export default function Eventos({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [inscricoesList, setInscricoesList] = useState([]);

  useEffect(() => {
    async function buscarEventos() {
      const { data, error } = await supabase.from('eventos').select('*');
      if (error) {
        console.log(error);
      } else {
        setEventos(data);
      }
      setCarregando(false);
    }
    buscarEventos();
  }, []);

  useEffect(() => {
    async function buscarInscricoes() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rows, error } = await supabase
        .from('inscricoes')
        .select('evento_id')
        .eq('usuario_id', user.id);

      if (!error) {
        setInscricoesList(rows.map(r => r.evento_id));
      }
    }
    buscarInscricoes();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.titulo}>Eventos do Campus</Text>

        {carregando && <ActivityIndicator animating />}
        {!carregando && eventos.length === 0 && <Text>Nenhum registro</Text>}

        {eventos.map((evento, index) => (
          <EventoCard
            key={index}
            {...evento}
            permite_inscricao={evento.permite_inscricao}
            onPress={(action) => {
              if (action === 'inscrever') {
                navigation.navigate('InscricaoEvento', { evento_id: evento.id });
              } else {
                navigation.navigate('DetalheEvento', evento);
              }
            }}
          />
        ))}
      </ScrollView>

      {/* FAB flutuante para cadastrar evento */}
      <FAB
        icon="plus"
        label="Novo Evento"
        style={styles.fab}
        onPress={() => navigation.navigate('NovoEvento')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, // espaço extra para o botão flutuante
  },
  titulo: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    color: 'red',
  },
});
