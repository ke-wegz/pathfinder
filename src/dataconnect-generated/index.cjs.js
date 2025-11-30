const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'spa',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const createRecommendationForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRecommendationForUser', inputVars);
}
createRecommendationForUserRef.operationName = 'CreateRecommendationForUser';
exports.createRecommendationForUserRef = createRecommendationForUserRef;

exports.createRecommendationForUser = function createRecommendationForUser(dcOrVars, vars) {
  return executeMutation(createRecommendationForUserRef(dcOrVars, vars));
};

const listCareerPathsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCareerPaths');
}
listCareerPathsRef.operationName = 'ListCareerPaths';
exports.listCareerPathsRef = listCareerPathsRef;

exports.listCareerPaths = function listCareerPaths(dc) {
  return executeQuery(listCareerPathsRef(dc));
};

const updateInterviewQuestionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateInterviewQuestion', inputVars);
}
updateInterviewQuestionRef.operationName = 'UpdateInterviewQuestion';
exports.updateInterviewQuestionRef = updateInterviewQuestionRef;

exports.updateInterviewQuestion = function updateInterviewQuestion(dcOrVars, vars) {
  return executeMutation(updateInterviewQuestionRef(dcOrVars, vars));
};

const getInterviewSessionForUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetInterviewSessionForUser', inputVars);
}
getInterviewSessionForUserRef.operationName = 'GetInterviewSessionForUser';
exports.getInterviewSessionForUserRef = getInterviewSessionForUserRef;

exports.getInterviewSessionForUser = function getInterviewSessionForUser(dcOrVars, vars) {
  return executeQuery(getInterviewSessionForUserRef(dcOrVars, vars));
};
