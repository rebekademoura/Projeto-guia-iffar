import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Avatar } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import * as ImagePicker from 'expo-image-picker';

export default function Perfil() {
  const { perfil, setPerfil } = useUsuario();
  const [nome, setNome] = useState('');
  const [novaFoto, setNovaFoto] = useState(null);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome);
      carregarEventosInscritos();
    }
  }, [perfil]);

  const atualizarPerfil = async () => {
    try {
      if (!perfil) return;

      const fotoUrl = novaFoto || perfil.foto_usuario;

      const { error } = await supabase
        .from('usuarios')
        .update({ nome, foto_usuario: fotoUrl })
        .eq('id', perfil.id);

      if (error) throw error;

      setPerfil({ ...perfil, nome, foto_usuario: fotoUrl });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const nomeArquivo = `foto_${perfil.id}_${Date.now()}.jpg`.replace(/[^a-zA-Z0-9_.-]/g, '');

        const { error: uploadError } = await supabase.storage
          .from('fotos-perfil')
          .upload(nomeArquivo, blob);

        if (uploadError) {
          Alert.alert('Erro ao enviar imagem', uploadError.message);
          return;
        }

        const { data: publicUrl } = supabase.storage
          .from('fotos-perfil')
          .getPublicUrl(nomeArquivo);

        setNovaFoto(publicUrl?.publicUrl || null);
      } catch (e) {
        Alert.alert('Erro ao processar imagem', e.message);
      }
    }
  };

  useEffect(() => {
  const carregarDadosPerfil = async () => {
    if (perfil && !perfil.email) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user?.email) {
        setPerfil(prev => ({ ...prev, email: user.email }));
      }
    }

    carregarEventosInscritos();
    setNome(perfil?.nome || '');
  };

  carregarDadosPerfil();
}, [perfil]);


  const carregarEventosInscritos = async () => {
    const { data: inscricoes } = await supabase
      .from('inscricoes')
      .select('evento_id')
      .eq('usuario_id', perfil.id);

    if (!inscricoes || inscricoes.length === 0) return;

    const ids = inscricoes.map((i) => i.evento_id);
    const { data: eventos } = await supabase
      .from('eventos')
      .select('*')
      .in('id', ids);

    setEventos(eventos || []);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Meu Perfil" />
        <Card.Content>
          <Avatar.Image
            size={100}
            source={{
              uri: novaFoto || perfil?.foto_usuario || 'https://via.placeholder.com/100x100.png?text=Sem+Foto',
            }}
            style={{ alignSelf: 'center', marginBottom: 10 }}
          />
          <Text>Nome: {perfil?.nome}</Text>
          <Text>Email: {perfil?.email}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Edição de Perfil" />
        <Card.Content>
          <TextInput
            label="Nome"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />
          <Button mode="outlined" onPress={escolherImagem} style={{ marginBottom: 10 }}>
            Selecionar Nova Foto
          </Button>
          <Button mode="contained" onPress={atualizarPerfil}>
            Salvar Alterações
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="Eventos Inscritos" />
        <Card.Content>
          {eventos.length === 0 ? (
            <Text>Nenhum evento inscrito.</Text>
          ) : (
            eventos.map((evento) => (
              <View key={evento.id} style={styles.eventoItem}>
                <Text style={styles.eventoTitulo}>{evento.nome}</Text>
                <Text>Data: {evento.data}</Text>
                <Text>Descrição: {evento.descricao}</Text>
                <Text>Local: {evento.local}</Text>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  card: {
    marginBottom: 20,
    padding: 10,
  },
  input: {
    marginBottom: 10,
  },
  eventoItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  eventoTitulo: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});
