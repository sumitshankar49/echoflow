'use client';

import { Sparkles, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type SubmitPayload = {
  title: string;
  content: string;
  tags: string[];
};

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  initialTags?: string[];
  submitLabel?: string;
  isPending?: boolean;
  onSubmit: (payload: SubmitPayload) => Promise<void> | void;
  onCancel?: () => void;
}

export function NoteEditor({
  initialTitle = '',
  initialContent = '',
  initialTags = [],
  submitLabel = 'Save note',
  isPending = false,
  onSubmit,
  onCancel,
}: NoteEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [tagsInput, setTagsInput] = useState(initialTags.join(', '));

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent);
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  useEffect(() => {
    setTagsInput(initialTags.join(', '));
  }, [initialTags]);

  const parsedTags = useMemo(
    () =>
      tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    [tagsInput],
  );

  const applyFormat = (command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList') => {
    document.execCommand(command, false);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const contentText = stripHtml(content);
    if (!contentText) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      content,
      tags: parsedTags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Your amazing note title"
        />
      </div>

      <div className="space-y-2">
        <Label>Formatting</Label>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => applyFormat('bold')}>
            Bold
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyFormat('italic')}>
            Italic
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => applyFormat('underline')}>
            Underline
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyFormat('insertUnorderedList')}
          >
            Bullet list
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => applyFormat('insertOrderedList')}
          >
            Numbered list
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(event) => setContent((event.target as HTMLDivElement).innerHTML)}
          className="min-h-36 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-tags">Tags</Label>
        <Textarea
          id="note-tags"
          value={tagsInput}
          onChange={(event) => setTagsInput(event.target.value)}
          rows={2}
          placeholder="work, planning, ideas"
        />
        <div className="flex flex-wrap gap-2">
          {parsedTags.length > 0 ? (
            parsedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {tag}
              </Badge>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Add comma-separated tags to organize notes.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isPending} className="gap-2">
          <WandSparkles className="h-4 w-4" />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}