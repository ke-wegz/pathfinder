# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListCareerPaths*](#listcareerpaths)
  - [*GetInterviewSessionForUser*](#getinterviewsessionforuser)
- [**Mutations**](#mutations)
  - [*CreateRecommendationForUser*](#createrecommendationforuser)
  - [*UpdateInterviewQuestion*](#updateinterviewquestion)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListCareerPaths
You can execute the `ListCareerPaths` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCareerPaths(): QueryPromise<ListCareerPathsData, undefined>;

interface ListCareerPathsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListCareerPathsData, undefined>;
}
export const listCareerPathsRef: ListCareerPathsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCareerPaths(dc: DataConnect): QueryPromise<ListCareerPathsData, undefined>;

interface ListCareerPathsRef {
  ...
  (dc: DataConnect): QueryRef<ListCareerPathsData, undefined>;
}
export const listCareerPathsRef: ListCareerPathsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCareerPathsRef:
```typescript
const name = listCareerPathsRef.operationName;
console.log(name);
```

### Variables
The `ListCareerPaths` query has no variables.
### Return Type
Recall that executing the `ListCareerPaths` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCareerPathsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListCareerPaths`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCareerPaths } from '@dataconnect/generated';


// Call the `listCareerPaths()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCareerPaths();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCareerPaths(dataConnect);

console.log(data.careerPaths);

// Or, you can use the `Promise` API.
listCareerPaths().then((response) => {
  const data = response.data;
  console.log(data.careerPaths);
});
```

### Using `ListCareerPaths`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCareerPathsRef } from '@dataconnect/generated';


// Call the `listCareerPathsRef()` function to get a reference to the query.
const ref = listCareerPathsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCareerPathsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.careerPaths);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.careerPaths);
});
```

## GetInterviewSessionForUser
You can execute the `GetInterviewSessionForUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getInterviewSessionForUser(vars: GetInterviewSessionForUserVariables): QueryPromise<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;

interface GetInterviewSessionForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetInterviewSessionForUserVariables): QueryRef<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
}
export const getInterviewSessionForUserRef: GetInterviewSessionForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getInterviewSessionForUser(dc: DataConnect, vars: GetInterviewSessionForUserVariables): QueryPromise<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;

interface GetInterviewSessionForUserRef {
  ...
  (dc: DataConnect, vars: GetInterviewSessionForUserVariables): QueryRef<GetInterviewSessionForUserData, GetInterviewSessionForUserVariables>;
}
export const getInterviewSessionForUserRef: GetInterviewSessionForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getInterviewSessionForUserRef:
```typescript
const name = getInterviewSessionForUserRef.operationName;
console.log(name);
```

### Variables
The `GetInterviewSessionForUser` query requires an argument of type `GetInterviewSessionForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetInterviewSessionForUserVariables {
  userId: UUIDString;
}
```
### Return Type
Recall that executing the `GetInterviewSessionForUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetInterviewSessionForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetInterviewSessionForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getInterviewSessionForUser, GetInterviewSessionForUserVariables } from '@dataconnect/generated';

// The `GetInterviewSessionForUser` query requires an argument of type `GetInterviewSessionForUserVariables`:
const getInterviewSessionForUserVars: GetInterviewSessionForUserVariables = {
  userId: ..., 
};

// Call the `getInterviewSessionForUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getInterviewSessionForUser(getInterviewSessionForUserVars);
// Variables can be defined inline as well.
const { data } = await getInterviewSessionForUser({ userId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getInterviewSessionForUser(dataConnect, getInterviewSessionForUserVars);

console.log(data.interviewSessions);

// Or, you can use the `Promise` API.
getInterviewSessionForUser(getInterviewSessionForUserVars).then((response) => {
  const data = response.data;
  console.log(data.interviewSessions);
});
```

### Using `GetInterviewSessionForUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getInterviewSessionForUserRef, GetInterviewSessionForUserVariables } from '@dataconnect/generated';

// The `GetInterviewSessionForUser` query requires an argument of type `GetInterviewSessionForUserVariables`:
const getInterviewSessionForUserVars: GetInterviewSessionForUserVariables = {
  userId: ..., 
};

// Call the `getInterviewSessionForUserRef()` function to get a reference to the query.
const ref = getInterviewSessionForUserRef(getInterviewSessionForUserVars);
// Variables can be defined inline as well.
const ref = getInterviewSessionForUserRef({ userId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getInterviewSessionForUserRef(dataConnect, getInterviewSessionForUserVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.interviewSessions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewSessions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateRecommendationForUser
You can execute the `CreateRecommendationForUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRecommendationForUser(vars: CreateRecommendationForUserVariables): MutationPromise<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;

interface CreateRecommendationForUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRecommendationForUserVariables): MutationRef<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
}
export const createRecommendationForUserRef: CreateRecommendationForUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRecommendationForUser(dc: DataConnect, vars: CreateRecommendationForUserVariables): MutationPromise<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;

interface CreateRecommendationForUserRef {
  ...
  (dc: DataConnect, vars: CreateRecommendationForUserVariables): MutationRef<CreateRecommendationForUserData, CreateRecommendationForUserVariables>;
}
export const createRecommendationForUserRef: CreateRecommendationForUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRecommendationForUserRef:
```typescript
const name = createRecommendationForUserRef.operationName;
console.log(name);
```

### Variables
The `CreateRecommendationForUser` mutation requires an argument of type `CreateRecommendationForUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateRecommendationForUserVariables {
  userId: UUIDString;
  careerPathId: UUIDString;
  description: string;
  link?: string | null;
  relevanceScore: number;
  title: string;
  type: string;
}
```
### Return Type
Recall that executing the `CreateRecommendationForUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRecommendationForUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRecommendationForUserData {
  recommendation_insert: Recommendation_Key;
}
```
### Using `CreateRecommendationForUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRecommendationForUser, CreateRecommendationForUserVariables } from '@dataconnect/generated';

// The `CreateRecommendationForUser` mutation requires an argument of type `CreateRecommendationForUserVariables`:
const createRecommendationForUserVars: CreateRecommendationForUserVariables = {
  userId: ..., 
  careerPathId: ..., 
  description: ..., 
  link: ..., // optional
  relevanceScore: ..., 
  title: ..., 
  type: ..., 
};

// Call the `createRecommendationForUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRecommendationForUser(createRecommendationForUserVars);
// Variables can be defined inline as well.
const { data } = await createRecommendationForUser({ userId: ..., careerPathId: ..., description: ..., link: ..., relevanceScore: ..., title: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRecommendationForUser(dataConnect, createRecommendationForUserVars);

console.log(data.recommendation_insert);

// Or, you can use the `Promise` API.
createRecommendationForUser(createRecommendationForUserVars).then((response) => {
  const data = response.data;
  console.log(data.recommendation_insert);
});
```

### Using `CreateRecommendationForUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRecommendationForUserRef, CreateRecommendationForUserVariables } from '@dataconnect/generated';

// The `CreateRecommendationForUser` mutation requires an argument of type `CreateRecommendationForUserVariables`:
const createRecommendationForUserVars: CreateRecommendationForUserVariables = {
  userId: ..., 
  careerPathId: ..., 
  description: ..., 
  link: ..., // optional
  relevanceScore: ..., 
  title: ..., 
  type: ..., 
};

// Call the `createRecommendationForUserRef()` function to get a reference to the mutation.
const ref = createRecommendationForUserRef(createRecommendationForUserVars);
// Variables can be defined inline as well.
const ref = createRecommendationForUserRef({ userId: ..., careerPathId: ..., description: ..., link: ..., relevanceScore: ..., title: ..., type: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRecommendationForUserRef(dataConnect, createRecommendationForUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.recommendation_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.recommendation_insert);
});
```

## UpdateInterviewQuestion
You can execute the `UpdateInterviewQuestion` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateInterviewQuestion(vars: UpdateInterviewQuestionVariables): MutationPromise<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;

interface UpdateInterviewQuestionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateInterviewQuestionVariables): MutationRef<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
}
export const updateInterviewQuestionRef: UpdateInterviewQuestionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateInterviewQuestion(dc: DataConnect, vars: UpdateInterviewQuestionVariables): MutationPromise<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;

interface UpdateInterviewQuestionRef {
  ...
  (dc: DataConnect, vars: UpdateInterviewQuestionVariables): MutationRef<UpdateInterviewQuestionData, UpdateInterviewQuestionVariables>;
}
export const updateInterviewQuestionRef: UpdateInterviewQuestionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateInterviewQuestionRef:
```typescript
const name = updateInterviewQuestionRef.operationName;
console.log(name);
```

### Variables
The `UpdateInterviewQuestion` mutation requires an argument of type `UpdateInterviewQuestionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateInterviewQuestionVariables {
  id: UUIDString;
  aiFeedback?: string | null;
  userResponse?: string | null;
}
```
### Return Type
Recall that executing the `UpdateInterviewQuestion` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateInterviewQuestionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateInterviewQuestionData {
  interviewQuestion_update?: InterviewQuestion_Key | null;
}
```
### Using `UpdateInterviewQuestion`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateInterviewQuestion, UpdateInterviewQuestionVariables } from '@dataconnect/generated';

// The `UpdateInterviewQuestion` mutation requires an argument of type `UpdateInterviewQuestionVariables`:
const updateInterviewQuestionVars: UpdateInterviewQuestionVariables = {
  id: ..., 
  aiFeedback: ..., // optional
  userResponse: ..., // optional
};

// Call the `updateInterviewQuestion()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateInterviewQuestion(updateInterviewQuestionVars);
// Variables can be defined inline as well.
const { data } = await updateInterviewQuestion({ id: ..., aiFeedback: ..., userResponse: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateInterviewQuestion(dataConnect, updateInterviewQuestionVars);

console.log(data.interviewQuestion_update);

// Or, you can use the `Promise` API.
updateInterviewQuestion(updateInterviewQuestionVars).then((response) => {
  const data = response.data;
  console.log(data.interviewQuestion_update);
});
```

### Using `UpdateInterviewQuestion`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateInterviewQuestionRef, UpdateInterviewQuestionVariables } from '@dataconnect/generated';

// The `UpdateInterviewQuestion` mutation requires an argument of type `UpdateInterviewQuestionVariables`:
const updateInterviewQuestionVars: UpdateInterviewQuestionVariables = {
  id: ..., 
  aiFeedback: ..., // optional
  userResponse: ..., // optional
};

// Call the `updateInterviewQuestionRef()` function to get a reference to the mutation.
const ref = updateInterviewQuestionRef(updateInterviewQuestionVars);
// Variables can be defined inline as well.
const ref = updateInterviewQuestionRef({ id: ..., aiFeedback: ..., userResponse: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateInterviewQuestionRef(dataConnect, updateInterviewQuestionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.interviewQuestion_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.interviewQuestion_update);
});
```

