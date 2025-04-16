import { mergeWith } from "lodash-es";

const environment = {
  mode: "local",
  baseUrl: "https://gateway.40mir.com",
  applicationId: "0cc19a75-0d0f-4692-95b6-f2b88db96da6",
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
  } catch (error) {}
};

export { environment, initEnvironment };
