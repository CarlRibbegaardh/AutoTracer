import type { SvgIconComponent } from "@mui/icons-material";

/** Properties for one tracer description on the start page. */
export interface TracerDescriptionProps {
  /** Tracer display name. */
  readonly name: string;

  /** Package that provides the tracer. */
  readonly packageName: string;

  /** What the tracer observes in this demo. */
  readonly description: string;

  /** Icon associated with the tracer. */
  readonly icon: SvgIconComponent;
}
