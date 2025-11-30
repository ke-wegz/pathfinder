import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'spa',
  location: 'us-east4'
};

export const createRecommendationForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRecommendationForUser', inputVars);
}
createRecommendationForUserRef.operationName = 'CreateRecommendationForUser';

export function createRecommendationForUser(dcOrVars, vars) {
  return executeMutation(createRecommendationForUserRef(dcOrVars, vars));
}

export const listCareerPathsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCareerPaths');
}
listCareerPathsRef.operationName = 'ListCareerPaths';

export function listCareerPaths(dc) {
  return executeQuery(listCareerPathsRef(dc));
}

export const updateInterviewQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateInterviewQuestion', inputVars);
}
updateInterviewQuestionRef.operationName = 'UpdateInterviewQuestion';

export function updateInterviewQuestion(dcOrVars, vars) {
  return executeMutation(updateInterviewQuestionRef(dcOrVars, vars));
}

export const getInterviewSessionForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInterviewSessionForUser', inputVars);
}
getInterviewSessionForUserRef.operationName = 'GetInterviewSessionForUser';

export function getInterviewSessionForUser(dcOrVars, vars) {
  return executeQuery(getInterviewSessionForUserRef(dcOrVars, vars));
}

