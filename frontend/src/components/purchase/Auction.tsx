import { useEffect, useState, useCallback } from 'react';
import styled, { ITEM } from 'styled-components';
import moment from 'moment';
import { theme } from '../../styles/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store';
import { callApiUpdateAuction } from '../../api/ProductApi';
import { callApiGetCredit } from '../../api/UserApi';
import { useDispatch } from 'react-redux';
import { userActions } from "../../state/user";
import { totalActions } from "../../state/common/common";

interface Props {
  desc: ITEM;
  uaNo: number;
}

const ItemTitle = styled.div`
  position: relative;
  font-size: 14px;
  padding-right: 10px;
  color: rgb(153, 153, 153);
`;

const ItemContent = styled.div`
  font-size: 14px;
  position: relative;
  display: flex;
`;  

const AuctionArea = styled.div`
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid rgb(220, 219, 228);
`;

const AuctionTitle = styled.div`
  font-size: 1rem;
  padding-bottom: 10px;
  font-weight: bold;
`;

const AuctionItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

const AuctionInputArea = styled.div` 
  width: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgb(234, 233, 241);
  height: 3.5rem;
`;

const StyledInput = styled.input`
  width: 100%; 
  box-sizing: border-box;
  background: none;
  border: none;
  text-align: left;
  font-size: 1rem;
  padding-left: 8px;
  outline: 0px;
  font-weight: normal !important;
  appearance: none;
  font-size: 14px;
`;

const ChargingButton = styled.div`
  cursor: pointer;
  margin-left: 1.125rem;
  width: 4.2rem;
  height: 2rem;
  border: none;
  background-color: rgb(234, 233, 241);
  font-size: 0.8125rem;
  color: rgb(94, 92, 107);
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const AvailablePoint = styled.div`
  margin-left: 10px;
  font-size: 0.8125rem;
  color: rgb(63, 62, 75);
  padding: 5px 0;
`;

const InputDescription = styled.p`
  padding-left: 10px;
  position: relative;
  margin-top: 0.75rem;
  font-size: 13px;
  color: rgb(114, 112, 127);
`;

const AuctionButton = styled.p`
  cursor: pointer;
  border-radius: 2px;
  width: 100%;
  padding: 1.125rem 0;
  background: ${({theme}) => theme.color.main };
  border: 0px;
  color: rgb(255, 255, 255);
  font-size: 1.125rem;
  font-weight: bold;
  text-align: center;
`;

const Auction = ({desc, uaNo}: Props) => {
  const [ credit, setCredit ] = useState("");
  const [ time, setTime ] = useState('');
  const [ userCredit, setUserCredit ] = useState(0);
  const userData = useSelector((state: RootState) => state.user.userData);
  const isUpdate = useSelector((state: RootState) => state.total.isUpdate);
  const dispatch = useDispatch();
  const endDate = desc.isEndDate;
  const CalTime = useCallback(()=> {
    let t1 = moment(endDate);
    let t2 = moment();
    const duTime = moment.duration(t1.diff(t2)).asSeconds();
    if (duTime < 0) {
      setTime('?????? ???!');
      return
    }
    const day = parseInt(String(duTime / (60*60*24)));
    const hour = parseInt(String((duTime - day*60*60*24) / (60*60)));
    const minute = parseInt(String((duTime - day*60*60*24 - hour*3600) / 60));
    const second = parseInt(String((duTime % 60)));
    const text = day + '??? ' + hour + '?????? ' + minute + '??? ' + second + '???';
    setTime(text);
  }, [endDate])

  useEffect(() => {
    const countdown = setInterval(CalTime, 1000);
    const fetchData = async() => {
      if (userData.uNo !== undefined){
        const result = await callApiGetCredit(userData.uNo);
        setUserCredit(result);
      }
    }
    fetchData();
    return () => {
      clearInterval(countdown);
    };
  }, [CalTime, userData]);

  const confirmValue = () => {
    if (desc.isAuctionIngPrice !== undefined){
      if (credit !== "" ) {
        if (parseInt(credit) % 100 !== 0){
          alert('???????????? 100 ????????? ??????????????????.');
          setCredit("");
        } else if (parseInt(credit) < desc.isAuctionIngPrice + 100){
          alert('??????????????? ??????????????? 100??? ??????????????? ?????????.');
        }
      }
    }
  }

  const submitAuction = async() => {
    if (credit !== "" && desc.isItemNo !== undefined && userData.uNo !== undefined && uaNo !== -1){
      const result = await callApiUpdateAuction(parseInt(credit), desc.isItemNo, userData.uNo, uaNo);
      if (result >= 0 ){
        alert('????????? ?????????????????????.');
        const data = Object.assign({}, userData);
        data.uCredit = result;
        dispatch(userActions.changeCredit(data));
        dispatch(totalActions.setIsUpdate(!isUpdate));
      } else {
        alert('????????? ??????????????????.');
      }
      window.close();
    } else {
      alert('?????????, ?????? ????????? ?????? ??????????????????!');
    }
  }

  return (
    <>
      <AuctionArea>
        <AuctionTitle>????????????</AuctionTitle>
        <AuctionItem>
          <ItemTitle>?????????</ItemTitle>
          <ItemContent style={{fontSize: "18px"}}><span style={{color: theme.color.main, fontWeight: 'bold'}}>
            {desc.isAuctionIngPrice !== undefined && desc.isAuctionIngPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
          ???</ItemContent>
        </AuctionItem>
        <AuctionItem>
          <ItemTitle>?????????</ItemTitle><ItemContent style={{fontSize: "16px"}}>
            {desc.isCoolPrice !== undefined && desc.isCoolPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}???</ItemContent>
        </AuctionItem>
        <AuctionItem>
          <ItemTitle>????????????</ItemTitle><ItemContent style={{fontSize: "16px"}}>{time}</ItemContent>
        </AuctionItem>
        <AuctionItem style={{flexDirection: 'column'}}>
          <ItemTitle>????????????</ItemTitle>
          <div style={{paddingLeft: "100px"}}>
            <InputDescription style={{margin: 0, color: 'black', fontSize: '14px', paddingTop: '20px'}}>
              ?????? <span style={{color: theme.color.main, fontWeight: 'bold'}}>
                {desc.isAuctionIngPrice !== undefined && (desc.isAuctionIngPrice+100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}???
              </span>?????? ???????????? ??? ????????????.
            </InputDescription>
            <ItemContent>
              <AuctionInputArea>
                <StyledInput 
                  type="text" 
                  placeholder="???????????? ??????" 
                  onChange={async(e) => {
                    if (userData.uCredit !== undefined && parseInt(e.target.value.replace(/[^\d]+/g, '')) >= userData.uCredit) {
                      setCredit(String(userData.uCredit));
                    } else {
                      setCredit(e.target.value.replace(/[^\d]+/g, ''))
                    }
                  }}
                  value={credit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  onBlur={confirmValue}/>
                <ChargingButton 
                  onClick={() => window.open(`../../profile/${userData.uNo}`, '_blank')}
                >????????????</ChargingButton>
              </AuctionInputArea>
            </ItemContent>
            <AvailablePoint>?????? ????????? ????????? 
              <span style={{fontWeight: 'bold', paddingLeft: '5px'}}>
                {credit !== '' ?
                (userCredit - parseInt(credit)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                : userCredit.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} C
              </span>
              </AvailablePoint>
            <InputDescription>???????????? ????????? ??????(",") ?????? 100??? ????????? ?????? ???????????????.</InputDescription>
          </div>
        </AuctionItem>
      </AuctionArea>
      <AuctionButton
        onClick={submitAuction}
      >????????????</AuctionButton>
    </>
  )
}

export default Auction;