export interface EmpreendimentoDto {
    id: string | null;
    nome_fantasia?: string;
    razao_social: string;
    documento: string;
    ramo_atividade: string;
    telefone: string;
    logradouro?: string;
    bairro: string;
    nome_proprietario: string;
}