import { gql } from '@apollo/client';
import { ProjectSubscriptionFilter } from '@src/generated/model.types';
import { Client } from 'discord.js';
import { BackendService } from './backend';

export class ProjectService {
  constructor(public client: Client, public backend: BackendService) {
    backend
      .withAuth()
      .subscribe({
        query: gql`
          subscription ProjectDiscordRequestHandler($filter: ProjectSubscriptionFilter) {
            projectDiscordRequested(filter: $filter)
          }
        `,
        variables: {
          // Empty filter for now because we want to listen to everything
          filter: <ProjectSubscriptionFilter>{},
        },
      })
      .subscribe((result) => {
        if (result.errors) return;

        console.log('Got result with data:');
        console.log(result.data);
      });
  }
}
