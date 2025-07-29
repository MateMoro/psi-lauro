import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Shield, Activity } from "lucide-react";

export default function SobreServico() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-institutional-blue">
          Entenda Nossa Realidade Assistencial
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conheça o perfil assistencial e a importância clínica do Hospital Planalto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Perfil da Unidade */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Shield className="h-5 w-5" />
              Perfil da Unidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              O Hospital Planalto é uma <strong>unidade de porta fechada</strong>, especializada 
              no atendimento de casos psiquiátricos de alta complexidade e gravidade.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nossa unidade é frequentemente indicada como referência para pacientes oriundos 
              dos Hospitais Cidade Tiradentes e Iva, que funcionam como <strong>portas abertas</strong> na 
              rede municipal de saúde mental.
            </p>
          </CardContent>
        </Card>

        {/* Complexidade Clínica */}
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Activity className="h-5 w-5" />
              Complexidade Clínica
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
              durante a internação.
            </p>
          </CardContent>
        </Card>

        {/* Média de Permanência */}
        <Card className="shadow-medium md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Clock className="h-5 w-5" />
              Justificativa da Média de Permanência (14,3 dias)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent/10 p-4 rounded-lg border-l-4 border-accent">
              <p className="text-sm text-foreground leading-relaxed">
                "O Hospital Planalto é uma unidade de porta fechada, referência para casos 
                psiquiátricos graves. Recebe majoritariamente pacientes transferidos dos 
                hospitais Cidade Tiradentes e Iva, que são portas abertas.
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                Nosso perfil assistencial inclui pacientes com quadros refratários e 
                necessidade de uso de fármacos como a clozapina, que demanda controle 
                hematológico rigoroso no início do tratamento.
              </p>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                Por isso, a média de permanência de <strong>14,3 dias</strong> é reflexo da 
                complexidade clínica e da busca por segurança terapêutica em casos de maior gravidade."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Segurança e Qualidade */}
        <Card className="shadow-medium md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-institutional-blue">
              <Users className="h-5 w-5" />
              Compromisso com a Segurança e Qualidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Este perfil clínico justifica uma média de permanência hospitalar mais longa, 
              voltada à <strong>estabilização segura</strong>, ao <strong>ajuste terapêutico</strong> 
              e à <strong>proteção do paciente</strong> e da rede. Os 14,3 dias refletem um 
              cuidado técnico rigoroso, alinhado às boas práticas e à segurança do paciente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}