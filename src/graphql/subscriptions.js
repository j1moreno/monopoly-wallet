/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onUpdatePlayer = /* GraphQL */ `
  subscription OnUpdatePlayer($id: ID) {
    onUpdatePlayer(id: $id) {
      id
      gameId
      name
      account
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateGame = /* GraphQL */ `
  subscription OnUpdateGame($id: ID) {
    onUpdateGame(id: $id) {
      id
      password
      players {
        items {
          id
          gameId
          name
          account
          createdAt
          updatedAt
        }
        nextToken
      }
      events
      createdAt
      updatedAt
    }
  }
`;
