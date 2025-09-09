import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export const POLICY_VERSION = "01-09-2025";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (accepted: boolean) => void;
  isBlocking?: boolean; // If true, modal cannot be closed without accepting
  mode?: 'read' | 'consent'; // read = info only, consent = requires acceptance
}

const PRIVACY_POLICY_CONTENT = `
**Declaração de Uso e Política de Privacidade**

**1. Propósito e Natureza dos Dados**

Este sistema (PSI Analytics - Hospital Planalto) processa dados de saúde mental para fins de análise epidemiológica, gestão hospitalar e melhoria da qualidade assistencial. Os dados incluem informações demográficas, diagnósticos (CID), procedência, e indicadores de internação de pacientes do serviço de psiquiatria.

**2. Base Legal**

O tratamento dos dados fundamenta-se na Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018) e demais normas aplicáveis, tendo como bases legais:
- Exercício regular de direitos em processo administrativo (Art. 7°, VI);
- Execução de políticas públicas (Art. 7°, III);
- Tutela da saúde (Art. 11, II).

**3. Coleta e Uso de Dados**

Os dados são coletados exclusivamente de sistemas hospitalares internos e utilizados para:
- Geração de indicadores assistenciais e epidemiológicos;
- Análise de tendências e padrões de internação;
- Avaliação de qualidade dos serviços prestados;
- Suporte à gestão e tomada de decisões clínicas;
- Cumprimento de obrigações regulatórias.

**4. Compartilhamento de Dados**

Os dados são compartilhados apenas com profissionais autorizados do Hospital Planalto e órgãos de saúde competentes, quando necessário para:
- Continuidade do cuidado;
- Relatórios epidemiológicos obrigatórios;
- Auditoria e fiscalização;
- Pesquisas científicas aprovadas por comitê de ética.

**5. Segurança e Proteção**

Implementamos medidas técnicas e organizacionais apropriadas para proteger os dados pessoais contra:
- Acesso não autorizado;
- Alteração, destruição ou perda acidental;
- Tratamento não autorizado ou ilícito;
- Transmissão acidental.

**6. Retenção de Dados**

Os dados são mantidos pelo tempo necessário para cumprimento das finalidades descritas, observando:
- Prazos legais de guarda de prontuários (20 anos);
- Necessidades de continuidade do cuidado;
- Obrigações regulatórias e de auditoria.

**7. Direitos do Titular**

Você tem direito a:
- Confirmação da existência de tratamento;
- Acesso aos dados;
- Correção de dados incompletos, inexatos ou desatualizados;
- Anonimização, bloqueio ou eliminação quando aplicável;
- Portabilidade quando tecnicamente viável;
- Informação sobre compartilhamento;
- Revogação do consentimento quando aplicável.

**8. Contato e Encarregado**

Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
- Encarregado de Dados: [nome]@hospitalplanalto.com.br
- Telefone: (XX) XXXX-XXXX
- Endereço: [Endereço do Hospital Planalto]

**9. Alterações**

Esta política pode ser alterada periodicamente. As alterações serão comunicadas através do próprio sistema e nova aceitação será solicitada quando necessário.

**10. Vigência**

Esta política entra em vigor na data de sua aceitação e permanece válida até nova versão.
`;

export function PrivacyPolicyModal({ 
  isOpen, 
  onClose, 
  onAccept, 
  isBlocking = false, 
  mode = 'read' 
}: PrivacyPolicyModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const acceptButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && mode === 'consent') {
      // Focus on the accept button when modal opens in consent mode
      setTimeout(() => {
        acceptButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mode]);

  const handleAcceptChange = (checked: boolean) => {
    setHasAccepted(checked);
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(true);
    }
    if (!isBlocking) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isBlocking) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isBlocking ? undefined : handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden"
        aria-modal="true"
        onPointerDownOutside={isBlocking ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isBlocking ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            Declaração de Uso e Política de Privacidade
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Versão {POLICY_VERSION}
          </p>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <div className="prose prose-sm max-w-none space-y-4 pb-4">
            {PRIVACY_POLICY_CONTENT.split('\n').map((paragraph, index) => {
              if (paragraph.trim() === '') return null;
              
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                // Handle bold headers
                const text = paragraph.replace(/\*\*/g, '');
                return (
                  <h3 key={index} className="font-semibold text-base mt-6 mb-2 text-foreground">
                    {text}
                  </h3>
                );
              }
              
              return (
                <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                  {paragraph.trim()}
                </p>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t">
          {mode === 'consent' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="privacy-accept"
                checked={hasAccepted}
                onCheckedChange={handleAcceptChange}
                aria-describedby="privacy-accept-description"
              />
              <label 
                htmlFor="privacy-accept" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                id="privacy-accept-description"
              >
                Li e concordo com a Política de Privacidade
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {!isBlocking && mode === 'read' && (
              <Button variant="outline" onClick={handleClose}>
                Fechar
              </Button>
            )}
            
            {mode === 'consent' && (
              <Button
                ref={acceptButtonRef}
                disabled={!hasAccepted}
                onClick={handleAccept}
                className="bg-primary hover:bg-primary/90"
              >
                Concordo e continuar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}