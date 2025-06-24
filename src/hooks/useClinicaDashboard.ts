
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
  clinica_id: string;
}

interface ClinicaInfo {
  id: string;
  nome: string;
  email: string;
  cidade: string;
  endereco: string;
  telefone: string;
}

export const useClinicaDashboard = (clinicaId?: string) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null);
  const [clinicaInfo, setClinicaInfo] = useState<ClinicaInfo | null>(null);
  
  const { toast } = useToast();
  const { isAdmin, clinicaData } = useAuth();
  const navigate = useNavigate();

  const currentClinicaId = clinicaId || clinicaData?.id;
  const currentClinicaName = clinicaInfo?.nome || clinicaData?.nome || 'Clínica Selecionada';

  // Buscar informações da clínica quando admin acessa via ID
  useEffect(() => {
    const fetchClinicaInfo = async () => {
      if (clinicaId && isAdmin) {
        try {
          const { data, error } = await supabase
            .from('clinicas')
            .select('*')
            .eq('id', clinicaId)
            .single();

          if (error) throw error;
          setClinicaInfo(data);
        } catch (error) {
          console.error('Erro ao buscar dados da clínica:', error);
          toast({
            title: "Erro",
            description: "Erro ao carregar dados da clínica.",
            variant: "destructive",
          });
        }
      }
    };

    fetchClinicaInfo();
  }, [clinicaId, isAdmin]);

  const fetchPacientes = async () => {
    if (!currentClinicaId) return;
    
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('clinica_id', currentClinicaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPacientes(data || []);
      setFilteredPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pacientes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredPacientes(pacientes);
    } else {
      const filtered = pacientes.filter(paciente =>
        paciente.nome.toLowerCase().includes(term.toLowerCase()) ||
        paciente.telefone.includes(term)
      );
      setFilteredPacientes(filtered);
    }
  };

  const handleEditPaciente = (paciente: Paciente) => {
    setSelectedPaciente(paciente);
    setIsEditFormOpen(true);
  };

  const handleDeletePaciente = async (id: string, nome: string) => {
    try {
      // Primeiro, deletar todos os vídeos relacionados ao paciente
      const { error: videosError } = await supabase
        .from('videos')
        .delete()
        .eq('paciente_id', id);

      if (videosError) throw videosError;

      // Depois, deletar o paciente
      const { error: pacienteError } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (pacienteError) throw pacienteError;

      toast({
        title: "Sucesso!",
        description: `Paciente "${nome}" excluída com sucesso.`,
      });

      fetchPacientes();
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handlePacienteClick = (pacienteId: string) => {
    navigate(`/paciente/${pacienteId}/videos`);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('clinicaLogada');
      await supabase.auth.signOut();
      
      toast({
        title: "Sucesso!",
        description: "Você saiu com sucesso.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao sair da conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  useEffect(() => {
    fetchPacientes();
  }, [currentClinicaId]);

  return {
    // State
    pacientes,
    filteredPacientes,
    searchTerm,
    isLoading,
    isFormOpen,
    isEditFormOpen,
    selectedPaciente,
    currentClinicaId,
    currentClinicaName,
    isAdmin,
    clinicaId,
    
    // Actions
    setIsFormOpen,
    setIsEditFormOpen,
    handleSearch,
    handleEditPaciente,
    handleDeletePaciente,
    handlePacienteClick,
    handleLogout,
    handleBackToAdmin,
    fetchPacientes
  };
};
