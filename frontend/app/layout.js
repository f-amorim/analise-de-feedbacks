export const metadata = {
  title: 'Dashboard de Feedbacks',
  description: 'Análise de feedbacks médicos com PLN',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: '#f5f5f5'
      }}>
        {children}
      </body>
    </html>
  );
}