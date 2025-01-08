export interface DadosEmpresa {
    atividade_principal?: {cnae: string, descricao: string};
    atividades_secundarias?: {cnae: string, descricao: string}[];
}