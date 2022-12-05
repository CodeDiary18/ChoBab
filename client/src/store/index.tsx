import create from 'zustand';
import { RESTAURANT_LIST_TYPES } from '@constants/modal';
import { NAVER_LAT, NAVER_LNG } from '@constants/map';

interface MeetLocationStoreType {
  meetLocation: { lat: number; lng: number };
  updateMeetLocation: (lat: number, lng: number) => void;
}

export const useMeetLocationStore = create<MeetLocationStoreType>((set) => ({
  meetLocation: { lat: NAVER_LAT, lng: NAVER_LNG },
  updateMeetLocation: (lat, lng) => set(() => ({ meetLocation: { lat, lng } })),
}));

interface RestaurantListStateStore {
  restaurantListState: RESTAURANT_LIST_TYPES;
  updateRestaurantListState: (restaurantListType: RESTAURANT_LIST_TYPES) => void;
}

export const useRestaurantListStateStore = create<RestaurantListStateStore>((set) => ({
  restaurantListState: RESTAURANT_LIST_TYPES.hidden,
  updateRestaurantListState: (restaurantListType: RESTAURANT_LIST_TYPES) =>
    set(() => ({ restaurantListState: restaurantListType })),
}));

interface RestaurantDetailStateStore {
  restaurantDetailState: RestaurantType | null;
  updateRestaurantDetailState: (restaurantDetailType: RestaurantType | null) => void;
}

export const useRestaurantDetailStateStore = create<RestaurantDetailStateStore>((set) => ({
  restaurantDetailState: null,
  updateRestaurantDetailState: (restaurantDetailType: RestaurantType | null) =>
    set(() => ({ restaurantDetailState: restaurantDetailType })),
}));

interface ToastStoreType {
  isOpen: boolean;
  content: string;
  bottom: number; // 아래에서 몇 px 띄울건지 지정
  duration: number;
  updateIsOpen: (isOpen: boolean) => void;
  updateToast: (content: string, bottom?: number, duration?: number) => void;
}

export const useToastStore = create<ToastStoreType>((set) => ({
  isOpen: false,
  content: '',
  bottom: 100,
  duration: 2000,
  updateIsOpen: (isOpen) => set(() => ({ isOpen })),
  updateToast: (content, bottom, duration) => set(() => ({ content, bottom, duration })),
}));
