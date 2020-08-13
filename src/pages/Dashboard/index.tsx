import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { FaSimCard, FaSpinner } from 'react-icons/fa';
import { FiMessageSquare, FiPower } from 'react-icons/fi';
import * as Yup from 'yup';

import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/toast';
import getValidationErrors from '../../utils/getValidationErrors';
import SMSDevApi from '../../services/api/sms.api';

import Input from '../../components/Input';
import Button from '../../components/Button';
import TextArea from '../../components/TextArea';

import {
  Container,
  Content,
  AnimationContainer,
  Header,
  HeaderContent,
  Profile,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface SMSFormData {
  phone: string;
  message: string;
}

const Dashboard: React.FC = () => {
  const formRef = useRef<FormHandles>(null);
  const { user, signOut } = useAuth();
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  const { addToast } = useToast();

  async function loadCredits(): Promise<void> {
    const response = await SMSDevApi.get('balance', {
      params: {
        key: `${user.sms_key}`,
      },
    });

    setCredits(response.data.saldo_sms);
  }

  useEffect(() => {
    loadCredits();
  }, []);

  const handleSubmit = useCallback(
    async (data: SMSFormData) => {
      try {
        setLoading(true);

        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          phone: Yup.string()
            .required('E-mail obrigatório')
            .min(11, 'Digite um numero de telefone válido')
            .matches(/[0-9]+/, 'Apenas números são válidos'),
          message: Yup.string().required('Mensagem obrigatória'),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const { phone, message } = data;

        const response = await SMSDevApi.get('send', {
          params: {
            key: `${user.sms_key}`,
            type: 9,
            number: phone,
            msg: message,
          },
        });

        const { codigo } = response.data;

        if (codigo === '403') {
          addToast({
            type: 'error',
            title: 'Erro no envio',
            description:
              'Você precisa abrir uma conta conosco para começar a enviar. Entre em contato conosco assim que possível.',
          });

          throw new Error('Saldo insuficiente');
        }

        if (codigo === '408') {
          addToast({
            type: 'error',
            title: 'Erro no envio',
            description:
              'Saldo insuficiente. Efetue uma recarga de créditos assim que possível.',
          });

          throw new Error('Saldo insuficiente');
        }

        addToast({
          type: 'success',
          title: 'Mensagem enviada!',
          description: 'Verifique se o dispositivo recebeu a mensagem.',
        });

        loadCredits();
        setLoading(false);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          addToast({
            type: 'error',
            title: 'Erro no envio',
            description:
              'Ocorreu um erro ao enviar sua mensagem, cheque os campos.',
          });
        }
      }
    },
    [addToast, user.sms_key],
  );

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>SMART SMS</h1>

          <Profile>
            <img
              src={
                user.avatar_url
                  ? user.avatar_url
                  : 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTOcCR9Qg_yFyOD4CA6ITWOGJM02y9JqwwLLA&usqp=CAU'
              }
              alt={user.name}
            />

            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
            </div>

            <div>
              <strong>Créditos</strong>
              <Link to="/profile">
                <strong>
                  Você tem
                  {` ${credits || '0'} `}
                  créditos
                </strong>
              </Link>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>
      <Content>
        <AnimationContainer>
          <h1>Envie seu SMS</h1>
          <Form ref={formRef} onSubmit={handleSubmit}>
            <Input
              name="phone"
              icon={FaSimCard}
              placeholder="(99) 99999-9999"
            />
            <TextArea
              name="message"
              icon={FiMessageSquare}
              placeholder="Mensagem"
            />
            <Button loading={loading} icon={FaSpinner} type="submit">
              Enviar
            </Button>
          </Form>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default Dashboard;
