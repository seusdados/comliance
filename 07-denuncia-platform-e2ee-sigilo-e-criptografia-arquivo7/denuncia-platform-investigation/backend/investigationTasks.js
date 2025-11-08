/*
 * Este módulo define tarefas padrão para o fluxo completo de investigação de um caso
 * de denúncia, baseando-se nas orientações das normas ISO 37008 e 37002.
 * Cada tarefa contém um identificador único, título, descrição, data de vencimento,
 * status e responsável (pode ser definido posteriormente). As datas de vencimento
 * são calculadas a partir da data de criação da lista de tarefas, distribuindo
 * prazos de forma razoável para permitir que a equipe cumpra cada etapa de
 * maneira ordenada.  Os tempos propostos servem como referência; as equipes
 * podem ajustar as datas conforme sua realidade.
 */

const { v4: uuidv4 } = require('uuid');

/**
 * Gera um array de tarefas padrão para um caso em investigação. Os prazos são
 * definidos em dias corridos a partir da data de criação fornecida.
 * @param {Date} startDate Data de referência para cálculo dos vencimentos
 * @returns {Array<Object>} Lista de tarefas com campos: id, title, description, status, dueDate, assignedTo
 */
function generateInvestigationTasks(startDate = new Date()) {
  const base = new Date(startDate);
  /**
   * Helper para somar dias a uma data e retornar ISO string
   * @param {number} days
   */
  function addDays(days) {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }
  return [
    {
      id: uuidv4(),
      title: 'Avaliação preliminar',
      description: 'Realizar avaliação preliminar da alegação, analisando seriedade e credibilidade e definindo se uma investigação completa é necessária.',
      status: 'pendente',
      dueDate: addDays(3),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Determinar escopo da investigação',
      description: 'Definir objetivos e escopo da investigação com base na avaliação preliminar: identificar se há violação de políticas ou leis, determinar período, local e pessoas envolvidas.',
      status: 'pendente',
      dueDate: addDays(5),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Planejar investigação',
      description: 'Elaborar plano de investigação contendo cronograma, recursos necessários, lista de pessoas a serem entrevistadas, fontes de evidências e potenciais riscos.',
      status: 'pendente',
      dueDate: addDays(7),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Manter confidencialidade e emitir avisos',
      description: 'Controlar o fluxo de informações de acordo com a necessidade de conhecer e emitir avisos de advertência por escrito ou verbal sobre a confidencialidade.',
      status: 'pendente',
      dueDate: addDays(8),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Coletar e revisar documentos',
      description: 'Obter, preservar e analisar documentos e dados relevantes, envolvendo TI ou consultores externos para dados eletrônicos quando necessário.',
      status: 'pendente',
      dueDate: addDays(14),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Preparar entrevistas',
      description: 'Listar entrevistados, preparar perguntas e agendar entrevistas garantindo privacidade, cultura local e técnicas adequadas.',
      status: 'pendente',
      dueDate: addDays(16),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Conduzir entrevistas',
      description: 'Realizar entrevistas de forma respeitosa, com registro adequado e confirmação das declarações pelos entrevistados.',
      status: 'pendente',
      dueDate: addDays(20),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Elaborar relatório de investigação',
      description: 'Compilar resultados, evidências e limitações em relatório claro e factual; obter apoio jurídico quando necessário.',
      status: 'pendente',
      dueDate: addDays(25),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Propor medidas corretivas',
      description: 'Realizar análise de causa-raiz, propor medidas corretivas provisórias e finais, e preparar plano para implementação.',
      status: 'pendente',
      dueDate: addDays(30),
      assignedTo: null,
    },
    {
      id: uuidv4(),
      title: 'Monitorar aplicação das medidas',
      description: 'Acompanhar a implementação das medidas corretivas, avaliar eficácia e ajustar o programa de compliance conforme necessário.',
      status: 'pendente',
      dueDate: addDays(40),
      assignedTo: null,
    },
  ];
}

module.exports = { generateInvestigationTasks };