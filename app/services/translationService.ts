interface TranslationPayload {
  text: string;
  source_lang: string;
  target_lang: string;
  use_retrieval_bias: boolean;
  beta: number;
  k_candidates: number;
  k_retrieval: number;
}

interface TranslationCandidate {
  translation_text: string;
  log_prob_component: number;
  similarity_component: number;
  final_score: number;
  similarity_breakdown: {
    semantic_similarity: number;
    medical_term_overlap: number;
    cultural_context: number;
    total_score: number;
  };
  original_rank: number;
  original_confidence: number;
  retrieval_biased_rank: number;
}

interface TranslationResponse {
  candidates: TranslationCandidate[];
  best_translation: string;
  retrieval_biased: boolean;
  equation_components: {
    log_prob_term: number;
    similarity_term: number;
    beta_weight: number;
    equation: string;
  };
  similarity_breakdown: {
    semantic_similarity: number;
    medical_term_overlap: number;
    cultural_context: number;
    total_score: number;
  };
  retrieved_contexts: Array<{
    content: string;
    metadata: {
      source: string;
      page: number;
      chunk_id: number;
    };
  }>;
  source_lang: string;
  target_lang: string;
  legacy_mode: boolean;
}

class TranslationService {
  private readonly baseUrl = 'https://h3vwf0fhff24pc-9090.proxy.runpod.net/translate/';

  async translateText(
    text: string,
    sourceLang: string = 'twi_Latn',
    targetLang: string = 'eng_Latn'
  ): Promise<string> {
    try {
      const payload: TranslationPayload = {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
        use_retrieval_bias: true,
        beta: 0.5,
        k_candidates: 3,
        k_retrieval: 5,
      };

      console.log('🌐 Translation payload:', payload);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
      }

      const data: TranslationResponse = await response.json();
      
      console.log('📥 Full API response:', data);
      console.log('Translation response:', {
        original: text,
        translated: data.best_translation,
        confidence: data.candidates[0]?.original_confidence || 0,
        actualSourceLang: data.source_lang,
        actualTargetLang: data.target_lang,
      });

      return data.best_translation || text; // Fallback to original text if translation fails
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text if translation fails
      return text;
    }
  }

  async translateTwiToEnglish(text: string): Promise<string> {
    return this.translateText(text, 'twi_Latn', 'eng_Latn');
  }

  async translateEnglishToTwi(text: string): Promise<string> {
    return this.translateText(text, 'eng_Latn', 'twi_Latn');
  }

  // Batch translation for multiple messages
  async translateBatch(
    texts: string[],
    sourceLang: string = 'twi_Latn',
    targetLang: string = 'eng_Latn'
  ): Promise<string[]> {
    const translations = await Promise.allSettled(
      texts.map(text => this.translateText(text, sourceLang, targetLang))
    );

    return translations.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Translation failed for text ${index}:`, result.reason);
        return texts[index]; // Return original text on failure
      }
    });
  }
}

export const translationService = new TranslationService();
export type { TranslationCandidate, TranslationResponse };
