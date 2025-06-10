import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
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
  const [enviando, setEnviando] = useState(false);
  const [uploadOK, setUploadOK] = useState(false);

  const selecionarArquivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (resultado.assets && resultado.assets.length > 0) {
        setEnviando(true);
        const { uri, name } = resultado.assets[0];
        const resposta = await fetch(uri);
        const blob = await resposta.blob();
        const caminho = `cursos/${Date.now()}_${name}`;

        const { error } = await supabase.storage.from('curso').upload(caminho, blob);

        if (error) {
          Alert.alert('Erro', 'Falha ao enviar o PDF.');
          console.error('Erro no upload:', error);
          setUploadOK(false);
        } else {
          const { data: { publicUrl } } = supabase.storage.from('curso').getPublicUrl(caminho);
          setArquivoUrl(publicUrl);
          setUploadOK(true);
          Alert.alert('Sucesso', 'Arquivo PDF enviado com sucesso!');
        }
      }
    } catch (error) {
      console.error('Erro ao selecionar/enviar arquivo:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao selecionar o arquivo.');
      setUploadOK(false);
    } finally {
      setEnviando(false);
    }
  };

  const salvarCurso = async () => {
    if (!nome || !modalidade || !nivel || !turno) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos principais.');
      return;
    }

    if (!uploadOK || !arquivoUrl) {
      Alert.alert('Arquivo não enviado', 'Você precisa enviar o PDF antes de cadastrar.');
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
        arquivo_url: arquivoUrl,
      },
    ]);

    if (error) {
      Alert.alert('Erro ao salvar', error.message);
      console.error('Erro ao salvar curso:', error);
    } else {
      Alert.alert('Sucesso', 'Curso cadastrado com sucesso!');
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

      <Button mode="outlined" onPress={selecionarArquivo} loading={enviando} disabled={enviando}>
        {enviando ? 'Enviando...' : 'Selecionar e Enviar PDF'}
      </Button>

      {uploadOK && <Text style={{ marginTop: 8 }}>✅ PDF enviado com sucesso!</Text>}

      <Button mode="contained" onPress={salvarCurso} style={{ marginTop: 20 }}>
        Cadastrar Curso
      </Button>

      <Button
        icon="arrow-left"
        mode="text"
        onPress={() => navigation.navigate('Cursos')}
        style={{ marginBottom: 8, marginTop: 10 }}
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
