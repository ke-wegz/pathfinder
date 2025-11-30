import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CareerPath_Key {
  id: UUIDString;
  __typename?: 'CareerPath_Key';
}

export interface CreateRecommendationForUserData {
  recommendation_insert: Recommendation_Key;
}

export interface CreateRecommendationForUserVariables {
  userId: UUIDString;
  careerPathId: UUIDString;
  description: string;
  link?: string | null;
  relevanceScore: number;
  title: string;
  type: string;
}

export interface GetInterviewSessionForUserData {
  interviewSessions: ({
    id: UUIDString;
    careerPath?: {
      id: UUIDString;
      name: string;
    } & CareerPath_Key;
      sessionDate: TimestampString;
      score?: number | null;
      feedbackSummary: string;
      durationMinutes: number;
      aiModelUsed?: string | null;
  } & InterviewSession_Key)[];
}

export interface GetInterviewSessionForUserVariables {
  userId: UUIDString;
}

export interface InterviewQuestion_Key {
  id: UUIDString;
  __typename?: 'InterviewQuestion_Key';
}

export interface InterviewSession_Key {
  id: UUIDString;
  __typename?: 'InterviewSession_Key';
}

export interface ListCareerPathsData {
  careerPaths: ({
    id: UUIDString;
    name: string;
    description: string;
    typicalEducation?: string | null;
    typicalSkills?: string[] | null;
    relatedJobTitles?: string[] | null;
  } & CareerPath_Key)[];
}

export interface Recommendation_Key {
  id: UUIDString;
  __typename?: 'Recommendation_Key';
}

export interface UpdateInterviewQuestionData {
  interviewQuestion_update?: InterviewQuestion_Key | null;
}

export interface UpdateInterviewQuestionVariables {
  id: UUIDString;
  aiFeedback?: string | null;
  userResponse?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateRecommendationForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRecommendationForUserVariables): MutationRef<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRecommendationForUserVariables): MutationRef<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
  operationName: string;
}
export const createRecommendationForUserRef: CreateRecommendationForUserRef;

export function createRecommendationForUser(vars: CreateRecommendationForUserVariables): MutationPromise<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
export function createRecommendationForUser(dc: DataConnect, vars: CreateRecommendationForUserVariables): MutationPromise<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;

interface ListCareerPathsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCareerPathsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListCareerPathsData, undefined>;
  operationName: string;
}
export const listCareerPathsRef: ListCareerPathsRef;

export function listCareerPaths(): QueryPromise<ListCareerPathsData, undefined>;
export function listCareerPaths(dc: DataConnect): QueryPromise<ListCareerPathsData, undefined>;

interface UpdateInterviewQuestionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateInterviewQuestionVariables): MutationRef<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateInterviewQuestionVariables): MutationRef<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
  operationName: string;
}
export const updateInterviewQuestionRef: UpdateInterviewQuestionRef;

export function updateInterviewQuestion(vars: UpdateInterviewQuestionVariables): MutationPromise<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
export function updateInterviewQuestion(dc: DataConnect, vars: UpdateInterviewQuestionVariables): MutationPromise<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;

interface GetInterviewSessionForUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetInterviewSessionForUserVariables): QueryRef<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetInterviewSessionForUserVariables): QueryRef<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
  operationName: string;
}
export const getInterviewSessionForUserRef: GetInterviewSessionForUserRef;

export function getInterviewSessionForUser(vars: GetInterviewSessionForUserVariables): QueryPromise<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
export function getInterviewSessionForUser(dc: DataConnect, vars: GetInterviewSessionForUserVariables): QueryPromise<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;

