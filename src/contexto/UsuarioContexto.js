import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from '../config/supabase';

const UsuarioContext = createContext();

export const UsuarioProvider = ({ children }) => {
  const [Usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [eventosInscritos, setEventosInscritos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const user = session.user;
        setUsuario(user);
        setUserEmail(user.email);

        setPerfil({
          id: user.id,
          nome: user.user_metadata?.name || '',
          email: user.email,
          foto_usuario: user.user_metadata?.avatar_url || null,
        });

        atualizarEventosInscritos(user.id);
      }
      setCarregando(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const user = session.user;
          setUsuario(user);
          setUserEmail(user.email);

          setPerfil(prev => ({
            ...prev,
            id: user.id,
            email: user.email
          }));

          atualizarEventosInscritos(user.id);
        } else {
          setUsuario(null);
          setUserEmail(null);
          setPerfil(null);
          setEventosInscritos([]);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
    setUserEmail(null);
    setPerfil(null);
    setEventosInscritos([]);
  };

  const atualizarEventosInscritos = async (usuarioId) => {
    const { data, error } = await supabase
      .from('inscricoes')
      .select('evento_id, status')
      .eq('usuario_id', usuarioId);

    if (!error) {
      setEventosInscritos(data);
    } else {
      console.error('Erro ao carregar eventos inscritos:', error.message);
    }
  };

  return (
    <UsuarioContext.Provider
      value={{
        Usuario,
        setUsuario,
        perfil,
        setPerfil,
        userEmail,               
        carregando,
        setCarregando,
        logout,
        eventosInscritos,
        atualizarEventosInscritos
      }}
    >
      {children}
    </UsuarioContext.Provider>
  );
};

export const useUsuario = () => useContext(UsuarioContext);
export const useEventos = () => useContext(UsuarioContext);
