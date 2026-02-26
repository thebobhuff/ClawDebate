'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  createDebateStageAdmin,
  deleteDebateStageAdmin,
  getDebateStagesAdmin,
  setDebateStageStatusAdmin,
  updateDebateStageAdmin,
} from '@/app/actions/debate-stages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type DebateItem = {
  id: string;
  title: string;
  status: string;
};

type StageItem = {
  id: string;
  debate_id: string;
  name: string;
  description: string | null;
  stage_order: number;
  status: 'pending' | 'active' | 'completed';
  start_at?: string | null;
  end_at?: string | null;
};

type StageFormState = {
  name: string;
  description: string;
  stageOrder: number;
  status: 'pending' | 'active' | 'completed';
  startAt: string;
  endAt: string;
};

function toLocalDateTimeInput(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function nextStageOrder(stages: StageItem[]): number {
  if (!stages.length) return 1;
  return Math.max(...stages.map((s) => s.stage_order)) + 1;
}

export function StageAdminPanel({
  debates,
  initialDebateId,
  initialStages,
}: {
  debates: DebateItem[];
  initialDebateId: string;
  initialStages: StageItem[];
}) {
  const router = useRouter();
  const [selectedDebateId, setSelectedDebateId] = useState(initialDebateId);
  const [stages, setStages] = useState<StageItem[]>(initialStages);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingStageId, setEditingStageId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<StageFormState>({
    name: '',
    description: '',
    stageOrder: nextStageOrder(initialStages),
    status: 'pending',
    startAt: '',
    endAt: '',
  });

  const [editForm, setEditForm] = useState<StageFormState>({
    name: '',
    description: '',
    stageOrder: 1,
    status: 'pending',
    startAt: '',
    endAt: '',
  });

  const selectedDebate = useMemo(
    () => debates.find((debate) => debate.id === selectedDebateId) || null,
    [debates, selectedDebateId]
  );

  const refreshStages = async (debateId: string) => {
    setLoading(true);
    setError(null);
    const result = await getDebateStagesAdmin(debateId);
    if (!result.success) {
      setError(result.error || 'Failed to load stages');
      setLoading(false);
      return;
    }

    const nextStages = (result.data as StageItem[]) || [];
    setStages(nextStages);
    setCreateForm((prev) => ({
      ...prev,
      stageOrder: nextStageOrder(nextStages),
    }));
    setLoading(false);
  };

  const onDebateChange = async (debateId: string) => {
    setSelectedDebateId(debateId);
    setNotice(null);
    setEditingStageId(null);
    await refreshStages(debateId);
    router.replace(`/admin/stages?debateId=${debateId}`);
  };

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    const result = await createDebateStageAdmin({
      debateId: selectedDebateId,
      name: createForm.name,
      description: createForm.description,
      stageOrder: createForm.stageOrder,
      status: createForm.status,
      startAt: createForm.startAt || null,
      endAt: createForm.endAt || null,
    });

    if (!result.success) {
      setError(result.error || 'Failed to create stage');
      setLoading(false);
      return;
    }

    await refreshStages(selectedDebateId);
    setCreateForm({
      name: '',
      description: '',
      stageOrder: nextStageOrder(stages),
      status: 'pending',
      startAt: '',
      endAt: '',
    });
    setNotice('Stage created');
    setLoading(false);
  };

  const startEdit = (stage: StageItem) => {
    setEditingStageId(stage.id);
    setEditForm({
      name: stage.name,
      description: stage.description || '',
      stageOrder: stage.stage_order,
      status: stage.status,
      startAt: toLocalDateTimeInput(stage.start_at),
      endAt: toLocalDateTimeInput(stage.end_at),
    });
    setNotice(null);
    setError(null);
  };

  const onSaveEdit = async () => {
    if (!editingStageId) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const result = await updateDebateStageAdmin(editingStageId, {
      debateId: selectedDebateId,
      name: editForm.name,
      description: editForm.description,
      stageOrder: editForm.stageOrder,
      status: editForm.status,
      startAt: editForm.startAt || null,
      endAt: editForm.endAt || null,
    });

    if (!result.success) {
      setError(result.error || 'Failed to update stage');
      setLoading(false);
      return;
    }

    await refreshStages(selectedDebateId);
    setEditingStageId(null);
    setNotice('Stage updated');
    setLoading(false);
  };

  const onDelete = async (stageId: string) => {
    if (!confirm('Delete this stage?')) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    const result = await deleteDebateStageAdmin(stageId, selectedDebateId);
    if (!result.success) {
      setError(result.error || 'Failed to delete stage');
      setLoading(false);
      return;
    }

    await refreshStages(selectedDebateId);
    setNotice('Stage deleted');
    setLoading(false);
  };

  const onStatusChange = async (
    stageId: string,
    status: 'pending' | 'active' | 'completed'
  ) => {
    setLoading(true);
    setError(null);
    setNotice(null);
    const result = await setDebateStageStatusAdmin(stageId, selectedDebateId, status);
    if (!result.success) {
      setError(result.error || 'Failed to update stage status');
      setLoading(false);
      return;
    }

    await refreshStages(selectedDebateId);
    setNotice(`Stage marked as ${status}`);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Debate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="debate-select">Debate</Label>
          <Select value={selectedDebateId} onValueChange={onDebateChange}>
            <SelectTrigger id="debate-select">
              <SelectValue placeholder="Select a debate" />
            </SelectTrigger>
            <SelectContent>
              {debates.map((debate) => (
                <SelectItem key={debate.id} value={debate.id}>
                  {debate.title} ({debate.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="stage-name">Stage Name</Label>
              <Input
                id="stage-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Opening Statements"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="stage-description">Description</Label>
              <Textarea
                id="stage-description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional instructions for this stage"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-order">Stage Order</Label>
              <Input
                id="stage-order"
                type="number"
                min={1}
                value={createForm.stageOrder}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    stageOrder: parseInt(e.target.value || '1', 10),
                  }))
                }
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={createForm.status}
                onValueChange={(value: 'pending' | 'active' | 'completed') =>
                  setCreateForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">pending</SelectItem>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="completed">completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-start">Start At</Label>
              <Input
                id="stage-start"
                type="datetime-local"
                value={createForm.startAt}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, startAt: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-end">End At</Label>
              <Input
                id="stage-end"
                type="datetime-local"
                value={createForm.endAt}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, endAt: e.target.value }))}
                disabled={loading}
              />
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading || !selectedDebate}>
                Create Stage
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Stages{selectedDebate ? ` for "${selectedDebate.title}"` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notice && (
            <p className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300">
              {notice}
            </p>
          )}
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!stages.length && (
            <p className="text-sm text-muted-foreground">No stages yet for this debate.</p>
          )}

          {stages.map((stage) => (
            <div key={stage.id} className="rounded-lg border p-4">
              {editingStageId === stage.id ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Stage Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Order</Label>
                    <Input
                      type="number"
                      min={1}
                      value={editForm.stageOrder}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          stageOrder: parseInt(e.target.value || '1', 10),
                        }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value: 'pending' | 'active' | 'completed') =>
                        setEditForm((prev) => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">pending</SelectItem>
                        <SelectItem value="active">active</SelectItem>
                        <SelectItem value="completed">completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Start At</Label>
                    <Input
                      type="datetime-local"
                      value={editForm.startAt}
                      onChange={(e) =>
                        setEditForm((prev) => ({ ...prev, startAt: e.target.value }))
                      }
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End At</Label>
                    <Input
                      type="datetime-local"
                      value={editForm.endAt}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, endAt: e.target.value }))}
                      disabled={loading}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button onClick={onSaveEdit} disabled={loading}>
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingStageId(null)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {stage.stage_order}. {stage.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{stage.description || 'No description'}</p>
                    </div>
                    <span className="rounded-full border px-2 py-0.5 text-xs">{stage.status}</span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Start: {stage.start_at ? new Date(stage.start_at).toLocaleString() : 'not set'} | End:{' '}
                    {stage.end_at ? new Date(stage.end_at).toLocaleString() : 'not set'}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(stage)} disabled={loading}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(stage.id, 'active')}
                      disabled={loading || stage.status === 'active'}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(stage.id, 'completed')}
                      disabled={loading || stage.status === 'completed'}
                    >
                      Complete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onStatusChange(stage.id, 'pending')}
                      disabled={loading || stage.status === 'pending'}
                    >
                      Set Pending
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(stage.id)}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
