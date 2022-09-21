import { gql } from '@apollo/client/core';
import * as T from '@src/generated/model.types';
import { PartialDeep } from 'type-fest';
import { BackendService } from './backend';

type ProjectionField<TType> = TType extends object ? Projection<TType> : true;
type Projection<TType> = {
  [K in keyof TType]?: TType[K] extends (infer TArrayType)[] ? ProjectionField<TArrayType> : ProjectionField<TType[K]>;
};

type OmitNever<T> = { [K in keyof T as T[K] extends never ? never : K]: T[K] };
type ShallowProjection<TType> = Partial<
  OmitNever<{
    [K in keyof TType]: TType[K] extends object ? never : true;
  }>
>;

class DAO<TType, TFilterInput, TInsertInput, TUpdateInput, TSortInput, TRelationsInput, TSubscribeFilter = never> {
  constructor(private name: string, private backend: BackendService) {}

  private get pascalName() {
    return this.name[0].toUpperCase() + this.name.substring(1);
  }

  private projectionToGraphQLBody(projection: any) {
    let str = '{\n';
    for (const key in projection) {
      if (projection[key] === true) {
        str += key + '\n';
      } else if (typeof projection[key] === 'object') {
        str += key + ' ' + this.projectionToGraphQLBody(projection[key]);
      }
    }
    str += '}\n';
    return str;
  }

  async findOne(params: {
    filter?: TFilterInput;
    limit?: number;
    relations?: TRelationsInput;
    skip?: number;
    sorts?: TSortInput[];
    projection: Projection<TType>;
  }): Promise<PartialDeep<TType> | undefined> {
    return (await this.findAll(params))[0];
  }

  async findAll(params: {
    filter?: TFilterInput;
    limit?: number;
    relations?: TRelationsInput;
    skip?: number;
    sorts?: TSortInput[];
    projection: Projection<TType>;
  }): Promise<PartialDeep<TType>[]> {
    const operationName = `${this.name}s`;
    const result = await this.backend.withAuth().query<any>({
      // prettier-ignore
      query: gql`
        query($filter: ${this.pascalName}FilterInput, $limit: Int, $relations: ${this.pascalName}RelationsFilterInput, $skip: Int, $sorts: [${this.pascalName}SortInput!]) {
          ${operationName}(filter: $filter, limit: $limit, relations: $relations, skip: $skip, sorts: $sorts) ${this.projectionToGraphQLBody(params.projection)}
        }
      `,
      variables: {
        filter: params.filter,
        limit: params.limit,
        relations: params.relations,
        skip: params.skip,
        sorts: params.sorts,
      },
      fetchPolicy: 'no-cache',
    });
    if (result.error) throw result.error;
    return result.data[operationName];
  }

  async insertOne(params: { record: TInsertInput; projection?: Projection<TType> }): Promise<PartialDeep<TType>> {
    // By default it will just fetch the id back
    if (!params.projection) params.projection = { id: true } as any;
    const operationName = `create${this.pascalName}`;
    const result = await this.backend.withAuth().mutate<any>({
      mutation: gql`
        mutation($record: ${this.pascalName}InsertInput!) {
          ${operationName}(record: $record) ${this.projectionToGraphQLBody(params.projection)}
        }
      `,
      variables: {
        record: params.record,
      },
      fetchPolicy: 'no-cache',
    });
    if (result.errors) throw result.errors[0];
    return result.data[operationName];
  }

  async updateAll(params: { filter: TFilterInput; changes: TUpdateInput }): Promise<boolean> {
    const operationName = `update${this.pascalName}s`;
    const result = await this.backend.withAuth().mutate<any>({
      mutation: gql`
        mutation($filter: ${this.pascalName}InsertInput!, $changes: ${this.pascalName}UpdateInput!) {
          ${operationName}(filter: $filter, changes: $changes)
        }
      `,
      variables: {
        filter: params.filter,
        changes: params.changes,
      },
      fetchPolicy: 'no-cache',
    });
    if (result.errors) throw result.errors[0];
    return result.data[operationName];
  }

  async deleteAll(params: { filter: TFilterInput }): Promise<boolean> {
    const operationName = `delete${this.pascalName}s`;
    const result = await this.backend.withAuth().mutate<any>({
      mutation: gql`
        mutation($filter: ${this.pascalName}FilterInput!) {
          ${operationName}(filter: $filter)
        }
      `,
      variables: {
        filter: params.filter,
      },
      fetchPolicy: 'no-cache',
    });
    if (result.errors) throw result.errors[0];
    return result.data[operationName];
  }

  async count(): Promise<number> {
    const operationName = `${this.name}Count`;
    const result = await this.backend.withAuth().mutate<any>({
      mutation: gql`
        query {
          ${operationName}
        }
      `,
      fetchPolicy: 'no-cache',
    });
    if (result.errors) throw result.errors[0];
    return result.data[operationName];
  }

  private async subscribeCRUD(
    crudName: 'Created' | 'Updated' | 'Deleted',
    params: {
      filter?: TSubscribeFilter | {};
      projection: ShallowProjection<TType>;
    },
  ) {
    if (!params.filter) params.filter = {};
    const subscription = await this.backend.withAuth().subscribe<any>({
      query: gql`
          subscription ${this.pascalName}${crudName}($filter: ${this.pascalName}SubscriptionFilter) {
            ${this.name}${crudName}(filter: $filter) ${this.projectionToGraphQLBody(params.projection)}
          }
        `,
      variables: {
        filter: params.filter,
      },
    });
    return subscription.map((x) => {
      if (x.errors) return undefined;
      return x.data[this.name + crudName] as Partial<TType>;
    });
  }

  async onCreated(params: { filter?: TSubscribeFilter; projection: ShallowProjection<TType> }) {
    return this.subscribeCRUD('Created', params);
  }

  async onUpdated(params: { filter?: TSubscribeFilter; projection: ShallowProjection<TType> }) {
    return this.subscribeCRUD('Updated', params);
  }

  async onDeleted(params: { filter?: TSubscribeFilter; projection: ShallowProjection<TType> }) {
    return this.subscribeCRUD('Deleted', params);
  }
}

export class EntityManager {
  constructor(private backend: BackendService) {}

  public readonly eBoard = new DAO<
    T.EBoard,
    T.QueryEBoardsArgs,
    T.EBoardInsertInput,
    T.EBoardUpdateInput,
    T.EBoardSortInput,
    T.EBoardRelationsFilterInput,
    T.EBoardSubscriptionFilter
  >('eBoard', this.backend);

  public readonly eBoardTerm = new DAO<
    T.EBoard,
    T.EBoardTermFilterInput,
    T.EBoardTermInsertInput,
    T.EBoardTermUpdateInput,
    T.EBoardTermSortInput,
    T.EBoardTermRelationsFilterInput,
    T.EBoardTermSubscriptionFilter
  >('eBoardTerm', this.backend);

  public readonly eBoardTermRole = new DAO<
    T.EBoardTermRole,
    T.EBoardTermRoleFilterInput,
    T.EBoardTermRoleInsertInput,
    T.EBoardTermRoleUpdateInput,
    T.EBoardTermRoleSortInput,
    T.EBoardTermRoleRelationsFilterInput
  >('eBoardTermRole', this.backend);

  public readonly project = new DAO<
    T.Project,
    T.ProjectFilterInput,
    T.ProjectInsertInput,
    T.ProjectUpdateInput,
    T.ProjectSortInput,
    T.ProjectRelationsFilterInput,
    T.ProjectSubscriptionFilter
  >('project', this.backend);

  public readonly projectDiscordConfig = new DAO<
    T.ProjectDiscordConfig,
    T.ProjectDiscordConfigFilterInput,
    T.ProjectDiscordConfigInsertInput,
    T.ProjectDiscordConfigUpdateInput,
    T.ProjectDiscordConfigSortInput,
    T.ProjectDiscordConfigRelationsFilterInput
  >('projectDiscordConfig', this.backend);

  public readonly projectInvite = new DAO<
    T.ProjectInvite,
    T.ProjectInviteFilterInput,
    T.ProjectInviteInsertInput,
    T.ProjectInviteUpdateInput,
    T.ProjectInviteSortInput,
    T.ProjectInviteRelationsFilterInput,
    T.ProjectInviteSubscriptionFilter
  >('projectInvite', this.backend);

  public readonly projectMember = new DAO<
    T.ProjectMember,
    T.ProjectMemberFilterInput,
    T.ProjectMemberInsertInput,
    T.ProjectMemberUpdateInput,
    T.ProjectMemberSortInput,
    T.ProjectMemberRelationsFilterInput,
    T.ProjectMemberSubscriptionFilter
  >('projectMember', this.backend);

  public readonly projectMemberRole = new DAO<
    T.ProjectMemberRole,
    T.ProjectMemberRoleFilterInput,
    T.ProjectMemberRoleInsertInput,
    T.ProjectMemberRoleUpdateInput,
    T.ProjectMemberRoleSortInput,
    T.ProjectMemberRoleRelationsFilterInput
  >('projectMemberRole', this.backend);

  public readonly user = new DAO<
    T.User,
    T.UserFilterInput,
    T.UserInsertInput,
    T.UserUpdateInput,
    T.UserSortInput,
    T.UserRelationsFilterInput,
    T.UserSubscriptionFilter
  >('user', this.backend);

  public readonly userLoginIdentity = new DAO<
    T.UserLoginIdentity,
    T.UserLoginIdentityFilterInput,
    T.UserLoginIdentityInsertInput,
    T.UserLoginIdentityUpdateInput,
    T.UserLoginIdentitySortInput,
    T.UserLoginIdentityRelationsFilterInput,
    T.UserLoginIdentitySubscriptionFilter
  >('userLoginIdentity', this.backend);

  public readonly userRole = new DAO<
    T.UserRole,
    T.UserRoleFilterInput,
    T.UserRoleInsertInput,
    T.UserRoleUpdateInput,
    T.UserRoleSortInput,
    T.UserRoleRelationsFilterInput
  >('userRole', this.backend);

  public readonly userSocial = new DAO<
    T.UserSocial,
    T.UserSocialFilterInput,
    T.UserSocialInsertInput,
    T.UserSocialUpdateInput,
    T.UserSocialSortInput,
    T.UserSocialRelationsFilterInput
  >('userSocial', this.backend);

  // Template for adding new models

  // public readonly  = new DAO<
  //   T.,
  //   T.FilterInput,
  //   T.InsertInput,
  //   T.UpdateInput,
  //   T.SortInput,
  //   T.RelationsFilterInput
  //   T.SubscriptionFilter // Optional
  // >('', this.backend);
}
