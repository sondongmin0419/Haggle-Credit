import styled from 'styled-components';
import { useState } from 'react';

const IntroduceTextArea = styled.textarea`
  border: 2px solid black;
  width: 60vw;
  max-width: 1000px;
  height: 60%;
  min-height: 200px;
  text-align: left;
  padding: 8px;
  resize: none;
`;
const Container = styled.div`
  display: flex;
  border-bottom: 1px solid gray;
  padding: 25px 0;
  width: 100%;
`;
interface ProductDescriptionProps {
  onIsContent: (name: any) => void;
}
const ProductDescription = ({ onIsContent }: ProductDescriptionProps) => {
  const [introduce, setIntroduce] = useState('');
  const onIntroduceHandler = (e: any) => {
    setIntroduce(e.target.value);
    onIsContent(e.target.value);
  };
  return (
    <Container id="address">
      <div
        style={{
          width: '20%',
          fontSize: '17px',
          fontWeight: 'bolder',
          minWidth: '130px',
        }}
      >
        <p>내용</p>
      </div>
      <div
        style={{
          width: '80%',
          paddingLeft: '20px',
          textAlign: 'left',
        }}
      >
        <div>
          <IntroduceTextArea
            value={introduce}
            onChange={onIntroduceHandler}
            placeholder="상품설명을 입력해주세요."
            spellCheck="false"
          ></IntroduceTextArea>
          <p style={{ textAlign: 'right', marginTop: '-2px' }}>0/2000</p>
        </div>
      </div>
    </Container>
  );
};

export default ProductDescription;
