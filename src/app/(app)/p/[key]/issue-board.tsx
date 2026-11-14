"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  pointerWithin,
  useDndContext,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StatusIcon } from "@/components/issue-icons";
import { statusLabels } from "@/lib/labels";
import { positionBetween } from "@/lib/position";
import { cn } from "@/lib/utils";
import type { IssueRow } from "../../issue-groups";

type Status = IssueRow["status"];
const statuses = Object.keys(statusLabels) as Status[];

// Drop onto whatever is under the pointer, preferring a card over its column. The keyboard has no pointer,
// so it falls back to the nearest corners.
const underPointer: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  const cards = hits.filter((hit) => !String(hit.id).startsWith("column:"));
  return cards.length ? cards : hits.length ? hits : closestCorners(args);
};

// One column per status. Dragging a card calls onMove with its new status and sort order; the parent saves it.
export function IssueBoard({ rows, onMove }: { rows: IssueRow[]; onMove: (row: IssueRow, status: Status, sortOrder: number) => void }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // a plain click still opens the issue
    // Space picks a card up and drops it; Enter still follows the link.
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ["Space"], cancel: ["Escape"], end: ["Space"] },
    }),
  );
  const columnRows = (status: Status) => rows.filter((row) => row.status === status);
  const active = rows.find((row) => row.id === activeId);

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    const row = rows.find((r) => r.id === active.id);
    if (!row || !over) return;
    // Dropped on a card, or on a column's empty space (droppable id "column:<status>").
    const overRow = rows.find((r) => r.id === over.id);
    const status = overRow ? overRow.status : (String(over.id).replace("column:", "") as Status);
    const column = columnRows(status);

    let before: IssueRow | undefined, after: IssueRow | undefined;
    if (status === row.status) {
      const from = column.indexOf(row);
      const to = overRow ? column.indexOf(overRow) : column.length - 1;
      if (from === to) return;
      const order = arrayMove(column, from, to);
      [before, after] = [order[to - 1], order[to + 1]];
    } else {
      const at = overRow ? column.indexOf(overRow) : column.length; // lands above the card it's dropped on
      [before, after] = [column[at - 1], column[at]];
    }
    onMove(row, status, positionBetween(before?.sortOrder, after?.sortOrder));
  }

  return (
    <DndContext
      id="issue-board" // a fixed id keeps dnd-kit's generated aria ids the same on server and browser
      sensors={sensors}
      collisionDetection={underPointer}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex items-start gap-3 overflow-x-auto p-3">
        {statuses.map((status) => (
          <Column key={status} status={status} rows={columnRows(status)} />
        ))}
      </div>
      {/* No drop animation: the card is already in its new spot (optimistic), so animating the overlay
          back would just make it slide toward its old position before disappearing. */}
      <DragOverlay dropAnimation={null}>{active && <CardBody row={active} className="rotate-2 shadow-lg" />}</DragOverlay>
    </DndContext>
  );
}

function Column({ status, rows }: { status: Status; rows: IssueRow[] }) {
  const id = `column:${status}`;
  const { setNodeRef } = useDroppable({ id });
  // Highlight when a card from another column is over this column or one of its cards.
  const { active, over } = useDndContext();
  const has = (itemId?: string | number) => rows.some((row) => row.id === itemId);
  const target = active && !has(active.id) && (over?.id === id || has(over?.id));
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-lg bg-muted/40 ring-1 ring-transparent transition-colors",
        target && "bg-muted/80 ring-foreground/25",
      )}
    >
      <h2 className="flex h-9 items-center gap-2 px-3 text-[13px] font-medium">
        <StatusIcon status={status} />
        {statusLabels[status]}
        <span className="font-normal text-muted-foreground">{rows.length}</span>
      </h2>
      <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex min-h-24 flex-col gap-2 p-2 pt-0">
          {rows.map((row) => (
            <Card key={row.id} row={row} />
          ))}
        </ul>
      </SortableContext>
    </section>
  );
}

function Card({ row }: { row: IssueRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id, disabled: row.pending });
  const style = { transform: CSS.Transform.toString(transform), transition };

  if (row.pending) {
    return (
      <li ref={setNodeRef} style={style}>
        <CardBody row={row} className="opacity-60" />
      </li>
    );
  }
  return (
    <li ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
      {/* The link is the drag handle too. draggable={false} stops the browser's own link dragging from taking over. */}
      <Link href={`/p/${row.projectKey}/${row.number}?view=board`} draggable={false} {...attributes} {...listeners} role="link" className="block rounded-md">
        <CardBody row={row} className="hover:bg-muted/60" />
      </Link>
    </li>
  );
}

function CardBody({ row, className }: { row: IssueRow; className?: string }) {
  return (
    <div className={cn("grid gap-1 rounded-md border bg-background p-3 text-[13px] shadow-xs", className)}>
      <span className="text-xs text-muted-foreground tabular-nums">
        {row.projectKey}-{row.pending ? "…" : row.number}
      </span>
      <span className="line-clamp-2">{row.title}</span>
    </div>
  );
}
