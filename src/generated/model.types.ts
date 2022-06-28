export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
  Json: any;
  Upload: any;
};

export const Access = {
  Closed: 'CLOSED',
  Invite: 'INVITE',
  Open: 'OPEN'
} as const;

export type Access = typeof Access[keyof typeof Access];
export type AccessFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Access>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Access>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<Access>;
  nin?: InputMaybe<Array<Access>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type BooleanFilterInput = {
  eq?: InputMaybe<Scalars['Boolean']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['Boolean']>>;
  ne?: InputMaybe<Scalars['Boolean']>;
  nin?: InputMaybe<Array<Scalars['Boolean']>>;
};

export type DateFilterInput = {
  eq?: InputMaybe<Scalars['Date']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['Date']>>;
  ne?: InputMaybe<Scalars['Date']>;
  nin?: InputMaybe<Array<Scalars['Date']>>;
};

export type EBoard = {
  __typename?: 'EBoard';
  avatarLink?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  terms: Array<EBoardTerm>;
  updatedAt?: Maybe<Scalars['Date']>;
  user: User;
  userId: Scalars['ID'];
};

export type EBoardFilterInput = {
  and_?: InputMaybe<Array<EBoardFilterInput>>;
  avatarLink?: InputMaybe<StringFilterInput>;
  bio?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<EBoardFilterInput>>;
  or_?: InputMaybe<Array<EBoardFilterInput>>;
  updatedAt?: InputMaybe<DateFilterInput>;
  userId?: InputMaybe<IdFilterInput>;
};

export type EBoardFindInput = {
  filter?: InputMaybe<EBoardFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardSortInput>>;
};

export type EBoardInsertInput = {
  avatarLink?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  userId: Scalars['ID'];
};

export type EBoardRelationsFilterInput = {
  terms?: InputMaybe<EBoardTermFindInput>;
  user?: InputMaybe<UserFindInput>;
};

export type EBoardSortInput = {
  avatarLink?: InputMaybe<SortDirection>;
  bio?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
};

export type EBoardSubscriptionFilter = {
  userId?: InputMaybe<Scalars['ID']>;
};

export type EBoardTerm = {
  __typename?: 'EBoardTerm';
  eBoard: EBoard;
  eBoardId: Scalars['ID'];
  id: Scalars['ID'];
  roles: Array<EBoardTermRole>;
  year: Scalars['Int'];
};

export type EBoardTermFilterInput = {
  and_?: InputMaybe<Array<EBoardTermFilterInput>>;
  eBoardId?: InputMaybe<IdFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<EBoardTermFilterInput>>;
  or_?: InputMaybe<Array<EBoardTermFilterInput>>;
  year?: InputMaybe<IntFilterInput>;
};

export type EBoardTermFindInput = {
  filter?: InputMaybe<EBoardTermFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardTermRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardTermSortInput>>;
};

export type EBoardTermInsertInput = {
  eBoardId: Scalars['ID'];
  year: Scalars['Int'];
};

export type EBoardTermRelationsFilterInput = {
  eBoard?: InputMaybe<EBoardFindInput>;
  roles?: InputMaybe<EBoardTermRoleFindInput>;
};

export type EBoardTermRole = {
  __typename?: 'EBoardTermRole';
  id: Scalars['ID'];
  roleCode: RoleCode;
  term: EBoardTerm;
  termId: Scalars['ID'];
};

export type EBoardTermRoleFilterInput = {
  and_?: InputMaybe<Array<EBoardTermRoleFilterInput>>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<EBoardTermRoleFilterInput>>;
  or_?: InputMaybe<Array<EBoardTermRoleFilterInput>>;
  roleCode?: InputMaybe<RoleCodeFilterInput>;
  termId?: InputMaybe<IdFilterInput>;
};

export type EBoardTermRoleFindInput = {
  filter?: InputMaybe<EBoardTermRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardTermRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardTermRoleSortInput>>;
};

export type EBoardTermRoleInsertInput = {
  roleCode: RoleCode;
  termId: Scalars['ID'];
};

export type EBoardTermRoleRelationsFilterInput = {
  term?: InputMaybe<EBoardTermFindInput>;
};

export type EBoardTermRoleSortInput = {
  id?: InputMaybe<SortDirection>;
  roleCode?: InputMaybe<SortDirection>;
  termId?: InputMaybe<SortDirection>;
};

export type EBoardTermRoleUpdateInput = {
  roleCode?: InputMaybe<RoleCode>;
  termId?: InputMaybe<Scalars['ID']>;
};

export type EBoardTermSortInput = {
  eBoardId?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  year?: InputMaybe<SortDirection>;
};

export type EBoardTermSubscriptionFilter = {
  eBoardId?: InputMaybe<Scalars['ID']>;
};

export type EBoardTermUpdateInput = {
  eBoardId?: InputMaybe<Scalars['ID']>;
  year?: InputMaybe<Scalars['Int']>;
};

export type EBoardUpdateInput = {
  avatarLink?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type FloatFilterInput = {
  eq?: InputMaybe<Scalars['Float']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  gt?: InputMaybe<Scalars['Float']>;
  gte?: InputMaybe<Scalars['Float']>;
  in?: InputMaybe<Array<Scalars['Float']>>;
  lt?: InputMaybe<Scalars['Float']>;
  lte?: InputMaybe<Scalars['Float']>;
  ne?: InputMaybe<Scalars['Float']>;
  nin?: InputMaybe<Array<Scalars['Float']>>;
};

export type IdFilterInput = {
  eq?: InputMaybe<Scalars['ID']>;
  exists?: InputMaybe<Scalars['ID']>;
  in?: InputMaybe<Array<Scalars['ID']>>;
  ne?: InputMaybe<Scalars['ID']>;
  nin?: InputMaybe<Array<Scalars['ID']>>;
};

export type IntFilterInput = {
  eq?: InputMaybe<Scalars['Int']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  gt?: InputMaybe<Scalars['Int']>;
  gte?: InputMaybe<Scalars['Int']>;
  in?: InputMaybe<Array<Scalars['Int']>>;
  lt?: InputMaybe<Scalars['Int']>;
  lte?: InputMaybe<Scalars['Int']>;
  ne?: InputMaybe<Scalars['Int']>;
  nin?: InputMaybe<Array<Scalars['Int']>>;
};

export const InviteType = {
  Incoming: 'INCOMING',
  Outgoing: 'OUTGOING'
} as const;

export type InviteType = typeof InviteType[keyof typeof InviteType];
export type InviteTypeFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<InviteType>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<InviteType>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<InviteType>;
  nin?: InputMaybe<Array<InviteType>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type JsonFilterInput = {
  eq?: InputMaybe<Scalars['Json']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['Json']>>;
  ne?: InputMaybe<Scalars['Json']>;
  nin?: InputMaybe<Array<Scalars['Json']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptProjectInvite?: Maybe<Scalars['Boolean']>;
  createEBoard: EBoard;
  createEBoardTerm: EBoardTerm;
  createEBoardTermRole: EBoardTermRole;
  createProject: Project;
  createProjectDiscordSettings: ProjectDiscordSettings;
  createProjectInvite: ProjectInvite;
  createProjectMember: ProjectMember;
  createProjectMemberRole: ProjectMemberRole;
  createUser: User;
  createUserLoginIdentity: UserLoginIdentity;
  createUserRole: UserRole;
  createUserSocial: UserSocial;
  deleteEBoard?: Maybe<Scalars['Boolean']>;
  deleteEBoardTerm?: Maybe<Scalars['Boolean']>;
  deleteEBoardTermRoles?: Maybe<Scalars['Boolean']>;
  deleteEBoardTerms?: Maybe<Scalars['Boolean']>;
  deleteEBoards?: Maybe<Scalars['Boolean']>;
  deleteProject?: Maybe<Scalars['Boolean']>;
  deleteProjectDiscordSettingss?: Maybe<Scalars['Boolean']>;
  deleteProjectInvite?: Maybe<Scalars['Boolean']>;
  deleteProjectInvites?: Maybe<Scalars['Boolean']>;
  deleteProjectMember?: Maybe<Scalars['Boolean']>;
  deleteProjectMemberRoles?: Maybe<Scalars['Boolean']>;
  deleteProjectMembers?: Maybe<Scalars['Boolean']>;
  deleteProjects?: Maybe<Scalars['Boolean']>;
  deleteUser?: Maybe<Scalars['Boolean']>;
  deleteUserLoginIdentitys?: Maybe<Scalars['Boolean']>;
  deleteUserRoles?: Maybe<Scalars['Boolean']>;
  deleteUserSocials?: Maybe<Scalars['Boolean']>;
  deleteUsers?: Maybe<Scalars['Boolean']>;
  joinOpenProject?: Maybe<Scalars['Boolean']>;
  newEBoard: Scalars['ID'];
  newEBoardTerm: Scalars['ID'];
  newProject: Scalars['ID'];
  newProjectInvite?: Maybe<Scalars['ID']>;
  newProjectMember?: Maybe<Scalars['ID']>;
  newUser?: Maybe<Scalars['ID']>;
  requestProjectDiscord?: Maybe<Scalars['Boolean']>;
  transferProjectOwnership?: Maybe<Scalars['Boolean']>;
  updateEBoard?: Maybe<Scalars['Boolean']>;
  updateEBoardTerm?: Maybe<Scalars['Boolean']>;
  updateEBoardTermRoles?: Maybe<Scalars['Boolean']>;
  updateEBoardTerms?: Maybe<Scalars['Boolean']>;
  updateEBoards?: Maybe<Scalars['Boolean']>;
  updateProject?: Maybe<Scalars['Boolean']>;
  updateProjectDiscordSettingss?: Maybe<Scalars['Boolean']>;
  updateProjectInvites?: Maybe<Scalars['Boolean']>;
  updateProjectMember?: Maybe<Scalars['Boolean']>;
  updateProjectMemberRoles?: Maybe<Scalars['Boolean']>;
  updateProjectMembers?: Maybe<Scalars['Boolean']>;
  updateProjects?: Maybe<Scalars['Boolean']>;
  updateUser?: Maybe<Scalars['Boolean']>;
  updateUserLoginIdentitys?: Maybe<Scalars['Boolean']>;
  updateUserRoles?: Maybe<Scalars['Boolean']>;
  updateUserSocials?: Maybe<Scalars['Boolean']>;
  updateUsers?: Maybe<Scalars['Boolean']>;
};


export type MutationAcceptProjectInviteArgs = {
  inviteId: Scalars['ID'];
};


export type MutationCreateEBoardArgs = {
  record: EBoardInsertInput;
};


export type MutationCreateEBoardTermArgs = {
  record: EBoardTermInsertInput;
};


export type MutationCreateEBoardTermRoleArgs = {
  record: EBoardTermRoleInsertInput;
};


export type MutationCreateProjectArgs = {
  record: ProjectInsertInput;
};


export type MutationCreateProjectDiscordSettingsArgs = {
  record: ProjectDiscordSettingsInsertInput;
};


export type MutationCreateProjectInviteArgs = {
  record: ProjectInviteInsertInput;
};


export type MutationCreateProjectMemberArgs = {
  record: ProjectMemberInsertInput;
};


export type MutationCreateProjectMemberRoleArgs = {
  record: ProjectMemberRoleInsertInput;
};


export type MutationCreateUserArgs = {
  record: UserInsertInput;
};


export type MutationCreateUserLoginIdentityArgs = {
  record: UserLoginIdentityInsertInput;
};


export type MutationCreateUserRoleArgs = {
  record: UserRoleInsertInput;
};


export type MutationCreateUserSocialArgs = {
  record: UserSocialInsertInput;
};


export type MutationDeleteEBoardArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteEBoardTermArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteEBoardTermRolesArgs = {
  filter: EBoardTermRoleFilterInput;
};


export type MutationDeleteEBoardTermsArgs = {
  filter: EBoardTermFilterInput;
};


export type MutationDeleteEBoardsArgs = {
  filter: EBoardFilterInput;
};


export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProjectDiscordSettingssArgs = {
  filter: ProjectDiscordSettingsFilterInput;
};


export type MutationDeleteProjectInviteArgs = {
  inviteId: Scalars['ID'];
};


export type MutationDeleteProjectInvitesArgs = {
  filter: ProjectInviteFilterInput;
};


export type MutationDeleteProjectMemberArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProjectMemberRolesArgs = {
  filter: ProjectMemberRoleFilterInput;
};


export type MutationDeleteProjectMembersArgs = {
  filter: ProjectMemberFilterInput;
};


export type MutationDeleteProjectsArgs = {
  filter: ProjectFilterInput;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUserLoginIdentitysArgs = {
  filter: UserLoginIdentityFilterInput;
};


export type MutationDeleteUserRolesArgs = {
  filter: UserRoleFilterInput;
};


export type MutationDeleteUserSocialsArgs = {
  filter: UserSocialFilterInput;
};


export type MutationDeleteUsersArgs = {
  filter: UserFilterInput;
};


export type MutationJoinOpenProjectArgs = {
  projectId: Scalars['ID'];
};


export type MutationNewEBoardArgs = {
  input: NewEBoardInput;
};


export type MutationNewEBoardTermArgs = {
  input: NewEBoardTermInput;
};


export type MutationNewProjectArgs = {
  input: NewProjectInput;
};


export type MutationNewProjectInviteArgs = {
  input: NewProjectInviteInput;
};


export type MutationNewProjectMemberArgs = {
  input: NewProjectMemberInput;
};


export type MutationNewUserArgs = {
  input: NewUserInput;
};


export type MutationRequestProjectDiscordArgs = {
  projectId: Scalars['ID'];
};


export type MutationTransferProjectOwnershipArgs = {
  memberId: Scalars['ID'];
  projectId: Scalars['ID'];
};


export type MutationUpdateEBoardArgs = {
  input: UpdateEBoardInput;
};


export type MutationUpdateEBoardTermArgs = {
  input: UpdateEBoardTermInput;
};


export type MutationUpdateEBoardTermRolesArgs = {
  changes: EBoardTermRoleUpdateInput;
  filter: EBoardTermRoleFilterInput;
};


export type MutationUpdateEBoardTermsArgs = {
  changes: EBoardTermUpdateInput;
  filter: EBoardTermFilterInput;
};


export type MutationUpdateEBoardsArgs = {
  changes: EBoardUpdateInput;
  filter: EBoardFilterInput;
};


export type MutationUpdateProjectArgs = {
  input: UpdateProjectInput;
};


export type MutationUpdateProjectDiscordSettingssArgs = {
  changes: ProjectDiscordSettingsUpdateInput;
  filter: ProjectDiscordSettingsFilterInput;
};


export type MutationUpdateProjectInvitesArgs = {
  changes: ProjectInviteUpdateInput;
  filter: ProjectInviteFilterInput;
};


export type MutationUpdateProjectMemberArgs = {
  input: UpdateProjectMemberInput;
};


export type MutationUpdateProjectMemberRolesArgs = {
  changes: ProjectMemberRoleUpdateInput;
  filter: ProjectMemberRoleFilterInput;
};


export type MutationUpdateProjectMembersArgs = {
  changes: ProjectMemberUpdateInput;
  filter: ProjectMemberFilterInput;
};


export type MutationUpdateProjectsArgs = {
  changes: ProjectUpdateInput;
  filter: ProjectFilterInput;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};


export type MutationUpdateUserLoginIdentitysArgs = {
  changes: UserLoginIdentityUpdateInput;
  filter: UserLoginIdentityFilterInput;
};


export type MutationUpdateUserRolesArgs = {
  changes: UserRoleUpdateInput;
  filter: UserRoleFilterInput;
};


export type MutationUpdateUserSocialsArgs = {
  changes: UserSocialUpdateInput;
  filter: UserSocialFilterInput;
};


export type MutationUpdateUsersArgs = {
  changes: UserUpdateInput;
  filter: UserFilterInput;
};

export type NewEBoardInput = {
  userId: Scalars['ID'];
};

export type NewEBoardTermInput = {
  eBoardId: Scalars['ID'];
  year: Scalars['Int'];
};

export type NewProjectInput = {
  access: Access;
  name: Scalars['String'];
  pitch: Scalars['String'];
};

export type NewProjectInviteInput = {
  projectId: Scalars['ID'];
  type: InviteType;
  userId: Scalars['ID'];
};

export type NewProjectMemberInput = {
  projectId: Scalars['ID'];
  userId: Scalars['ID'];
};

export type NewProjectMemberRoleInput = {
  projectMemberId: Scalars['ID'];
  roleCode: RoleCode;
};

export type NewUserInput = {
  discordId?: InputMaybe<Scalars['String']>;
  displayName: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  username: Scalars['String'];
};

export type NewUserRoleInput = {
  roleCode: RoleCode;
  userId: Scalars['ID'];
};

export const Permission = {
  CreateProject: 'CREATE_PROJECT',
  CreateProjectMember: 'CREATE_PROJECT_MEMBER',
  CreateUser: 'CREATE_USER',
  DeleteProject: 'DELETE_PROJECT',
  DeleteUser: 'DELETE_USER',
  ManageEboard: 'MANAGE_EBOARD',
  ManageEboardRoles: 'MANAGE_EBOARD_ROLES',
  ManageMetadata: 'MANAGE_METADATA',
  ManageProjectInvites: 'MANAGE_PROJECT_INVITES',
  ManageProjectMember: 'MANAGE_PROJECT_MEMBER',
  ManageProjectMemberRoles: 'MANAGE_PROJECT_MEMBER_ROLES',
  ManageUserRoles: 'MANAGE_USER_ROLES',
  ReadUserPrivate: 'READ_USER_PRIVATE',
  TransferProjectOwnership: 'TRANSFER_PROJECT_OWNERSHIP',
  UpdateProject: 'UPDATE_PROJECT',
  UpdateUser: 'UPDATE_USER'
} as const;

export type Permission = typeof Permission[keyof typeof Permission];
export type PermissionFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Permission>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Permission>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<Permission>;
  nin?: InputMaybe<Array<Permission>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type Project = {
  __typename?: 'Project';
  access: Access;
  bannerLink?: Maybe<Scalars['String']>;
  cardImageLink?: Maybe<Scalars['String']>;
  completedAt?: Maybe<Scalars['Date']>;
  createdAt?: Maybe<Scalars['Date']>;
  description?: Maybe<Scalars['String']>;
  discordSettings?: Maybe<ProjectDiscordSettings>;
  downloadLinks?: Maybe<Array<Scalars['String']>>;
  galleryImageLinks?: Maybe<Array<Scalars['String']>>;
  id: Scalars['ID'];
  invites: Array<ProjectInvite>;
  members: Array<ProjectMember>;
  name: Scalars['String'];
  pitch: Scalars['String'];
  soundcloudEmbedSrc?: Maybe<Scalars['String']>;
  tags?: Maybe<Array<Scalars['String']>>;
  updatedAt?: Maybe<Scalars['Date']>;
};

export type ProjectDiscordSettings = {
  __typename?: 'ProjectDiscordSettings';
  categoryId?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  project: Project;
  projectId: Scalars['ID'];
  textChannelIds?: Maybe<Array<Scalars['String']>>;
  updatedAt?: Maybe<Scalars['Date']>;
  voiceChannelIds?: Maybe<Array<Scalars['String']>>;
};

export type ProjectDiscordSettingsFilterInput = {
  and_?: InputMaybe<Array<ProjectDiscordSettingsFilterInput>>;
  categoryId?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<ProjectDiscordSettingsFilterInput>>;
  or_?: InputMaybe<Array<ProjectDiscordSettingsFilterInput>>;
  projectId?: InputMaybe<IdFilterInput>;
  textChannelIds?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateFilterInput>;
  voiceChannelIds?: InputMaybe<StringFilterInput>;
};

export type ProjectDiscordSettingsFindInput = {
  filter?: InputMaybe<ProjectDiscordSettingsFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectDiscordSettingsRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectDiscordSettingsSortInput>>;
};

export type ProjectDiscordSettingsInsertInput = {
  categoryId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId: Scalars['ID'];
  textChannelIds?: InputMaybe<Array<Scalars['String']>>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  voiceChannelIds?: InputMaybe<Array<Scalars['String']>>;
};

export type ProjectDiscordSettingsRelationsFilterInput = {
  project?: InputMaybe<ProjectFindInput>;
};

export type ProjectDiscordSettingsSortInput = {
  categoryId?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  projectId?: InputMaybe<SortDirection>;
  textChannelIds?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
  voiceChannelIds?: InputMaybe<SortDirection>;
};

export type ProjectDiscordSettingsUpdateInput = {
  categoryId?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId?: InputMaybe<Scalars['ID']>;
  textChannelIds?: InputMaybe<Array<Scalars['String']>>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  voiceChannelIds?: InputMaybe<Array<Scalars['String']>>;
};

export type ProjectFilterInput = {
  access?: InputMaybe<AccessFilterInput>;
  and_?: InputMaybe<Array<ProjectFilterInput>>;
  bannerLink?: InputMaybe<StringFilterInput>;
  cardImageLink?: InputMaybe<StringFilterInput>;
  completedAt?: InputMaybe<DateFilterInput>;
  createdAt?: InputMaybe<DateFilterInput>;
  description?: InputMaybe<StringFilterInput>;
  downloadLinks?: InputMaybe<StringFilterInput>;
  galleryImageLinks?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  nor_?: InputMaybe<Array<ProjectFilterInput>>;
  or_?: InputMaybe<Array<ProjectFilterInput>>;
  pitch?: InputMaybe<StringFilterInput>;
  soundcloudEmbedSrc?: InputMaybe<StringFilterInput>;
  tags?: InputMaybe<StringFilterInput>;
  updatedAt?: InputMaybe<DateFilterInput>;
};

export type ProjectFindInput = {
  filter?: InputMaybe<ProjectFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectSortInput>>;
};

export type ProjectInsertInput = {
  access: Access;
  bannerLink?: InputMaybe<Scalars['String']>;
  cardImageLink?: InputMaybe<Scalars['String']>;
  completedAt?: InputMaybe<Scalars['Date']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  description?: InputMaybe<Scalars['String']>;
  downloadLinks?: InputMaybe<Array<Scalars['String']>>;
  galleryImageLinks?: InputMaybe<Array<Scalars['String']>>;
  name: Scalars['String'];
  pitch: Scalars['String'];
  soundcloudEmbedSrc?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  updatedAt?: InputMaybe<Scalars['Date']>;
};

export type ProjectInvite = {
  __typename?: 'ProjectInvite';
  createdAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  project: Project;
  projectId: Scalars['ID'];
  type: InviteType;
  user: User;
  userId: Scalars['ID'];
};

export type ProjectInviteFilterInput = {
  and_?: InputMaybe<Array<ProjectInviteFilterInput>>;
  createdAt?: InputMaybe<DateFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<ProjectInviteFilterInput>>;
  or_?: InputMaybe<Array<ProjectInviteFilterInput>>;
  projectId?: InputMaybe<IdFilterInput>;
  type?: InputMaybe<InviteTypeFilterInput>;
  userId?: InputMaybe<IdFilterInput>;
};

export type ProjectInviteFindInput = {
  filter?: InputMaybe<ProjectInviteFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectInviteRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectInviteSortInput>>;
};

export type ProjectInviteInsertInput = {
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId: Scalars['ID'];
  type: InviteType;
  userId: Scalars['ID'];
};

export type ProjectInviteRelationsFilterInput = {
  project?: InputMaybe<ProjectFindInput>;
  user?: InputMaybe<UserFindInput>;
};

export type ProjectInviteSortInput = {
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  projectId?: InputMaybe<SortDirection>;
  type?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
};

export type ProjectInviteSubscriptionFilter = {
  projectId?: InputMaybe<Scalars['ID']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type ProjectInviteUpdateInput = {
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId?: InputMaybe<Scalars['ID']>;
  type?: InputMaybe<InviteType>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type ProjectMember = {
  __typename?: 'ProjectMember';
  contributions?: Maybe<Scalars['String']>;
  createdAt?: Maybe<Scalars['Date']>;
  id: Scalars['ID'];
  project: Project;
  projectId: Scalars['ID'];
  roles: Array<ProjectMemberRole>;
  updatedAt?: Maybe<Scalars['Date']>;
  user: User;
  userId: Scalars['ID'];
};

export type ProjectMemberFilterInput = {
  and_?: InputMaybe<Array<ProjectMemberFilterInput>>;
  contributions?: InputMaybe<StringFilterInput>;
  createdAt?: InputMaybe<DateFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<ProjectMemberFilterInput>>;
  or_?: InputMaybe<Array<ProjectMemberFilterInput>>;
  projectId?: InputMaybe<IdFilterInput>;
  updatedAt?: InputMaybe<DateFilterInput>;
  userId?: InputMaybe<IdFilterInput>;
};

export type ProjectMemberFindInput = {
  filter?: InputMaybe<ProjectMemberFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectMemberRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectMemberSortInput>>;
};

export type ProjectMemberInsertInput = {
  contributions?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId: Scalars['ID'];
  updatedAt?: InputMaybe<Scalars['Date']>;
  userId: Scalars['ID'];
};

export type ProjectMemberRelationsFilterInput = {
  project?: InputMaybe<ProjectFindInput>;
  roles?: InputMaybe<ProjectMemberRoleFindInput>;
  user?: InputMaybe<UserFindInput>;
};

export type ProjectMemberRole = {
  __typename?: 'ProjectMemberRole';
  id: Scalars['ID'];
  projectMember: ProjectMember;
  projectMemberId: Scalars['ID'];
  roleCode: RoleCode;
};

export type ProjectMemberRoleFilterInput = {
  and_?: InputMaybe<Array<ProjectMemberRoleFilterInput>>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<ProjectMemberRoleFilterInput>>;
  or_?: InputMaybe<Array<ProjectMemberRoleFilterInput>>;
  projectMemberId?: InputMaybe<IdFilterInput>;
  roleCode?: InputMaybe<RoleCodeFilterInput>;
};

export type ProjectMemberRoleFindInput = {
  filter?: InputMaybe<ProjectMemberRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectMemberRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectMemberRoleSortInput>>;
};

export type ProjectMemberRoleInsertInput = {
  projectMemberId: Scalars['ID'];
  roleCode: RoleCode;
};

export type ProjectMemberRoleRelationsFilterInput = {
  projectMember?: InputMaybe<ProjectMemberFindInput>;
};

export type ProjectMemberRoleSortInput = {
  id?: InputMaybe<SortDirection>;
  projectMemberId?: InputMaybe<SortDirection>;
  roleCode?: InputMaybe<SortDirection>;
};

export type ProjectMemberRoleUpdateInput = {
  projectMemberId?: InputMaybe<Scalars['ID']>;
  roleCode?: InputMaybe<RoleCode>;
};

export type ProjectMemberSortInput = {
  contributions?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  projectId?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
};

export type ProjectMemberSubscriptionFilter = {
  projectId?: InputMaybe<Scalars['ID']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type ProjectMemberUpdateInput = {
  contributions?: InputMaybe<Scalars['String']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  projectId?: InputMaybe<Scalars['ID']>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type ProjectRelationsFilterInput = {
  discordSettings?: InputMaybe<ProjectDiscordSettingsFindInput>;
  invites?: InputMaybe<ProjectInviteFindInput>;
  members?: InputMaybe<ProjectMemberFindInput>;
};

export type ProjectSortInput = {
  access?: InputMaybe<SortDirection>;
  bannerLink?: InputMaybe<SortDirection>;
  cardImageLink?: InputMaybe<SortDirection>;
  completedAt?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  description?: InputMaybe<SortDirection>;
  downloadLinks?: InputMaybe<SortDirection>;
  galleryImageLinks?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  pitch?: InputMaybe<SortDirection>;
  soundcloudEmbedSrc?: InputMaybe<SortDirection>;
  tags?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type ProjectSubscriptionFilter = {
  projectId?: InputMaybe<Scalars['ID']>;
};

export type ProjectUpdateInput = {
  access?: InputMaybe<Access>;
  bannerLink?: InputMaybe<Scalars['String']>;
  cardImageLink?: InputMaybe<Scalars['String']>;
  completedAt?: InputMaybe<Scalars['Date']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  description?: InputMaybe<Scalars['String']>;
  downloadLinks?: InputMaybe<Array<Scalars['String']>>;
  galleryImageLinks?: InputMaybe<Array<Scalars['String']>>;
  name?: InputMaybe<Scalars['String']>;
  pitch?: InputMaybe<Scalars['String']>;
  soundcloudEmbedSrc?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
  updatedAt?: InputMaybe<Scalars['Date']>;
};

export type Query = {
  __typename?: 'Query';
  eBoardTermRoles: Array<EBoardTermRole>;
  eBoardTerms: Array<EBoardTerm>;
  eBoards: Array<EBoard>;
  isAuthTokenValid?: Maybe<Scalars['Boolean']>;
  projectDiscordSettingss: Array<ProjectDiscordSettings>;
  projectInvites: Array<ProjectInvite>;
  projectMemberRoles: Array<ProjectMemberRole>;
  projectMembers: Array<ProjectMember>;
  projects: Array<Project>;
  securityContext?: Maybe<Scalars['Json']>;
  securityPolicy?: Maybe<Scalars['Json']>;
  userLoginIdentitys: Array<UserLoginIdentity>;
  userRoles: Array<UserRole>;
  userSocials: Array<UserSocial>;
  users: Array<User>;
};


export type QueryEBoardTermRolesArgs = {
  filter?: InputMaybe<EBoardTermRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardTermRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardTermRoleSortInput>>;
};


export type QueryEBoardTermsArgs = {
  filter?: InputMaybe<EBoardTermFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardTermRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardTermSortInput>>;
};


export type QueryEBoardsArgs = {
  filter?: InputMaybe<EBoardFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<EBoardRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<EBoardSortInput>>;
};


export type QueryProjectDiscordSettingssArgs = {
  filter?: InputMaybe<ProjectDiscordSettingsFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectDiscordSettingsRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectDiscordSettingsSortInput>>;
};


export type QueryProjectInvitesArgs = {
  filter?: InputMaybe<ProjectInviteFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectInviteRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectInviteSortInput>>;
};


export type QueryProjectMemberRolesArgs = {
  filter?: InputMaybe<ProjectMemberRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectMemberRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectMemberRoleSortInput>>;
};


export type QueryProjectMembersArgs = {
  filter?: InputMaybe<ProjectMemberFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectMemberRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectMemberSortInput>>;
};


export type QueryProjectsArgs = {
  filter?: InputMaybe<ProjectFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<ProjectRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<ProjectSortInput>>;
};


export type QuerySecurityContextArgs = {
  userId?: InputMaybe<Scalars['ID']>;
};


export type QueryUserLoginIdentitysArgs = {
  filter?: InputMaybe<UserLoginIdentityFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserLoginIdentityRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserLoginIdentitySortInput>>;
};


export type QueryUserRolesArgs = {
  filter?: InputMaybe<UserRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserRoleSortInput>>;
};


export type QueryUserSocialsArgs = {
  filter?: InputMaybe<UserSocialFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserSocialRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserSocialSortInput>>;
};


export type QueryUsersArgs = {
  filter?: InputMaybe<UserFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserSortInput>>;
};

export const RoleCode = {
  Artist: 'ARTIST',
  BotDeveloper: 'BOT_DEVELOPER',
  ClubGraphicArtist: 'CLUB_GRAPHIC_ARTIST',
  Eboard: 'EBOARD',
  EventCoordinator: 'EVENT_COORDINATOR',
  GameDesigner: 'GAME_DESIGNER',
  Moderator: 'MODERATOR',
  Musician: 'MUSICIAN',
  Outreach: 'OUTREACH',
  President: 'PRESIDENT',
  Programmer: 'PROGRAMMER',
  ProjectMember: 'PROJECT_MEMBER',
  ProjectOfficer: 'PROJECT_OFFICER',
  ProjectOwner: 'PROJECT_OWNER',
  SoundDesigner: 'SOUND_DESIGNER',
  SuperAdmin: 'SUPER_ADMIN',
  Treasurer: 'TREASURER',
  User: 'USER',
  VicePresident: 'VICE_PRESIDENT',
  Webmaster: 'WEBMASTER',
  Writer: 'WRITER'
} as const;

export type RoleCode = typeof RoleCode[keyof typeof RoleCode];
export type RoleCodeFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<RoleCode>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<RoleCode>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<RoleCode>;
  nin?: InputMaybe<Array<RoleCode>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export const SortDirection = {
  Asc: 'asc',
  Desc: 'desc'
} as const;

export type SortDirection = typeof SortDirection[keyof typeof SortDirection];
export type StringFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['String']>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<Scalars['String']>;
  nin?: InputMaybe<Array<Scalars['String']>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export const StringFilterMode = {
  Insensitive: 'INSENSITIVE',
  Sensitive: 'SENSITIVE'
} as const;

export type StringFilterMode = typeof StringFilterMode[keyof typeof StringFilterMode];
export type Subscription = {
  __typename?: 'Subscription';
  eBoardCreated?: Maybe<Scalars['ID']>;
  eBoardDeleted?: Maybe<Scalars['ID']>;
  eBoardTermCreated?: Maybe<Scalars['ID']>;
  eBoardTermDeleted?: Maybe<Scalars['ID']>;
  eBoardTermUpdated?: Maybe<Scalars['ID']>;
  eBoardUpdated?: Maybe<Scalars['ID']>;
  projectCreated?: Maybe<Scalars['ID']>;
  projectDeleted?: Maybe<Scalars['ID']>;
  projectDiscordRequested?: Maybe<Scalars['ID']>;
  projectInviteCreated?: Maybe<Scalars['ID']>;
  projectInviteDeleted?: Maybe<Scalars['ID']>;
  projectMemberCreated?: Maybe<Scalars['ID']>;
  projectMemberDeleted?: Maybe<Scalars['ID']>;
  projectMemberUpdated?: Maybe<Scalars['ID']>;
  projectUpdated?: Maybe<Scalars['ID']>;
  userCreated?: Maybe<Scalars['ID']>;
  userDeleted?: Maybe<Scalars['ID']>;
  userUpdated?: Maybe<Scalars['ID']>;
};


export type SubscriptionEBoardCreatedArgs = {
  filter: EBoardSubscriptionFilter;
};


export type SubscriptionEBoardDeletedArgs = {
  filter: EBoardSubscriptionFilter;
};


export type SubscriptionEBoardTermCreatedArgs = {
  filter: EBoardTermSubscriptionFilter;
};


export type SubscriptionEBoardTermDeletedArgs = {
  filter: EBoardTermSubscriptionFilter;
};


export type SubscriptionEBoardTermUpdatedArgs = {
  filter: EBoardTermSubscriptionFilter;
};


export type SubscriptionEBoardUpdatedArgs = {
  filter: EBoardSubscriptionFilter;
};


export type SubscriptionProjectCreatedArgs = {
  filter: ProjectSubscriptionFilter;
};


export type SubscriptionProjectDeletedArgs = {
  filter: ProjectSubscriptionFilter;
};


export type SubscriptionProjectDiscordRequestedArgs = {
  filter: ProjectSubscriptionFilter;
};


export type SubscriptionProjectInviteCreatedArgs = {
  filter: ProjectInviteSubscriptionFilter;
};


export type SubscriptionProjectInviteDeletedArgs = {
  filter: ProjectInviteSubscriptionFilter;
};


export type SubscriptionProjectMemberCreatedArgs = {
  filter: ProjectMemberSubscriptionFilter;
};


export type SubscriptionProjectMemberDeletedArgs = {
  filter: ProjectMemberSubscriptionFilter;
};


export type SubscriptionProjectMemberUpdatedArgs = {
  filter: ProjectMemberSubscriptionFilter;
};


export type SubscriptionProjectUpdatedArgs = {
  filter: ProjectSubscriptionFilter;
};


export type SubscriptionUserCreatedArgs = {
  filter: UserSubscriptionFilter;
};


export type SubscriptionUserDeletedArgs = {
  filter: UserSubscriptionFilter;
};


export type SubscriptionUserUpdatedArgs = {
  filter: UserSubscriptionFilter;
};

export type SubscriptionInsertInput = {
  eBoardCreated?: InputMaybe<Scalars['ID']>;
  eBoardDeleted?: InputMaybe<Scalars['ID']>;
  eBoardTermCreated?: InputMaybe<Scalars['ID']>;
  eBoardTermDeleted?: InputMaybe<Scalars['ID']>;
  eBoardTermUpdated?: InputMaybe<Scalars['ID']>;
  eBoardUpdated?: InputMaybe<Scalars['ID']>;
  projectCreated?: InputMaybe<Scalars['ID']>;
  projectDeleted?: InputMaybe<Scalars['ID']>;
  projectDiscordRequested?: InputMaybe<Scalars['ID']>;
  projectInviteCreated?: InputMaybe<Scalars['ID']>;
  projectInviteDeleted?: InputMaybe<Scalars['ID']>;
  projectMemberCreated?: InputMaybe<Scalars['ID']>;
  projectMemberDeleted?: InputMaybe<Scalars['ID']>;
  projectMemberUpdated?: InputMaybe<Scalars['ID']>;
  projectUpdated?: InputMaybe<Scalars['ID']>;
  userCreated?: InputMaybe<Scalars['ID']>;
  userDeleted?: InputMaybe<Scalars['ID']>;
  userUpdated?: InputMaybe<Scalars['ID']>;
};

export type SubscriptionSortInput = {
  eBoardCreated?: InputMaybe<SortDirection>;
  eBoardDeleted?: InputMaybe<SortDirection>;
  eBoardTermCreated?: InputMaybe<SortDirection>;
  eBoardTermDeleted?: InputMaybe<SortDirection>;
  eBoardTermUpdated?: InputMaybe<SortDirection>;
  eBoardUpdated?: InputMaybe<SortDirection>;
  projectCreated?: InputMaybe<SortDirection>;
  projectDeleted?: InputMaybe<SortDirection>;
  projectDiscordRequested?: InputMaybe<SortDirection>;
  projectInviteCreated?: InputMaybe<SortDirection>;
  projectInviteDeleted?: InputMaybe<SortDirection>;
  projectMemberCreated?: InputMaybe<SortDirection>;
  projectMemberDeleted?: InputMaybe<SortDirection>;
  projectMemberUpdated?: InputMaybe<SortDirection>;
  projectUpdated?: InputMaybe<SortDirection>;
  userCreated?: InputMaybe<SortDirection>;
  userDeleted?: InputMaybe<SortDirection>;
  userUpdated?: InputMaybe<SortDirection>;
};

export type SubscriptionUpdateInput = {
  eBoardCreated?: InputMaybe<Scalars['ID']>;
  eBoardDeleted?: InputMaybe<Scalars['ID']>;
  eBoardTermCreated?: InputMaybe<Scalars['ID']>;
  eBoardTermDeleted?: InputMaybe<Scalars['ID']>;
  eBoardTermUpdated?: InputMaybe<Scalars['ID']>;
  eBoardUpdated?: InputMaybe<Scalars['ID']>;
  projectCreated?: InputMaybe<Scalars['ID']>;
  projectDeleted?: InputMaybe<Scalars['ID']>;
  projectDiscordRequested?: InputMaybe<Scalars['ID']>;
  projectInviteCreated?: InputMaybe<Scalars['ID']>;
  projectInviteDeleted?: InputMaybe<Scalars['ID']>;
  projectMemberCreated?: InputMaybe<Scalars['ID']>;
  projectMemberDeleted?: InputMaybe<Scalars['ID']>;
  projectMemberUpdated?: InputMaybe<Scalars['ID']>;
  projectUpdated?: InputMaybe<Scalars['ID']>;
  userCreated?: InputMaybe<Scalars['ID']>;
  userDeleted?: InputMaybe<Scalars['ID']>;
  userUpdated?: InputMaybe<Scalars['ID']>;
};

export type UpdateEBoardInput = {
  avatar?: InputMaybe<UploadWithOperation>;
  bio?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type UpdateEBoardTermInput = {
  id: Scalars['ID'];
  roles?: InputMaybe<Array<RoleCode>>;
  year?: InputMaybe<Scalars['Int']>;
};

export type UpdateProjectInput = {
  access?: InputMaybe<Access>;
  banner?: InputMaybe<UploadWithOperation>;
  cardImage?: InputMaybe<UploadWithOperation>;
  completed?: InputMaybe<Scalars['Boolean']>;
  completedAt?: InputMaybe<Scalars['Date']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  description?: InputMaybe<Scalars['String']>;
  downloadLinks?: InputMaybe<Array<Scalars['String']>>;
  galleryImages?: InputMaybe<Array<UploadOrSource>>;
  id: Scalars['ID'];
  name?: InputMaybe<Scalars['String']>;
  pitch?: InputMaybe<Scalars['String']>;
  soundcloudEmbedSrc?: InputMaybe<Scalars['String']>;
  tags?: InputMaybe<Array<Scalars['String']>>;
};

export type UpdateProjectMemberInput = {
  contributions?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  roles?: InputMaybe<Array<RoleCode>>;
};

export type UpdateUserInput = {
  avatar?: InputMaybe<UploadWithOperation>;
  banner?: InputMaybe<UploadWithOperation>;
  bio?: InputMaybe<Scalars['String']>;
  classYear?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  displayName?: InputMaybe<Scalars['String']>;
  id: Scalars['ID'];
  roles?: InputMaybe<Array<RoleCode>>;
  socials?: InputMaybe<Array<UpdateUserSocialInput>>;
};

export type UpdateUserSocialInput = {
  link: Scalars['String'];
  platform: Scalars['String'];
  username: Scalars['String'];
};

export type UploadFilterInput = {
  eq?: InputMaybe<Scalars['Upload']>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<Scalars['Upload']>>;
  ne?: InputMaybe<Scalars['Upload']>;
  nin?: InputMaybe<Array<Scalars['Upload']>>;
};

export const UploadOperation = {
  Delete: 'DELETE',
  Insert: 'INSERT'
} as const;

export type UploadOperation = typeof UploadOperation[keyof typeof UploadOperation];
export type UploadOperationFilterInput = {
  contains?: InputMaybe<Scalars['String']>;
  endsWith?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<UploadOperation>;
  exists?: InputMaybe<Scalars['Boolean']>;
  in?: InputMaybe<Array<UploadOperation>>;
  mode?: InputMaybe<StringFilterMode>;
  ne?: InputMaybe<UploadOperation>;
  nin?: InputMaybe<Array<UploadOperation>>;
  startsWith?: InputMaybe<Scalars['String']>;
};

export type UploadOrSource = {
  source?: InputMaybe<Scalars['String']>;
  upload?: InputMaybe<Scalars['Upload']>;
};

export type UploadWithOperation = {
  operation?: InputMaybe<UploadOperation>;
  upload?: InputMaybe<Scalars['Upload']>;
};

export type User = {
  __typename?: 'User';
  avatarLink?: Maybe<Scalars['String']>;
  bannerLink?: Maybe<Scalars['String']>;
  bio?: Maybe<Scalars['String']>;
  classYear?: Maybe<Scalars['Int']>;
  createdAt?: Maybe<Scalars['Date']>;
  displayName: Scalars['String'];
  eBoard?: Maybe<EBoard>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  loginIdentities: Array<UserLoginIdentity>;
  projectInvites: Array<ProjectInvite>;
  projectMembers: Array<ProjectMember>;
  roles: Array<UserRole>;
  socials: Array<UserSocial>;
  updatedAt?: Maybe<Scalars['Date']>;
  username: Scalars['String'];
};

export type UserFilterInput = {
  and_?: InputMaybe<Array<UserFilterInput>>;
  avatarLink?: InputMaybe<StringFilterInput>;
  bannerLink?: InputMaybe<StringFilterInput>;
  bio?: InputMaybe<StringFilterInput>;
  classYear?: InputMaybe<IntFilterInput>;
  createdAt?: InputMaybe<DateFilterInput>;
  displayName?: InputMaybe<StringFilterInput>;
  email?: InputMaybe<StringFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<UserFilterInput>>;
  or_?: InputMaybe<Array<UserFilterInput>>;
  updatedAt?: InputMaybe<DateFilterInput>;
  username?: InputMaybe<StringFilterInput>;
};

export type UserFindInput = {
  filter?: InputMaybe<UserFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserSortInput>>;
};

export type UserInsertInput = {
  avatarLink?: InputMaybe<Scalars['String']>;
  bannerLink?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  classYear?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  displayName: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  username: Scalars['String'];
};

export type UserLoginIdentity = {
  __typename?: 'UserLoginIdentity';
  data?: Maybe<Scalars['Json']>;
  id: Scalars['ID'];
  identityId: Scalars['String'];
  name: Scalars['String'];
  user: User;
  userId: Scalars['ID'];
};

export type UserLoginIdentityFilterInput = {
  and_?: InputMaybe<Array<UserLoginIdentityFilterInput>>;
  data?: InputMaybe<JsonFilterInput>;
  id?: InputMaybe<IdFilterInput>;
  identityId?: InputMaybe<StringFilterInput>;
  name?: InputMaybe<StringFilterInput>;
  nor_?: InputMaybe<Array<UserLoginIdentityFilterInput>>;
  or_?: InputMaybe<Array<UserLoginIdentityFilterInput>>;
  userId?: InputMaybe<IdFilterInput>;
};

export type UserLoginIdentityFindInput = {
  filter?: InputMaybe<UserLoginIdentityFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserLoginIdentityRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserLoginIdentitySortInput>>;
};

export type UserLoginIdentityInsertInput = {
  data?: InputMaybe<Scalars['Json']>;
  identityId: Scalars['String'];
  name: Scalars['String'];
  userId: Scalars['ID'];
};

export type UserLoginIdentityRelationsFilterInput = {
  user?: InputMaybe<UserFindInput>;
};

export type UserLoginIdentitySortInput = {
  data?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  identityId?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
};

export type UserLoginIdentityUpdateInput = {
  data?: InputMaybe<Scalars['Json']>;
  identityId?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type UserRelationsFilterInput = {
  eBoard?: InputMaybe<EBoardFindInput>;
  loginIdentities?: InputMaybe<UserLoginIdentityFindInput>;
  projectInvites?: InputMaybe<ProjectInviteFindInput>;
  projectMembers?: InputMaybe<ProjectMemberFindInput>;
  roles?: InputMaybe<UserRoleFindInput>;
  socials?: InputMaybe<UserSocialFindInput>;
};

export type UserRole = {
  __typename?: 'UserRole';
  id: Scalars['ID'];
  roleCode: RoleCode;
  user: User;
  userId: Scalars['ID'];
};

export type UserRoleFilterInput = {
  and_?: InputMaybe<Array<UserRoleFilterInput>>;
  id?: InputMaybe<IdFilterInput>;
  nor_?: InputMaybe<Array<UserRoleFilterInput>>;
  or_?: InputMaybe<Array<UserRoleFilterInput>>;
  roleCode?: InputMaybe<RoleCodeFilterInput>;
  userId?: InputMaybe<IdFilterInput>;
};

export type UserRoleFindInput = {
  filter?: InputMaybe<UserRoleFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserRoleRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserRoleSortInput>>;
};

export type UserRoleInsertInput = {
  roleCode: RoleCode;
  userId: Scalars['ID'];
};

export type UserRoleRelationsFilterInput = {
  user?: InputMaybe<UserFindInput>;
};

export type UserRoleSortInput = {
  id?: InputMaybe<SortDirection>;
  roleCode?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
};

export type UserRoleUpdateInput = {
  roleCode?: InputMaybe<RoleCode>;
  userId?: InputMaybe<Scalars['ID']>;
};

export type UserSocial = {
  __typename?: 'UserSocial';
  id: Scalars['ID'];
  link: Scalars['String'];
  platform: Scalars['String'];
  user: User;
  userId: Scalars['ID'];
  username: Scalars['String'];
};

export type UserSocialFilterInput = {
  and_?: InputMaybe<Array<UserSocialFilterInput>>;
  id?: InputMaybe<IdFilterInput>;
  link?: InputMaybe<StringFilterInput>;
  nor_?: InputMaybe<Array<UserSocialFilterInput>>;
  or_?: InputMaybe<Array<UserSocialFilterInput>>;
  platform?: InputMaybe<StringFilterInput>;
  userId?: InputMaybe<IdFilterInput>;
  username?: InputMaybe<StringFilterInput>;
};

export type UserSocialFindInput = {
  filter?: InputMaybe<UserSocialFilterInput>;
  limit?: InputMaybe<Scalars['Int']>;
  relations?: InputMaybe<UserSocialRelationsFilterInput>;
  skip?: InputMaybe<Scalars['Int']>;
  sorts?: InputMaybe<Array<UserSocialSortInput>>;
};

export type UserSocialInsertInput = {
  link: Scalars['String'];
  platform: Scalars['String'];
  userId: Scalars['ID'];
  username: Scalars['String'];
};

export type UserSocialRelationsFilterInput = {
  user?: InputMaybe<UserFindInput>;
};

export type UserSocialSortInput = {
  id?: InputMaybe<SortDirection>;
  link?: InputMaybe<SortDirection>;
  platform?: InputMaybe<SortDirection>;
  userId?: InputMaybe<SortDirection>;
  username?: InputMaybe<SortDirection>;
};

export type UserSocialUpdateInput = {
  link?: InputMaybe<Scalars['String']>;
  platform?: InputMaybe<Scalars['String']>;
  userId?: InputMaybe<Scalars['ID']>;
  username?: InputMaybe<Scalars['String']>;
};

export type UserSortInput = {
  avatarLink?: InputMaybe<SortDirection>;
  bannerLink?: InputMaybe<SortDirection>;
  bio?: InputMaybe<SortDirection>;
  classYear?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  displayName?: InputMaybe<SortDirection>;
  email?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
  username?: InputMaybe<SortDirection>;
};

export type UserSubscriptionFilter = {
  userId?: InputMaybe<Scalars['ID']>;
};

export type UserUpdateInput = {
  avatarLink?: InputMaybe<Scalars['String']>;
  bannerLink?: InputMaybe<Scalars['String']>;
  bio?: InputMaybe<Scalars['String']>;
  classYear?: InputMaybe<Scalars['Int']>;
  createdAt?: InputMaybe<Scalars['Date']>;
  displayName?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  updatedAt?: InputMaybe<Scalars['Date']>;
  username?: InputMaybe<Scalars['String']>;
};