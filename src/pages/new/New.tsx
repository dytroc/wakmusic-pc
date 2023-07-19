import styled, { css } from "styled-components";

import { ReactComponent as Check } from "@assets/icons/ic_16_check.svg";

import { T7Light } from "@components/Typography/Light";
import { T7Medium } from "@components/Typography/Medium";
import PageContainer from "@components/globals/PageContainer";
import DefaultScroll from "@components/globals/Scroll/DefaultScroll";
import FunctionSection from "@components/new/FunctionSection";
import MusicList from "@components/new/MusicList";

import colors from "@constants/colors";
import { hourlyChart } from "@constants/dummys";

import { isNumber } from "@utils/isTypes";

interface NewProps {}

const New = ({}: NewProps) => {
  return (
    <Wrapper>
      <FunctionSection />
      <UpdateTimeLayout>
        <Check />
        <T7Light color={colors.blueGray500}>
          00월 00일 오전 0시 업데이트
        </T7Light>
      </UpdateTimeLayout>
      <WhiteLine />
      <GuideBox>
        <InfoText>곡 정보</InfoText>
        <TextLayout>
          <GuideText width={70}>1시간 전</GuideText>
          <GuideText width={70}>발매일</GuideText>
          <GuideText width={70}>조회수</GuideText>
        </TextLayout>
      </GuideBox>
      <BlackLine />
      <MusicSection>
        <DefaultScroll>
          <MusicLayout>
            {hourlyChart.map((item, index) => (
              <MusicList key={index} item={item} />
            ))}
          </MusicLayout>
        </DefaultScroll>
      </MusicSection>
    </Wrapper>
  );
};

const Wrapper = styled(PageContainer)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  height: 636px;
  border-radius: 15px;
  border: 1px solid ${colors.blueGray25};
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(62.5px);
  margin-top: 20px;
`;

const UpdateTimeLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  margin: 12px 0px 14px 20px;
`;

const WhiteLine = styled.div`
  width: 734px;
  height: 1px;
  border-radius: 99px;
  background: linear-gradient(
    117deg,
    rgba(255, 255, 255, 0) 0%,
    #fff 4.69%,
    #fff 92.56%,
    rgba(255, 255, 255, 0) 100%
  );
`;

const BlackLine = styled.div`
  width: 734px;
  height: 1px;
  border-radius: 99px;
  background: linear-gradient(
    117deg,
    rgba(228, 231, 236, 0) 0%,
    #e4e7ec 4.69%,
    #e4e7ec 92.56%,
    rgba(228, 231, 236, 0) 100%
  );
`;

const GuideBox = styled.div`
  width: 100%;
  height: 30px;
  padding: 0px 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0px 20px 0px 0px;
  position: relative;
`;

const GuideText = styled(T7Medium)<{ width?: number }>`
  text-align: center;
  width: ${(props) => (isNumber(props.width) ? props.width + "px" : "auto")};
  color: ${colors.blueGray400};

  ${(props) =>
    isNumber(props.width)
      ? css`
          width: ${props.width + "px"};
        `
      : css`
          width: auto;
        `};
`;

const TextLayout = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoText = styled(GuideText)`
  position: absolute;
  left: 106px;
`;

const MusicSection = styled.div`
  width: 100%;
  flex: 1 1 0;
`;

const MusicLayout = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default New;
