import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert} from 'react-native';
import { Text, TextInput, ActivityIndicator, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../contexto/UsuarioContexto';


export default function NovoEvento({navigate}) {

  const [nome,       setNome]       = useState('');
  const [dataTime,   setDataTime]   = useState('');
  const [local,      setLocal]      = useState();
  const [descricao,  setDescricao]  = useState('');
  const [inscricao,  setInscricao]  = useState(''); //abertas ou fechadas
  const [total_vagas,  setTotalVagas]  = useState('');
  const [vagas_disponiveis,  setVagasDisponiveis]  = useState('');



  const [carregando, setCarregando] = useState(false);


  const navigation = useNavigation();
  const { perfil} = useUsuario();

  const novoEvento = async () => {
    

    
    if (!nome || !dataTime || !local || !descricao || !total_vagas) {
      alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    const dataFormatada = new Date(dataTime.replace(' ', 'T'));


     //parte 2 do fluxo - cadastrar na nossa 
      const { error: erroUsuario } = await 
      supabase.from('eventos').insert([
        { nome, 
          data: dataFormatada.toISOString(), 
          local, 
          descricao,
          inscricao: true,
          total_vagas}
      ]);

      setCarregando(false);

  if (erroUsuario) {
    alert('Erro ao cadastrar novo evento: ' + erroUsuario.message);
  } else {
    alert('Evento cadastrado com sucesso!');
    navigation.navigate('Eventos');
  }

  };
    
  //se não eiste usuário logado e se ele possui tipo admin
    if (!perfil || perfil.tipo !== 'admin') {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="titleLarge" style={{ marginBottom: 16 }}>Ususário sem permissão</Text>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('Cursos')}
                    style={styles.botao}
                >
                    Retornar a página anterior
                </Button>
            </ScrollView>
        );
    }
   
    if (perfil && perfil.tipo == 'admin'){
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text variant="titleLarge" style={{ marginBottom: 16 }}>Cadastrar novo evento</Text>
          
                <TextInput
                    label="Nome do Evento"
                    value={nome}
                    onChangeText={setNome}
                    style={styles.input}
                />
          
                <TextInput
                    label="Data - Digite o ano-mês-dia"
                    value={dataTime}
                    onChangeText={setDataTime}
                    autoCapitalize="none"
                    style={styles.input}
                />
    
                <TextInput
                    label="Local"
                    value={local}
                    onChangeText={setLocal}
                    style={styles.input}
                />

                <TextInput
                    label="Descrição"
                    value={descricao}
                    onChangeText={setDescricao}
                    style={styles.input}
                />
                <TextInput
                    label="Quantidade de vagas disponíveis"
                    value={total_vagas}
                    onChangeText={setTotalVagas}
                    style={styles.input}
                />
    
                <Button mode="contained" onPress={novoEvento} loading={carregando}>
                    Cadastrar
                </Button>
            </ScrollView>
        );
    }

}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { marginBottom: 16 },
});

