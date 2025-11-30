# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateRecommendationForUser, useListCareerPaths, useUpdateInterviewQuestion, useGetInterviewSessionForUser } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateRecommendationForUser(createRecommendationForUserVars);

const { data, isPending, isSuccess, isError, error } = useListCareerPaths();

const { data, isPending, isSuccess, isError, error } = useUpdateInterviewQuestion(updateInterviewQuestionVars);

const { data, isPending, isSuccess, isError, error } = useGetInterviewSessionForUser(getInterviewSessionForUserVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createRecommendationForUser, listCareerPaths, updateInterviewQuestion, getInterviewSessionForUser } from '@dataconnect/generated';


// Operation CreateRecommendationForUser:  For variables, look at type CreateRecommendationForUserVars in ../index.d.ts
const { data } = await CreateRecommendationForUser(dataConnect, createRecommendationForUserVars);

// Operation ListCareerPaths: 
const { data } = await ListCareerPaths(dataConnect);

// Operation UpdateInterviewQuestion:  For variables, look at type UpdateInterviewQuestionVars in ../index.d.ts
const { data } = await UpdateInterviewQuestion(dataConnect, updateInterviewQuestionVars);

// Operation GetInterviewSessionForUser:  For variables, look at type GetInterviewSessionForUserVars in ../index.d.ts
const { data } = await GetInterviewSessionForUser(dataConnect, getInterviewSessionForUserVars);


```