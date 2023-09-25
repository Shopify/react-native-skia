export interface ParagraphFactory {
  /**
   * Whether the paragraph builder requires ICU data to be provided by the
   * client.
   */
  RequiresClientICU(): boolean;
}
