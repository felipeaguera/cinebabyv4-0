import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Search, LogOut, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PacienteForm from '@/components/PacienteForm';

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
  clinica_id: string;
}

interface ClinicaDashboardProps {
  clinicaId?: string; // Para quando admin acessa pacientes de uma clínica específica
}

const ClinicaDashboard = ({ clinicaId }: ClinicaDashboardProps) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clinicaInfo, setClinicaInfo] = useState<any>(null);
  const { toast } = useToast();
  const { isAdmin, clinicaData } = useAuth();
  const navigate = useNavigate();

  // Determinar qual clínica usar (própria ou especificada pelo admin)
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

  const handleLogout = async () => {
    try {
      // Limpar dados da clínica do localStorage
      localStorage.removeItem('clinicaLogada');
      
      // Fazer logout do Supabase
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

  useEffect(() => {
    fetchPacientes();
  }, [currentClinicaId]);

  if (!currentClinicaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5 flex items-center justify-center">
        <div className="text-red-500">Erro: Clínica não identificada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/11c646c5-83c3-4ae9-b5ca-83145f51532d.png" 
                alt="CineBaby Logo" 
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-3xl font-bold text-cinebaby-purple">
                  Pacientes da {currentClinicaName}
                  {isAdmin && clinicaId && (
                    <span className="text-sm font-normal text-gray-500 ml-2">(Visualização Admin)</span>
                  )}
                </h1>
                <p className="text-gray-600">Gerencie suas pacientes e seus ultrassons</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && clinicaId && (
                <Button
                  onClick={handleBackToAdmin}
                  variant="outline"
                  className="border-cinebaby-turquoise text-cinebaby-turquoise hover:bg-cinebaby-turquoise hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Admin
                </Button>
              )}
              {!isAdmin && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-cinebaby-purple text-cinebaby-purple hover:bg-cinebaby-purple hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-l-4 border-cinebaby-purple shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Pacientes
              </CardTitle>
              <Users className="h-4 w-4 text-cinebaby-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cinebaby-purple">{pacientes.length}</div>
              <p className="text-xs text-gray-500">
                Gestantes cadastradas
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-cinebaby-turquoise shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pacientes Hoje
              </CardTitle>
              <Users className="h-4 w-4 text-cinebaby-turquoise" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cinebaby-turquoise">
                {pacientes.filter(p => {
                  const today = new Date().toDateString();
                  const pacienteDate = new Date(p.created_at).toDateString();
                  return today === pacienteDate;
                }).length}
              </div>
              <p className="text-xs text-gray-500">
                Cadastradas hoje
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="text-xl text-cinebaby-purple">
                Lista de Pacientes
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-cinebaby-purple hover:bg-cinebaby-purple/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Paciente
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Carregando pacientes...</div>
              </div>
            ) : filteredPacientes.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'Nenhuma paciente encontrada.' : 'Nenhuma paciente cadastrada ainda.'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-cinebaby-purple hover:bg-cinebaby-purple/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Primeira Paciente
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPacientes.map((paciente) => (
                    <TableRow key={paciente.id}>
                      <TableCell className="font-medium">
                        <Button
                          variant="link"
                          className="p-0 h-auto font-medium text-cinebaby-purple hover:text-cinebaby-purple/80"
                          onClick={() => handlePacienteClick(paciente.id)}
                        >
                          {paciente.nome}
                        </Button>
                      </TableCell>
                      <TableCell>{paciente.telefone}</TableCell>
                      <TableCell>
                        {new Date(paciente.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="bg-red-500 hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a paciente "{paciente.nome}"? 
                                Essa ação não poderá ser desfeita e todos os vídeos relacionados também serão excluídos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePaciente(paciente.id, paciente.nome)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PacienteForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchPacientes}
        clinicaId={currentClinicaId}
      />
    </div>
  );
};

export default ClinicaDashboard;
