import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform, Pressable, Image } from 'react-native';
import { Text, TextInput, ActivityIndicator, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../contexto/UsuarioContexto';
import * as ImagePicker from 'expo-image-picker';

export default function NovoEvento() {
  const [nome, setNome] = useState('');
  const [dataTime, setDataTime] = useState('');
  const [local, setLocal] = useState('');
  const [descricao, setDescricao] = useState('');
  const [total_vagas, setTotalVagas] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [fotosSelecionadas, setFotosSelecionadas] = useState([]); // URIs locais
  const [urlsImagens, setUrlsImagens] = useState([]); // URLs públicas
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  const navigation = useNavigation();
  const { perfil } = useUsuario();

  // === Envia imagem para o Supabase Storage e salva URL ===
  const uploadImagem = async (uri) => {
    try {
      setCarregandoFoto(true);
      const resposta = await fetch(uri);
      const blob = await resposta.blob();
      const nomeImagem = `evento_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('imagem')
        .upload(nomeImagem, blob);

      if (uploadError) {
        Alert.alert('Erro ao enviar imagem');
        return null;
      }

      const { data } = supabase.storage.from('imagem').getPublicUrl(nomeImagem);
      return data?.publicUrl || null;
    } catch (err) {
      console.error('Erro ao enviar imagem:', err);
      return null;
    } finally {
      setCarregandoFoto(false);
    }
  };

  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão da câmera negada...');
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      allowsMultipleSelection: false,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      const imagem = resultado.assets[0];
      setFotosSelecionadas((prev) => [...prev, imagem.uri]);
    }
  };

  const escolherDaGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada...');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      const imagens = resultado.assets.map((asset) => asset.uri);
      setFotosSelecionadas((prev) => [...prev, ...imagens]);
    }
  };

  const selecionarImagem = () => {
    Alert.alert('Adicionar Imagem', 'Escolha a origem da imagem:', [
      { text: 'Câmera', onPress: tirarFoto },
      { text: 'Galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // === Cadastro de evento e imagens ===
  const novoEvento = async () => {
    if (!nome || !dataTime || !local || !descricao || !total_vagas) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    let dataFormatada;
    try {
      dataFormatada = new Date(dataTime.replace(' ', 'T'));
      if (isNaN(dataFormatada.getTime())) throw new Error('Data inválida');
    } catch {
      Alert.alert('Data inválida', 'A data informada está em um formato incorreto.');
      return;
    }

    setCarregando(true);

    const { data: eventoCriado, error: erroEvento } = await supabase.from('eventos').insert([
      {
        nome,
        data: dataFormatada.toISOString(),
        local,
        descricao,
        inscricao: true,
        total_vagas,
        vagas_disponiveis: total_vagas,
      },
    ]).select().single(); // retorna o evento inserido

    if (erroEvento || !eventoCriado) {
      setCarregando(false);
      Alert.alert('Erro ao cadastrar evento', erroEvento?.message || 'Erro desconhecido');
      return;
    }

    // Enviar imagens uma por uma e salvar na tabela 'imagens'
    const imagensPublicadas = [];
    for (const uri of fotosSelecionadas) {
      const url = await uploadImagem(uri);
      if (url) {
        imagensPublicadas.push(url);
        await supabase.from('imagem').insert([
          {
            evento_id: eventoCriado.id,
            usuario_id: perfil.id,
            url_imagem: url,
          },
        ]);
      }
    }

    setCarregando(false);
    Alert.alert('Sucesso', 'Evento e imagens cadastrados com sucesso!');
    navigation.navigate('Eventos');
  };

  if (!perfil || perfil.tipo !== 'admin') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Usuário sem permissão</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Cursos')} style={styles.botao}>
          Retornar à página anterior
        </Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>Cadastrar novo evento</Text>

      <TextInput label="Nome do Evento" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput label="Data - Digite o ano-mês-dia" value={dataTime} onChangeText={setDataTime} style={styles.input} />
      <TextInput label="Local" value={local} onChangeText={setLocal} style={styles.input} />
      <TextInput label="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
      <TextInput label="Quantidade de vagas disponíveis" value={total_vagas} onChangeText={setTotalVagas} style={styles.input} />

      <Button mode="outlined" onPress={selecionarImagem} style={{ marginTop: 20 }}>
        Adicionar Imagens do Evento
      </Button>
      {Platform.OS === 'web' && (
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={async (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        const novasFotos = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const objectUrl = URL.createObjectURL(file);
          novasFotos.push(objectUrl);
        }
        setFotosSelecionadas((prev) => [...prev, ...novasFotos]);
      }
    }}
    style={{ marginTop: 10 }}
  />
)}


      {fotosSelecionadas.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {fotosSelecionadas.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 10 }}
            />
          ))}
        </View>
      )}

      <Button mode="contained" onPress={novoEvento} loading={carregando}>
        Cadastrar Evento
      </Button>

      <Button
        icon="arrow-left"
        mode="text"
        onPress={() => navigation.navigate('Eventos')}
        style={{ marginBottom: 8 }}
      >
        Voltar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 12 },
  botao: { marginTop: 20 },
});
