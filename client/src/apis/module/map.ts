import { API_URL } from '@constants/url';
import ApiService from '@apis/index';

export const MapService = {
  getDrivingInfo: async (startLat: number, startLng: number, goalLat: number, goalLng: number) => {
    const {
      data: { data: drivingInfoData },
    } = await ApiService.get<ResTemplateType<DrivingInfoType>>(API_URL.DRIVING_INFO, {
      params: {
        start: `${startLng},${startLat}`,
        goal: `${goalLng},${goalLat}`,
      },
    });
    return drivingInfoData;
  },
};
