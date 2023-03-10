import styled from 'styled-components';
import * as palette from '@styles/Variables';

export const CategoryLayout = styled.div`
  width: 100%;
  height: 100%;
`;

export const CategoryControlBarBox = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  height: 100%;
`;

export const CategoryGuideParagraph = styled.p`
  width: 85%;
  padding-left: 3%;
`;

interface CategoryToggleButtonStateType {
  isOpen: boolean;
}

export const CategoryToggleButton = styled.button<CategoryToggleButtonStateType>`
  width: 15%;
  height: 100%;
  background: none;

  border: 0;
  border-left: 1px solid ${palette.PRIMARY};

  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    transform: rotate(${({ isOpen }) => (isOpen ? '-180deg' : '0')});
  }
`;

export const CategoryBox = styled.div`
  position: absolute;

  left: 0;
  right: 0;

  padding: 3%;

  background: white;
  box-shadow: 0px 4px 4px rgb(104 94 94 / 25%), inset 0px 4px 4px rgb(0 0 0 / 25%);
`;

export const CategoryList = styled.ul`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;

interface SelectedCategoryType {
  isSelect: boolean;
}

export const CategoryItem = styled.li<SelectedCategoryType>`
  list-style: none;

  width: 20%;

  border: 1px solid ${palette.BORDER};
  border-radius: 5px;

  text-align: center;

  margin: 2%;
  padding: 2% 1%;

  background-color: ${({ isSelect }) => (isSelect ? palette.PRIMARY : 'transparent')};
  color: ${({ isSelect }) => (isSelect ? 'white' : 'black')};

  white-space: nowrap;
  overflow: hidden;
  //text-overflow: ellipsis;
`;
