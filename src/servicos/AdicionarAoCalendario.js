import * as Calendar from 'expo-calendar';
import { Platform, Alert } from 'react-native';

async function getOrCreateCalendar() {
  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const defaultCalendar = calendars.find(cal => cal.title === 'Eventos do App');
  if (defaultCalendar) return defaultCalendar.id;

  if (Platform.OS === 'ios') {
    const defaultCal = await Calendar.getDefaultCalendarAsync();
    return Calendar.createCalendarAsync({
      title: 'Eventos do App',
      color: '#2196F3',
      entityType: Calendar.EntityTypes.EVENT,
      sourceId: defaultCal.source.id,
      source: defaultCal.source,
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    });
  } else {
    // NO ANDROID: NÃO PASSE sourceId, SÓ source!
    return Calendar.createCalendarAsync({
      title: 'Eventos do App',
      color: '#2196F3',
      entityType: Calendar.EntityTypes.EVENT,
      source: { isLocalAccount: true, name: 'Eventos do App' }, // name obrigatório!
      accessLevel: Calendar.CalendarAccessLevel.OWNER
    });
  }
}

export async function adicionarAoCalendario({
  titulo,
  descricao,
  local,
  inicio,
  fim
}) {
  if (Platform.OS === 'web') return;

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permissão', 'Permita acesso ao calendário para adicionar o evento.');
    return;
  }

  const calendarId = await getOrCreateCalendar();

  await Calendar.createEventAsync(calendarId, {
    title: titulo,
    notes: descricao,
    location: local,
    startDate: new Date(inicio),
    endDate: new Date(fim),
    timeZone: 'America/Sao_Paulo'
  });

  Alert.alert('Sucesso', 'Evento adicionado ao seu calendário!');
}
