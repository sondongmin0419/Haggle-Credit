import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import ProductList from '../../components/home/PruductList';
import { RouteComponentProps } from 'react-router-dom';
import { CATEGORYS, IDXTOCATEGORY } from '../../common/data';
import CategoryList from '../../components/category/CategoryList';
import LoadingList from '../../components/common/LoadingList';
import Category from '../../components/category/Category';
import { callApiCategoryProductList, callApiCategoryCount } from '../../api/ProductApi';
import { ITEM, CATEGORYCNT } from "styled-components";
import Pagination from '@material-ui/lab/Pagination';

interface MatchParams {
  name: string;
}

const Container = styled.div`
  padding: 145px 200px 0 200px;
  background-color: rgb(249, 249, 249);
  @media (max-width: 1024px) {
    padding: 145px 40px 0 40px;
  }
`;

const ProductArea = styled.div`
  padding: 30px 0;
`;

const TitleArea = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 50px;
  margin-bottom: 20px;
`;

const TitleText = styled.div`
  display: flex;
  font-size: 16px;
  align-items: center;
`;

const FilterArea = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
`;

const Filter = styled.div`
  font-size: 12px;
  display: flex;
  font-weight: bold;
`;

const FilterItem = styled.div`
  cursor: pointer;
  margin-right: 20px;
  position: relative;
  display: block;
  ::after {
    content: "";
    position: absolute;
    top: 3px;
    right: -10px;
    width: 1px;
    height: 12px;
    border-right: 1px solid rgb(204, 204, 204);
  }
`;

const LastItem = styled.div`
  cursor: pointer;
  position: relative;
  display: block;
`;

const CategoryPage = ({match}: RouteComponentProps<MatchParams>) => {
  const [category, setCategory] = useState(match.params.name);
  const [subCategory, setSubCategory] = useState('');
  const [buy, setBuy] = useState(true);
  const [filterIdx, setFilterIdx] = useState(0);
  const [products, setProducts] = useState<ITEM[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [itemNum, setItemNum] = useState(5);
  const [categoryList, setCategoryList] = useState<CATEGORYCNT[]>([]);
  const [subIdx, setSubIdx] = useState(0);
  const ConfirmWidth = useCallback(()=>{
    const windowInnerWidth = window.innerWidth;
    if (windowInnerWidth > 1280) {
      setItemNum(5);
    } else if (windowInnerWidth > 1023) {
      setItemNum(4);
    } else if (windowInnerWidth > 700) {
      setItemNum(3);
    } else if (windowInnerWidth > 410) {
      setItemNum(2);
    } else {
      setItemNum(1);
    }
  }, []);

  useEffect(()=>{
    const fetchData = async() => {
      setIsLoading(true);
      if(filterIdx === 0){
        const result = await callApiCategoryProductList('down', category, subCategory, String(pageNum), 'is_no');
        setProducts(result);
      } else if(filterIdx === 1){
        const result = await callApiCategoryProductList('up', category, subCategory, String(pageNum), 'is_auction_ing_price');
        setProducts(result);
      } else if(filterIdx === 2){
        const result = await callApiCategoryProductList('down', category, subCategory, String(pageNum), 'is_auction_ing_price');
        setProducts(result);
      }
      const categotyCnt =  await callApiCategoryCount(category);
      // for (let cnt of categotyCnt){
      //   if (cnt.cntSub)
      // }
      setCategoryList(categotyCnt);
      setIsLoading(false);
    }
    setProducts([]);
    fetchData();
  }, [category, subCategory, filterIdx, pageNum])

  useEffect(()=>{
    window.scrollTo(0, 0);
    ConfirmWidth();
    window.addEventListener('resize', ConfirmWidth);
    const idx: number = parseInt(match.params.name.split('-')[1]);
      if (idx <= 1200) {
        setCategory(match.params.name);
        setSubCategory('');
      } else {
        if (idx >= 100000) {
          setCategory(IDXTOCATEGORY[String(idx).slice(0, 4)]);
        } else {
          setCategory(IDXTOCATEGORY[String(idx).slice(0,3)]);
        }
        setSubCategory(match.params.name);
      }
      return () => {
        window.removeEventListener('resize', ConfirmWidth);
      }
  }, [ConfirmWidth, match.params.name])

  return (
    <Container>
      <ProductArea>
        <Category category={category} subCategory={subCategory} />
        {subCategory === '' && <CategoryList category={category} categoryList={CATEGORYS[category]} categoryCnt={categoryList}/>}
        <TitleArea>
          <TitleText>
            {subCategory === '' ? category.split('-')[0] : subCategory.split('-')[0]} 상품 추천
          </TitleText>
        </TitleArea>
        <FilterArea>
          <Filter>
            <FilterItem style={buy ? {color: '#ffceae'}:{}} onClick={() => setBuy(true)}>팝니다</FilterItem>
            <LastItem style={buy ? {}:{color: '#ffceae'}} onClick={() => setBuy(false)}>삽니다</LastItem>
          </Filter>
          <Filter>
            <FilterItem style={filterIdx === 0 ? {color: '#ffceae'}:{}} onClick={() => setFilterIdx(0)}>최신순</FilterItem>
            <FilterItem style={filterIdx === 1 ? {color: '#ffceae'}:{}} onClick={() => setFilterIdx(1)}>저가순</FilterItem>
            <LastItem style={filterIdx === 2 ? {color: '#ffceae'}:{}} onClick={() => setFilterIdx(2)}>고가순</LastItem>
          </Filter>
        </FilterArea>
        {isLoading ? 
          <LoadingList itemNum={itemNum}/> :
          <ProductList buy={buy} products={products} itemNum={itemNum}/>
        }
        <div style={{display: 'flex', justifyContent: 'center', padding: '20px 0'}}>
          {categoryList.length > 0 && subCategory === '' && 
            <Pagination 
            count={parseInt(String(categoryList[0].cntMain/100))} 
            variant="outlined" 
            shape="rounded" 
            color="secondary" 
            onChange={(e, page)=>setPageNum(page)}/>}
          {categoryList.length > 0 && subCategory !== '' && 
            <Pagination 
            count={parseInt(String(categoryList[subIdx].cntSub/100))} 
            variant="outlined"
            shape="rounded" 
            color="secondary" 
            onChange={(e, page)=>setPageNum(page)}/>}
        </div>
      </ProductArea>
    </Container>
  )
}

export default CategoryPage;