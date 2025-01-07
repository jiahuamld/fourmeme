export class MessageQueue<T> {
  private queue: T[];
  private resolvers: ((value: T) => void)[];

  constructor() {
    this.queue = [];
    this.resolvers = [];
  }

  enqueue(message: T): void {
    if (this.resolvers.length > 0) {
      const resolver = this.resolvers.shift()!;
      resolver(message);
    } else {
      this.queue.push(message);
    }
  }

  async dequeue(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    return new Promise((resolve) => {
  
      this.resolvers.push(resolve);
    });
  }

  size(): number {
    return this.queue.length;
  }
} 