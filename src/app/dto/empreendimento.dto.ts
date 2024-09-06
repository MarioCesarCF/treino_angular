export interface EmpreendimentoDto {
    id?: string;
    nome_fantasia?: string;
    razao_social: string;
    documento: number;
    ramo_atividade: string;
    telefone: number;
    logradouro?: string;
    bairro: string;
}