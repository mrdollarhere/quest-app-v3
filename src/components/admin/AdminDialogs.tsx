"use client";

import React from 'react';
import { TestDialog } from './dialogs/TestDialog';
import { UserDialog } from './dialogs/UserDialog';
import { BulkDialog } from './dialogs/BulkDialog';
import { QuestionDialog } from './dialogs/QuestionDialog';
import { Question } from '@/types/quiz';

interface AdminDialogsProps {
  dialogs: {
    test: boolean;
    user: boolean;
    question: boolean;
    bulk: boolean;
  };
  setDialogs: (dialogs: any) => void;
  editingItem: any;
  selectedTestId: string;
  questions: Question[];
  onSaveTest: (data: any) => void;
  onSaveUser: (data: any) => void;
  onSaveUsers?: (data: any[]) => void;
  onSaveQuestion: (data: any, isRequired: boolean) => void;
  onSaveBulk: (json: string) => void;
  loading?: boolean;
}

export function AdminDialogs({ 
  dialogs, 
  setDialogs, 
  editingItem, 
  selectedTestId, 
  questions,
  onSaveTest, 
  onSaveUser, 
  onSaveUsers,
  onSaveQuestion, 
  onSaveBulk,
  loading
}: AdminDialogsProps) {
  return (
    <>
      <TestDialog 
        open={dialogs.test} 
        onOpenChange={(val) => setDialogs({...dialogs, test: val})}
        editingItem={editingItem}
        onSave={onSaveTest}
        loading={loading}
      />

      <QuestionDialog 
        open={dialogs.question}
        onOpenChange={(val) => setDialogs({...dialogs, question: val})}
        editingItem={editingItem}
        selectedTestId={selectedTestId}
        onSave={onSaveQuestion}
        loading={loading}
      />

      <UserDialog 
        open={dialogs.user}
        onOpenChange={(val) => setDialogs({...dialogs, user: val})}
        editingItem={editingItem}
        onSave={onSaveUser}
        onSaveBatch={onSaveUsers}
        loading={loading}
      />

      <BulkDialog 
        open={dialogs.bulk}
        onOpenChange={(val) => setDialogs({...dialogs, bulk: val})}
        selectedTestId={selectedTestId}
        questions={questions}
        onSave={onSaveBulk}
      />
    </>
  );
}
