"""
GitHub Actions: Processa feedbacks pendentes com modelo do Hugging Face
"""

import os
from supabase import create_client
from transformers import pipeline

# Configurações
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
HF_MODEL = os.getenv("HF_MODEL_NAME", "seu-usuario/distilbertimbau-feedback-medico")

print("🔗 Conectando ao Supabase...")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

print("📥 Buscando feedbacks não processados...")
response = supabase.table("feedback_simples").select("*").is_("sentimento", "null").execute()
pendentes = response.data

print(f"📊 {len(pendentes)} feedbacks pendentes")

if not pendentes:
    print("✅ Nada para processar")
    exit(0)

print(f"🤖 Carregando modelo: {HF_MODEL}")
classifier = pipeline("sentiment-analysis", model=HF_MODEL, tokenizer=HF_MODEL)

print("🔄 Processando...")
for fb in pendentes:
    resultado = classifier(fb["comentario"])[0]
    
    # Mapeia labels
    label_map = {"LABEL_0": "negativo", "LABEL_1": "neutro", "LABEL_2": "positivo"}
    sentimento = label_map.get(resultado["label"], resultado["label"])
    
    # Atualiza no Supabase
    supabase.table("feedback_simples").update({
        "sentimento": sentimento,
        "score_sentimento": resultado["score"]
    }).eq("id", fb["id"]).execute()
    
    print(f"   ✓ ID {fb['id']}: {sentimento} ({resultado['score']:.2%})")

print(f"\n✅ {len(pendentes)} feedbacks processados!")