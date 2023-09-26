type TokenizedText = {
  words: number[];
  graphemes: number[];
  breaks: [number, number][];
};

export interface ParagraphFactory {
  /**
   * Whether the paragraph builder requires ICU data to be provided by the
   * client.
   * Private API, used for testing only.
   * @private
   */
  RequiresClientICU(): boolean;
  /**
   * Returns the ICU data required by the paragraph builder.
   * If the paragraph builder does not require any ICU data, returns null.
   * Private API, used for testing only.
   * @private
   */
  TokenizeText(text: string): TokenizedText | null;
}
