import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigation = useNavigation();

  const cadastrar = () =>{
    console.log(nome, email, senha);

    setCarregando(false);
  }

  
  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>Criar Conta</Text>

      <TextInput
        label="Nome completo"
        value={nome}
        style={styles.input}
        onChangeText={setNome}
      />
      <TextInput
        label="E-mail"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        onChangeText={setEmail}
      />
      <TextInput
        label="Senha"
        value={senha}
        secureTextEntry
        style={styles.input}
        onChangeText={setSenha}
      />

      <Button mode="contained" 
            onPress={cadastrar} 
            loading={carregando}>
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