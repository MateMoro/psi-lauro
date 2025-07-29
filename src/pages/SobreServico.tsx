import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Shield, Activity, FileText, TrendingUp } from "lucide-react";

export default function SobreServico() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-institutional-blue">
          🏥 Sobre o Serviço de Psiquiatria – Hospital Planalto
        </h1>
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
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                O Serviço de Psiquiatria <strong>(pronto-socorro e enfermaria) foi reaberto em abril de 2020</strong>, 
                sob gestão compartilhada com a SPDM.
              </li>
              <li>
                Durante a pandemia, o hospital foi designado como <strong>unidade de catástrofe</strong>, 
                o que implicou no fechamento temporário do serviço de saúde mental.
              </li>
              <li>
                Desde então, o setor funciona como <strong>unidade referenciada em saúde mental</strong>, 
                recebendo majoritariamente pacientes regulados dos hospitais Cidade Tiradentes 
                e Benedito Montenegro (IVA).
              </li>
            </ul>
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
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                Atendemos prioritariamente pacientes com <strong>quadros agudos graves</strong>, 
                refratários ao tratamento ambulatorial convencional.
              </li>
              <li>
                Muitos casos necessitam de introdução de fármacos de alto risco, como a 
                <strong> clozapina</strong>, que exige monitoramento hematológico rigoroso 
                durante a internação, o que reforça o grau de complexidade clínica e o papel 
                estratégico da unidade.
              </li>
              <li>
                Embora oficialmente configurado como <strong>porta fechada</strong>, há aumento 
                progressivo de admissões via SAMU e demanda espontânea, demonstrando mudança 
                gradual no perfil de entrada.
              </li>
            </ul>
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
            <ul className="space-y-2 text-sm leading-relaxed">
              <li>
                <span className="font-medium text-foreground">Média mensal:</span>
                <span className="text-muted-foreground ml-1">cerca de 30 internações psiquiátricas.</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Tempo médio de permanência recente:</span>
                <span className="text-muted-foreground ml-1">14,3 dias, compatível com o perfil clínico de maior gravidade.</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Taxa de ocupação:</span>
                <span className="text-muted-foreground ml-1">91,3%.</span>
              </li>
              <li>
                <span className="font-medium text-foreground">Taxa de reinternação em até 15 dias:</span>
                <span className="text-muted-foreground ml-1">?.</span>
              </li>
            </ul>
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
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                <strong>Enfermaria com 16 leitos psiquiátricos.</strong>
              </li>
              <li>
                Equipe multiprofissional composta por psiquiatra diarista, plantonistas, 
                enfermagem, psicologia, terapia ocupacional e serviço social.
              </li>
            </ul>
            <div className="bg-accent/10 p-3 rounded-lg border-l-4 border-accent">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Primeiro setor a registrar os PTS diretamente no sistema SGHx</strong>, 
                promovendo maior alinhamento clínico e qualificação do cuidado interdisciplinar.
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
            <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>
                Protocolos clínicos revisados para depressão, transtorno afetivo bipolar 
                e esquizofrenia.
              </li>
              <li>
                Capacitações com foco em comunicação não violenta e humanização do cuidado.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}