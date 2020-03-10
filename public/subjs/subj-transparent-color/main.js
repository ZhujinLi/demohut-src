import { render2x2 } from "./render2x2.js";

render2x2("#view-bad", {});

render2x2("#view-bleeding", { bleeding: true });

render2x2("#view-green-bad", { green: true });

render2x2("#view-green-pma", { green: true, pma: true });