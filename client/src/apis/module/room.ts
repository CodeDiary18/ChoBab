import { API_URL } from '@constants/url';
import ApiService from '@apis/index';

export const RoomService = {
  validRoom: async (roomCode: string) => {
    const {
      data: {
        data: { isRoomValid },
      },
    } = await ApiService.get<ResTemplateType<RoomValidType>>(API_URL.VALID_ROOM, {
      params: { roomCode },
    });
    return isRoomValid;
  },

  createRoom: async (lat: number, lng: number) => {
    const {
      data: {
        data: { roomCode },
      },
    } = await ApiService.post<ResTemplateType<RoomCodeType>>(API_URL.CREATE_ROOM, {
      lat,
      lng,
    });

    return roomCode;
  },
};
