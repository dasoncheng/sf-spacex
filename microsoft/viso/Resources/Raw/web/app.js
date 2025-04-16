const { createApp, ref } = Vue;

createApp({
  setup() {
    const message = ref('Hello from Vue SPA!');
    let count = 0;

    function changeMessage() {
      count++;
      message.value = `Vue Button Clicked ${count} times!`;
    }

    return {
      message,
      changeMessage
    };
  }
}).mount('#app');
