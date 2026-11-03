import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { Quasar, Notify, Dialog } from "quasar";
import quasarLang from "quasar/lang/es";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.css";

import App from "./App.vue";
import router from "./router";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate); // persiste los stores que tengan persist: true

createApp(App)
  .use(pinia)
  .use(router)
  .use(Quasar, {
    plugins: { Notify, Dialog },
    lang: quasarLang,
    config: { brand: { primary: "#1b7f5c", secondary: "#26404d", accent: "#e0a100" } },
  })
  .mount("#app");
