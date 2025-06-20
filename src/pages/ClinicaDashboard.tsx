
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Trash2, Search, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PacienteForm from '@/components/PacienteForm';

interface Paciente {
  id: string;
  nome: string;
  telefone: string;
  created_at: string;
}

interface Clinica {
  id: string;
  nome: string;
  cidade: string;
  endereco: string;
  telefone: string;
  email: string;
}

interface ClinicaDashboardProps {
  clinicaId?: string; // Para quando o admin acessa uma clínica específica
}

const ClinicaDashboard = ({ clinicaId }: ClinicaDashboardProps) => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([]);
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminAccess, setIsAdminAccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se é acesso do admin ou da própria clínica
    let currentClinicaId = clinicaId;
    
    if (!currentClinicaId) {
      const clinicaLogada = localStorage.getItem('clinicaLogada');
      if (clinicaLogada) {
        const clinicaData = JSON.parse(clinicaLogada);
        currentClinicaId = clinicaData.id;
        setClinica(clinicaData);
      } else {
        navigate('/clinica/login');
        return;
      }
    } else {
      setIsAdminAccess(true);
      fetchClinicaData(currentClinicaId);
    }

    if (currentClinicaId) {
      fetchPacientes(currentClinicaId);
    }
  }, [clinicaId, navigate]);

  useEffect(() => {
    filterPacientes();
  }, [searchTerm, pacientes]);

  const fetchClinicaData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('clinicas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setClinica(data);
    } catch (error) {
      console.error('Erro ao buscar dados da clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da clínica.",
        variant: "destructive",
      });
    }
  };

  const fetchPacientes = async (clinicaId: string) => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('clinica_id', clinicaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPacientes(data || []);
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

  const filterPacientes = () => {
    if (!searchTerm) {
      setFilteredPacientes(pacientes);
    } else {
      const filtered = pacientes.filter(paciente =>
        paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paciente.telefone.includes(searchTerm)
      );
      setFilteredPacientes(filtered);
    }
  };

  const handleDeletePaciente = async (id: string, nome: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Paciente "${nome}" excluída com sucesso.`,
      });

      if (clinica) {
        fetchPacientes(clinica.id);
      }
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir paciente. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('clinicaLogada');
    navigate('/clinica/login');
  };

  const handleBackToAdmin = () => {
    navigate('/admin/dashboard');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!clinica) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
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
                  Pacientes da Clínica {clinica.nome}
                </h1>
                <p className="text-gray-600">{clinica.cidade} - {clinica.telefone}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {isAdminAccess ? (
                <Button
                  onClick={handleBackToAdmin}
                  variant="outline"
                  className="border-cinebaby-purple text-cinebaby-purple hover:bg-cinebaby-purple hover:text-white"
                >
                  ← Voltar ao painel admin
                </Button>
              ) : (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <CardTitle className="text-xl text-cinebaby-purple">
                Lista de Pacientes
              </CardTitle>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                      <TableCell className="font-medium">{paciente.nome}</TableCell>
                      <TableCell>{paciente.telefone}</TableCell>
                      <TableCell>{formatDate(paciente.created_at)}</TableCell>
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
                                Essa ação não poderá ser desfeita e todos os vídeos relacionados também serão removidos.
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
        onSuccess={() => {
          if (clinica) {
            fetchPacientes(clinica.id);
          }
        }}
        clinicaId={clinica.id}
      />
    </div>
  );
};

export default ClinicaDashboard;
