import React, { useRef, useCallback } from 'react';
import { Form } from '@unform/web';
import { FormHandles } from '@unform/core';

import Input from '../../components/Input';
import Button from '../../components/Button';
import SMSDevApi from '../../services/api/sms.api';

interface SMSFormData {
  phone: string;
  message: string;
}

const Dashboard: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const handleSubmit = useCallback(async (data: SMSFormData) => {
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

    console.log(response.data);
  }, []);

  return (
    <div>
      <Form ref={formRef} onSubmit={handleSubmit}>
        <Input name="phone" placeholder="Número celular" />
        <Input name="message" placeholder="Mensagem" />
        <Button type="submit">Enviar</Button>
      </Form>
    </div>
  );
};

export default Dashboard;
