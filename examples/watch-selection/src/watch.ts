// Listens for SelectionChanged and shows a toast whenever the selection changes.
// Demonstrates:
//   - Action API handler
//   - typed ctx.actionContext narrowed by the generic parameter
//   - SketchActionHandler<'Name'>
import type { SketchActionHandler } from 'sketch-plugin-types';
import * as UI from 'sketch/ui';

export const onSelectionChanged: SketchActionHandler<'SelectionChanged'> = (
    ctx,
) => {
    const { document, oldSelection, newSelection } = ctx.actionContext;
    UI.message(
        `Selection: ${oldSelection.length} -> ${newSelection.length}`,
        document,
    );
};
