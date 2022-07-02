import { gql } from '@apollo/client/core';
import { SecurityContext } from '@src/shared/security';
import { BackendService } from './backend';

export class GraphQLAPIService {
  constructor(private backend: BackendService) {}

  async securityContext(userId?: string) {
    const result = await this.backend.query<{
      securityContext: SecurityContext;
    }>({
      query: gql`
        query GetSecurityContext($userId: ID) {
          securityContext(userId: $userId)
        }
      `,
      variables: {
        userId,
      },
    });
    if (result.error) throw result.error;
    return result.data.securityContext;
  }
}
