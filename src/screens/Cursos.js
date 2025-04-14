import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import CursoCard from '../componentes/CursoCard';

const cursos_db = [
    {
      nome: 'Técnico em Informática',
      modalidade: 'Integrado',
      nivel: 'Técnico de Nível Médio',
      turno: 'Manhã',
      unidade: 'IFFar - Campus Panambi',
      duracao: '3 anos (1800h)',
      descricao:
        'O curso técnico em informática forma profissionais capazes de desenvolver sistemas, websites e realizar manutenção em computadores. Abrange disciplinas de programação, redes, banco de dados e lógica computacional.'
    },
    {
      nome: 'Sistemas para Internet',
      modalidade: 'Presencial',
      nivel: 'Graduação / Tecnologia',
      turno: 'Noite',
      unidade: 'IFFar - Campus Panambi',
      duracao: '3 anos (1898h)',
      descricao:
        'O tecnólogo em Sistemas para Internet desenvolve soluções web, apps e sistemas em nuvem. Atua com banco de dados, interfaces responsivas, segurança digital e tecnologias modernas do mercado.'
    },
  ];
  

export default function Cursos({ navigation }) {
    
    return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.titulo}>Cursos do Campus</Text>
      
      {cursos_db.map((curso, index) => (
        <CursoCard key={index} {...curso} onPress={() => navigation.navigate('DetalheCurso', curso)} />
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { marginBottom: 16 },
});
