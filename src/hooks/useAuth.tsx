
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ClinicaData {
  id: string;
  nome: string;
  email: string;
  cidade: string;
  endereco: string;
  telefone: string;
}

export const useAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [clinicaData, setClinicaData] = useState<ClinicaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const currentPath = window.location.pathname;
      
      // Verificar se há dados de clínica logada
      const clinicaLogada = localStorage.getItem('clinicaLogada');
      
      if (clinicaLogada) {
        try {
          const parsedClinica = JSON.parse(clinicaLogada);
          setClinicaData(parsedClinica);
          setIsAdmin(false);
          
          // Se tentar acessar área admin, redirecionar para clínica
          if (currentPath.startsWith('/admin')) {
            navigate('/clinica/dashboard');
            return;
          }
        } catch (error) {
          console.error('Erro ao parse dos dados da clínica:', error);
          localStorage.removeItem('clinicaLogada');
          navigate('/');
          return;
        }
      }
      
      // Verificar acesso admin (simples check - poderia ser melhorado)
      if (currentPath.startsWith('/admin')) {
        // Para esta implementação simples, assumimos que se não há clínica logada
        // e está tentando acessar admin, é um admin
        setIsAdmin(true);
        setClinicaData(null);
      }
      
      // Se não há autenticação e está tentando acessar área protegida
      if (!clinicaLogada && (currentPath.startsWith('/admin') || currentPath.startsWith('/clinica'))) {
        if (currentPath !== '/') {
          navigate('/');
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('clinicaLogada');
    setClinicaData(null);
    setIsAdmin(false);
    navigate('/');
  };

  return {
    isAdmin,
    clinicaData,
    isLoading,
    logout
  };
};
