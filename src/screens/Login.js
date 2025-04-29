import { Button, Text, TextInput } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { set } from "date-fns";
import { supabase } from "../config/supabase";



export default function Login({ navigation }) {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: senha,
        });
      
        if (error) {
          alert(error.message);
        } else {
          navigation.navigate('Home'); 
        }
      
        setLoading(false);
      }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Bem-vindo(a) ao Guia Acadêmico IFFar Panambi
            </Text>

            <TextInput
                label="E-mail"
                value={email}
                onChangeText={text => setEmail(text)}
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
                autoCapitalize="none"
            />

            <Button 
                style={styles.button}
                mode="outlined"
                title="Sign in"     
                onPress={() => signInWithEmail()} 
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
