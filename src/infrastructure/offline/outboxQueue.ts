export interface OfflineOperation<T = unknown> {
  operationId: string;
  entityId: string;
  version: number;
  createdAt: string;
  userId: string;
  payload: T;
}

export class OfflineQueue<T = unknown> {
  private queue: OfflineOperation<T>[] = [];
  enqueue(op: Omit<OfflineOperation<T>, 'operationId' | 'createdAt'>) {
    const item = { ...op, operationId: crypto.randomUUID(), createdAt: new Date().toISOString() };
    this.queue.push(item);
    return item;
  }
  drain() { const items = [...this.queue]; this.queue = []; return items; }
  size() { return this.queue.length; }
}
