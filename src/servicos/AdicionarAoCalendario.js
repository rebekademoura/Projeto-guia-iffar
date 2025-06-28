import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

// 1. Pega ou cria um calendário local do aparelho
async function getLocalCalendarId() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

  // tenta encontrar um calendário local já existente
  const localCal = calendars.find(cal =>
    cal.source?.isLocalAccount === true
  );
  if (localCal) return localCal.id;

  // se não existir, cria um novo calendário local
  if (Platform.OS === 'android') {
    return Calendar.createCalendarAsync({
      title: 'Calendário Local',
      name: 'calendario_local',            // identificador interno
      color: '#2196F3',
      entityType: Calendar.EntityTypes.EVENT,
      source: { isLocalAccount: true, name: 'Calendário Local' },
      accessLevel: Calendar.CalendarAccessLevel.OWNER,
      ownerAccount: 'local'                // pode ser qualquer string
    });
  } else {
    // no iOS precisamos do sourceId original, mas forçamos isLocalAccount
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return Calendar.createCalendarAsync({
      title: 'Calendário Local',
      name: 'calendario_local',
      color: '#2196F3',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCal.source.id,
      source: { ...defaultCal.source, isLocalAccount: true, name: 'Calendário Local' },
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    });
  }
}

// 2. Função que adiciona o evento a esse calendário local
export async function adicionarAoCalendario({ titulo, descricao, local, inicio, fim }) {
  if (Platform.OS === 'web') return;

  // pede permissão
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão', 'Permita acesso ao calendário para adicionar o evento.');
    return;
  }

  try {
    // obtém (ou cria) o calendário local
    const calendarId = await getLocalCalendarId();

    // cria o evento nele
    await Calendar.createEventAsync(calendarId, {
      title:     titulo,
      notes:     descricao,
      location:  local,
      startDate: new Date(inicio),
      endDate:   new Date(fim),
      timeZone:  'America/Sao_Paulo',
    });

    Alert.alert('Sucesso', 'Evento adicionado ao calendário local do seu telefone.');
  } catch (err) {
    console.error('Erro ao adicionar ao calendário:', err);
    Alert.alert('Erro', `Não foi possível adicionar ao calendário: ${err.message}`);
  }
}
