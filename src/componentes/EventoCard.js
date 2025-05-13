import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Badge, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {format} from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';



export default function EventoCard({ nome, data, local, evento_id, onPress }) {
  const theme = useTheme();
  const { eventosInscritos } = useUsuario();

  const inscricao = eventosInscritos.find(e => e.evento_id === evento_id);
  const status = inscricao?.status;

  let textoBadge = '';
  let corBadge = '';

  if (status) {
    if (status === 'confirmada') {
      corBadge = '#4CAF50'; textoBadge = 'Inscrição Confirmada';
    } else if (status === 'cancelada') {
      corBadge = '#F44336'; textoBadge = 'Inscrição Cancelada';
    } else if (status === 'em espera') {
      corBadge = '#FF9800'; textoBadge = 'Em Espera';
    } else {
      corBadge = '#9E9E9E'; textoBadge = 'Status Desconhecido';
    }
    console.log('Status do evento:', status);

  }

    /*
    if (status) {
        if (status === 'confirmada') {
            corBadge = '#4CAF50'; // verde
            textoBadge = 'Inscrição Confirmada';
        } else if (status === 'cancelada') {
            corBadge = '#F44336'; // vermelho
            textoBadge = 'Inscrição Cancelada';
        } else if (status === 'em espera') {
            corBadge = '#FF9800'; // laranja
            textoBadge = 'Inscrição em Espera';
        } else {
            corBadge = '#9E9E9E'; // cinza
            textoBadge = 'Status Desconhecido';
        }
    } else {
        corBadge = inscricao === true ? theme.colors.primary : theme.colors.secondary;
        textoBadge = inscricao === true ? 'Inscrições abertas' : 'Inscrições encerradas';
    }
        
    {eventos.map((evento, index) => {
        let textoBadge = '';
        let corBadge = '';

        if (evento.status) {
          if (evento.status === 'confirmada') {
            corBadge = '#4CAF50'; // verde
            textoBadge = 'Inscrição Confirmada';
          } else if (evento.status === 'cancelada') {
            corBadge = '#F44336'; // vermelho
            textoBadge = 'Inscrição Cancelada';
          } else if (evento.status === 'em espera') {
            corBadge = '#FF9800'; // laranja
            textoBadge = 'Inscrição em Espera';
          } else {
            corBadge = '#9E9E9E'; // cinza
            textoBadge = 'Status Desconhecido';
          }
        } else {
          corBadge = theme.colors.secondary;
          textoBadge = 'Sem Status';
        }
    
    */
    return (
        <Card style={styles.card} mode="outlined" onPress={onPress}>
            <Card.Content>
                <View style={styles.header}>
                    <Text variant="titleMedium" style={styles.nome}>{nome}</Text>
                    {status && (
  <Badge style={[styles.badge, { backgroundColor: corBadge }]}>
    olá
  </Badge>
)}
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
