declare interface UserType {
  userId: string;
  userLat: number;
  userLng: number;
  userName: string;
}

declare interface RestaurantType {
  id: string;
  name: string;
  category: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
  rating?: number;
  photoKeyList?: string[];
  priceLevel?: number;
}

declare interface ResTemplateType<T> {
  message: string;
  data: T;
}

declare interface RoomValidType {
  isRoomValid: boolean;
}

declare interface RoomDataType {
  roomCode: string;
  lat: number;
  lng: number;
  userList: UserType[];
  restaurantList: RestaurantType[];
  candidateList: RestaurantType[];
  userId: string;
  userName: string;
}
