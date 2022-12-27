import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CustomException } from '@common/exceptions/custom.exception';
import { isInKorea } from '@utils/location';
import { NaverDrivingResType, TraoptimalType } from '@map/map';
import { NAVER_DRIVING_API_URL } from '@constants/api';
import { COMMON_EXCEPTION } from '@response/common';
import { LOCATION_EXCEPTION } from '@response/location';
import { MAP_EXCEPTION } from '@map/map.response';
import { plainToInstance } from 'class-transformer';
import { SummaryDto } from '@map/dto/summary.dto';

@Injectable()
export class MapService {
  private readonly NAVER_MAP_API_CLIENT_ID: string;
  private readonly NAVER_MAP_API_CLIENT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.NAVER_MAP_API_CLIENT_ID = configService.get('NAVER_MAP_API_CLIENT_ID');
    this.NAVER_MAP_API_CLIENT_SECRET = configService.get('NAVER_MAP_API_CLIENT_SECRET');
  }

  /**
   * 좌표 데이터 유효성 검사
   */
  private validPosData(pos: number[]) {
    if (pos.length !== 2) {
      throw new CustomException(COMMON_EXCEPTION.INVALID_QUERY_PARAMS);
    }

    const [lng, lat] = pos;
    if (!isInKorea(lat, lng)) {
      throw new CustomException(LOCATION_EXCEPTION.OUT_OF_KOREA);
    }
  }

  async drivingInfo(start: number[], goal: number[]) {
    // 출발지, 도착지 좌표 데이터 유효성 검사
    this.validPosData(start);
    this.validPosData(goal);

    const startPos = start.join(',');
    const goalPos = goal.join(',');
    if (startPos === goalPos) {
      throw new CustomException(MAP_EXCEPTION.INVALID_GOAL);
    }

    const { summary, path } = await this.getDrivingInfo(startPos, goalPos);
    const summaryInstance = plainToInstance(SummaryDto, summary, {
      excludeExtraneousValues: true,
    });
    return { ...summaryInstance, path };
  }

  /**
   * Naver Map Direction5를 통해 출발/도착지에 대한 길찾기 요청을 보내고 응답을 받음
   */
  async getDrivingInfo(startPos: string, goalPos: string): Promise<TraoptimalType> {
    try {
      const { data } = await axios.get<NaverDrivingResType>(NAVER_DRIVING_API_URL, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.NAVER_MAP_API_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': this.NAVER_MAP_API_CLIENT_SECRET,
        },
        params: { start: startPos, goal: goalPos },
      });

      if (data?.code !== 0) {
        throw new Error();
      }
      return data.route.traoptimal[0];
    } catch (error) {
      throw new CustomException(MAP_EXCEPTION.FAIL_GET_DRIVING_INFO);
    }
  }
}
