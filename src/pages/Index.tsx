export default function Index() {
  return (
    <>
      <div style={{
        position: "fixed",
        top: 0,
        width: "100%",
        textAlign: "center",
        backgroundColor: "white",
        zIndex: 9999,
        padding: "20px 0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ 
          fontFamily: "'Inter', 'Roboto Slab', serif", 
          fontSize: "28px",
          color: "#1565C0",
          fontWeight: "700",
          margin: "0"
        }}>
          Painel de Internações Psiquiátricas
        </h1>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6" style={{ paddingTop: "60px" }}>

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <div style={{ 
          background: "#FFFFFF", 
          borderRadius: "12px", 
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", 
          padding: "24px", 
          marginBottom: "16px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "19px", color: "#1565C0", marginBottom: "12px", fontWeight: "600" }}>🎯 Objetivo do sistema</div>
          <p style={{ color: "#333333", fontSize: "16px", lineHeight: "1.6" }}>
            Este aplicativo foi desenvolvido para permitir o acompanhamento técnico e analítico das internações psiquiátricas do Hospital Planalto. Focado em indicadores clínico-administrativos, ele apoia a gestão da assistência, identifica padrões relevantes (como reinternações, tempo médio de internação e perfil clínico) e orienta melhorias em articulação com a Rede de Atenção Psicossocial (RAPS).
          </p>
        </div>

        <div style={{ 
          background: "#FFFFFF", 
          borderRadius: "12px", 
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", 
          padding: "24px", 
          marginBottom: "16px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "19px", color: "#1565C0", marginBottom: "12px", fontWeight: "600" }}>🧪 Metodologia e fonte dos dados</div>
          <p style={{ color: "#333333", fontSize: "16px", lineHeight: "1.6" }}>
            Dados extraídos da base de internações da Enfermaria Psiquiátrica do Hospital Planalto. Seu foco é a análise institucional retroativa, com finalidade técnica e gerencial, oferecendo subsídios para qualificação do cuidado em saúde mental.
          </p>
        </div>

        <div style={{ 
          background: "#FFFFFF", 
          borderRadius: "12px", 
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", 
          padding: "24px", 
          marginBottom: "16px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "19px", color: "#1565C0", marginBottom: "12px", fontWeight: "600" }}>📅 Período dos dados</div>
          <p style={{ color: "#333333", fontSize: "16px", lineHeight: "1.6" }}>
            O painel abrange internações entre 11/06/2024 e 24/07/2025.
          </p>
        </div>

        <div style={{ 
          background: "#FFFFFF", 
          borderRadius: "12px", 
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)", 
          padding: "24px", 
          marginBottom: "24px", 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: "19px", color: "#1565C0", marginBottom: "12px", fontWeight: "600" }}>🔄 Versão do sistema</div>
          <p style={{ color: "#333333", fontSize: "16px", lineHeight: "1.6" }}>
            Versão 1.0<br />
            Última atualização: 30/07/2025
          </p>
        </div>

        <div style={{ textAlign: "center", fontSize: "13px", color: "#666666" }}>
          Desenvolvido pelo Serviço de Psiquiatria do Hospital Planalto
        </div>
      </div>
      </div>
    </>
  );
}