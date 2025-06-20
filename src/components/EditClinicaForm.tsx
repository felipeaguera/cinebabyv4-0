
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Clinica {
  id: string;
  nome: string;
  cidade: string;
  endereco: string;
  telefone: string;
  email: string;
  senha: string;
}

interface EditClinicaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clinica: Clinica | null;
}

const EditClinicaForm = ({ isOpen, onClose, onSuccess, clinica }: EditClinicaFormProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    cidade: '',
    telefone: '',
    email: '',
    senha: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (clinica) {
      setFormData({
        nome: clinica.nome,
        cidade: clinica.cidade,
        telefone: clinica.telefone,
        email: clinica.email,
        senha: clinica.senha
      });
    }
  }, [clinica]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinica) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('clinicas')
        .update({
          nome: formData.nome,
          cidade: formData.cidade,
          telefone: formData.telefone,
          email: formData.email,
          senha: formData.senha,
          updated_at: new Date().toISOString()
        })
        .eq('id', clinica.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Dados da clínica atualizados com sucesso.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados da clínica. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-cinebaby-purple">
            Editar Clínica
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Clínica</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Nome da clínica"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={formData.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              placeholder="Cidade"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="Telefone"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail/Login</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="E-mail"
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="text"
              value={formData.senha}
              onChange={(e) => handleInputChange('senha', e.target.value)}
              placeholder="Senha"
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-cinebaby-purple hover:bg-cinebaby-purple/90"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditClinicaForm;
