import { Button, Text } from "react-native-paper";
import { ScrollView, StyleSheet} from "react-native";
import CursoCard from "../componentes/CursoCard";


const cursos_db = [
    {nome: "Sistemas para Internet", modalidade: "Superior", turno: "Noturno"},
    {nome: "Técnico em Informática", modalidade: "Técnico/Médio", turno: "Diurno"}
]


export default function Cursos({navigation}){

    return(
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.text}>
                Lista de Cursos
            </Text>

            {cursos_db.map((curso, index) => (
                <CursoCard key={index} {...curso} />
            )) }
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
