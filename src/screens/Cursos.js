import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import CursoCard from '../componentes/CursoCard';
import { supabase } from '../config/supabase';

export default function Curso({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarCursos() {
      const { data, error } = await supabase.from('cursos').select('*');
      if (error) {
        console.log(error);
      } else {
        setCursos(data);
      }
      setCarregando(false);
    }
    buscarCursos();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={styles.titulo}>Cursos do Campus</Text>

        {carregando && <ActivityIndicator animating />}
        {!carregando && cursos.length === 0 && <Text>Não há registros</Text>}

        {cursos.map((curso, index) => (
          <CursoCard
            key={index}
            {...curso}
            onPress={() => navigation.navigate('DetalheCurso', curso)}
          />
        ))}
      </ScrollView>

      {/* Botão flutuante */}
      <FAB
        icon="plus"
        label="Novo Curso"
        style={styles.fab}
        onPress={() => navigation.navigate('NovoCurso')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100, // espaço para o botão flutuante
  },
  titulo: {
    marginBottom: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 16,
    bottom: 16,
  },
});
