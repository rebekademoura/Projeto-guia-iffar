import { createContext, useContext, useState } from "react";
import { supabase } from '../config/supabase';


const UsuarioContext = createContext();

export const UsuarioProvider = ({children}) => {

    
    const [Usuario, setUsuario] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [eventosInscritos, setEventosInscritos] = useState([]);

    const [carregando, setCarregando] = useState(true);

    const logout = async () => {
        await supabase.auth.signOut();
        setUsuario(null);
        setPerfil(null);
    }

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

export const useUsuario =() => useContext(UsuarioContext);
export const useEventos =() => useContext(UsuarioContext);