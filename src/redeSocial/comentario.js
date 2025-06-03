// components/ModalComentario.js
import React, { useState } from 'react';
import { Modal, Portal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export default function ModalComentario() {
  const [visivel, setVisivel] = useState(false);
  const [texto, setTexto] = useState('');

  const abrir = () => setVisivel(true);
  const fechar = () => {
    setTexto('');
    setVisivel(false);
  };

  const enviar = () => {
    console.log('Comentário:', texto);
    alert('Comentário enviado!');
    fechar();
  };

  return (
    <>
      <IconButton icon="comment-outline" size={24} onPress={abrir} />

      <Portal>
        <Modal visible={visivel} onDismiss={fechar} contentContainerStyle={styles.modal}>
          <Text variant="titleMedium">Comentar evento</Text>
          <TextInput
            label="Digite seu comentário"
            value={texto}
            onChangeText={setTexto}
            multiline
            mode="outlined"
            style={{ marginVertical: 10 }}
          />
          <Button mode="contained" onPress={enviar}>
            Comentar
          </Button>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
});
