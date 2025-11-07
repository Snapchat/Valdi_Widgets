export interface SectionHandler {
  /**
   * Render the given items with the given renderItem function.
   * The renderItem function will be called for every item given,
   * unless the SectionList is configured to limit the max number
   * of new items per render.
   * @param items
   * @param renderItem
   */
  renderItems<T>(items: T[], renderItem: (item: T, index: number, isFirst: boolean, isLast: boolean) => void): void;
}
