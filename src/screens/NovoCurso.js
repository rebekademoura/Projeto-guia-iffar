import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';

export default function NovoCurso() {
  const { perfil } = useUsuario();
  const navigation = useNavigation();

  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [nivel, setNivel] = useState('');
  const [turno, setTurno] = useState('');
  const [unidade, setUnidade] = useState('');
  const [duracao, setDuracao] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivoUrl, setArquivoUrl] = useState(null);

  const selecionarArquivo = async () => {
  try {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (resultado.assets && resultado.assets.length > 0) {
      const { uri, name } = resultado.assets[0];
      const resposta = await fetch(uri);
      const blob = await resposta.blob();
      const caminho = `cursos/${Date.now()}_${name}`;

      const { data, error } = await supabase.storage.from('curso').upload(caminho, blob); // <- corrigido

      if (error) {
        Alert.alert('Erro', 'Falha ao enviar o PDF.');
        console.error('Erro no upload:', error);
      } else {
        const { data: { publicUrl } } = supabase.storage.from('curso').getPublicUrl(caminho); // <- corrigido
        setArquivoUrl(publicUrl);
        Alert.alert('Sucesso', 'Arquivo PDF enviado com sucesso!');
      }
    }
  } catch (error) {
    console.error('Erro ao selecionar arquivo:', error);
    Alert.alert('Erro', 'Ocorreu um erro ao selecionar o arquivo.');
  }
};


  const salvarCurso = async () => {
    if (!nome || !modalidade || !nivel || !turno) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos principais.');
      return;
    }

    const { error } = await supabase.from('cursos').insert([
      {
        nome,
        modalidade,
        nivel,
        turno,
        unidade,
        duracao,
        descricao,
        arquivo_url: arquivoUrl, // ✅ agora está corretamente separado por vírgula
      },
    ]);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
    } else {
      Alert.alert('Sucesso', 'Curso cadastrado!');
      navigation.navigate('Cursos');
    }
  };

  if (perfil?.tipo !== 'admin') {
    return (
      <View style={styles.bloqueado}>
        <Text variant="titleLarge">⛔ Acesso restrito</Text>
        <Text>Esta funcionalidade é exclusiva para administradores.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={styles.titulo}>Novo Curso</Text>

      <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput label="Modalidade" value={modalidade} onChangeText={setModalidade} style={styles.input} />
      <TextInput label="Nível" value={nivel} onChangeText={setNivel} style={styles.input} />
      <TextInput label="Turno" value={turno} onChangeText={setTurno} style={styles.input} />
      <TextInput label="Unidade" value={unidade} onChangeText={setUnidade} style={styles.input} />
      <TextInput label="Duração" value={duracao} onChangeText={setDuracao} style={styles.input} />
      <TextInput label="Descrição" value={descricao} onChangeText={setDescricao} multiline style={styles.input} />

      <Button mode="outlined" onPress={selecionarArquivo}>
        Selecionar PDF do Curso
      </Button>

      {arquivoUrl && <Text style={{ marginTop: 8 }}>✅ Arquivo enviado com sucesso!</Text>}

      <Button mode="contained" onPress={salvarCurso} style={{ marginTop: 20 }}>
        Salvar Curso
      </Button>
      <Button
  icon="arrow-left"
  mode="text"
  onPress={() => navigation.navigate('Cursos')}
  style={{ marginBottom: 8 }}
>
  Voltar
</Button>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  titulo: { marginBottom: 16 },
  input: { marginBottom: 12 },
  bloqueado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
