import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from '@room/room.schema';
import { RoomController } from '@room/room.controller';
import { RoomService } from '@room/room.service';
import { RedisModule } from '@cache/redis.module';
import { RestaurantModule } from '@restaurant/restaurant.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
    RedisModule,
    RestaurantModule,
  ],
  controllers: [RoomController],
  providers: [RoomService],
})
export class RoomModule {}
