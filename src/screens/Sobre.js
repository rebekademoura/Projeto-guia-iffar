import { Button, Text } from "react-native-paper";
import { Linking, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";


export default function Sobre(){

    return(
        <LinearGradient
            colors={['#DFF5EB', '#FFFFFF']}
            style={{flex:1}}
        >
            <View style={styles.container}>
                <Text style={styles.text}>
                    Sobre o App
                </Text>
                <Text>
                    Este aplicativo é um projeto acadêmico do curso
                    de Sistemas para Internet - Campus Panambi.
                </Text>
                <Button style={styles.button} mode="contained" onPress={()=>Linking.openURL('https://www.iffarroupilha.edu.br/panambi')}>
                    Acessar o site do IFFar
                </Button>
            </View>
        </LinearGradient>
    )
}

// CSS, visual da aplicação
const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent: 'center',
        padding:20
    },
    title:{
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center'
    },
    button:{
        marginVertical: 10
    }
})
