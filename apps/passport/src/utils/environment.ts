import { ref } from "vue";

interface Environment {
  mode: string;
  baseUrl: string;
}

const environment = ref<Environment>();

const initEnvironment = async () => {
  try {
    const response = await fetch("/environment.json");
    const config: Environment = await response.json();
    environment.value = config;
  } catch (error) {
    environment.value = {
      mode: "local",
      baseUrl: "api",
    };
  }
};

export { environment, initEnvironment };
