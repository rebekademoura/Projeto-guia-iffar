import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigation = useNavigation();

  const cadastrar = async () => {
    
    if (!email || !senha || !nome) {
      //Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    setCarregando(true);

    //parte 1 do fluxo - cadastrando na tabela de users do supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      //Alert.alert('Erro no cadastro', error.message);
      alert('Erro no cadastro', error.message);
      setCarregando(false);
      return;
    }

    //se cadastrou, temos o id do usuario
    const id = data.user?.id;

     //parte 2 do fluxo - cadastrar na nossa 
     // tabela personalizada de usuarios
    if (id) {   
      const { error: erroUsuario } = await 
      supabase.from('usuarios').insert([
        { id, nome, tipo: 'admin' }
      ]);

      if (erroUsuario) {
        //Alert.
        alert('Erro ao salvar usuário:', erroUsuario.message);
      } else {
        //Alert.alert('Conta criada com sucesso!', 'Você já pode fazer login.');
        navigation.navigate('Login');
      }
    }

    setCarregando(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>Criar Conta</Text>

      <TextInput
        label="Nome completo"
        value={nome}
        onChangeText={setNome}
        style={styles.input}
      />
      <TextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" onPress={cadastrar} loading={carregando}>
        Cadastrar
      </Button>

      <Button onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }}>
        Já tenho conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: 'center' },
  input: { marginBottom: 16 },
});