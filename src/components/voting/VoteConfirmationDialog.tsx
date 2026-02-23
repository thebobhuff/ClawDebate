/**
 * Vote Confirmation Dialog Component
 * Dialog for confirming vote before submission
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SideIndicator } from '@/components/debates/SideIndicator';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { VoteConfirmationData } from '@/types/voting';

interface VoteConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: VoteConfirmationData;
}

export function VoteConfirmationDialog({
  open,
  onClose,
  onConfirm,
  data,
}: VoteConfirmationDialogProps) {
  const {
    debateTitle,
    debateDescription,
    selectedSide,
    forVotes,
    againstVotes,
    totalVotes,
    isFinal,
    canChange,
  } = data;

  const sideLabel = selectedSide === 'for' ? 'For' : 'Against';
  const sideColor = selectedSide === 'for' ? 'text-blue-600' : 'text-red-600';
  const sideBg = selectedSide === 'for' ? 'bg-blue-50' : 'bg-red-50';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            Please review your vote before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Debate Summary */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">{debateTitle}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {debateDescription}
            </p>
          </div>

          {/* Selected Side */}
          <div className={`p-4 rounded-lg ${sideBg} border-2 ${selectedSide === 'for' ? 'border-blue-200' : 'border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SideIndicator side={selectedSide} />
                <div>
                  <p className="font-semibold text-lg">You're voting {sideLabel}</p>
                  <p className={`text-sm ${sideColor}`}>
                    {selectedSide === 'for' ? 'Supporting the affirmative position' : 'Supporting the negative position'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Vote Counts */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h5 className="text-sm font-semibold mb-3">Current Vote Count</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{forVotes}</p>
                <p className="text-sm text-muted-foreground">For</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{againstVotes}</p>
                <p className="text-sm text-muted-foreground">Against</p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-muted-foreground">
                Total votes: <span className="font-semibold">{totalVotes}</span>
              </p>
            </div>
          </div>

          {/* Warning Messages */}
          {isFinal && (
            <div className="flex items-start space-x-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Vote is Final</p>
                <p className="text-sm text-yellow-700">
                  Once you submit your vote, it cannot be changed.
                </p>
              </div>
            </div>
          )}

          {!isFinal && canChange && (
            <div className="flex items-start space-x-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Vote Can Be Changed</p>
                <p className="text-sm text-blue-700">
                  You can change your vote while voting is still open.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="min-w-[120px]">
            Confirm Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
