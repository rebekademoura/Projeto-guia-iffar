import React, { useState } from "react";
import { View, StyleSheet, Alert, Image } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import { supabase } from "../config/supabase";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [imagemUri, setImagemUri] = useState(null);
  const navigation = useNavigation();

  const escolherImagem = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão negada para acessar a galeria.");
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setImagemUri(resultado.assets[0].uri);
    }
  };

  const uploadImagem = async (userId) => {
    if (!imagemUri) return null;
    try {
      const response = await fetch(imagemUri);
      const blob = await response.blob();
      const nomeArquivo = `foto_${userId}_${Date.now()}.jpg`.replace(
        /[^a-zA-Z0-9_.-]/g,
        ""
      );
      const { error: uploadError } = await supabase.storage
        .from("fotos-perfil")
        .upload(nomeArquivo, blob, { contentType: "image/jpeg" });
      if (uploadError) {
        Alert.alert("Erro ao enviar imagem", uploadError.message);
        return null;
      }
      const { data } = supabase.storage
        .from("fotos-perfil")
        .getPublicUrl(nomeArquivo);
      return data.publicUrl;
    } catch (error) {
      Alert.alert("Erro ao processar imagem", error.message);
      return null;
    }
  };

  const enviarEmailConfirmacao = async ({ to, nome }) => {
    const { data, error } = await supabase.functions.invoke(
      "sendSignupEmail",
      {
        body: JSON.stringify({ to, nome }),
      }
    );
    if (error) {
      console.warn("Erro ao enviar e-mail:", error);
    }
    return data;
  };

  const cadastrar = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Senha fraca", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setCarregando(true);
    // 1) Cria na Auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
    });
    if (authError) {
      Alert.alert("Erro no cadastro", authError.message);
      setCarregando(false);
      return;
    }
    const userId = authData.user?.id;
    if (!userId) {
      Alert.alert("Erro inesperado", "ID do usuário não retornado.");
      setCarregando(false);
      return;
    }

    // 2) Upload da foto
    const urlImagem = await uploadImagem(userId);

    // 3) Insere na tabela `usuarios`
    const { error: erroUsuario } = await supabase.from("usuarios").insert([
      {
        id: userId,
        nome,
        email,          // <— adiciona o campo email aqui
        tipo: "admin",
        foto_usuario: urlImagem,
      },
    ]);
    if (erroUsuario) {
      Alert.alert("Erro ao salvar usuário", erroUsuario.message);
      setCarregando(false);
      return;
    }

    // 4) Dispara e-mail de confirmação
    await enviarEmailConfirmacao({ to: email.trim(), nome });

    // 5) Feedback e redirecionamento
    Alert.alert(
      "Sucesso",
      "Conta criada com sucesso! Verifique seu e-mail para confirmação."
    );
    navigation.navigate("Login");
    setCarregando(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={{ marginBottom: 16 }}>
        Criar Conta
      </Text>
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
      <Button
        mode="outlined"
        onPress={escolherImagem}
        style={{ marginBottom: 10 }}
      >
        Selecionar Foto de Perfil
      </Button>
      {imagemUri && (
        <Image
          source={{ uri: imagemUri }}
          style={{
            width: 120,
            height: 120,
            alignSelf: "center",
            marginBottom: 12,
            borderRadius: 60,
          }}
        />
      )}
      <Button mode="contained" onPress={cadastrar} loading={carregando}>
        Cadastrar
      </Button>
      <Button
        onPress={() => navigation.navigate("Login")}
        style={{ marginTop: 8 }}
      >
        Já tenho conta
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1, justifyContent: "center" },
  input: { marginBottom: 16 },
});
