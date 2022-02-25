import * as yup from 'yup'; // for everything

const schemaPaciente = yup.object().shape({
    name: yup
        .string().
        required('O nome é obrigatório.'),
    email: yup
        .string()
        .email('Informe um e-mail válido.')
        .required('O e-mail é obrigatório.'),
    senha: yup.
        string()
        .min(6, 'O tamanho mínimo para a senha é 6 dígitos.')
        .required('A senha é obrigatória.'),
    datanascimento: yup
        .string().
        required('A data de nascimento é obrigatória.'),
    contatos: yup
        .string().
        required('O contato é obrigatório.'),
    endereco: yup
        .string()
        .nullable(true)
        .required('O Endereço é obrigatório.'),
});

export default schemaPaciente;