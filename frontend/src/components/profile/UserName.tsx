import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store';

const Container = styled.div`
  width: 15%;
  text-align: left;
`;

const TagP = styled.p`
  margin: 0;
  position: relative;
  padding-left: 1vw;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.3vw;
`;

const UserName = () => {
  const userData = useSelector((state: RootState) => state.user.userData);

  return (
    <Container>
      <TagP>{userData.uName} 님</TagP>
    </Container>
  );
};

export default UserName;
