import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet} from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import EventoCard from '../componentes/EventoCard';
import { supabase } from '../config/supabase';
  

export default function Eventos({ navigation }) {

    const [eventos, setEventos] = useState([]);
    const [carregando, setCarregando] = useState(true);

    useEffect(()=>{
        async function buscarEventos() {
            const {data, error} = await supabase.from('eventos').select('*'); //pode retornar dados, ou erros

            if(error){
                console.log(error);
            }
            else{
              setEventos(data);
            }
            setCarregando(false);
        }
        buscarEventos();
    }, [] )
    
    return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.titulo}>Eventos do Campus</Text>
      <Button onPress={() => navigation.navigate('NovoEvento')} style={{ marginTop: 8 }}>
          Cadastrar Novo Evento
        </Button>
      

      {carregando && <ActivityIndicator animating/>} 
      {!carregando && eventos.length==0 && <Text>Não tem registro</Text>}

      {eventos.map((eventos, index) => (
        <EventoCard key={index} {...eventos} onPress={() => navigation.navigate('DetalheEvento', eventos)} />
      ))}

        
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { marginBottom: 16 },
});
