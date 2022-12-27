import { useState } from 'react';
import Modal from '@components/Modal';
import { CATEGORY_TYPE } from '@constants/category';
import { useSelectedCategoryStore } from '@store/index';
import { ReactComponent as ArrowDown } from '@assets/images/arrow-down.svg';
import {
  CategoryGuideParagraph,
  CategoryToggleButton,
  CategoryControlBarBox,
  CategoryBox,
  CategoryLayout,
  CategoryList,
  CategoryItem,
} from './styles';

function Category() {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);

  const { selectedCategoryData, updateSelectedCategoryData } = useSelectedCategoryStore(
    (state) => state
  );

  const handleToggleCategory = (categoryName: CATEGORY_TYPE | null): (() => void) => {
    return (): void => {
      // '전체'가 선택된 경우
      if (!categoryName) {
        updateSelectedCategoryData(new Set());
        return;
      }

      // '카테고리'가 선택된 경우
      const newSelectedCategoryData = new Set(selectedCategoryData);

      if (selectedCategoryData.has(categoryName)) {
        newSelectedCategoryData.delete(categoryName);
      } else {
        newSelectedCategoryData.add(categoryName);
      }

      // '카테고리'가 전부 선택된 경우
      if (newSelectedCategoryData.size === Object.keys(CATEGORY_TYPE).length) {
        updateSelectedCategoryData(new Set());
        return;
      }

      updateSelectedCategoryData(newSelectedCategoryData);
    };
  };

  return (
    <CategoryLayout>
      <CategoryControlBarBox>
        <CategoryGuideParagraph>
          {!selectedCategoryData.size
            ? '먹고싶은 음식을 선택해주세요!'
            : [...selectedCategoryData].join(', ')}
        </CategoryGuideParagraph>
        <CategoryToggleButton
          isOpen={isModalOpen}
          type="button"
          onClick={(event) => {
            setModalOpen(!isModalOpen);

            event.stopPropagation();
          }}
        >
          <ArrowDown />
        </CategoryToggleButton>
      </CategoryControlBarBox>

      <Modal isOpen={isModalOpen} setIsOpen={setModalOpen}>
        <CategoryBox>
          <CategoryList>
            <CategoryItem
              isSelect={!selectedCategoryData.size}
              onClick={handleToggleCategory(null)}
            >
              전체
            </CategoryItem>
            {Object.values(CATEGORY_TYPE).map((categoryName, index) => {
              return (
                <CategoryItem
                  isSelect={selectedCategoryData.has(categoryName)}
                  // categoryName은 변하지 않는 데이터. index와 함께 쓸 명분이 있다.
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${categoryName}${index}`}
                  onClick={handleToggleCategory(categoryName)}
                >
                  {categoryName}
                </CategoryItem>
              );
            })}
          </CategoryList>
        </CategoryBox>
      </Modal>
    </CategoryLayout>
  );
}

export default Category;
