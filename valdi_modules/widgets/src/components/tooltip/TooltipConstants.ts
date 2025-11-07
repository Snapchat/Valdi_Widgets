export class TooltipConstants {
  /**
   * Distance between the corner of the tooltip and the tail icon, when not centered
   */
  static tailToCornerDistance = 10;
  /**
   * Size of the tail's image asset in point
   */
  static tailImageSize = 20;
  /**
   * Margin between the tail icon and the actual content
   */
  static tailToContentMargin = -8;
  /**
   * Overlap needed for the tail inside to align with the content, when not centered
   */
  static tailOverlap = TooltipConstants.tailToCornerDistance + TooltipConstants.tailImageSize;
}
