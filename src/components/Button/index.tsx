import React, { ButtonHTMLAttributes } from 'react';
import { IconBaseProps } from 'react-icons';

import { Container } from './styles';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  icon?: React.ComponentType<IconBaseProps>;
};

const Button: React.FC<ButtonProps> = ({
  loading,
  icon: Icon,
  children,
  ...rest
}) => {
  return (
    <Container type="button" {...rest}>
      {loading && Icon ? <Icon size={20} /> : children}
    </Container>
  );
};

export default Button;
