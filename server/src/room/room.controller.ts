import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateRoomDto } from '@room/dto/create-room.dto';
import { RoomService } from '@room/room.service';
import { CustomException } from '@common/exceptions/custom.exception';
import { ROOM_EXCEPTION, ROOM_RES } from '@room/room.response';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto) {
    const { lat, lng, radius } = createRoomDto;
    const roomCode = await this.roomService.createRoom(lat, lng, radius);
    return ROOM_RES.SUCCESS_CREATE_ROOM(roomCode);
  }

  @Get('valid')
  async validRoom(@Query('roomCode') roomCode: string) {
    const isRoomValid = await this.roomService.validRoom(roomCode);
    if (!isRoomValid) {
      throw new CustomException(ROOM_EXCEPTION.FAIL_VALID_ROOM);
    }

    return ROOM_RES.SUCCESS_VALID_ROOM;
  }
}
