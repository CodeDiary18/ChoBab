import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends HttpException {
  constructor(message) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
