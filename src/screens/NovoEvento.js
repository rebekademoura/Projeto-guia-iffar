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

export default function NovoEvento() {
  /* ───────────────── campos do formulário ───────────────── */
  const [nome,          setNome]          = useState('');
  const [dataTime,      setDataTime]      = useState(''); 
  const [local,         setLocal]         = useState('');
  const [descricao,     setDescricao]     = useState('');
  const [totalVagas,    setTotalVagas]    = useState('');

  /* localização */
  const [latitude,      setLatitude]      = useState('');
  const [longitude,     setLongitude]     = useState('');
  const [pegandoLoc,    setPegandoLoc]    = useState(false);

  /* imagens */
  const [fotos,         setFotos]         = useState([]);
  const [carregandoFoto,setCarregandoFoto]= useState(false);

  /* flags gerais */
  const [carregando,    setCarregando]    = useState(false);

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
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Falha ao obter localização.');
    } finally {
      setPegandoLoc(false);
    }
  };

  /* ───────────────── upload imagem ───────────────── */
  const uploadImagem = async (uri) => {
    try {
      setCarregandoFoto(true);
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const nome = `evento_${Date.now()}.jpg`;
      const { error } = await supabase.storage.from('imagem').upload(nome, blob);
      if (error) {
        Alert.alert('Erro ao enviar imagem', error.message);
        return null;
      }
      const { data } = supabase.storage.from('imagem').getPublicUrl(nome);
      return data?.publicUrl ?? null;
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
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.7 });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setFotos(p => [...p, ...uris]);
    }
  };

  const selecionarImagem = () =>
    Alert.alert('Adicionar Imagem', 'Escolha a origem:', [
      { text: 'Câmera',   onPress: tirarFoto },
      { text: 'Galeria',  onPress: escolherDaGaleria },
      { text: 'Cancelar', style: 'cancel' },
    ]);

  /* ───────────────── submit ───────────────── */
  const salvarEvento = async () => {
    console.log('▶ salvarEvento');
    if (!nome || !dataTime || !local || !descricao || !totalVagas ||
        !latitude || !longitude) {
      return Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
    }

    const vagasInt = parseInt(totalVagas, 10);
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (Number.isNaN(vagasInt) || vagasInt <= 0) return Alert.alert('Total de vagas inválido');
    if (Number.isNaN(lat) || Number.isNaN(lon))   return Alert.alert('Latitude/Longitude inválidas');

    /* parsing robusto de data */
    let isoString = '';
    const entrada = dataTime.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(entrada)) {
      isoString = `${entrada}T00:00:00`;
    } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(entrada)) {
      const [d, t] = entrada.split(' ');
      isoString = `${d}T${t}:00`;
    } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(entrada)) {
      isoString = `${entrada}:00`;
    } else {
      return Alert.alert('Data inválida', 'Use formatos:\nAAAA-MM-DD\nAAAA-MM-DD HH:MM\nAAAA-MM-DDTHH:MM');
    }

    const dataEvento = new Date(isoString);
    if (Number.isNaN(dataEvento.getTime()))
      return Alert.alert('Data inválida', 'Não foi possível interpretar a data.');

    setCarregando(true);

    try {
      /* INSERT evento */
      const { data: evento } = await supabase
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
        }], { returning: 'representation' })
        .throwOnError()
        .single();

      console.log('✅ Evento inserido', evento);

      /* upload imagens */
      for (const uri of fotos) {
        const url = await uploadImagem(uri);
        if (url) {
          await supabase.from('imagem')
            .insert([{ evento_id: evento.id, usuario_id: perfil.id, url_imagem: url }])
            .throwOnError();
          console.log('   ↳ imagem salva', url);
        }
      }

      Alert.alert('Sucesso', 'Evento cadastrado!');
      navigation.navigate('Eventos');
    } catch (err) {
      console.error('❌ ERRO salvarEvento', err);
      Alert.alert('Falha', err?.message || 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  /* ───────────────── bloqueio não-admin ───────────────── */
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

  /* ───────────────── UI ───────────────── */
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Cadastrar novo evento
      </Text>

      <TextInput label="Nome" value={nome} onChangeText={setNome} style={styles.input} />
      <TextInput label="Data (AAAA-MM-DD HH:MM)" value={dataTime} onChangeText={setDataTime} style={styles.input} />
      <TextInput label="Local" value={local} onChangeText={setLocal} style={styles.input} />
      <TextInput label="Descrição" value={descricao} onChangeText={setDescricao} style={styles.input} />
      <TextInput label="Total de vagas" value={totalVagas} onChangeText={setTotalVagas} style={styles.input} keyboardType="numeric" />

      {/* localização */}
      <TextInput label="Latitude" value={latitude} onChangeText={setLatitude} style={styles.input} keyboardType="numeric" />
      <TextInput label="Longitude" value={longitude} onChangeText={setLongitude} style={styles.input} keyboardType="numeric" />
      <Button mode="outlined" onPress={pegarLocalAtual} loading={pegandoLoc}>
        Usar minha localização
      </Button>

      {/* imagens */}
      <Button mode="outlined" onPress={selecionarImagem} style={{ marginTop: 20 }}>
        Adicionar imagens
      </Button>

      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => {
            const novos = [...e.target.files].map(f => URL.createObjectURL(f));
            setFotos(p => [...p, ...novos]);
          }}
          style={{ marginTop: 10 }}
        />
      )}

      {fotos.length > 0 && (
        <View style={{ marginTop: 10 }}>
          {fotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 10 }} />
          ))}
        </View>
      )}

      <Button mode="contained" onPress={salvarEvento} loading={carregando}>
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
});
