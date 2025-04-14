import { Button, Text, TextInput } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useState } from "react";

export default function Cadastro({ navigation }) {
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    const handleCadastro = () => {
        // Aqui pode entrar a lógica de validação ou envio para API
        if (senha !== confirmarSenha) {
            alert("As senhas não coincidem!");
            return;
        }

        // Exemplo de redirecionamento após cadastro
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Criar Conta
            </Text>

            <TextInput
                label="Nome completo"
                value={nome}
                onChangeText={text => setNome(text)}
                style={styles.input}
                mode="outlined"
            />

            <TextInput
                label="E-mail"
                value={email}
                onChangeText={text => setEmail(text)}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
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

            <TextInput
                label="Confirmar Senha"
                value={confirmarSenha}
                onChangeText={text => setConfirmarSenha(text)}
                style={styles.input}
                mode="outlined"
                secureTextEntry
            />

            <Button
                style={styles.button}
                mode="contained"
                onPress={handleCadastro}
            >
                Cadastrar
            </Button>

            <Button
                style={styles.button}
                mode="outlined"
                onPress={() => navigation.navigate('Login')}
            >
                Já tenho uma conta
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
