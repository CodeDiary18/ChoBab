import { Expose, Transform } from 'class-transformer';

export class SummaryDto {
  @Expose()
  @Transform(({ value }) => value.location.map((v) => Number(v)))
  start: number[];

  @Expose()
  @Transform(({ value }) => value.location.map((v) => Number(v)))
  goal: number[];

  @Expose()
  distance: number;

  @Expose()
  duration: number;

  @Expose()
  tollFare: number;

  @Expose()
  taxiFare: number;

  @Expose()
  fuelPrice: number;
}
