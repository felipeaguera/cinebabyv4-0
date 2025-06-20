
import React from 'react';
import { useParams } from 'react-router-dom';
import ClinicaDashboard from '@/pages/ClinicaDashboard';

const AdminClinicaPacientes = () => {
  const { clinicaId } = useParams<{ clinicaId: string }>();

  if (!clinicaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cinebaby-purple/5 via-white to-cinebaby-turquoise/5 flex items-center justify-center">
        <div className="text-red-500">ID da clínica não encontrado</div>
      </div>
    );
  }

  return <ClinicaDashboard clinicaId={clinicaId} />;
};

export default AdminClinicaPacientes;
