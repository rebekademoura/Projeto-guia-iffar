import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export default function CursoCard({nome, modalidade, turno}){
    return(

        <Card style={styles.card} mode="outlined">
            <Card.Content>
                <Text variant="titleMedium"> {nome} </Text>
                <Text variant="bodyMedium"> Modalidade: {modalidade} </Text>
                <Text variant="bodyMedium"> Turno: {turno} </Text>
            </Card.Content>
        </Card>

    )
}

const styles = StyleSheet.create({
    card:{
        marginBottom: 15
    }
})