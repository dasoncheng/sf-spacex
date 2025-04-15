import { mergeWith } from "lodash-es";

const environment = {
  mode: "local",
  baseUrl: "/api",
  applicationId: "89324658-bea8-4716-bf6a-0e19669a87eb",
};

type Environment = typeof environment;

const initEnvironment = async () => {
  try {
    const response = await fetch("/environment.json");
    const config: Environment = await response.json();
    mergeWith(environment, config);
    console.log(environment);
  } catch (error) {}
};

export { environment, initEnvironment };
