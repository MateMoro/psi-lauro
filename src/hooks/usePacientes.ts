import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useHospital } from '@/contexts/HospitalContext';

export interface Paciente {
  id: number;
  nome: string | null;
  cns: string | null;
  data_nascimento: string | null;
  cid: string | null;
  cid_grupo: string | null;
  caps_referencia: string | null;
  genero: string | null;
  raca_cor: string | null;
  data_admissao: string | null;
  data_alta: string | null;
}

export interface PacienteEnriquecido extends Paciente {
  idade: number;
  numeroInternacoes: number;
  iniciais: string;
}

export function usePacientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const { getTableName, selectedHospital } = useHospital();

  const { data: pacientes = [], isLoading, error } = useQuery({
    queryKey: ['pacientes', selectedHospital],
    queryFn: async () => {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          nome,
          cns,
          data_nascimento,
          cid,
          cid_grupo,
          caps_referencia,
          genero,
          raca_cor,
          data_admissao,
          data_alta
        `)
        .order('nome');

      if (error) throw error;
      return data as Paciente[];
    }
  });

  // Buscar contagem de internações por paciente
  const { data: contagemInternacoes = {} } = useQuery({
    queryKey: ['contagem-internacoes', selectedHospital],
    queryFn: async () => {
      const tableName = getTableName();
      const { data, error } = await supabase
        .from(tableName)
        .select('nome')
        .not('nome', 'is', null);

      if (error) throw error;

      // Contar internações por nome (assumindo que mesmo nome = mesmo paciente)
      const contagem: Record<string, number> = {};
      data.forEach(item => {
        if (item.nome) {
          contagem[item.nome] = (contagem[item.nome] || 0) + 1;
        }
      });

      return contagem;
    }
  });

  // Processar dados dos pacientes
  const pacientesEnriquecidos = useMemo(() => {
    return pacientes.map(paciente => {
      // Calcular idade
      let idade = 0;
      if (paciente.data_nascimento) {
        const dataNasc = new Date(paciente.data_nascimento);
        const hoje = new Date();
        idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNasc = dataNasc.getMonth();
        if (mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < dataNasc.getDate())) {
          idade--;
        }
      }

      // Gerar iniciais
      const iniciais = paciente.nome
        ? paciente.nome
            .split(' ')
            .map(parte => parte.charAt(0).toUpperCase())
            .join('')
        : '';

      // Número de internações
      const numeroInternacoes = paciente.nome ? (contagemInternacoes[paciente.nome] || 1) : 1;

      return {
        ...paciente,
        idade,
        numeroInternacoes,
        iniciais
      } as PacienteEnriquecido;
    });
  }, [pacientes, contagemInternacoes]);

  // Filtrar pacientes baseado no termo de busca
  const pacientesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return pacientesEnriquecidos;

    const termo = searchTerm.toLowerCase().trim();

    return pacientesEnriquecidos.filter(paciente => {
      // Busca por nome completo
      const nomeMatch = paciente.nome?.toLowerCase().includes(termo);

      // Busca por iniciais
      const iniciaisMatch = paciente.iniciais.toLowerCase().includes(termo);

      // Busca por CNS
      const cnsMatch = paciente.cns?.includes(termo);

      return nomeMatch || iniciaisMatch || cnsMatch;
    });
  }, [pacientesEnriquecidos, searchTerm]);

  return {
    pacientes: pacientesFiltrados,
    searchTerm,
    setSearchTerm,
    isLoading,
    error
  };
}