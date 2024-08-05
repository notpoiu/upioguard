import React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkpoint, checkpoints } from '@/db/schema';
import { TrashIcon } from 'lucide-react';

export function SortableItem({id, index, checkpoint,checkpoints, setCheckpoints}: {id: string, index: number, checkpoint: Checkpoint, checkpoints: Checkpoint[], setCheckpoints: React.Dispatch<React.SetStateAction<Checkpoint[]>>}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: id});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex flex-row gap-2 items-center transition-all">
      <div className="border rounded h-10 min-w-[30px]" />
      <div className="flex flex-col w-full">
        <Input value={checkpoint.checkpoint_url} readOnly />
      </div>
      <Button
        size={"icon"}
        onClick={() => setCheckpoints(checkpoints.filter((_, i) => i !== index))}
      >
        <TrashIcon />
      </Button>
    </div>
  );
}