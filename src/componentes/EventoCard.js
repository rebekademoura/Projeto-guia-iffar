import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {format} from 'date-fns';



export default function EventoCard({ nome, data, local, inscricao, onPress }) {
    const theme = useTheme();

    const corBadge = inscricao === 'aberta'
        ? theme.colors.primary
        : theme.colors.secondary;

    const textoBadge = inscricao === 'aberta' ? 'Inscrições abertas' : 'Inscrições Encerradas';

    return (
        <Card style={styles.card} mode="outlined" onPress={onPress}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.nome}>{nome}</Text>
                    <Badge style={[styles.badge, { backgroundColor: corBadge }]}>
                        {textoBadge}
                    </Badge>
                </View>
                <View style={styles.info}>
                    <MaterialCommunityIcons name="clock-outline" size={16} />
                    <Text variant="bodyMedium">Data: {format(data,'dd/MM/yyyy')}</Text>
                </View>
                <View style={styles.info}>
                    <MaterialCommunityIcons name="account-group-outline" size={16} />
                    <Text variant="bodyMedium">Local: {local}</Text>
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
    nome: {
        marginBottom: 10,
        color: '#1C9B5E',
      }
});
