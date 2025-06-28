import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, Linking } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer'; // npm install buffer
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import { useNavigation } from '@react-navigation/native';

export default function NovoCurso() {
  const { perfil } = useUsuario();
  const navigation = useNavigation();

  // estados do formulário
  const [nome, setNome] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [nivel, setNivel] = useState('');
  const [turno, setTurno] = useState('');
  const [unidade, setUnidade] = useState('');
  const [duracao, setDuracao] = useState('');
  const [descricao, setDescricao] = useState('');

  // estados do arquivo
  const [fileUri, setFileUri] = useState('');
  const [fileName, setFileName] = useState('');

  // estado geral de envio
  const [enviando, setEnviando] = useState(false);

  // só seleciona, sem upload
  const selecionarArquivo = async () => {
    const resultado = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (resultado.canceled) return;

    const { uri, name } = resultado.assets[0];
    setFileUri(uri);
    setFileName(name);
  };

  // faz upload e insert juntos
  const salvarCurso = async () => {
    if (!nome || !modalidade || !nivel || !turno) {
      return Alert.alert('Campos obrigatórios', 'Preencha os campos principais.');
    }
    if (!fileUri) {
      return Alert.alert('Arquivo não selecionado', 'Selecione um PDF antes de cadastrar.');
    }

    setEnviando(true);

    try {
      // ler e converter
      const b64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(b64, 'base64');

      // upload
      const bucket = 'curso';
      const path = `${Date.now()}_${fileName}`;
      const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(path, buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      // obter publicUrl
      const { data, error: urlError } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);

      if (urlError || !data?.publicUrl) {
        throw new Error(urlError?.message ?? 'Não gerou publicUrl');
      }
      const publicUrl = data.publicUrl;

      // insert no banco
      const { error: insertError } = await supabase
        .from('cursos')
        .insert([{
          nome,
          modalidade,
          nivel,
          turno,
          unidade,
          duracao,
          descricao,
          arquivo_url: publicUrl,
        }]);

      if (insertError) throw new Error(insertError.message);

      Alert.alert('Sucesso', 'Curso cadastrado com sucesso!');
      navigation.navigate('Cursos');
    } catch (err) {
      Alert.alert('Erro', err.message || 'Falha ao cadastrar curso.');
    } finally {
      setEnviando(false);
    }
  };

  if (perfil?.tipo !== 'admin') {
    return (
      <View style={styles.bloqueado}>
        <Text variant="titleLarge">⛔ Acesso restrito</Text>
        <Text>Esta área é só para administradores.</Text>
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
      <TextInput
        label="Descrição"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        style={styles.input}
      />

      <Button
        mode="outlined"
        onPress={selecionarArquivo}
        disabled={enviando}
        style={{ marginBottom: 8 }}
      >
        Selecionar PDF
      </Button>

      {fileName ? <Text style={styles.fileName}>Arquivo selecionado: {fileName}</Text> : null}

      <Button
        mode="contained"
        onPress={salvarCurso}
        loading={enviando}
      >
        Cadastrar Curso
      </Button>

      <Button
        icon="arrow-left"
        mode="text"
        onPress={() => navigation.navigate('Cursos')}
        style={{ marginTop: 10 }}
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
  fileName: { marginBottom: 12, fontStyle: 'italic' },
  bloqueado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
