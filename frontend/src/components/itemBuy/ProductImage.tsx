import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from '../../common/store';
import { useDispatch } from 'react-redux';
import { userActions } from '../../state/user/index';
import ImageUploading, { ImageListType } from 'react-images-uploading';

const ImgSection = styled.div`
  width: 100%;
  text-align: center;
  position: relative;
  top: -50%;
`;
const Container = styled.div`
  display: flex;
  border-bottom: 1px solid gray;
  padding: 25px 0;
  width: 100%;
`;
const ImgSection2 = styled.div``;
const RemoveButton = styled.img`
  position: absolute;
  width: 30px;
  :hover {
    cursor: pointer;
  }
`;
const ImgInputButton = styled.button`
  padding: 6px 25px;
  border: none;
  background-color: #ff6600;
  border-radius: 4px;
  color: white;
  cursor: pointer;
`;

const ImageList = styled.div`
  margin: 5px;
  text-align: center;
  widtg: 100px;
  height: 100px;
  ${ImgSection2} {
    visibility: hidden;
  }
  ${RemoveButton} {
    visibility: hidden;
  }
  :hover {
    ${ImgSection2} {
      visibility: visible;
    }
    ${RemoveButton} {
      visibility: visible;
    }
  }
`;
interface ProductImageProps {
  onisProductPhoto: (name: any) => void;
}
const ProductImage = ({ onisProductPhoto }: ProductImageProps) => {
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.user.userData);
  const [isWrap, setIsWrapm] = useState(false);
  const [images, setImages] = useState([]);
  const maxNumber = 8;

  const onChange = (imageList: ImageListType) => {
    setImages(imageList as never[]);
    onisProductPhoto(imageList as never[]);
  };
  const ConfirmWidth = useCallback(() => {
    const windowInnerWidth = window.innerWidth;
    if (windowInnerWidth > 1622) {
      setIsWrapm(false);
    } else {
      setIsWrapm(true);
    }
  }, []);
  useEffect(() => {
    ConfirmWidth();
    window.addEventListener('resize', ConfirmWidth);
    return () => {
      window.removeEventListener('resize', ConfirmWidth);
    };
  });

  return (
    <>
      <ImageUploading
        multiple
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
      >
        {({
          imageList,
          onImageUpload,
          onImageRemove,
          isDragging,
          dragProps,
        }) => (
          <>
            <Container id="imgSection">
              <div
                style={{
                  width: '20%',
                  fontSize: '17px',
                  fontWeight: 'bolder',
                  minWidth: '130px',
                }}
              >
                ???????????????<span style={{ color: 'red' }}>* </span>
                <span style={{ color: 'gray', fontWeight: 'normal' }}>
                  ({images.length}/8)
                </span>
              </div>
              <div
                style={{
                  width: '80%',
                  paddingLeft: '20px',
                  minWidth: '650px',
                }}
              >
                <div>
                  <div style={{ height: '15vw', display: 'flex' }}>
                    <div>
                      <div
                        style={{
                          width: '15vw',
                          backgroundColor: '#eeeeee',
                          height: '100%',
                        }}
                      ></div>
                      <ImgSection>
                        <ImgInputButton
                          style={isDragging ? { color: 'red' } : undefined}
                          onClick={onImageUpload}
                          {...dragProps}
                        >
                          ????????????
                        </ImgInputButton>
                      </ImgSection>
                    </div>
                    <div
                      style={{
                        marginTop: '3vw',
                        color: '#29b6f6',
                        fontSize: '1vw',
                        width: '100%',
                        textAlign: 'left',
                        paddingLeft: '3vw',
                      }}
                    >
                      <span style={{ fontWeight: 'bolder' }}>
                        * ?????? ???????????? 640x640??? ????????? ?????? ????????????.
                      </span>
                      <br />
                      <span>
                        - ???????????? ???????????? ??? ?????????????????? ????????? ???????????????.
                      </span>
                      <br />
                      <span>
                        - ???????????? ?????? ??? ?????? ?????????????????? ????????? ??? ????????????.
                      </span>
                      <br />
                      <span>
                        - ???????????? ?????? ??? ???????????? ??????????????? ????????? ???
                        ????????????.
                      </span>
                      <br />
                      <span>
                        - ??? ?????????????????? ???????????? ????????? ????????? ????????? ???
                        ????????????.
                      </span>
                      <br />
                      <span>
                        ?????? ?????? ???????????? 640 X 640 ?????? ???????????? ??????
                        ???????????????.(?????? ????????? ?????? 10M)
                      </span>
                      <br />
                    </div>
                  </div>
                  <div
                    style={
                      isWrap
                        ? {
                            flexWrap: 'wrap',
                            margin: 0,
                            marginTop: '20px',
                            width: '60vw',
                            maxWidth: '1000px',
                            display: 'flex',
                          }
                        : {
                            margin: 0,
                            marginTop: '20px',
                            width: '60vw',
                            maxWidth: '1000px',
                            display: 'flex',
                          }
                    }
                  >
                    {imageList.map((image, index) => (
                      <ImageList
                        key={index}
                        className="image-item"
                        style={{ display: 'flex' }}
                      >
                        <img
                          src={image.dataURL}
                          alt=""
                          width="120px"
                          height="120px"
                        />
                        <RemoveButton
                          src={'../images/removeButton.png'}
                          onClick={() => onImageRemove(index)}
                        ></RemoveButton>
                      </ImageList>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </>
        )}
      </ImageUploading>
    </>
  );
};

export default ProductImage;
