import { useEffect } from 'react';
import { ReactComponent as BackwardIcon } from '@assets/images/backward-arrow-icon.svg';

import { DetailTitle } from '@components/RestaurantDetail/Title';
import { DetailCarousel } from '@components/RestaurantDetail/Carousel';
import RestaurantVoteButton from '@components/RestaurantVoteButton';

import { RESTAURANT_DETAIL_TYPES, RESTAURANT_LIST_TYPES } from '@constants/modal';
import { useSelectedRestaurantDataStore } from '@store/index';
import { ModalBox, ModalLayout, BackwardButton, VoteButtonLayout } from './styles';
import { DetailBody } from './Body';

interface PropsType {
  updateRestaurantDetailLayerStatus: (restaurantDetailType: RESTAURANT_DETAIL_TYPES) => void;
}

export function DetailModal({ updateRestaurantDetailLayerStatus }: PropsType) {
  const { selectedRestaurantData, updateSelectedRestaurantData } = useSelectedRestaurantDataStore(
    (state) => state
  );
  useEffect(() => {
    return () => {
      // 굳이 useEffect에서 이를 수행해주는 이유는
      // 클릭 이벤트 시 이를 수행해주면 클릭 즉시 전역 상태가 변하면서 애니메이션 와중에 데이터들이 null 값으로 바뀌기 때문
      // 보기 안좋음
      updateSelectedRestaurantData(null);
    };
  }, []);

  return (
    <ModalLayout>
      <ModalBox>
        <BackwardButton
          onClick={() => {
            updateRestaurantDetailLayerStatus(RESTAURANT_DETAIL_TYPES.hidden);
          }}
        >
          <BackwardIcon fill="white" />
        </BackwardButton>
        <VoteButtonLayout>
          <RestaurantVoteButton
            id={selectedRestaurantData?.id || ''}
            restaurantListType={RESTAURANT_LIST_TYPES.filtered}
          />
        </VoteButtonLayout>
        <DetailCarousel imageUrlList={selectedRestaurantData?.photoUrlList || []} />
        <DetailTitle
          name={selectedRestaurantData?.name || ''}
          category={selectedRestaurantData?.category || ''}
          rating={selectedRestaurantData?.rating || 0}
        />
        <DetailBody
          address={selectedRestaurantData?.address || ''}
          lat={selectedRestaurantData?.lat || NaN}
          lng={selectedRestaurantData?.lng || NaN}
          phone={selectedRestaurantData?.phone || ''}
          url={selectedRestaurantData?.url || ''}
        />
      </ModalBox>
    </ModalLayout>
  );
}
