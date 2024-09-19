export interface EmpreendimentoDto {
    id: string | null;
    nome_fantasia?: string;
    razao_social: string;
    documento: number;
    ramo_atividade: string;
    telefone: number;
    logradouro?: string;
    bairro: string;
    nome_proprietario: string;
}