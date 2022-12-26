import { FAIL_RES, SUCCESS_RES } from '@response/index';
import { DrivingInfoType } from '@map/map';

export const MAP_RES = {
  SUCCESS_GET_DRIVING_INFO: (data: DrivingInfoType) => {
    return SUCCESS_RES('성공적으로 경로 정보를 가져왔습니다.', data);
  },
};

export const MAP_EXCEPTION = {
  FAIL_GET_DRIVING_INFO: FAIL_RES('길찾기 정보를 가져오는데 실패했습니다.'),
  INVALID_GOAL: FAIL_RES('출발지와 도착지가 같습니다.'),
};
