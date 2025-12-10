import {
  connectDataConnectEmulator,
  getDataConnect,
  type DataConnect,
  type QueryPromise,
  type MutationPromise
} from 'firebase/data-connect'
import {
  connectorConfig,
  listMovies,
  listUsers,
  listUserReviews,
  getMovieById,
  searchMovie,
  createMovie,
  upsertUser,
  addReview,
  deleteReview,
  type ListMoviesData,
  type ListUsersData,
  type ListUserReviewsData,
  type GetMovieByIdData,
  type GetMovieByIdVariables,
  type SearchMovieData,
  type SearchMovieVariables,
  type CreateMovieData,
  type CreateMovieVariables,
  type UpsertUserData,
  type UpsertUserVariables,
  type AddReviewData,
  type AddReviewVariables,
  type DeleteReviewData,
  type DeleteReviewVariables
} from '@dataconnect/generated'

let cachedClient: DataConnect | null = null
let emulatorBound = false

export type DataConnectClientOptions = {
  useEmulator?: boolean
  emulatorHost?: string
  emulatorPort?: number
}

function connectEmulator(client: DataConnect, options?: DataConnectClientOptions) {
  if (emulatorBound) return
  const host = options?.emulatorHost ?? 'localhost'
  const port = options?.emulatorPort ?? 9399
  connectDataConnectEmulator(client, host, port)
  emulatorBound = true
}

export function getDataConnectClient(options?: DataConnectClientOptions): DataConnect {
  if (!cachedClient) {
    cachedClient = getDataConnect(connectorConfig)
  }
  const shouldUseEmulator = options?.useEmulator
  if (cachedClient && shouldUseEmulator) {
    connectEmulator(cachedClient, options)
  }
  return cachedClient
}

export function withDataConnect<T>(run: (client: DataConnect) => T, options?: DataConnectClientOptions): T {
  return run(getDataConnectClient(options))
}

export function listMoviesQuery(options?: DataConnectClientOptions): QueryPromise<ListMoviesData, undefined> {
  return listMovies(getDataConnectClient(options))
}

export function listUsersQuery(options?: DataConnectClientOptions): QueryPromise<ListUsersData, undefined> {
  return listUsers(getDataConnectClient(options))
}

export function listUserReviewsQuery(options?: DataConnectClientOptions): QueryPromise<ListUserReviewsData, undefined> {
  return listUserReviews(getDataConnectClient(options))
}

export function getMovieByIdQuery(
  vars: GetMovieByIdVariables,
  options?: DataConnectClientOptions
): QueryPromise<GetMovieByIdData, GetMovieByIdVariables> {
  return getMovieById(getDataConnectClient(options), vars)
}

export function searchMovieQuery(
  vars?: SearchMovieVariables,
  options?: DataConnectClientOptions
): QueryPromise<SearchMovieData, SearchMovieVariables | undefined> {
  return searchMovie(getDataConnectClient(options), vars)
}

export function createMovieMutation(
  vars: CreateMovieVariables,
  options?: DataConnectClientOptions
): MutationPromise<CreateMovieData, CreateMovieVariables> {
  return createMovie(getDataConnectClient(options), vars)
}

export function upsertUserMutation(
  vars: UpsertUserVariables,
  options?: DataConnectClientOptions
): MutationPromise<UpsertUserData, UpsertUserVariables> {
  return upsertUser(getDataConnectClient(options), vars)
}

export function addReviewMutation(
  vars: AddReviewVariables,
  options?: DataConnectClientOptions
): MutationPromise<AddReviewData, AddReviewVariables> {
  return addReview(getDataConnectClient(options), vars)
}

export function deleteReviewMutation(
  vars: DeleteReviewVariables,
  options?: DataConnectClientOptions
): MutationPromise<DeleteReviewData, DeleteReviewVariables> {
  return deleteReview(getDataConnectClient(options), vars)
}

export type {
  ListMoviesData,
  ListUsersData,
  ListUserReviewsData,
  GetMovieByIdData,
  GetMovieByIdVariables,
  SearchMovieData,
  SearchMovieVariables,
  CreateMovieData,
  CreateMovieVariables,
  UpsertUserData,
  UpsertUserVariables,
  AddReviewData,
  AddReviewVariables,
  DeleteReviewData,
  DeleteReviewVariables
}
