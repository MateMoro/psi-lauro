import { useState } from 'react';
import { PrivacyPolicyModal } from './privacy/PrivacyPolicyModal';

export function DashboardFooter() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handlePrivacyLinkClick = () => {
    setIsPrivacyModalOpen(true);
  };

  const handlePrivacyModalClose = () => {
    setIsPrivacyModalOpen(false);
  };

  return (
    <>
      <footer className="py-4 px-6 border-t border-border bg-card mt-auto">
        {/* Desktop layout - single line for >= 480px */}
        <div className="hidden min-[480px]:flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 – IntegraRAPS. Todos os direitos reservados.
          </p>
          <button
            onClick={handlePrivacyLinkClick}
            className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            aria-label="Abrir Política de Privacidade"
          >
            Política de Privacidade
          </button>
        </div>

        {/* Mobile layout - two lines for < 480px */}
        <div className="min-[480px]:hidden space-y-2 text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 – IntegraRAPS. Todos os direitos reservados.
          </p>
          <button
            onClick={handlePrivacyLinkClick}
            className="text-sm text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            aria-label="Abrir Política de Privacidade"
          >
            Política de Privacidade
          </button>
        </div>
      </footer>

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={handlePrivacyModalClose}
        mode="read"
        isBlocking={false}
      />
    </>
  );
}