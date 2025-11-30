import { CreateRecommendationForUserData, CreateRecommendationForUserVariables, ListCareerPathsData, UpdateInterviewQuestionData, UpdateInterviewQuestionVariables, GetInterviewSessionForUserData, GetInterviewSessionForUserVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateRecommendationForUser(options?: useDataConnectMutationOptions<CreateRecommendationForUserData, FirebaseError, CreateRecommendationForUserVariables>): UseDataConnectMutationResult<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
export function useCreateRecommendationForUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRecommendationForUserData, FirebaseError, CreateRecommendationForUserVariables>): UseDataConnectMutationResult<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;

export function useListCareerPaths(options?: useDataConnectQueryOptions<ListCareerPathsData>): UseDataConnectQueryResult<ListCareerPathsData, undefined>;
export function useListCareerPaths(dc: DataConnect, options?: useDataConnectQueryOptions<ListCareerPathsData>): UseDataConnectQueryResult<ListCareerPathsData, undefined>;

export function useUpdateInterviewQuestion(options?: useDataConnectMutationOptions<UpdateInterviewQuestionData, FirebaseError, UpdateInterviewQuestionVariables>): UseDataConnectMutationResult<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
export function useUpdateInterviewQuestion(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateInterviewQuestionData, FirebaseError, UpdateInterviewQuestionVariables>): UseDataConnectMutationResult<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;

export function useGetInterviewSessionForUser(vars: GetInterviewSessionForUserVariables, options?: useDataConnectQueryOptions<GetInterviewSessionForUserData>): UseDataConnectQueryResult<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
export function useGetInterviewSessionForUser(dc: DataConnect, vars: GetInterviewSessionForUserVariables, options?: useDataConnectQueryOptions<GetInterviewSessionForUserData>): UseDataConnectQueryResult<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
