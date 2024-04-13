import {
  ApolloClient,
  ApolloQueryResult,
  FetchResult,
  InMemoryCache,
  MutationOptions,
  NormalizedCacheObject,
  ObservableQuery,
  OperationVariables,
  QueryOptions,
  split,
  SubscriptionOptions,
  WatchQueryOptions,
} from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition, Observable } from '@apollo/client/utilities';
import { AuthConfig, ServerConfig } from '@src/misc/config';
import { createUploadLink } from 'apollo-upload-client';
import fetch from 'cross-fetch';
import { createClient, Client as GraphQLWsClient } from 'graphql-ws';
import WebSocket from 'ws';

export class BackendService {
  private opSettings: {
    useAuth: boolean;
  } = this.defaultOpSettings();

  private graphQLWsClient!: GraphQLWsClient;
  private apollo!: ApolloClient<NormalizedCacheObject>;

  constructor(private authConfig: AuthConfig, private serverConfig: ServerConfig) {
    this.rebuildClient();
  }

  public rebuildClient() {
    if (this.apollo) {
      this.apollo.stop();
      this.apollo.clearStore();
    }
    this.apollo = new ApolloClient(this.configureApolloClientOptions());
  }

  private resetOpSettings() {
    this.opSettings = this.defaultOpSettings();
  }

  private defaultOpSettings() {
    return {
      useAuth: false,
    };
  }

  private getHeaders() {
    return {
      Authorization: `Basic-Root ${this.authConfig.backendRootUser.username}:${this.authConfig.backendRootUser.password}`,
    };
  }

  private configureApolloOperationOptions(options: any) {
    return {
      ...options,
      ...(this.opSettings.useAuth && {
        context: {
          ...options.context,
          headers: {
            ...this.getHeaders(),
            ...options.context?.headers,
          },
        },
      }),
    };
  }

  private configureApolloClientOptions() {
    const uploadLink = createUploadLink({
      uri: this.serverConfig.httpsPrefix + this.serverConfig.backendDomain + this.serverConfig.graphqlRelativePath,
      headers: { 'Apollo-Require-Preflight': 'true' },
      fetch: fetch,
    });

    if (this.graphQLWsClient) this.graphQLWsClient.dispose();
    this.graphQLWsClient = createClient({
      url: this.serverConfig.wssPrefix + this.serverConfig.backendDomain + this.serverConfig.graphqlRelativePath,
      connectionParams: {
        authentication: `Basic-Root ${this.authConfig.backendRootUser.username}:${this.authConfig.backendRootUser.password}`,
      },
      webSocketImpl: WebSocket,
    });

    const webSocketLink = new GraphQLWsLink(this.graphQLWsClient);

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    const splitLink = split(
      // split based on operation type
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      webSocketLink,
      uploadLink,
    );

    return {
      link: splitLink,
      cache: new InMemoryCache(),
    };
  }

  // #region // ----- SETTINGS ----- //

  withAuth() {
    this.opSettings.useAuth = true;
    return this;
  }
  // #endregion // -- SETTINGS ----- //

  // #region // ----- GRAPHQL ----- //
  watchQuery<TData, TVariables extends OperationVariables>(
    options: WatchQueryOptions<TVariables, TData>,
  ): ObservableQuery<TData, TVariables> {
    const result = this.apollo.watchQuery<TData, TVariables>(this.configureApolloOperationOptions(options));
    this.resetOpSettings();
    return result;
  }

  query<T, V extends OperationVariables>(options: QueryOptions<V, T>): Promise<ApolloQueryResult<T>> {
    const result = this.apollo.query<T, V>(this.configureApolloOperationOptions(options));
    this.resetOpSettings();
    return result;
  }

  mutate<T, V extends OperationVariables>(options: MutationOptions<T, V>): Promise<FetchResult<T>> {
    const result = this.apollo.mutate<T, V>(this.configureApolloOperationOptions(options));
    this.resetOpSettings();
    return result;
  }

  subscribe<T, V extends OperationVariables>(options: SubscriptionOptions<V, T>): Observable<FetchResult<T>> {
    const result = this.apollo.subscribe<T, V>(this.configureApolloOperationOptions(options));
    this.resetOpSettings();
    return result;
  }
  // #endregion // -- GRAPHQL ----- //
}
