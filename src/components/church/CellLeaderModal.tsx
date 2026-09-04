"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  X,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface CellLeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  cellId?: string;
  cellName?: string;
  churchName?: string;
}

export default function CellLeaderModal({
  isOpen,
  onClose,
  cellId,
  cellName = 'Home Fellowship Cell',
  churchName = 'Church Community'
}: CellLeaderModalProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let query = supabase
        .from('profiles')
        .select('id, full_name, email, phone, verification_status, community_verification_status, church_cell_id, created_at');

      if (cellId) {
        query = query.eq('church_cell_id', cellId);
      } else {
        query = query.or(`community_verification_status.eq.pending,community_verification_status.eq.community_verified`);
      }

      const { data, error } = await query;
      if (error) {
        // Table or columns might not exist yet
        console.warn('Could not load cell members:', error.message);
        setMembers([]);
      } else {
        setMembers(data || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, cellId]);

  const handleApproveMember = async (memberId: string, memberName: string) => {
    setProcessingId(memberId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          community_verification_status: 'community_verified'
        })
        .eq('id', memberId);

      if (error) {
        setErrorMsg('Approval failed: ' + error.message);
      } else {
        // Send in-app notification to member
        await supabase.from('notifications').insert({
          user_id: memberId,
          title: 'Church Fellowship Verified! ⛪',
          message: `Your membership in ${cellName} (${churchName}) has been confirmed by your fellowship coordinator!`
        });

        // Update local state
        setMembers(prev =>
          prev.map(m => (m.id === memberId ? { ...m, community_verification_status: 'community_verified' } : m))
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  const pendingMembers = members.filter(m => m.community_verification_status === 'pending');
  const verifiedMembers = members.filter(m => m.community_verification_status === 'community_verified');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gazie-navy/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-2 border-gazie-navy rounded-3xl w-full max-w-lg p-6 shadow-xl space-y-5 relative max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-dashed border-gazie-navy/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-gazie-navy">
                Cell Leader Verification Portal
              </h2>
              <p className="text-[11px] text-gazie-navy/60 font-semibold">
                {cellName} • {churchName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gazie-navy/40 hover:text-gazie-navy transition p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          
          {/* Pending Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Pending Fellowship Members ({pendingMembers.length})
              </span>
              <button
                type="button"
                onClick={fetchMembers}
                className="text-[10px] text-gazie-navy/60 hover:text-gazie-navy flex items-center gap-1 underline cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-[11px] text-gazie-navy/50 py-4 text-center">Loading members...</p>
            ) : pendingMembers.length === 0 ? (
              <div className="bg-gazie-paper/30 border border-dashed border-gazie-navy/20 rounded-2xl p-4 text-center text-[11px] text-gazie-navy/60">
                No members currently pending verification for this cell.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-gazie-navy block">{member.full_name}</span>
                      <span className="text-[10px] text-gazie-navy/60 block">{member.phone || member.email}</span>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-2.5 h-2.5" /> NIN {member.verification_status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApproveMember(member.id, member.full_name)}
                      disabled={processingId === member.id}
                      className="bg-[#2D6A4F] hover:bg-emerald-800 text-white font-bold text-[11px] py-1.5 px-3 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{processingId === member.id ? 'Approving...' : 'Confirm Member'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Members List */}
          {verifiedMembers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-gazie-navy/10">
              <span className="font-bold text-gazie-navy uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-gazie-green" />
                Verified Brethren ({verifiedMembers.length})
              </span>

              <div className="divide-y divide-dashed divide-gazie-navy/10">
                {verifiedMembers.map((m) => (
                  <div key={m.id} className="py-2 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-semibold text-gazie-navy block">{m.full_name}</span>
                      <span className="text-[9px] text-gazie-navy/50">{m.phone || 'Phone verified'}</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Cell Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-dashed border-gazie-navy/10 pt-3 flex justify-between items-center text-[10px] text-gazie-navy/60">
          <span>Trust & Safety: Approving confirms this person attends your cell fellowship.</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-gazie-navy hover:underline cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
