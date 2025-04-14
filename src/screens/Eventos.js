import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import EventoCard from '../componentes/EventoCard';

const eventos_db = [
    {
        titulo: 'Semana Acadêmica',
        data: '25/09/2025',
        local: 'Auditório',
        inscricao: 'aberta',
        descricao: 'Evento com palestras, oficinas e apresentações de projetos dos alunos.',
    },
    {
        titulo: 'Feira de Profissões',
        data: '10/10/2025',
        local: 'Bloco B',
        inscricao: 'fechada',
        descricao: 'Apresentação dos cursos técnicos e superiores do IFFar.',
    },
];

export default function Eventos({ navigation  }) {
  
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text variant="titleLarge" style={styles.titulo}>Eventos Acadêmicos</Text>

            {eventos_db.map((evento, index) => (
                <EventoCard
                    key={index}
                    {...evento}
                    onPress={() => navigation.navigate('DetalheEvento', evento)} 

                />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    titulo: { marginBottom: 16 },
});
