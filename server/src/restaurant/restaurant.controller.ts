import { RESTAURANT_RES } from '@common/response/restaurant';
import { Controller, Get, Query } from '@nestjs/common';
import { GetRestaurantDetailQueryDto } from './dto/get-restaurant-detail-query.dto';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // 당장 이를 사용하지 않기로
  @Get()
  async getRestaurantDetail(@Query() getRestaurantDetailDto: GetRestaurantDetailQueryDto) {
    const { name, address, lat, lng, restaurantId: id } = getRestaurantDetailDto;
    const { rating, priceLevel } = await this.restaurantService.getRestaurantDetail(
      id,
      address,
      name,
      lat,
      lng
    );

    return RESTAURANT_RES.SUCCESS_SEARCH_RESTAURANT_DETAIL(rating, priceLevel);
  }
}
