
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface Paciente {
  id: string;
  nome: string;
  clinica_id: string;
}

interface Video {
  id: string;
  titulo: string | null;
  arquivo_url: string | null;
  created_at: string;
}

interface Clinica {
  nome: string;
}

const PacientePublic = () => {
  const { pacienteId } = useParams<{ pacienteId: string }>();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [clinica, setClinica] = useState<Clinica | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (!pacienteId) return;

    try {
      // Buscar dados da paciente
      const { data: pacienteData, error: pacienteError } = await supabase
        .from('pacientes')
        .select('*, clinicas(nome)')
        .eq('id', pacienteId)
        .single();

      if (pacienteError) throw pacienteError;
      
      setPaciente(pacienteData);
      setClinica({ nome: pacienteData.clinicas?.nome || 'Clínica' });

      // Buscar vídeos da paciente
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

      if (videosError) throw videosError;
      setVideos(videosData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pacienteId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5 flex items-center justify-center">
        <div className="text-red-500">Paciente não encontrada</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/11c646c5-83c3-4ae9-b5ca-83145f51532d.png" 
            alt="CineBaby Logo" 
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-cinebaby-purple mb-2">
            Momentos Especiais
          </h1>
          <h2 className="text-2xl text-gray-700 mb-2">
            {paciente.nome}
          </h2>
          <p className="text-gray-600">
            Clínica: {clinica?.nome}
          </p>
        </div>

        <div className="text-center mb-8 p-6 bg-white/50 rounded-lg">
          <Heart className="mx-auto h-12 w-12 text-pink-400 mb-4" />
          <p className="text-lg text-gray-700 italic">
            "Reviva esse momento mágico sempre que quiser. Ver seu bebê antes do nascimento 
            é um carinho que emociona para sempre."
          </p>
        </div>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Play className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                Ainda não há vídeos disponíveis para esta paciente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video, index) => (
              <Card key={video.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-cinebaby-purple">
                    {video.titulo || `Ultrassom ${index + 1}`}
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(video.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  {video.arquivo_url ? (
                    <div className="space-y-4">
                      <video 
                        controls 
                        className="w-full rounded-lg"
                        preload="metadata"
                      >
                        <source src={video.arquivo_url} type="video/mp4" />
                        Seu navegador não suporta vídeos.
                      </video>
                      <Button
                        onClick={() => window.open(video.arquivo_url!, '_blank')}
                        className="w-full bg-cinebaby-purple hover:bg-cinebaby-purple/90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Abrir em Tela Cheia
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Vídeo não disponível</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-12 text-gray-500">
          <p>Powered by CineBaby - Momentos que ficam para sempre</p>
        </div>
      </div>
    </div>
  );
};

export default PacientePublic;
