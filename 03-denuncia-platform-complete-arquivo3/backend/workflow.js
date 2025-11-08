/*
 * Módulo de fluxo de casos.  Define etapas básicas de investigação e funções
 * utilitárias para avançar o status de um caso, atribuir responsáveis e
 * acompanhar o progresso.  A lógica aqui é simplificada e pode ser
 * expandida conforme necessidade.
 */

const STATUSES = ['novo', 'triagem', 'em_investigacao', 'acoes', 'encerrado'];

/**
 * Avança o status de um caso de acordo com suas atribuições.
 * Por exemplo, quando um caso é atribuído a um triador, muda para 'triagem';
 * quando um investigador assume, muda para 'em_investigacao'.
 * @param {object} caseItem
 */
function advanceCase(caseItem) {
  if (caseItem.status === 'novo' && caseItem.assignments && caseItem.assignments.triage) {
    caseItem.status = 'triagem';
  } else if (caseItem.status === 'triagem' && caseItem.assignments && caseItem.assignments.investigator) {
    caseItem.status = 'em_investigacao';
  }
  // Podem ser adicionadas outras regras
}

/**
 * Atribui um usuário a um papel no caso e atualiza o status conforme necessário.
 * @param {object} caseItem
 * @param {string} roleName Ex.: 'triage', 'investigator'
 * @param {string} userId
 */
function assignRole(caseItem, roleName, userId) {
  if (!caseItem.assignments) {
    caseItem.assignments = {};
  }
  caseItem.assignments[roleName] = userId;
  advanceCase(caseItem);
}

module.exports = { STATUSES, advanceCase, assignRole };