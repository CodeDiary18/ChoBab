import { InjectModel } from '@nestjs/mongoose';
import { Logger, OnModuleInit } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { NextFunction, Request, Response } from 'express';

import { Room, RoomDocument } from '@room/room.schema';
import { makeUserRandomNickname } from '@utils/nickname';
import { sessionMiddleware } from '@utils/session';

import { RedisService } from '@cache/redis.service';

import { VoteResultType } from '@socket/socket';
import { SOCKET_RES } from '@socket/socket.response';
import { VoteRestaurantDto } from '@socket/dto/vote-restaurant.dto';
import { ConnectRoomDto } from '@socket/dto/connect-room.dto';
import { UserLocationDto } from '@socket/dto/user-location.dto';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ namespace: 'room' })
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private readonly COOKIE_SECRET = this.configService.get('COOKIE_SECRET');
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) {
    this.COOKIE_SECRET = this.configService.get('COOKIE_SECRET');
  }

  onModuleInit() {
    this.server.use((socket, next) => {
      sessionMiddleware(this.COOKIE_SECRET)(
        socket.request as Request,
        {} as Response,
        next as NextFunction
      );
    });

    this.server.use((socket: Socket, next) => {
      const req = socket.request;

      Object.assign(socket, { sessionID: req.sessionID });

      next();
    });
  }

  @SubscribeMessage('connectRoom')
  async handleConnectRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() connectRoomDto: ConnectRoomDto
  ) {
    const { roomCode, userLat, userLng } = connectRoomDto;

    client.roomCode = roomCode;

    client.join(roomCode);

    try {
      const { lat, lng } = await this.roomModel.findOne({ roomCode });

      const restaurantList = await this.redisService.restaurantList.getRestaurantListForRoom(
        roomCode
      );

      const { sessionID: userId } = client.request;

      let user = await this.redisService.joinList.getUserInfo(roomCode, userId);

      if (!user) {
        user = { userId, userLat, userLng, userName: makeUserRandomNickname(), isOnline: true };
        await this.redisService.joinList.addUserToJoinList(roomCode, user);
      } else {
        await this.redisService.joinList.setUserOnline(roomCode, userId);
      }

      const newUserList = await this.redisService.joinList.getJoinList(roomCode);

      client.emit(
        'connectResult',
        SOCKET_RES.CONNECT_SUCCESS(
          roomCode,
          lat,
          lng,
          restaurantList,
          newUserList,
          user.userId,
          user.userName
        )
      );

      client.to(roomCode).emit('join', SOCKET_RES.JOIN_USER({ ...user, isOnline: true }));
    } catch (error) {
      client.emit('connectResult', SOCKET_RES.CONNECT_FAIL);
    }
  }

  afterInit() {
    this.logger.log('Initialized!');
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected - [sessionId] ${client.sessionID}`);
  }

  @SubscribeMessage('changeMyLocation')
  async handleMyLoc(
    @ConnectedSocket() client: Socket,
    @MessageBody() userLocationDto: UserLocationDto
  ) {
    const { sessionID, roomCode } = client;
    const { userLat, userLng } = userLocationDto;

    // ?????? ?????? ????????????
    await this.redisService.joinList.updateUserLocationDataToJoinList(roomCode, sessionID, {
      userLat,
      userLng,
    });

    // ?????? ??????????????? ???????????? ??? ????????? ??????
    this.server
      .in(roomCode)
      .emit(
        'changeUserLocation',
        SOCKET_RES.CHANGED_USER_LOCATION({ userId: sessionID, userLat, userLng })
      );
  }

  // ?????? ??????
  @SubscribeMessage('voteRestaurant')
  async voteRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() voteRestaurantDto: VoteRestaurantDto
  ) {
    const { restaurantId } = voteRestaurantDto;
    const roomCode = client.roomCode;

    try {
      const voteResult = await this.redisService.candidateList.voteCandidate(
        roomCode,
        client.sessionID,
        restaurantId
      );
      if (!voteResult) {
        throw new Error();
      }

      client.emit('voteRestaurantResult', SOCKET_RES.VOTE_RESTAURANT_SUCCESS(restaurantId));

      // ?????? ?????? ?????? ??? - ????????????????????? ???????????? ????????? ????????? id ????????? ??????
      this.getUserVoteRestaurantIdList(client);

      const candidateList = await this.redisService.candidateList.getCandidateList(roomCode);

      const voteCountResult = this.getCurrentVoteResult(candidateList);

      // ???????????? ?????? ?????????????????? ?????? ?????? ??????
      this.server
        .in(roomCode)
        .emit('voteResultUpdate', SOCKET_RES.UPDATE_VOTE_RESULT(voteCountResult));
    } catch (error) {
      client.emit('voteRestaurantResult', SOCKET_RES.VOTE_RESTAURANT_FAIL);
    }
  }

  // ?????? ?????? ??????
  @SubscribeMessage('cancelVoteRestaurant')
  async cancelVoteRestaurant(
    @ConnectedSocket() client: Socket,
    @MessageBody() voteRestaurantDto: VoteRestaurantDto
  ) {
    const { restaurantId } = voteRestaurantDto;
    const roomCode = client.roomCode;

    try {
      const voteResult = await this.redisService.candidateList.cancelVoteCandidate(
        roomCode,
        client.sessionID,
        restaurantId
      );

      if (!voteResult) {
        throw new Error();
      }

      client.emit(
        'cancelVoteRestaurantResult',
        SOCKET_RES.CANCEL_VOTE_RESTAURANT_SUCCESS(restaurantId)
      );

      // ?????? ?????? ?????? ?????? ??? - ????????????????????? ???????????? ????????? ????????? id ????????? ??????
      this.getUserVoteRestaurantIdList(client);

      const candidateList = await this.redisService.candidateList.getCandidateList(roomCode);

      const voteCountResult = this.getCurrentVoteResult(candidateList);

      // ???????????? ?????? ?????????????????? ?????? ?????? ??????
      this.server
        .in(roomCode)
        .emit('voteResultUpdate', SOCKET_RES.UPDATE_VOTE_RESULT(voteCountResult));
    } catch (error) {
      client.emit('cancelVoteRestaurantResult', SOCKET_RES.CANCEL_VOTE_RESTAURANT_FAIL);
    }
  }

  // ?????? ?????? ?????? ??????
  @SubscribeMessage('getVoteResult')
  async getVoteResult(@ConnectedSocket() client: Socket) {
    const roomCode = client.roomCode;
    const candidateList = await this.redisService.candidateList.getCandidateList(roomCode);

    client.emit(
      'currentVoteResult',
      SOCKET_RES.CURRENT_VOTE_RESULT(this.getCurrentVoteResult(candidateList))
    );
  }

  // ???????????? ????????? ????????? id ????????? ??????
  @SubscribeMessage('getUserVoteRestaurantIdList')
  async getUserVoteRestaurantIdList(@ConnectedSocket() client: Socket) {
    const roomCode = client.roomCode;
    const candidateList = await this.redisService.candidateList.getCandidateList(roomCode);

    // ???????????? ????????? ????????? ?????????
    const userVoteRestaurantIdList = Object.keys(candidateList).filter((restaurantId) =>
      candidateList[restaurantId].find((userId) => userId === client.sessionID)
    );

    client.emit(
      'userVoteRestaurantIdList',
      SOCKET_RES.USER_VOTE_RESTAURANT_ID_LIST(userVoteRestaurantIdList)
    );
  }

  async handleDisconnect(client: Socket) {
    const { sessionID, roomCode } = client;

    // ?????? ?????? ????????? ?????? ???????????? ?????? ???????????? ??????
    const roomSessionIDs =
      this.server.sockets instanceof Map
        ? [...this.server.sockets]
            .filter(([key, value]) => value.roomCode === roomCode)
            .map(([key, value]) => value.sessionID)
        : [];

    // ????????? ?????? ?????? ???????????? ?????? ??? ?????? ?????? (DB, Client ?????? ?????? ??????)
    if (!roomSessionIDs.includes(sessionID)) {
      await this.redisService.joinList.delUserToJoinList(roomCode, sessionID);

      client.to(roomCode).emit('leave', SOCKET_RES.LEAVE_USER(sessionID));
    }

    this.logger.debug(`Client disconnected - [sessionId] ${sessionID}`);
  }

  // ?????? ?????? ????????? ?????? ??????
  private getCurrentVoteResult = (candidateList: { [index: string]: string[] }) => {
    const voteResult: VoteResultType[] = [];

    Object.keys(candidateList).forEach((restaurantId) => {
      if (!candidateList[restaurantId].length) {
        return;
      }
      voteResult.push({
        restaurantId,
        count: candidateList[restaurantId].length,
      });
    });

    return voteResult;
  };
}
