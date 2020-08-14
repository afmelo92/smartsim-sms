import React, { useRef, useCallback, useState } from 'react';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';
import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import * as Yup from 'yup';
import { Link, useHistory } from 'react-router-dom';

import { FaSpinner } from 'react-icons/fa';
import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';
import SSApi from '../../services/api/smartsim.api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Content, AnimationContainer, Background } from './styles';

interface SMSKeyUpdateFormData {
  email: string;
  sms_key: string;
}

const _UpdateUser: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const { addToast } = useToast();

  const handleSubmit = useCallback(
    async (data: SMSKeyUpdateFormData) => {
      try {
        setLoading(true);

        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          sms_key: Yup.string().required('SMS Key obrigatorio'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { email, sms_key } = data;

        await SSApi.put('/users', {
          email,
          sms_key,
        });

        history.push('/dashboard');

        addToast({
          type: 'success',
          title: 'Perfil do cliente atualizado!',
          description: 'O cliente já pode começar a enviar mensagens.',
        });

        setLoading(false);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          return;
        }

        addToast({
          type: 'error',
          title: 'Erro na atualização',
          description:
            'Ocorreu um erro ao atualizar seu perfil, tente novamente',
        });
      } finally {
        setLoading(false);
      }
    },
    [addToast, history],
  );

  return (
    <Container>
      <Content>
        <AnimationContainer>
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h1>Cadastro de Chave SMS</h1>

            <Input name="email" icon={FiMail} placeholder="E-mail do cliente" />

            <Input
              name="sms_key"
              icon={FiLock}
              type="sms_key"
              placeholder="SMS dev Key"
            />

            <Button loading={loading} icon={FaSpinner} type="submit">
              Cadastrar Chave
            </Button>
          </Form>

          <Link to="/dashboard">
            <FiArrowLeft />
            Voltar ao dashboard
          </Link>
        </AnimationContainer>
      </Content>
      <Background />
    </Container>
  );
};

export default _UpdateUser;
