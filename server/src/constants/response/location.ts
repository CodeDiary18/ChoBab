import { FAIL_RES } from '@response/index';

export const LOCATION_EXCEPTION = {
  OUT_OF_KOREA: FAIL_RES('대한민국을 벗어난 입력입니다.'),
  OUT_OF_MAX_RADIUS: FAIL_RES('최대 탐색 반경을 벗어난 입력입니다.'),
};
