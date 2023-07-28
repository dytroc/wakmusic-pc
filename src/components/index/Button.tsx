import styled from "styled-components";

import { T7Medium } from "@components/Typography";

import colors from "@constants/colors";

interface ButtonProps {
  icon: React.FC;
  children: string;
  onClick?: () => void;
}

const Button = ({ icon: Icon, children, onClick }: ButtonProps) => {
  return (
    <Container onClick={onClick}>
      <Icon />
      <T7Medium>{children}</T7Medium>
    </Container>
  );
};

const Container = styled.div`
  width: 108px;
  height: 40px;

  border-radius: 10px;
  border: 1px solid ${colors.blueGray100};
  background-color: ${colors.white}66; // 40%
  backdrop-filter: blur(62.5px);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  color: ${colors.blueGray600};

  cursor: pointer;
`;

export default Button;
