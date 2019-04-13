import { Nullable } from 'typescript-nullable';
import { getType } from 'typesafe-actions';
import { repoSaveSucceeded } from '../actions';
import { RootAction } from '../util';
import { ApiRepo } from '../deltas';

export type RepoState = Nullable<ApiRepo>;

const defaultState: RepoState = null;

export const repoReducer = (
  state: RepoState = defaultState,
  action: RootAction
) => {
  switch (action.type) {
    case getType(repoSaveSucceeded):
      return action.payload.response;
    default:
      return state;
  }
};