import { renderQuote as pyonRender, type RenderResult as PyonRenderResult } from "../../pyon/src/render.ts";
import { fetchAvatar } from "../../pyon/src/avatar.ts";
import { layouts, pickLayout, type LayoutName } from "../../pyon/src/layouts/index.ts";
import { tryAcquireSlot, releaseSlot } from "../../pyon/src/semaphore.ts";
import type { QuoteRequest } from "../../pyon/src/schema.ts";

export type RenderOptions = {
  text: string;
  displayName: string;
  username: string;
  avatarUrl: string;
  accentColor?: string;
  bgColor?: string;
  textColor?: string;
  style?: LayoutName;
};

export type RenderResult = {
  png: Buffer;
  style: LayoutName;
};

/**
 * Renders a quote card by calling Pyon's rendering pipeline directly.
 *
 * Style selection is dynamic: if the requested style exists in Pyon's
 * layout registry it is used, otherwise `pickLayout()` picks randomly.
 */
export async function renderQuote(options: RenderOptions): Promise<RenderResult> {
  if (!tryAcquireSlot()) {
    throw new Error("Too busy right now — try again in a moment.");
  }

  try {
    const avatar = await fetchAvatar(options.avatarUrl);
    const availableStyles = Object.keys(layouts) as LayoutName[];
    const chosenStyle =
      options.style && availableStyles.includes(options.style)
        ? options.style
        : pickLayout(); // random

    const req: QuoteRequest = {
      text: options.text,
      displayName: options.displayName,
      username: options.username,
      avatarUrl: options.avatarUrl,
      accentColor: options.accentColor,
      bgColor: options.bgColor,
      textColor: options.textColor,
      style: chosenStyle as QuoteRequest["style"],
    };

    const result: PyonRenderResult = await pyonRender(req, avatar);

    const arrayBuf = await result.png.arrayBuffer();
    return {
      png: Buffer.from(arrayBuf),
      style: result.style,
    };
  } finally {
    releaseSlot();
  }
}

export { layouts, type LayoutName };
