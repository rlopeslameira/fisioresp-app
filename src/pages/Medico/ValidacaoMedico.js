import * as yup from 'yup'; // for everything

const schemaMedico = yup.object().shape({
  nome: yup
    .string().
    required('O nome é obrigatório.'),
  email: yup
    .string()
    .email('Informe um e-mail válido.')
    .required('O e-mail é obrigatório.'),
  senha: yup.
    string()
    .min(6, 'O tamanho mínimo para a senha é 6 dígitos.')
    .required('A senha é obrigatória.')
});

export default schemaMedico;