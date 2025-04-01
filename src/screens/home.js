import { Button, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";
 

export default function Home({navigation}){

    return(
        <View style={styles.container}>
            <Text style={styles.text}>
                Guia acadêmico IFFar Panambi
            </Text>
            <Button style={styles.button} mode="contained" onPress={()=>navigation.navigate('Curso')}>
                Ver Cursos
            </Button>
            <Button style={styles.button} mode="contained" onPress={()=>navigation.navigate('Evento')}> 
                Ver Eventos
            </Button>
            <Button style={styles.button} mode="outlined" onPress={()=>navigation.navigate('Sobre')}> 
                Sobre o app
            </Button>
        </View>
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
