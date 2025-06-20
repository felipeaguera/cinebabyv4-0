
import React from 'react';
import { Building2, Users, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
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
              <div className="text-2xl font-bold text-cinebaby-purple">0</div>
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
            <CardTitle className="text-xl text-cinebaby-purple">
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Bem-vindo ao painel administrativo do CineBaby! Em breve você poderá:
            </p>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cinebaby-purple rounded-full"></div>
                <span>Cadastrar e gerenciar clínicas parceiras</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cinebaby-turquoise rounded-full"></div>
                <span>Acompanhar estatísticas da plataforma</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Monitorar o crescimento de momentos especiais compartilhados</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
