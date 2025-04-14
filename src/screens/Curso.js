import { Button, Text } from "react-native-paper";
import { ScrollView, StyleSheet} from "react-native";
import CursoCard from "../componentes/CursoCard";
import { LinearGradient } from "expo-linear-gradient";


const cursos_db = [
    {   nome: "Sistemas para Internet", 
        modalidade: "Superior",
        nivel: "Superior", 
        unidade:" IFFar - Campus Panambi",
        duracao:"3 anos",
        turno: "Noturno",
        descricao:"Descrição do curso..."
    }
]


export default function Cursos({navigation}){

    return(
        <LinearGradient
            colors={['#DFF5EB', '#FFFFFF']}
            style={{flex:1}}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>
                    Lista de Cursos
                </Text>

                {cursos_db.map((curso, index) => (
                    <CursoCard key={index} {...curso} OnPress={()=>navigation.navigate('DetalheCurso', curso)} />
                )) }
            </ScrollView>
        </LinearGradient>
    )
}


// CSS, visual da aplicação
const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:20
    },
    title:{
        fontSize: 24,
        marginBottom: 30,
        textAlign: 'center',
        paddingTop: 1
    },
    button:{
        marginVertical: 10
    }
})
