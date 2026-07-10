import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Card {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'other';
  last_four_digits: string | null;
  credit_limit: number;
  current_balance: number;
  due_day: number | null;
  closing_day: number | null;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type CardInsert = Omit<Card, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type CardUpdate = Partial<CardInsert>;

export function useCards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCards(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar cartões:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createCard = async (card: CardInsert) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('cards')
        .insert({ ...card, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setCards(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateCard = async (id: string, updates: CardUpdate) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCards(prev => prev.map(c => c.id === id ? data : c));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteCard = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCards(prev => prev.filter(c => c.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, createCard, updateCard, deleteCard, refetch: fetchCards };
}
