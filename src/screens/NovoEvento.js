import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { supabase } from '../config/supabase';
import { useNavigation } from '@react-navigation/native';
import { useUsuario } from '../contexto/UsuarioContexto';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer'; // npm install buffer

export default function NovoEvento() {
  /* ───────────────── campos do formulário ───────────────── */
  const [nome,       setNome]       = useState('');
  const [dataTime,   setDataTime]   = useState('');
  const [local,      setLocal]      = useState('');
  const [descricao,  setDescricao]  = useState('');
  const [totalVagas, setTotalVagas] = useState('');

  /* localização */
  const [latitude,   setLatitude]   = useState('');
  const [longitude,  setLongitude]  = useState('');
  const [pegandoLoc, setPegandoLoc] = useState(false);

  /* imagens */
  const [fotos,          setFotos]          = useState([]);
  const [carregandoFoto, setCarregandoFoto] = useState(false);

  /* flags gerais */
  const [carregando, setCarregando] = useState(false);

  const navigation = useNavigation();
  const { perfil } = useUsuario();

  /* ───────────────── localização ───────────────── */
  const pegarLocalAtual = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão negada', 'Não foi possível acessar a localização.');
    }
    try {
      setPegandoLoc(true);
      const { coords } = await Location.getCurrentPositionAsync({});
      setLatitude(coords.latitude.toString());
      setLongitude(coords.longitude.toString());
    } catch {
      Alert.alert('Erro', 'Falha ao obter localização.');
    } finally {
      setPegandoLoc(false);
    }
  };

  /* ───────────────── upload imagem ───────────────── */
  const uploadImagem = async (uri) => {
    setCarregandoFoto(true);
    try {
      let dataToUpload, contentType;

      if (Platform.OS === 'web') {
        const resp = await fetch(uri);
        const blob = await resp.blob();
        dataToUpload = blob;
        contentType = blob.type;
      } else {
        const b64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        dataToUpload = Buffer.from(b64, 'base64');
        contentType = 'image/jpeg';
      }

      const fileName = `evento_${Date.now()}.jpg`;
      const { error: upErr } = await supabase
        .storage
        .from('imagem')
        .upload(fileName, dataToUpload, {
          contentType,
          cacheControl: '3600',
          upsert: false,
        });
      if (upErr) throw upErr;

      const { data: { publicUrl }, error: urlErr } = supabase
        .storage
        .from('imagem')
        .getPublicUrl(fileName);
      if (urlErr) throw urlErr;

      return publicUrl;
    } catch (err) {
      Alert.alert('Erro ao enviar imagem', err.message);
      return null;
    } finally {
      setCarregandoFoto(false);
    }
  };

  /* ───────────────── pickers imagem ───────────────── */
  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão da câmera negada');
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true });
    if (!res.canceled) setFotos(p => [...p, res.assets[0].uri]);
  };

  const escolherDaGaleria = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permissão negada');
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setFotos(p => [...p, ...uris]);
    }
  };

  const selecionarImagem = () =>
    Alert.alert('Adicionar Imagem', 'Escolha a origem:', [
      { text: 'Câmera',  onPress: tirarFoto },
      { text: 'Galeria', onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  /* ───────────────── submit ───────────────── */
  const salvarEvento = async () => {
    // validações iniciais
    if (!nome || !dataTime || !local || !descricao || !totalVagas || !latitude || !longitude) {
      return Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
    }
    const vagasInt = parseInt(totalVagas, 10);
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(vagasInt) || vagasInt <= 0) return Alert.alert('Total de vagas inválido');
    if (isNaN(lat) || isNaN(lon))     return Alert.alert('Latitude/Longitude inválidas');

    // valida e formata data
    let isoString;
    const entrada = dataTime.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(entrada)) {
      isoString = `${entrada}T00:00:00`;
    } else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}$/.test(entrada)) {
      const t = entrada.replace(' ', 'T');
      isoString = `${t}:00`;
    } else {
      return Alert.alert(
        'Data inválida',
        'Use um destes formatos:\n' +
        '• 2025-07-15\n' +
        '• 2025-07-15 14:30\n' +
        '• 2025-07-15T14:30'
      );
    }
    const dataEvento = new Date(isoString);
    if (isNaN(dataEvento.getTime())) {
      return Alert.alert('Data inválida', 'Não foi possível interpretar essa data.');
    }

    setCarregando(true);
    try {
      // INSERT + SELECT + SINGLE para obter evento.id
      const { data: evento, error: evErr } = await supabase
        .from('eventos')
        .insert([{
          nome,
          data: dataEvento.toISOString(),
          local,
          descricao,
          inscricao: true,
          total_vagas: vagasInt,
          vagas_disponiveis: vagasInt,
          latitude: lat,
          longitude: lon,
        }])
        .select()
        .single();

      if (evErr || !evento?.id) {
        throw evErr || new Error('Não foi possível criar o evento');
      }

      // upload e gravação das imagens
      for (const uri of fotos) {
        const url = await uploadImagem(uri);
        if (url) {
          const { error: imgErr } = await supabase
            .from('imagem')
            .insert([{ evento_id: evento.id, usuario_id: perfil.id, url_imagem: url }]);
          if (imgErr) console.warn('Falha ao salvar imagem:', imgErr);
        }
      }

      Alert.alert('Sucesso', 'Evento cadastrado!');
      navigation.navigate('Eventos');
    } catch (err) {
      console.error('❌ ERRO salvarEvento', err);
      Alert.alert('Falha', err.message || 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  // bloqueio para não-admin
  if (!perfil || perfil.tipo !== 'admin') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          Usuário sem permissão
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Voltar
        </Button>
      </ScrollView>
    );
  }

  // UI
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Cadastrar novo evento
      </Text>

      <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput
        label="Data (AAAA-MM-DD HH:MM)"
        value={dataTime}
        onChangeText={setDataTime}
        style={styles.input}
      />
      <TextInput label="Local" value={local} onChangeText={setLocal} style={styles.input} />
      <TextInput label="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
      <TextInput
        label="Total de vagas"
        value={totalVagas}
        onChangeText={setTotalVagas}
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        style={styles.input}
        keyboardType="numeric"
      />
      <TextInput
        label="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        style={styles.input}
        keyboardType="numeric"
      />

      <Button mode="outlined" onPress={pegarLocalAtual} loading={pegandoLoc}>
        Usar minha localização
      </Button>

      <Button mode="outlined" onPress={selecionarImagem} style={{ marginTop: 20 }}>
        Adicionar imagens
      </Button>

      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            const uris = [...e.target.files].map(f => URL.createObjectURL(f));
            setFotos(p => [...p, ...uris]);
          }}
          style={{ marginTop: 10 }}
        />
      )}

      {fotos.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {fotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.preview} />
          ))}
        </View>
      )}

      <Button mode="contained" onPress={salvarEvento} loading={carregando} style={{ marginTop: 20 }}>
        Cadastrar Evento
      </Button>

      <Button icon="arrow-left" mode="text" onPress={() => navigation.goBack()} style={{ marginTop: 8 }}>
        Voltar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input:     { marginBottom: 12 },
  preview:   { width: 200, height: 200, borderRadius: 10, marginBottom: 10 },
});
