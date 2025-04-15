import { Button, Text, TextInput } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useState } from "react";


export default function Login({ navigation }) {
    const [nome, setNome] = useState("");
    const [senha, setSenha] = useState("");

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Bem-vindo(a) ao Guia Acadêmico IFFar Panambi
            </Text>

            <TextInput
                label="E-mail"
                value={nome}
                onChangeText={text => setNome(text)}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
            />

            <TextInput
                label="Senha"
                value={senha}
                onChangeText={text => setSenha(text)}
                style={styles.input}
                mode="outlined"
                secureTextEntry
            />

            <Button
                style={styles.button}
                mode="contained"
                onPress={() => {
                    // Aqui você pode adicionar a lógica de login
                    navigation.navigate('Home');
                }}
            >
                Entrar
            </Button>

            <Button
                style={styles.button}
                mode="outlined"
                onPress={() => {
                    // Navegar para uma tela de cadastro, por exemplo
                    navigation.navigate('Cadastro');
                }}
            >
                Criar conta
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginVertical: 10,
    }
});
