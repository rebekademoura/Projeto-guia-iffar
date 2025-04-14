import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, useTheme } from 'react-native-paper';



export default function EventoCard({ titulo, data, local, inscricao, onPress }) {
    const theme = useTheme();

    const corBadge = inscricao === 'aberta'
        ? theme.colors.primary
        : theme.colors.secondary;

    const textoBadge = inscricao === 'aberta' ? 'Inscrições abertas' : 'Inscrições Encerradas';

    return (
        <Card style={styles.card} mode="outlined" onPress={onPress}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium">{titulo}</Text>
                    <Badge style={[styles.badge, { backgroundColor: corBadge }]}>
                        {textoBadge}
                    </Badge>
                </View>
                <Text variant="bodyMedium">Data: {data}</Text>
                <Text variant="bodyMedium">Local: {local}</Text>
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
    badge: {
        color: '#fff',
        paddingHorizontal: 10,
        fontSize: 12,
    },
});
