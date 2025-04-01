import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1C9B5E',       // verde principal
    secondary: '#C4112F',     // vermelho destaque
    background: '#F4F4F4',    // fundo leve cinza
    surface: '#FFFFFF',       // branco
    onSurface: '#000000',     // preto
    text: '#000000',          // preto
    outline: '#CCCCCC',
  },
};
