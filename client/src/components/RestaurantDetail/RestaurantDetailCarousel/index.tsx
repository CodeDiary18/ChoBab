import { useRef, useState } from 'react';
import RestaurantDefaultImgUrl from '@assets/images/restaurant-default.jpg';
import { Image, ImageBox, ImageCarouslBox, ImageCarouslLayout } from './styles';

interface PropsType {
  imageUrlList: string[];
}

export function RestaurantDetailCarousel({ imageUrlList }: PropsType) {
  const imageCount = imageUrlList.length;
  const [visibleImageIdx, setVisibleImageIdx] = useState<number>(0);
  const touchPosition = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const MIN_SLIDE_UNIT = 50;

  const throttlingTimerRef = useRef<NodeJS.Timer | null>(null);
  const THROTTLING_TIME = 1500;

  return (
    <ImageCarouslLayout
      // 모바일 슬라이드 이벤트 대응을 위함
      // 최소 슬라이드 거리를 추가하여 이를 넘지 않을 시에는 이벤트 발생  x
      onTouchStart={(e) => {
        touchPosition.current.start = e.changedTouches[0].clientX;
      }}
      onTouchEnd={(e) => {
        touchPosition.current.end = e.changedTouches[0].clientX;

        const { start: touchStart, end: touchEnd } = touchPosition.current;

        if (touchStart - touchEnd > MIN_SLIDE_UNIT) {
          setVisibleImageIdx(
            visibleImageIdx < imageCount - 1 ? visibleImageIdx + 1 : visibleImageIdx
          );
          return;
        }

        if (touchEnd - touchStart > MIN_SLIDE_UNIT) {
          setVisibleImageIdx(visibleImageIdx > 0 ? visibleImageIdx - 1 : visibleImageIdx);
        }
      }}
      // 데스크탑 스크롤 이벤트를 대응하기 위함
      // 쓰로틀링을 추가하여 스크롤 시 여러번 이벤트가 발생하는 것을 방지
      onWheel={(e) => {
        if (throttlingTimerRef.current) {
          return;
        }

        throttlingTimerRef.current = setTimeout(() => {
          throttlingTimerRef.current = null;
        }, THROTTLING_TIME);

        const isScrollLeft = e.deltaX > 0;

        if (isScrollLeft) {
          setVisibleImageIdx(
            visibleImageIdx < imageCount - 1 ? visibleImageIdx + 1 : visibleImageIdx
          );
          return;
        }

        setVisibleImageIdx(visibleImageIdx > 0 ? visibleImageIdx - 1 : visibleImageIdx);
      }}
    >
      <ImageCarouslBox style={{ marginLeft: `-${visibleImageIdx * 100}%` }}>
        {imageUrlList.map((imageUrl) => (
          <ImageBox key={imageUrl}>
            <Image src={imageUrl || RestaurantDefaultImgUrl} />
          </ImageBox>
        ))}
      </ImageCarouslBox>
      <p>{imageCount ? `${visibleImageIdx + 1}/${imageCount}` : `0/0`}</p>
    </ImageCarouslLayout>
  );
}
