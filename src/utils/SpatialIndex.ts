export class SpatialIndex<T> {
  private grid = new Map<string, T[]>();
  private cellSize = 50; // pixels

  add(item: T, position: { x: number; y: number }): void {
    const key = this.getGridKey(position);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(item);
  }

  remove(item: T, position: { x: number; y: number }): void {
    const key = this.getGridKey(position);
    const cell = this.grid.get(key);
    if (cell) {
      const index = cell.indexOf(item);
      if (index > -1) {
        cell.splice(index, 1);
        if (cell.length === 0) {
          this.grid.delete(key);
        }
      }
    }
  }

  getNearby(position: { x: number; y: number }, radius: number): T[] {
    const cells = this.getNearbyCells(position, radius);
    const results: T[] = [];
    const seen = new Set<T>();

    cells.forEach(cellKey => {
      const items = this.grid.get(cellKey) || [];
      items.forEach(item => {
        if (!seen.has(item)) {
          seen.add(item);
          results.push(item);
        }
      });
    });

    return results;
  }

  clear(): void {
    this.grid.clear();
  }

  getAll(): T[] {
    const results: T[] = [];
    const seen = new Set<T>();

    this.grid.forEach(cell => {
      cell.forEach(item => {
        if (!seen.has(item)) {
          seen.add(item);
          results.push(item);
        }
      });
    });

    return results;
  }

  private getGridKey(pos: { x: number; y: number }): string {
    const x = Math.floor(pos.x / this.cellSize);
    const y = Math.floor(pos.y / this.cellSize);
    return `${x},${y}`;
  }

  private getNearbyCells(position: { x: number; y: number }, radius: number): string[] {
    const cells: string[] = [];
    const cellRadius = Math.ceil(radius / this.cellSize);

    const centerX = Math.floor(position.x / this.cellSize);
    const centerY = Math.floor(position.y / this.cellSize);

    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        // Check if this cell is actually within the radius
        const cellX = (centerX + dx) * this.cellSize;
        const cellY = (centerY + dy) * this.cellSize;

        // Calculate distance from position to cell center
        const distance = Math.sqrt(
          Math.pow(position.x - (cellX + this.cellSize / 2), 2) +
          Math.pow(position.y - (cellY + this.cellSize / 2), 2)
        );

        if (distance <= radius + this.cellSize / 2) {
          cells.push(`${centerX + dx},${centerY + dy}`);
        }
      }
    }

    return cells;
  }
}
