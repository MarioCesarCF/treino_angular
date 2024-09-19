export interface Empreendimento {
    id: string | null;
    nome_fantasia: string;
    razao_social: string;
    documento: number;
    ramo_atividade: string;
    nome_proprietario: string;
    telefone: number;
    bairro: string;
    logradouro: string;
    situacao: boolean;
}