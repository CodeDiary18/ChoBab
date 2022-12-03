import { useEffect, useRef } from 'react';

import RiceImage from '@assets/images/rice.svg';
import SushiImage from '@assets/images/sushi.svg';
import DumplingImage from '@assets/images/dumpling.svg';
import SpaghettiImage from '@assets/images/spaghetti.svg';
import ChickenImage from '@assets/images/chicken.svg';
import HamburgerImage from '@assets/images/hamburger.svg';
import HotdogImage from '@assets/images/hotdog.svg';

import { useNaverMaps } from '@hooks/useNaverMaps';

import { MapBox } from './styles';

interface RestaurantType {
  id: string;
  name: string;
  category: string;
  phone: string;
  lat: number;
  lng: number;
  address: string;
}

interface RoomLocationType {
  lat: number;
  lng: number;
}

interface PropsType {
  restaurantData: RestaurantType[];
  roomLocation: RoomLocationType;
}

const getIconUrlByCategory = (category: string) => {
  switch (category) {
    case '일식':
      return SushiImage;
    case '중식':
      return DumplingImage;
    case '양식':
      return SpaghettiImage;
    case '치킨':
      return ChickenImage;
    case '패스트푸드':
      return HamburgerImage;
    case '분식':
      return HotdogImage;
    case '한식':
    default:
      return RiceImage;
  }
};

function MainMap({ restaurantData, roomLocation }: PropsType) {
  const [mapRef, mapDivRef] = useNaverMaps();

  const infoWindowsRef = useRef<naver.maps.InfoWindow[]>([]);

  const closeAllMarkerInfoWindow = () => {
    infoWindowsRef.current.forEach((infoWindow) => {
      infoWindow.close();
    });
  };

  const initMarkers = (map: naver.maps.Map) => {
    const mapBounds = map.getBounds() as naver.maps.LatLngBounds;

    const restaurantClassifyCategory: Map<string, RestaurantType[]> = new Map();

    // 카테고리로 분류
    restaurantData.forEach((restaurant) => {
      const { category } = restaurant;

      if (!restaurantClassifyCategory.has(category)) {
        restaurantClassifyCategory.set(category, []);
      }

      restaurantClassifyCategory.get(category)?.push(restaurant);
    });

    // 카테고리별 클러스터 생성
    restaurantClassifyCategory.forEach((value, key) => {
      const markers: naver.maps.Marker[] = [];

      const restaurants = value;

      const category = key;

      const iconUrl = getIconUrlByCategory(category);

      restaurants.forEach((restaurant) => {
        const { lat, lng } = restaurant;

        if (!mapBounds.hasLatLng(new naver.maps.LatLng(lat, lng))) {
          return;
        }

        if (!map) {
          return;
        }

        const { name } = restaurant;

        // (map 에 반영시키지 않는)마커 객체 생성
        const marker = new naver.maps.Marker({
          title: name,
          position: new naver.maps.LatLng(lat, lng),
          icon: {
            content: `<img src=${iconUrl} width="30" height="30" alt=${name}/>`,
          },
        });

        markers.push(marker);

        // 인포윈도우 객체 생성
        const infoWindow = new naver.maps.InfoWindow({
          content: name,
        });

        infoWindowsRef.current.push(infoWindow);

        // 마커 클릭 이벤트 등록
        naver.maps.Event.addListener(marker, 'click', () => {
          infoWindow.open(map, marker);
        });
      });

      const markerClustering = new MarkerClustering({
        map: mapRef.current,
        markers,
        maxZoom: 19,
        gridSize: 300,
        disableClickZoom: false,
        icons: [
          {
            content: `
            <div style="position:relative">
              <div
                name="counter"
                style="
                  position:absolute;
                  top:-10px;
                  right:-10px;
                  background:rgba(0,0,0,40%);
                  border-radius:30px;
                  width:20px;
                  height:20px;
                  color:white;
                  font-size:9px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                "
              >
                5
              </div>
              <img src=${iconUrl} width="30" height="30" />
            </div>
            `,
          },
        ],
        indexGenerator: [0],
        // @types/navermaps 에 Marker 클래스 타입에 getElement 메서드가 정의되어 있질 않다.
        stylingFunction: (clusterMarker: any, count) => {
          const markerDom = clusterMarker.getElement() as HTMLElement;

          const counterDOM = markerDom.querySelector('div[name="counter"]');

          if (!(counterDOM instanceof HTMLElement)) {
            return;
          }

          counterDOM.innerText = `${count}`;
        },
      });
    });
  };

  const onInit = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onInitListener = naver.maps.Event.addListener(map, 'init', () => {
      if (!map) {
        return;
      }

      initMarkers(map);
    });
    return onInitListener;
  };

  const onClick = (map: naver.maps.Map): naver.maps.MapEventListener => {
    const onClickListener = naver.maps.Event.addListener(map, 'click', () => {
      if (!map) {
        return;
      }

      closeAllMarkerInfoWindow();
    });

    return onClickListener;
  };

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    const clickListener = onClick(mapRef.current);
    const initListener = onInit(mapRef.current);

    // eslint-disable-next-line consistent-return
    return () => {
      naver.maps.Event.removeListener(clickListener);
      naver.maps.Event.removeListener(initListener);
    };
  }, []);

  // 모임 위치(props) 변경 시 지도 화면 이동
  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    mapRef.current.setCenter({ x: roomLocation.lng, y: roomLocation.lat });
  }, [roomLocation]);

  return <MapBox ref={mapDivRef} />;
}

export default MainMap;
