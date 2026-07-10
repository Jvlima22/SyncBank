import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Income {
  id: string;
  user_id: string;
  income_type: 'product_sale' | 'service' | 'commission' | 'refund' | 'salary' | 'freelance' | 'investment' | 'other';
  amount: number;
  date: string;
  client_source: string | null;
  category: string | null;
  description: string | null;
  attachment_url: string | null;
  status: 'received' | 'pending';
  created_at: string;
  updated_at: string;
}

type IncomeInsert = Omit<Income, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
type IncomeUpdate = Partial<IncomeInsert>;

export function useIncomes() {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomes = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setIncomes(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar receitas:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createIncome = async (income: IncomeInsert) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const { data, error } = await supabase
        .from('incomes')
        .insert({ ...income, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setIncomes(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const updateIncome = async (id: string, updates: IncomeUpdate) => {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setIncomes(prev => prev.map(i => i.id === id ? data : i));
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  const deleteIncome = async (id: string) => {
    try {
      const { error } = await supabase
        .from('incomes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIncomes(prev => prev.filter(i => i.id !== id));
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  return { incomes, loading, error, createIncome, updateIncome, deleteIncome, refetch: fetchIncomes };
}
