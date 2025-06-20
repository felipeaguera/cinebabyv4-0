
import React, { useState, useEffect } from 'react';
import { Building2, Users, Heart, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClinicaForm from '@/components/ClinicaForm';

interface Clinica {
  id: string;
  nome: string;
  cidade: string;
  endereco: string;
  telefone: string;
  email: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchClinicas = async () => {
    try {
      const { data, error } = await supabase
        .from('clinicas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClinicas(data || []);
    } catch (error) {
      console.error('Erro ao buscar clínicas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar clínicas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClinica = async (id: string, nome: string) => {
    try {
      const { error } = await supabase
        .from('clinicas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Clínica "${nome}" excluída com sucesso.`,
      });

      fetchClinicas();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir clínica. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClinicas();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <img 
              src="/lovable-uploads/11c646c5-83c3-4ae9-b5ca-83145f51532d.png" 
              alt="CineBaby Logo" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-cinebaby-purple">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">Gerencie as clínicas da plataforma CineBaby</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-l-4 border-cinebaby-purple shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Clínicas
              </CardTitle>
              <Building2 className="h-4 w-4 text-cinebaby-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cinebaby-purple">{clinicas.length}</div>
              <p className="text-xs text-gray-500">
                Clínicas cadastradas na plataforma
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-cinebaby-turquoise shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pacientes Totais
              </CardTitle>
              <Users className="h-4 w-4 text-cinebaby-turquoise" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cinebaby-turquoise">0</div>
              <p className="text-xs text-gray-500">
                Gestantes cadastradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-pink-400 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Momentos Especiais
              </CardTitle>
              <Heart className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-400">0</div>
              <p className="text-xs text-gray-500">
                Vídeos de ultrassom compartilhados
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-cinebaby-purple">
                Clínicas Cadastradas
              </CardTitle>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-cinebaby-purple hover:bg-cinebaby-purple/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Nova Clínica
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="text-gray-500">Carregando clínicas...</div>
              </div>
            ) : clinicas.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma clínica cadastrada ainda.</p>
                <Button
                  onClick={() => setIsFormOpen(true)}
                  className="bg-cinebaby-purple hover:bg-cinebaby-purple/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Clínica
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome da Clínica</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinicas.map((clinica) => (
                    <TableRow key={clinica.id}>
                      <TableCell className="font-medium">{clinica.nome}</TableCell>
                      <TableCell>{clinica.cidade}</TableCell>
                      <TableCell>{clinica.telefone}</TableCell>
                      <TableCell>{clinica.email}</TableCell>
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
                                Tem certeza que deseja excluir a clínica "{clinica.nome}"? 
                                Essa ação não poderá ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteClinica(clinica.id, clinica.nome)}
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

      <ClinicaForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchClinicas}
      />
    </div>
  );
};

export default AdminDashboard;
