'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data, error } = await supabase
      .from('feedback_simples')
      .select('*')
      .order('timestamp_forms', { ascending: false });

    if (!error && data) {
      setDados(data);
    }
    setCarregando(false);
  }

  if (carregando) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Carregando...</div>;
  }

  // Estatísticas
  const total = dados.length;
  const processados = dados.filter(d => d.sentimento).length;
  const positivos = dados.filter(d => d.sentimento === 'positivo').length;
  const negativos = dados.filter(d => d.sentimento === 'negativo').length;
  const neutros = dados.filter(d => d.sentimento === 'neutro').length;
  const mediaAvaliacao = dados.reduce((acc, d) => acc + (d.avaliacao || 0), 0) / total;

  // Dados para gráficos
  const dadosSentimento = [
    { name: 'Positivo', value: positivos, color: '#00cc96' },
    { name: 'Neutro', value: neutros, color: '#636efa' },
    { name: 'Negativo', value: negativos, color: '#ef553b' },
  ];

  const dadosAvaliacao = Array.from({ length: 10 }, (_, i) => ({
    nota: i + 1,
    quantidade: dados.filter(d => d.avaliacao === i + 1).length
  }));

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🏥 Dashboard de Feedbacks Médicos</h1>
      
      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <Card titulo="Total" valor={total} cor="#636efa" />
        <Card titulo="Positivos" valor={positivos} cor="#00cc96" />
        <Card titulo="Negativos" valor={negativos} cor="#ef553b" />
        <Card titulo="Média" valor={`${mediaAvaliacao.toFixed(1)}/10`} cor="#ffa500" />
      </div>

      {/* Gráficos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>📊 Distribuição de Sentimentos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dadosSentimento} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {dadosSentimento.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>⭐ Distribuição de Avaliações</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosAvaliacao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nota" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Feedbacks Recentes */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0 }}>💬 Feedbacks Recentes</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Data</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Nota</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Sentimento</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Comentário</th>
              </tr>
            </thead>
            <tbody>
              {dados.slice(0, 20).map((fb, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{new Date(fb.timestamp_forms).toLocaleDateString('pt-BR')}</td>
                  <td style={{ padding: '12px' }}>{fb.avaliacao}/10</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: fb.sentimento === 'positivo' ? '#d4edda' : fb.sentimento === 'negativo' ? '#f8d7da' : '#d1ecf1',
                      color: fb.sentimento === 'positivo' ? '#155724' : fb.sentimento === 'negativo' ? '#721c24' : '#0c5460',
                      fontSize: '0.9em'
                    }}>
                      {fb.sentimento || 'Pendente'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {fb.comentario}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px', color: '#666', fontSize: '0.9em' }}>
        Atualizado automaticamente via GitHub Actions | Modelo: DistilBERTimbau
      </div>
    </div>
  );
}

function Card({ titulo, valor, cor }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${cor}`
    }}>
      <div style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>{titulo}</div>
      <div style={{ fontSize: '2em', fontWeight: 'bold', color: cor }}>{valor}</div>
    </div>
  );
}