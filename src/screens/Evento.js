import { Button, Text } from "react-native-paper";
import { ScrollView, StyleSheet} from "react-native";
import EventoCard from "../componentes/EventoCard";

const eventos_db = [
    {titulo: "Semana Acadêmica - Sistemas para Internet", data: "12/07/2025", local: "Auditório"},
    {titulo: "Mostra Cultural", data: "03/05/2025", local: "C-18"}
]

export default function Evento(){

    return(
        <ScrollView contentContainerStylestyle={styles.container}>
            <Text style={styles.text}>
                Lista de Eventos
            </Text>
            
        {eventos_db.map((evento,index)=>(
            <EventoCard  key={index} {...evento}/>
        ))}

        </ScrollView>
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
