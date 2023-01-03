import { RestaurantIdType } from '@restaurant/restaurant';

type UserIdType = string;

export interface UserType {
  userId: UserIdType;
  userLat: number;
  userLng: number;
  userName: string;
  isOnline: boolean;
}

export interface CandidateHashType {
  [index: RestaurantIdType]: UserIdType[];
}

export interface JoinListType {
  [index: UserIdType]: UserType;
}
