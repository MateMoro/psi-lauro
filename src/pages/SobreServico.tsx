import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Shield, Activity, FileText, TrendingUp } from "lucide-react";

export default function SobreServico() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-institutional-blue">
          Sobre o Serviço de Psiquiatria – Hospital Planalto
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conheça nossa estrutura, perfil assistencial e práticas clínicas especializadas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histórico e Estrutura */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Shield className="h-5 w-5" />
              Histórico e Estrutura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Serviço de Psiquiatria foi <strong>reaberto em abril de 2020</strong>, sob gestão 
              compartilhada com a SPDM, após atuar como unidade de catástrofe durante a pandemia, 
              o que implicou no fechamento temporário do setor de saúde mental.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Desde então, funciona como <strong>unidade referenciada em saúde mental</strong>, 
              recebendo majoritariamente pacientes regulados dos hospitais Cidade Tiradentes 
              e Benedito Montenegro (IVA).
            </p>
          </CardContent>
        </Card>

        {/* Perfil Assistencial */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Activity className="h-5 w-5" />
              Perfil Assistencial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Atendemos prioritariamente pacientes com <strong>quadros agudos graves</strong>, 
              refratários ao tratamento ambulatorial convencional.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Muitos casos necessitam de introdução de fármacos de alto risco, como a 
              <strong> clozapina</strong>, que exige monitoramento hematológico rigoroso 
              durante a internação, o que reforça o grau de complexidade clínica e o papel 
              estratégico da unidade.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Embora oficialmente configurado como <strong>porta fechada</strong>, há aumento 
              progressivo de admissões via SAMU e demanda espontânea, demonstrando mudança 
              gradual no perfil de entrada.
            </p>
          </CardContent>
        </Card>

        {/* Indicadores */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <TrendingUp className="h-5 w-5" />
              Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <span className="font-medium text-foreground">Média mensal:</span>
                <span className="text-muted-foreground ml-2">cerca de 30 internações psiquiátricas</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Tempo médio de permanência:</span>
                <span className="text-muted-foreground ml-2">14,3 dias</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Taxa de ocupação:</span>
                <span className="text-muted-foreground ml-2">91,3%</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Por não contar com pronto-socorro geral, a taxa de reinternação precoce (≤15 dias) 
              não é monitorada sistematicamente, mas a articulação com os CAPS no momento da 
              alta favorece um retorno seguro à rede.
            </p>
          </CardContent>
        </Card>

        {/* Equipe e Práticas Clínicas */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Users className="h-5 w-5" />
              Equipe e Práticas Clínicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Enfermaria com 16 leitos psiquiátricos.</strong>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Equipe multiprofissional composta por psiquiatra diarista, plantonistas, 
              enfermagem, psicologia, terapia ocupacional e serviço social.
            </p>
            <div className="bg-accent/10 p-3 rounded-lg border-l-4 border-accent">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Pioneiro na implantação do PTS na unidade</strong>, o Serviço de 
                Psiquiatria foi o primeiro setor a registrar Projetos Terapêuticos Singulares 
                diretamente no sistema SGHx, promovendo maior alinhamento clínico e qualificação 
                do cuidado interdisciplinar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Aprimoramento Contínuo */}
        <Card className="shadow-medium lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <FileText className="h-5 w-5" />
              Aprimoramento Contínuo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-foreground mb-2">Protocolos Clínicos</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Protocolos clínicos revisados para depressão, transtorno afetivo bipolar 
                  e esquizofrenia.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-2">Capacitações</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Capacitações com foco em comunicação não violenta e humanização do cuidado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}