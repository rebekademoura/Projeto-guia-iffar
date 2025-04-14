import { ScrollView, StyleSheet } from "react-native";
import { Card, Divider, Text } from "react-native-paper";


export function DetalheCurso(route){

    const {
        nome,
        modalidade,
        nivel,
        unidade,
        duracao,
        turno,
        descricao
    } = route.params;
    return(

        <ScrollView style={style.container}>
            <Card mode="outlined" style={style.card}>
                <Card.Content>
                    <Text variant="titleLarge"> {nome} </Text>

                    <Divider styles={style.divisor}/>

                    <Text variant="titleMedium"> Modalidade: {modalidade} </Text>
                    <Text variant="titleMedium"> Nível: {nivel} </Text>
                    <Text variant="titleMedium"> Unidade: {unidade} </Text>
                    <Text variant="titleMedium"> Duração: {duracao} </Text>
                    <Text variant="titleMedium"> Turno: {turno} </Text>

                    <Divider styles={style.divisor}/>

                    <Text variant="titleSmall">Descrição</Text>
                    <Text variant="titleMedium">{descricao}</Text>
                
                </Card.Content>
            </Card>

        </ScrollView>


    );
}

const style = StyleSheet.create({
    container:{
        flex:1,
        padding:16
    },
    card:{
        marginBotton:15
    },
    divisor:{
        marginVertical:10
    }

})