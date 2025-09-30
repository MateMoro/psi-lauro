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
O aplicativo IntegraRAPS é uma ferramenta digital de uso exclusivo institucional, desenvolvida para finalidade assistencial e gerencial. Seus dados são processados com base na Lei Geral de Proteção de Dados (LGPD), em alinhamento com as bases legais de tutela da saúde e execução de políticas públicas.

Esta plataforma integra, com atualização diária em dias úteis, dados provenientes de uma planilha operacional compartilhada com a Secretaria de Saúde. Esses dados são consolidados e disponibilizados na aplicação para facilitar a continuidade do cuidado, otimizar a comunicação entre equipes e aprimorar a gestão do histórico clínico.

Seguimos o princípio da minimização, compartilhando apenas os dados estritamente necessários para a prestação dos serviços. Todos os acessos são logados, auditáveis e restritos a profissionais de saúde autorizados. É proibido o compartilhamento externo de qualquer informação, assegurando a confidencialidade e a segurança do paciente.

O uso indevido deste aplicativo, incluindo o acesso não autorizado ou a divulgação de dados sigilosos, configura infração ética, administrativa e legal.
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