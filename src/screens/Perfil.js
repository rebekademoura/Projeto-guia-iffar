import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { format } from 'date-fns';
import { supabase } from '../config/supabase';
import { useUsuario } from '../contexto/UsuarioContexto';
import * as ImagePicker from 'expo-image-picker';

export default function Perfil() {
  const { perfil, setPerfil } = useUsuario();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [novaFoto, setNovaFoto] = useState(null);
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome);
      setEmail(perfil.email);
      setNovaFoto(perfil.foto_usuario);
      carregarEventosInscritos();
    }
  }, [perfil]);

  const confirmarAlteracoes = async () => {
    console.log('Iniciando atualização de perfil');
    if (!perfil) return;
    try {
      let updatedEmail = perfil.email;
      const authUpdates = {};
      if (email && email !== perfil.email) authUpdates.email = email;
      if (novaSenha) {
        if (novaSenha !== confirmSenha) {
          return Alert.alert('Erro', 'A confirmação de senha não confere.');
        }
        authUpdates.password = novaSenha;
      }
      console.log('Atualizações para Auth:', authUpdates);
      let updatedSession;
      if (Object.keys(authUpdates).length) {
        const { data: authData, error: authError } = await supabase.auth.updateUser(authUpdates);
        console.log('Resposta updateUser:', { authData, authError });
        if (authError) return Alert.alert('Erro Auth', authError.message);
        updatedEmail = authData.user.email;
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('Atualização de sessão:', { sessionData, sessionError });
        if (sessionError) console.error('Não foi possível atualizar sessão:', sessionError);
        updatedSession = sessionData.session;
      }
      let fotoUrl = perfil.foto_usuario;
      if (selectedImage) {
        const resp = await fetch(selectedImage);
        const blob = await resp.blob();
        const fileName = `perfil_${perfil.id}_${Date.now()}.jpg`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from('fotos-perfil')
          .upload(fileName, blob, { upsert: true });
        console.log('Resultado storage.upload:', { storageData, storageError });
        if (storageError) return Alert.alert('Erro storage', storageError.message);
        const { data: urlData } = supabase.storage.from('fotos-perfil').getPublicUrl(fileName);
        fotoUrl = urlData.publicUrl;
      }

      const dbUpdates = { nome: nome.trim(), email: updatedEmail, foto_usuario: fotoUrl };
      console.log('Atualizações para DB:', dbUpdates);
      const { data: updatedRows, error: dbError } = await supabase
        .from('usuarios')
        .update(dbUpdates)
        .eq('id', perfil.id)
        .select();
      console.log('Resultado usuarios.update:', { updatedRows, dbError });
      if (dbError) return Alert.alert('Erro BD', dbError.message);

      setPerfil({
        ...perfil,
        nome: nome.trim(),
        email: updatedEmail,
        foto_usuario: fotoUrl,
      });
      setNovaSenha('');
      setConfirmSenha('');
      setSelectedImage(null);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso.');
    } catch (error) {
      console.error('Erro inesperado:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };

  const escolherImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão negada');
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const carregarEventosInscritos = async () => {
    try {
      const { data: ins } = await supabase
        .from('inscricoes')
        .select('evento_id')
        .eq('usuario_id', perfil.id);
      const ids = ins.map(i => i.evento_id);
      if (!ids.length) return setEventos([]);
      const { data: evts } = await supabase
        .from('eventos')
        .select('*')
        .in('id', ids);
      setEventos(evts);
    } catch (err) {
      console.error('Erro ao carregar eventos:', err);
      setEventos([]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps='handled'>
      <Card style={styles.card}>
        <Card.Content style={styles.center}>
          <Image source={{ uri: novaFoto }} style={styles.avatar} />
          <Text>Nome: {perfil?.nome}</Text>
          <Text>E-mail: {perfil?.email}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title='Editar Perfil' />
        <Card.Content>
          <TextInput label='Nome' value={nome} onChangeText={setNome} style={styles.input} />
          <TextInput label='E-mail' value={email} onChangeText={setEmail} keyboardType='email-address' autoCapitalize='none' style={styles.input} />
          <TextInput label='Nova Senha' value={novaSenha} onChangeText={setNovaSenha} secureTextEntry style={styles.input} />
          <TextInput label='Confirme Senha' value={confirmSenha} onChangeText={setConfirmSenha} secureTextEntry style={styles.input} />
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.previewImage} />}
          <Button mode='outlined' onPress={escolherImagem} style={styles.button}>Selecionar Foto</Button>
          <Button mode='contained' onPress={confirmarAlteracoes}>Salvar Alterações</Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title='Eventos Inscritos' />
        <Card.Content>
          {eventos.length === 0 ? <Text>Nenhum evento inscrito.</Text> : eventos.map(evt => (
            <View key={evt.id} style={styles.eventoItem}>
              <Text style={styles.eventoTitulo}>{evt.nome}</Text>
              <Text>{format(new Date(evt.data), 'dd/MM/yyyy')}</Text>
              <Text>{evt.local}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 20 },
  center: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  input: { marginBottom: 12 },
  previewImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 12 },
  button: { marginBottom: 12 },
  eventoItem: { marginBottom: 10, padding: 8, backgroundColor: '#f2f2f2', borderRadius: 4 },
  eventoTitulo: { fontWeight: 'bold' },
});
