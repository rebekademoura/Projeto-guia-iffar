import { createContext, useContext, useState } from "react";
import { supabase } from '../config/supabase';


const UsuarioContext = createContext();

export const UsuarioProvider = ({children}) => {

    
    const [Usuario, setUsuario] = useState(null);
    const [perfil, setPerfil] = useState(null);

    const [carregando, setCarregando] = useState(true);

    const logout = async () => {
        await supabase.auth.signOut();
        setUsuario(null);
        setPerfil(null);
    }
    
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
            }}
        >
            {children}
        </UsuarioContext.Provider>
    );

};

export const useUsuario =() => useContext(UsuarioContext);