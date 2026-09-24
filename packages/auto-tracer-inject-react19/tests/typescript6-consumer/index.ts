import {
  normalizeConfig,
  type TransformConfig,
} from "@autotracer/inject-react19";

const config = {
  mode: "opt-out",
} satisfies TransformConfig;

const normalizedConfig = normalizeConfig(config);

void normalizedConfig;
