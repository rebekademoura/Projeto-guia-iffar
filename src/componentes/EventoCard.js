import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import { Badge, Card, Text } from "react-native-paper";
import { useTheme } from "react-native-paper";


export default function EventoCard({titulo, data, local, inscricao}){

    const theme = useTheme();

    const corBadge = inscricao === "aberta"?theme.colors.primary:"tomato";    
    const textBadge = inscricao === "aberta"?"Inscrições abertas":"Inscrições encerradas";



    return(
            <Card style={styles.card} mode="outlined">
                <Card.Content>
                    <View style={styles.header}>
                        <Text variant="titleMedium"> {titulo} </Text>
                        <Badge
                            style={[styles.badge, {backgroundColor:corBadge}]}
                            variant="bodyMedium">{textBadge}
                        </Badge>
                    </View>
                        <Text variant="bodyMedium"> Local: {local} </Text>
                        <Text variant="bodyMedium"> Data: {data} </Text>
                </Card.Content>
            </Card>  
    )
}

const styles = StyleSheet.create({
    card:{
        marginBottom: 15
    },

    header:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },

    badge:{
        color: '#fff',
        paddingHorizontal: 10,
        fontSize:12
    }




})