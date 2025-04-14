import { Button, Text } from "react-native-paper";
import { ScrollView, StyleSheet} from "react-native";
import EventoCard from "../componentes/EventoCard";
import { LinearGradient } from "expo-linear-gradient";


const eventos_db = [
    {titulo: "Semana Acadêmica - Sistemas para Internet", data: "12/07/2025", local: "Auditório", inscricao: "aberta", descricao:'blablabla bleble'}
]

export default function Evento(){

    return(
        <LinearGradient
            colors={['#DFF5EB', '#FFFFFF']}
            style={{flex:1}}
        >
            <ScrollView contentContainerStylestyle={styles.container}>
                <Text style={styles.title}>
                    Lista de Eventos
                </Text>
            
                {eventos_db.map((evento,index)=>(
                    <EventoCard  key={index} {...evento}/>
                ))}
            </ScrollView>
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
        textAlign: 'center',
        paddingTop:15
    },
    button:{
        marginVertical: 10
    }
})
