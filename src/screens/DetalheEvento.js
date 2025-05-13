import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Badge, Divider, Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';




export default function DetalheEvento({ route }) {
    const { id, nome, data, local, inscricao, descricao } = route.params;
    const theme = useTheme();
    const navigation = useNavigation();

    const corBadge = inscricao === true ? theme.colors.primary : theme.colors.outline;
    const textoBadge = inscricao === true ? 'Inscrições abertas' : 'Encerradas';


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Card mode="outlined" style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <Text variant="titleLarge">{nome}</Text>
                        <Badge style={[styles.badge, { backgroundColor: corBadge }]}>
                            {textoBadge}
                        </Badge>
                    </View>

                    <Divider style={styles.divisor} />
                    <Text variant="bodyMedium">📅 Data: {format(data,'dd/MM/yyyy')}</Text>
                    <Text variant="bodyMedium">📍 Local: {local}</Text>

                    <Divider style={styles.divisor} />
                    <Text variant="titleSmall" style={styles.subtitulo}>Descrição:</Text>
                    <Text style={styles.descricao}>{descricao}</Text>
                </Card.Content>

                <Button
                mode="outlined"
                onPress={() => navigation.navigate('InscricaoEvento',{evento_id: route.params.id })}
                style={styles.botaoInscrever}>
                    Quero me inscrever
                </Button>       
            </Card>

            <Button
                mode="outlined"
                onPress={() => navigation.navigate('Eventos')}
                style={styles.botaoVoltar}>
                Voltar
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: { marginBottom: 16 },
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
    divisor: { marginVertical: 12 },
    subtitulo: { marginBottom: 4 },
    descricao: { marginTop: 8, lineHeight: 20 },
    botaoVoltar: { marginTop: 10 },
    botaoInscrever: { marginTop: 10, color: '#C4112F',},

});
