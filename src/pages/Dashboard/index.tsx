import React, { useRef, useCallback } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';
import { FaSimCard } from 'react-icons/fa';
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

  const { addToast } = useToast();

  const handleSubmit = useCallback(
    async (data: SMSFormData) => {
      try {
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
            key:
              'VBUQONYM9022I25YHBVBUUJ8GBW6638LS5UY8XKY8JXVNC9209EMYLCBMQWUR7715W0QZPWPVT7I6TBHKAS4PLXEVRSZ4S0DGXMN16RV2L44FNT70PZHS4G0NSQ4HW3B',
            type: 9,
            number: phone,
            msg: message,
          },
        });

        const { codigo } = response.data;
        if (codigo === '408') {
          addToast({
            type: 'error',
            title: 'Erro no envio',
            description:
              'Saldo insuficiente. Efetue uma recarga de créditos assim que possível',
          });

          throw new Error('Saldo insuficiente');
        }

        addToast({
          type: 'success',
          title: 'Mensagem enviada!',
          description: 'Verifique se o dispositivo recebeu a mensagem',
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);

          formRef.current?.setErrors(errors);

          addToast({
            type: 'error',
            title: 'Erro no envio',
            description:
              'Ocorreu um erro ao enviar sua mensagem, cheque os campos',
          });
        }
      }
    },
    [addToast],
  );

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h1>SMART SMS</h1>

          <Profile>
            <img
              src={
                user.avatar_url ||
                'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTOcCR9Qg_yFyOD4CA6ITWOGJM02y9JqwwLLA&usqp=CAU'
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
                <strong>Você tem 23 créditos</strong>
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
            <Button type="submit">Enviar</Button>
          </Form>
        </AnimationContainer>
      </Content>
    </Container>
  );
};

export default Dashboard;
