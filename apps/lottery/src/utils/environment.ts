import { mergeWith } from "lodash-es";

const environment = {
  mode: "local",
  baseUrl: "https://gateway.40mir.com",
  996: {
    appv: "3.6.0",
    device: "ios",
  },
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
