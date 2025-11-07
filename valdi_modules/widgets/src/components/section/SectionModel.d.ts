import { RenderFunction } from '../RenderFunction';
import { SectionHandler } from './SectionHandler';

export type RenderFunctionAnchor = RenderFunction;
export type RenderFunctionHeader = RenderFunction;
export type RenderFunctionBody = RenderFunction<SectionHandler>;

export interface SectionModel {
  /**
   * A unique key which identifies this Section.
   */
  key: string;
  /**
   * Render function for injecting anchors right above the section header
   * (used for anchors because it will not be translated by the sticky headers)
   */
  onRenderAnchor?: RenderFunctionAnchor;
  /**
   * Render function for rendering the visual content of the header of the section.
   * (do not use this for anchor because it may get translated by the sticky headers)
   */
  onRenderHeader?: RenderFunctionHeader;
  /**
   * Render function for rendering the body of the section.
   */
  onRenderBody: RenderFunctionBody;
  /**
   * When created, this will make the section roll-in fading
   */
  animated?: boolean;
}
