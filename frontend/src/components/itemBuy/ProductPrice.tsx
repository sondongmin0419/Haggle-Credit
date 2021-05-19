import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200,
    },
  })
);
const Container = styled.div`
  display: flex;
  border-bottom: 1px solid gray;
  padding: 25px 0;
  width: 100%;
`;
interface ProductPriceProps {
  onIsCoolPrice: (name: any) => void;
  onIsAuctionPrice: (name: any) => void;
  onIsEndDate: (name: any) => void;
}
const ProductPrice = ({
  onIsCoolPrice,
  onIsAuctionPrice,
  onIsEndDate,
}: ProductPriceProps) => {
  const classes = useStyles();
  const [toDate, setToDate] = useState<any>('');
  const [endDate, setEndDate] = useState<any>('');
  const [inputEndDate, setInputEndDate] = useState<any>('');
  const [priceData, setPriceData] = useState({
    coolPrice: '0',
    AuctionPrice: '0',
  });

  useEffect(() => {
    let d = new Date();
    // 3 1~3
    // 2 0~2
    const end_date =
      d.getFullYear() +
      '-' +
      ('0' + (d.getMonth() + 1)).slice(
        (d.getMonth() + 1).toString().length - 1,
        (d.getMonth() + 1).toString().length + 1
      ) +
      '-' +
      (d.getDate() + 2);
    const to_date =
      d.getFullYear() +
      '-' +
      ('0' + (d.getMonth() + 1)).slice(
        (d.getMonth() + 1).toString().length - 1,
        (d.getMonth() + 1).toString().length + 1
      ) +
      '-' +
      d.getDate();
    console.log(end_date);
    setToDate(to_date);
    setEndDate(end_date);
    setInputEndDate(end_date);
  }, []);
  const onCoolPriceHandler = (e: any) => {
    let price = e.target.value;
    while (price[0] === '0') {
      price = price.slice(1, price.length);
    }
    if (!price) {
      price = '0';
    }
    setPriceData({ ...priceData, coolPrice: price });
    onIsCoolPrice(price);
  };
  const onAuctionPriceHandler = (e: any) => {
    let price = e.target.value;
    while (price[0] === '0') {
      price = price.slice(1, price.length);
    }
    if (!price) {
      price = '0';
    }
    setPriceData({ ...priceData, AuctionPrice: price });
    onIsAuctionPrice(price);
  };

  const onEndDate = (e: any) => {
    console.log(e.target.value);
    console.log(endDate);
    const date1 = new Date(
      endDate.slice(0, 4),
      endDate.slice(6, 7) - 1,
      endDate.slice(8, 10)
    );
    const date2 = new Date(
      e.target.value.slice(0, 4),
      e.target.value.slice(6, 7) - 1,
      e.target.value.slice(8, 10)
    );
    const elapsedMSec = date2.getTime() - date1.getTime();
    const elapsedDay = elapsedMSec / 1000 / 60 / 60 / 24;
    if (elapsedDay >= 0) {
      onIsEndDate(e.target.value);
    } else {
      alert('경매종료일을 작성일로부터 최소 2일후로 지정해주세요');
      setInputEndDate(endDate);
    }
  };
  return (
    <>
      {/* <Container id="address">
        <div
          style={{
            width: '20%',
            fontSize: '17px',
            fontWeight: 'bolder',
            minWidth: '130px',
          }}
        >
          즉시구매가격<span style={{ color: 'red' }}>* </span>
        </div>
        <div
          style={{
            width: '80%',
            paddingLeft: '20px',
            minWidth: '650px',
            textAlign: 'left',
          }}
        >
          <div>
            <div>
              <input
                style={{
                  height: '20px',
                  width: '200px',
                  padding: '10px',
                }}
                value={priceData.coolPrice}
                onChange={onCoolPriceHandler}
                placeholder="숫자만 입력해주세요."
              ></input>
              원
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'red' }}>
            *판매글 등록시 100원아래의 금액은 0으로 대체됩니다.
            <br />
            ex{')'}123123원 -{'>'} 123100원
          </div>
        </div>
      </Container> */}
      <Container id="address">
        <div
          style={{
            width: '20%',
            fontSize: '17px',
            fontWeight: 'bolder',
            minWidth: '130px',
          }}
        >
          역경매시작가격<span style={{ color: 'red' }}>* </span>
        </div>
        <div
          style={{
            width: '80%',
            paddingLeft: '20px',
            minWidth: '650px',
            textAlign: 'left',
          }}
        >
          <div>
            <div>
              <input
                style={{
                  height: '20px',
                  width: '200px',
                  padding: '10px',
                }}
                value={priceData.AuctionPrice}
                onChange={onAuctionPriceHandler}
                placeholder="숫자만 입력해주세요."
              ></input>
              원
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'red' }}>
            *판매글 등록시 100원아래의 금액은 0으로 대체됩니다.
            <br />
            ex{')'}123123원 -{'>'} 123100원
          </div>
        </div>
      </Container>
      {endDate && (
        <Container id="address">
          <div
            style={{
              width: '20%',
              fontSize: '17px',
              fontWeight: 'bolder',
              minWidth: '130px',
            }}
          >
            역경매종료시간<span style={{ color: 'red' }}>* </span>
          </div>
          <div
            style={{
              width: '80%',
              paddingLeft: '20px',
              minWidth: '650px',
              textAlign: 'left',
            }}
          >
            <div>
              <div>
                <form className={classes.container} noValidate>
                  <TextField
                    id="date"
                    type="date"
                    defaultValue={inputEndDate}
                    onChange={onEndDate}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </form>
              </div>
              <div style={{ fontSize: '12px', color: 'red' }}>
                *종료시간은 최소2일후로 지정해주세요.
                <br />
                ex{')'} 작성일 {toDate} -{'>'} {endDate} (o)
              </div>
            </div>
            <div></div>
          </div>
        </Container>
      )}
    </>
  );
};

export default ProductPrice;
