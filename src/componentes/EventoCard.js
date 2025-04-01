import { StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";

export default function EventoCard({titulo, data, local}){
    return(

        <Card style={styles.card} mode="outlined">
            <Card.Content>
                <Text variant="titleMedium"> {titulo} </Text>
                <Text variant="bodyMedium"> Data: {data} </Text>
                <Text variant="bodyMedium"> Local: {local} </Text>
            </Card.Content>
        </Card>

    )
}

const styles = StyleSheet.create({
    card:{
        marginBottom: 15
    }
})