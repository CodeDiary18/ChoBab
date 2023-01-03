import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { MergedRestaurantType } from '@restaurant/restaurant';
import { Cache } from 'cache-manager';
import { CandidateHashType, JoinListType, UserType } from '@cache/redis';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  // 각 도메인 별 Redis key를 반환하는 객체
  private readonly redisKey = {
    restaurantList: (roomCode: string) => `ROOM_CODE:${roomCode}:RESTAURANT_LIST`,
    candidateList: (roomCode: string) => `ROOM_CODE:${roomCode}:CANDIDATE_LIST`,
    joinList: (roomCode: string) => `ROOM_CODE:${roomCode}:JOIN_LIST`,
  };

  restaurantList = {
    // 초기 모임 생성 시 음식점 정보를 Redis에 적재하는 로직
    setRestaurantListForRoom: async (roomCode: string, restaurantList: MergedRestaurantType[]) => {
      const restaurantListKey = this.redisKey.restaurantList(roomCode);
      await this.cacheManager.set(restaurantListKey, restaurantList);
    },

    // 방 코드를 이용하여 해당 모임에서 사용하는 음식점 데이터를 반환
    getRestaurantListForRoom: async (roomCode: string) => {
      const restaurantListKey = this.redisKey.restaurantList(roomCode);
      const result = await this.cacheManager.get<MergedRestaurantType[]>(restaurantListKey);
      return result;
    },
  };

  candidateList = {
    // 모임 생성 시 이후 사용할 빈 후보 음식점 리스트를 생성 후 Redis에 적재
    createEmptyCandidateListForRoom: async (
      roomCode: string,
      restaurantList: MergedRestaurantType[]
    ) => {
      const candidateListKey = this.redisKey.candidateList(roomCode);
      const candidateHash = restaurantList.reduce((hash, restaurant) => {
        hash[restaurant.id] = [];
        return hash;
      }, {});
      await this.cacheManager.set(candidateListKey, candidateHash);
    },

    // 방 코드를 이용하여 해당 모임의 후보 음식점 리스트를 반환
    getCandidateList: async (roomCode: string) => {
      const candidateListKey = this.redisKey.candidateList(roomCode);
      const candidateHash = this.cacheManager.get<CandidateHashType>(candidateListKey);
      return candidateHash;
    },

    // 좋아요 투표를 수행하고 이에 대한 성공 여부를 반환
    voteCandidate: async (
      roomCode: string,
      userId: string,
      restaurantId: string
    ): Promise<boolean> => {
      const candidateListKey = this.redisKey.candidateList(roomCode);
      const candidateHash = await this.cacheManager.get<CandidateHashType>(candidateListKey);
      const restaurantVoteList = candidateHash[restaurantId];
      if (!restaurantVoteList) {
        return false;
      }
      // 이미 투표한 식당에 대한 처리
      if (restaurantVoteList.find((voter) => voter === userId)) {
        return false;
      }
      restaurantVoteList.push(userId);
      await this.cacheManager.set(candidateListKey, candidateHash);
      return true;
    },

    // 투표 취소를 수행하고 이에 대한 성공 여부를 반환
    cancelVoteCandidate: async (
      roomCode: string,
      userId: string,
      restaurantId: string
    ): Promise<boolean> => {
      const candidateListKey = this.redisKey.candidateList(roomCode);
      const candidateHash = await this.cacheManager.get<CandidateHashType>(candidateListKey);
      const restaurantVoteList = candidateHash[restaurantId];
      if (!restaurantVoteList) {
        // 이후 throw로 예외처리 필요
        return false;
      }
      // 이전에 투표한 적 없는 식당에 대한 처리
      if (!restaurantVoteList.find((voter) => voter === userId)) {
        return false;
      }
      candidateHash[restaurantId] = restaurantVoteList.filter((voter) => voter !== userId);
      await this.cacheManager.set(candidateListKey, candidateHash);
      return true;
    },
  };

  joinList = {
    // 모임 생성 시 사용자들이 입장할 빈 리스트 생성
    createEmptyJoinListForRoom: async (roomCode: string) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      await this.cacheManager.set(joinListKey, {});
    },

    // 방 코드를 이용하여 현재 참여자 리스트를 반환
    getJoinList: async (roomCode: string) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);
      return findJoinHash;
    },

    getUserInfo: async (roomCode: string, userId: string) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);
      return findJoinHash[userId];
    },

    setUserOnline: async (roomCode: string, userId: string) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);
      findJoinHash[userId] = { ...findJoinHash[userId], isOnline: true };
      await this.cacheManager.set(joinListKey, findJoinHash);
    },

    // 사용자가 모임에 참여하는 로직
    addUserToJoinList: async (roomCode: string, user: UserType) => {
      const { userId } = user;

      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);

      const addUserData = {};
      addUserData[userId] = user;
      await this.cacheManager.set(joinListKey, { ...findJoinHash, ...addUserData });
    },

    // 사용자를 모임에서 내보내는 로직 => offline 처리하는 함수로 내부로직 변경
    delUserToJoinList: async (roomCode: string, userId: string) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);
      // 해당 방에 이미 접속해있지 않을 때
      if (!findJoinHash[userId]) {
        return;
      }
      findJoinHash[userId] = { ...findJoinHash[userId], isOnline: false };
      await this.cacheManager.set(joinListKey, findJoinHash);
    },

    // 모임에 접속된 사용자의 위치 정보를 수정하고 성공 여부를 반환
    updateUserLocationDataToJoinList: async (
      roomCode: string,
      userId: string,
      newPosition: { userLat: number; userLng: number }
    ) => {
      const joinListKey = this.redisKey.joinList(roomCode);
      const findJoinHash = await this.cacheManager.get<JoinListType>(joinListKey);

      // 접속자 리스트에 수정하려는 사용자가 존재하지 않을 때
      if (!findJoinHash[userId]) {
        return false;
      }

      const { userLat, userLng } = newPosition;
      findJoinHash[userId] = { ...findJoinHash[userId], userLat, userLng };

      await this.cacheManager.set(joinListKey, findJoinHash);
      return true;
    },
  };
}
